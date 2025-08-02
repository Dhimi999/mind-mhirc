import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type"
};

// --- PROMPT HELPERS ---

const createSafetyCheckPrompt = (userMessage: string) => {
  return `
Kamu adalah chatbot pendamping yang bersifat empatik, suportif, dan tidak menghakimi. 
Tugasmu adalah menganalisis pesan dari pengguna dan memberikan dua respons dalam format JSON yang valid:
1. "jawaban": Respons kamu yang hangat, empatik, dan suportif untuk ditampilkan kepada pengguna.
2. "flag": Status boolean (true/false) yang menandakan jika pesan pengguna mengandung indikasi bahaya.
Berikut adalah pesan dari pengguna:
---
${userMessage}
---
Hasilkan jawaban HANYA dalam format JSON: { "jawaban": "...", "flag": true/false }`;
};

const createOptimizedSummaryPrompt = (
  newMessagesContext: string,
  existingSummary: string | null
) => {
  const intro = existingSummary
    ? `Rangkuman saat ini:\n"${existingSummary}"\n\nPesan terbaru:\n---\n${newMessagesContext}\n---`
    : `Analisis percakapan awal ini:\n---\n${newMessagesContext}\n---`;

  return `${intro}\n\nBerdasarkan pesan terbaru, perbarui/buat rangkuman dan judul relevan (1-5 kata). Hasilkan HANYA dalam format JSON:\n{\n  "title": "Judul baru/relevan",\n  "summary": "Rangkuman lengkap yang baru."\n}`;
};

const createConsultationPrompt = (
  userMessage: string,
  consultationSummary: string
) => {
  return `
Anda adalah seorang konselor AI yang membantu orang tua memahami situasi yang dialami anak mereka.
Fokus utama Anda adalah memberikan panduan, saran, dan dukungan.
Berikut adalah rangkuman masalah yang sedang dihadapi anak:
---
${consultationSummary}
---
Dan ini adalah pertanyaan dari orang tua:
---
${userMessage}
---
Tolong berikan jawaban Anda sebagai seorang konselor ahli.`;
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
    const { message, conversation_id, user_id } = await req.json();

    if (!message || !conversation_id || !user_id) {
      throw new Error("Message, conversation_id, and user_id are required.");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY")!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite"
    });

    const { data: conversationData, error: convError } = await supabaseAdmin
      .from("ai_conversations")
      .select("conversation_type, full_summary, messages_count")
      .eq("id", conversation_id)
      .single();

    if (convError)
      throw new Error(
        `Could not fetch conversation data: ${convError.message}`
      );

    let aiResponseText;

    // --- ALUR 1: PERCAKAPAN KONSULTASI ---
    if (conversationData?.conversation_type === "consultation") {
      console.log(
        `[AI] Generating CONSULTATION response for: ${conversation_id}`
      );
      const consultationSummary =
        conversationData.full_summary || "Tidak ada rangkuman detail.";
      const consultationPrompt = createConsultationPrompt(
        message,
        consultationSummary
      );
      const result = await retryWithBackoff(() =>
        model.generateContent(consultationPrompt)
      );
      aiResponseText = result.response.text();

      await supabaseAdmin.from("ai_messages").insert([
        {
          conversation_id,
          user_id,
          content: message,
          sender: "user",
          created_at: requestTimestamp.toISOString()
        },
        {
          conversation_id,
          user_id,
          content: aiResponseText,
          sender: "ai",
          created_at: new Date(requestTimestamp.getTime() + 1).toISOString()
        }
      ]);
      console.log(`[DB] Consultation messages saved.`);
    } else {
      // --- ALUR 2: PERCAKAPAN BIASA (DENGAN MODERASI & SUMMARY) ---
      console.log(`[AI] Generating GENERAL response for: ${conversation_id}`);

      const moderationResult = await retryWithBackoff(() =>
        model.generateContent(createSafetyCheckPrompt(message), {
          responseMimeType: "application/json"
        })
      );
      const rawResponseText = moderationResult.response.text();
      const jsonMatch = rawResponseText.match(/{[\s\S]*}/);
      if (!jsonMatch)
        throw new Error("Invalid JSON response from moderation AI.");

      const { jawaban, flag } = JSON.parse(jsonMatch[0]);
      aiResponseText = jawaban;
      const isUrgent = flag === true || flag === "true";

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
          created_at: new Date(requestTimestamp.getTime() + 1).toISOString(),
          flag_urgent: "false"
        }
      ]);
      console.log(`[DB] Messages saved. Urgent: ${isUrgent}`);

      if (isUrgent) {
        const { data: existingCase } = await supabaseAdmin
          .from("urgent_cases")
          .select("id")
          .eq("source_conversation_id", conversation_id)
          .eq("is_resolved", false)
          .maybeSingle();
        if (!existingCase) {
          const { data: childProfile } = await supabaseAdmin
            .from("profiles")
            .select("parent_id")
            .eq("id", user_id)
            .single();
          if (childProfile?.parent_id) {
            const { data: userMessage } = await supabaseAdmin
              .from("ai_messages")
              .select("id")
              .eq("conversation_id", conversation_id)
              .eq("sender", "user")
              .order("created_at", { ascending: false })
              .limit(1)
              .single();
            if (userMessage) {
              await supabaseAdmin.from("urgent_cases").insert({
                child_user_id: user_id,
                parent_user_id: childProfile.parent_id,
                source_conversation_id: conversation_id,
                source_message_id: userMessage.id
              });
              console.log(
                `[CASE CREATED] New urgent case for conversation ${conversation_id}`
              );
              supabaseAdmin.functions
                .invoke("notify-parent", {
                  body: {
                    messageContent: message,
                    flaggedByUserId: user_id,
                    conversationId: conversation_id
                  }
                })
                .catch((err) =>
                  console.error("Error invoking notify-parent:", err)
                );
            }
          }
        }
      }

      const { full_summary: existingSummary, messages_count: oldCount } =
        conversationData;
      const newMessagesCount = (oldCount || 0) + 2;
      let contextForSummary: string | null = null;
      let summaryMode: "INITIAL" | "UPDATE" | null = null;

      if (newMessagesCount >= 4 && !existingSummary) {
        summaryMode = "INITIAL";
        const { data: msgs } = await supabaseAdmin
          .from("ai_messages")
          .select("content, sender")
          .eq("conversation_id", conversation_id)
          .order("created_at", { ascending: true })
          .limit(4);
        contextForSummary =
          msgs?.map((m) => `${m.sender}: ${m.content}`).join("\n") || null;
      } else if (newMessagesCount > 4 && existingSummary) {
        summaryMode = "UPDATE";
        const { data: msgs } = await supabaseAdmin
          .from("ai_messages")
          .select("content, sender")
          .eq("conversation_id", conversation_id)
          .order("created_at", { ascending: false })
          .limit(2);
        contextForSummary =
          msgs
            ?.reverse()
            .map((m) => `${m.sender}: ${m.content}`)
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
          console.log(`[SUCCESS] Summary updated.`);
        }
      }
    }

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
