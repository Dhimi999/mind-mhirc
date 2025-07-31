import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type"
};

// --- PROMPT HELPERS ---

// Prompt untuk moderasi pesan pengguna
const createSafetyCheckPrompt = (userMessage: string) => {
  return `
Kamu adalah chatbot pendamping yang bersifat empatik, suportif, dan tidak menghakimi. 
Tugasmu adalah menganalisis pesan dari pengguna dan memberikan dua respons dalam format JSON yang valid:
1. "jawaban": Respons kamu yang hangat, empatik, dan suportif untuk ditampilkan kepada pengguna.
2. "flag": Status boolean (true/false) yang menandakan jika pesan pengguna mengandung indikasi bahaya seperti ingin menyakiti diri sendiri, bunuh diri, kekerasan, atau tindakan berbahaya lainnya.

Kamu TIDAK PERLU memberi tahu pengguna bahwa kamu sedang menandai flag ini. Flag ini hanya untuk sistem.

Berikut adalah pesan dari pengguna:
---
${userMessage}
---

Hasilkan jawaban HANYA dalam format JSON yang valid seperti ini:
{
  "jawaban": "Teks jawaban empatikmu di sini...",
  "flag": true
}`;
};

// Prompt untuk membuat rangkuman (judul dan isi)
const createOptimizedSummaryPrompt = (
  newMessagesContext: string,
  existingSummary: string | null
) => {
  const intro = existingSummary
    ? `Rangkuman saat ini adalah:\n"${existingSummary}"\n\nPesan-pesan terbaru adalah:\n---\n${newMessagesContext}\n---`
    : `Analisis percakapan awal ini:\n---\n${newMessagesContext}\n---`;

  return `${intro}\n\nBerdasarkan pesan terbaru, perbarui/buat rangkuman dan buatlah judul yang paling relevan (1-5 kata). Hasilkan HANYA dalam format JSON:\n{\n  "title": "Judul baru/relevan",\n  "summary": "Rangkuman lengkap yang baru."\n}`;
};

// --- FUNGSI RETRY ---
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  retries = 5,
  delay = 1000,
  backoff = 2
): Promise<T> => {
  try {
    return await fn();
  } catch (e) {
    if (retries > 0) {
      const jitter = Math.random() * 500;
      console.log(
        `Retrying in ${(delay + jitter).toFixed(
          0
        )}ms... (${retries} retries left)`
      );
      await new Promise((res) => setTimeout(res, delay + jitter));
      return retryWithBackoff(fn, retries - 1, delay * backoff, backoff);
    } else {
      console.error("Max retries reached. Throwing error:", e);
      throw e;
    }
  }
};

// --- LOGIKA UTAMA SERVER ---
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const requestTimestamp = new Date();
    const { history, message, conversation_id, user_id } = await req.json();

    if (!message || !conversation_id || !user_id) {
      throw new Error("Message, conversation_id, and user_id are required.");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY")!);
    // PENTING: Gunakan nama model resmi untuk stabilitas
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite"
    });

    // 1. Dapatkan Respons AI yang sudah dimoderasi
    const moderationResult = await retryWithBackoff(() =>
      model.generateContent(createSafetyCheckPrompt(message), {
        responseMimeType: "application/json"
      })
    );

    const rawResponseText = moderationResult.response.text();
    const jsonMatch = rawResponseText.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      throw new Error("Invalid JSON response from moderation AI.");
    }

    const { jawaban, flag } = JSON.parse(jsonMatch[0]);
    const aiResponseText = jawaban;
    const isUrgent = flag === true || flag === "true";

    // 2. Simpan Pesan dengan flag_urgent
    const aiTimestamp = new Date(requestTimestamp.getTime() + 1);
    await supabaseAdmin.from("ai_messages").insert([
      {
        conversation_id,
        user_id,
        content: message,
        sender: "user",
        created_at: requestTimestamp.toISOString(),
        flag_urgent: isUrgent
      },
      {
        conversation_id,
        user_id,
        content: aiResponseText,
        sender: "ai",
        created_at: aiTimestamp.toISOString(),
        flag_urgent: "false"
      }
    ]);
    console.log(
      `[DB] Messages saved. User message flagged as urgent: ${isUrgent}`
    );

    // Panggil fungsi notifikasi jika urgent (tanpa menunggu)
    if (isUrgent) {
      supabaseAdmin.functions
        .invoke("notify-parent", {
          body: {
            messageContent: message,
            flaggedByUserId: user_id,
            conversationId: conversation_id
          }
        })
        .catch((err) => {
          console.error("Error invoking notify-admin function:", err);
        });
    }

    // 3. Proses Perangkuman Otomatis
    const { data: convData } = await supabaseAdmin
      .from("ai_conversations")
      .select("full_summary, messages_count")
      .eq("id", conversation_id)
      .single();

    if (convData) {
      const { full_summary: existingSummary, messages_count: oldCount } =
        convData;
      const newMessagesCount = oldCount + 2;

      let contextForSummary: string | null = null;
      let summaryMode: "INITIAL" | "UPDATE" | null = null;

      if (newMessagesCount >= 4 && !existingSummary) {
        summaryMode = "INITIAL";
        const { data: initialMessages } = await supabaseAdmin
          .from("ai_messages")
          .select("content, sender")
          .eq("conversation_id", conversation_id)
          .order("created_at", { ascending: true })
          .limit(4);
        contextForSummary =
          initialMessages
            ?.map((msg) => `${msg.sender}: ${msg.content}`)
            .join("\n") || null;
      } else if (newMessagesCount > 4 && existingSummary) {
        summaryMode = "UPDATE";
        const { data: recentMessages } = await supabaseAdmin
          .from("ai_messages")
          .select("content, sender")
          .eq("conversation_id", conversation_id)
          .order("created_at", { ascending: false })
          .limit(2);
        contextForSummary =
          recentMessages
            ?.reverse()
            .map((msg) => `${msg.sender}: ${msg.content}`)
            .join("\n") || null;
      }

      if (contextForSummary && summaryMode) {
        console.log(`[SUMMARY] Triggered: ${summaryMode}.`);
        const summaryResponse = await retryWithBackoff(() =>
          model.generateContent(
            createOptimizedSummaryPrompt(contextForSummary!, existingSummary),
            { responseMimeType: "application/json" }
          )
        );

        const summaryJsonMatch = summaryResponse.response
          .text()
          .match(/{[\s\S]*}/);

        if (summaryJsonMatch) {
          const { title, summary } = JSON.parse(summaryJsonMatch[0]);
          await supabaseAdmin
            .from("ai_conversations")
            .update({
              summary: title,
              full_summary: summary,
              updated_at: new Date().toISOString()
            })
            .eq("id", conversation_id);
          console.log(`[SUCCESS] Summary updated for ${conversation_id}`);
        } else {
          console.error(
            `[ERROR] Failed to parse JSON summary for ${conversation_id}.`
          );
        }
      }
    }

    // 4. Kembalikan Respons Teks AI ke Frontend
    return new Response(JSON.stringify({ text: aiResponseText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
  } catch (error) {
    console.error("[FATAL]", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
