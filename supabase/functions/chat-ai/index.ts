import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Declare Deno for TypeScript editor to avoid "Cannot find name 'Deno'" in non-Deno tooling
declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type"
};

// --- PROMPT HELPERS ---

type UserContext = {
  name?: string | null;
  ageYears?: number | null;
  gender?: string | null;
  city?: string | null;
  country?: string | null;
};

const buildUserContext = (profile: any | null): UserContext => {
  if (!profile) return {};
  const name =
    profile.display_name ||
    profile.first_name ||
    profile.full_name ||
    profile.preferred_name ||
    profile.nickname ||
    profile.username ||
    null;
  const dobRaw = profile.date_of_birth || profile.dob || profile.birthdate || null;
  let ageYears: number | null = null;
  if (dobRaw) {
    const dob = new Date(dobRaw);
    if (!isNaN(dob.getTime())) {
      const diff = Date.now() - dob.getTime();
      ageYears = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
    }
  }
  const gender = (profile.gender || profile.sex || profile.jenis_kelamin || null)?.toString();
  // Prefer coarse location only; avoid full address lines
  const city = profile.city || profile.kota || profile.town || null;
  const country = profile.country || profile.negara || null;
  return { name, ageYears, gender, city, country };
};

const createSafetyCheckPrompt = (
  userMessage: string,
  options?: { includeGreeting?: boolean; userLocale?: string; userContext?: UserContext }
) => {
  const includeGreeting = options?.includeGreeting ? "true" : "false";
  const userLocale = options?.userLocale || "id";
  const ctx = options?.userContext || {};
  const userName = ctx.name || "";
  return `
PERAN & IDENTITAS
Anda adalah Eva — teman AI empatik dari Mind MHIRC yang mendampingi kesehatan mental secara aman dan manusiawi. Tugas utama Anda adalah mendengarkan, memahami, memvalidasi emosi, dan menjaga keselamatan pengguna. Untuk percakapan umum (non‑konsultasi), jangan memberi langkah-langkah teknis/solusi detail; fokus pada dukungan emosional dan refleksi perasaan.

GAYA KOMUNIKASI
- Hangat, ramah, menenangkan, dan non‑menghakimi.
- Bahasa percakapan sederhana, jelas, dan sopan. Utamakan Bahasa Indonesia (userLocale: ${userLocale}).
- Hindari format list/bullet. Jawab dalam paragraf pendek 1–3 kalimat per paragraf.
- Jangan berlebihan kapitalisasi.

KESELAMATAN & ESKALASI
- Jika ada indikasi bahaya mendesak (ide bunuh diri, kekerasan, atau krisis): validasi perasaan, sarankan segera menghubungi layanan darurat/tenaga profesional, dan dorong menghubungi orang tepercaya di sekitar.

ATURAN RESPON
- Salam pembuka hanya pada pesan pertama percakapan (includeGreeting=${includeGreeting}). Jika true, awali jawaban dengan: "Halo, aku Eva." Jika false, jangan ulangi perkenalan.
- Validasi emosi, dengarkan, ajukan pertanyaan terbuka yang ringan bila relevan.
- Jangan memberi instruksi teknis/langkah rinci pada mode dukungan umum.

KONTEKS PENGGUNA (PRIVAT — JANGAN DIEKSPOS LANGSUNG)
- Nama (jika ada): "${userName}"
- Usia (tahun, jika terhitung dari Tgl Lahir): ${ctx.ageYears ?? ""}
- Jenis kelamin (opsional): ${ctx.gender ?? ""}
- Lokasi kasar (kota/negara, jika ada): ${ctx.city || ctx.country || ""}

ATURAN PRIVASI & PENGGUNAAN KONTEXT
- Gunakan konteks ini hanya untuk menyesuaikan empati, contoh, dan nada bahasa.
- Jangan menyebutkan atau membocorkan data spesifik (tgl lahir, alamat lengkap, kota/negara, jenis kelamin) kecuali pengguna telah menyebutkannya dalam chat saat ini.
- Jika perlu menyebut usia, gunakan cara implisit (mis. "di tahap hidupmu") — hindari menyebut angka usia kecuali pengguna sudah menyebutkannya lebih dulu.
- Untuk lokasi, hindari menyebut nama kota/negara kecuali pengguna sudah menyebutkannya.
- Jika pengguna bertanya data apa yang kamu punya, jawab kategori secara umum tanpa nilai spesifik, kecuali mereka memintanya dengan jelas.

PENYEBUTAN NAMA
- Jika nama tersedia dan sesuai konteks, boleh menyapa dengan nama depan secara singkat setelah konfirmasi preferensi (mis. "Jika kamu nyaman, aku memanggilmu ${userName}.")
- Jika nama tidak tersedia: jelaskan bahwa kamu belum tahu, lalu tanya bagaimana mereka ingin dipanggil.
- Jangan menebak atau mengarang nama.

DISAMBIGUASI PERTANYAAN "NAMA"
- Jika pengguna menanyakan nama kamu (kata kunci: "namamu", "siapa namamu", "siapa kamu"): jawab singkat "Aku Eva" lalu kembali ke fokus dukungan.
- Jika pengguna menanyakan apakah kamu tahu nama mereka (kata kunci: "namaku", "nama saya", "tahu namaku", "kamu tau namaku?"): ikuti aturan IDENTITAS PENGGUNA di atas.

FORMAT KELUARAN
Kembalikan HANYA JSON:
{
  "jawaban": "Teks respons empatik (opsional diawali salam sesuai aturan)",
  "flag": true/false
}

PESAN PENGGUNA:
---
${userMessage}
---`;
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
  consultationSummary: string,
  userContext?: UserContext
) => {
  return `
PERAN & IDENTITAS
Anda adalah Eva — konselor AI Mind MHIRC (mode konsultasi). Berikan panduan praktis yang aman, berbasis bukti, dan peka budaya.

KONTEKS PENGGUNA (PRIVAT — JANGAN DIEKSPOS LANGSUNG)
- Nama (jika ada): ${userContext?.name ?? ""}
- Usia (tahun, jika ada): ${userContext?.ageYears ?? ""}
- Jenis kelamin (opsional): ${userContext?.gender ?? ""}
- Lokasi kasar (opsional): ${userContext?.city || userContext?.country || ""}

Aturan privasi sama seperti di mode dukungan: gunakan konteks hanya untuk menyesuaikan rekomendasi; jangan sebutkan angka usia atau lokasi spesifik kecuali pengguna menyebutkannya dulu.

GAYA KOMUNIKASI
- Empatik, jelas, dan ringkas. Gunakan paragraf pendek.
- Boleh menggunakan langkah/opsi praktis, namun tetap aman dan tidak menggantikan tenaga profesional.

KONTEKS KASUS
Ringkasan situasi:
---
${consultationSummary}
---
Pertanyaan orang tua:
---
${userMessage}
---

TUJUAN JAWABAN
- Berikan 2–4 opsi praktis yang aman untuk dicoba.
- Sertakan anjuran kapan perlu mencari bantuan profesional.
- Hindari istilah teknis berlebihan.
`;
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

// --- SANITIZER: enforce style and greeting rules ---
const sanitizeSupportResponse = (text: string, includeGreeting: boolean) => {
  let out = text || "";
  // Remove code fences and markdown headers
  out = out.replace(/```[\s\S]*?```/g, "");
  out = out.replace(/^\s*#+\s*/gm, "");
  // Convert bullet/list lines into plain text
  out = out.replace(/^\s*(?:[-*•]|\d+[.)])\s+/gm, "");
  // Collapse excessive blank lines
  out = out.replace(/\n{3,}/g, "\n\n");
  // Greeting control
  const greetingRegex = /^\s*halo,?\s*aku\s*eva[.!\-–—:]?\s*/i;
  const hasGreeting = greetingRegex.test(out);
  if (!includeGreeting && hasGreeting) {
    out = out.replace(greetingRegex, "");
  }
  if (includeGreeting && !hasGreeting) {
    out = `Halo, aku Eva. ${out.trim()}`;
  }
  return out.trim();
};

// --- LOGIKA UTAMA SERVER ---
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const requestTimestamp = new Date();
  const { message, conversation_id, user_id } = await req.json();
  const acceptLang = req.headers.get("accept-language") || "id";
  const userLocale = acceptLang.toLowerCase().startsWith("en") ? "en" : "id";

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
    // Fetch user context (privacy-preserving)
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", user_id)
      .maybeSingle();
    const userCtx = buildUserContext(profile as any);

    // --- ALUR 1: PERCAKAPAN KONSULTASI ---
    if (conversationData?.conversation_type === "consultation") {
      console.log(
        `[AI] Generating CONSULTATION response for: ${conversation_id}`
      );
      const consultationSummary =
        conversationData.full_summary || "Tidak ada rangkuman detail.";
      const consultationPrompt = createConsultationPrompt(
        message,
        consultationSummary,
        userCtx
      );
      const result = (await retryWithBackoff(() =>
        model.generateContent(consultationPrompt)
      )) as any;
      aiResponseText = (result as any).response.text();

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

      const isFirstMessage = (conversationData?.messages_count || 0) === 0;
      const moderationResult = (await retryWithBackoff(() =>
        model.generateContent(
          createSafetyCheckPrompt(message, { includeGreeting: isFirstMessage, userLocale, userContext: userCtx })
        )
      )) as any;
      const rawResponseText = (moderationResult as any).response.text();
      const jsonMatch = rawResponseText.match(/{[\s\S]*}/);
      if (!jsonMatch)
        throw new Error("Invalid JSON response from moderation AI.");

      const { jawaban, flag } = JSON.parse(jsonMatch[0]);
      aiResponseText = sanitizeSupportResponse(jawaban, isFirstMessage);
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
                .catch((err: unknown) =>
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
          msgs?.map((m: { sender: string; content: string }) => `${m.sender}: ${m.content}`).join("\n") || null;
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
            .map((m: { sender: string; content: string }) => `${m.sender}: ${m.content}`)
            .join("\n") || null;
      }

      if (contextForSummary && summaryMode) {
        console.log(`[SUMMARY] Triggered: ${summaryMode}.`);
        const summaryResponse = (await retryWithBackoff(() =>
          model.generateContent(
            createOptimizedSummaryPrompt(contextForSummary!, existingSummary)
          )
        )) as any;
        const summaryJsonMatch = (summaryResponse as any).response
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
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
