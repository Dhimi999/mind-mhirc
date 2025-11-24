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
    profile.nick_name ||
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

const fetchUserFacts = async (supabaseClient: any, userId: string): Promise<string[]> => {
  const { data, error } = await supabaseClient
    .from("ai_user_facts")
    .select("content")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20); // Limit context window

  if (error) {
    console.error("Error fetching user facts:", error);
    return [];
  }
  return data.map((f: any) => f.content);
};

const createFactExtractionPrompt = (userMessage: string, existingFacts: string[]) => {
  return `
Tugas: Ekstrak fakta permanen tentang pengguna dari pesan ini.
Pesan: "${userMessage}"

Fakta yang SUDAH DIKETAHUI (JANGAN DUPLIKASI):
${existingFacts.map(f => `- ${f}`).join("\n")}

Kriteria Fakta:
- Nama, hobi, hewan peliharaan, pekerjaan, hubungan keluarga, kondisi medis penting, atau preferensi jangka panjang.
- Simpan dalam KALIMAT LENGKAP (Subjek + Predikat + Objek). Contoh: "Pengguna memiliki kucing bernama Mochi", bukan "kucing Mochi".
- JANGAN ekstrak emosi sesaat (misal: "aku sedih hari ini") atau pertanyaan.
- JANGAN ekstrak jika fakta sudah ada di daftar "Fakta yang SUDAH DIKETAHUI".

Output JSON:
{
  "facts": ["fakta baru 1", "fakta baru 2"] 
}
Jika tidak ada fakta baru, kembalikan { "facts": [] }
`;
};

const createPersonaPrompt = (
  options?: { includeGreeting?: boolean; userLocale?: string; userContext?: UserContext; facts?: string[] }
) => {
  const includeGreeting = options?.includeGreeting ? "true" : "false";
  const userLocale = options?.userLocale || "id";
  const ctx = options?.userContext || {};
  const userName = ctx.name || "";
  const userFacts = options?.facts || [];
  
  return `
PERAN & IDENTITAS
Anda adalah Eva — teman AI empatik dari Mind MHIRC yang mendampingi kesehatan mental secara aman dan manusiawi. Tugas utama Anda adalah mendengarkan, memahami, memvalidasi emosi, dan menjaga keselamatan pengguna.

GAYA KOMUNIKASI
- Hangat, ramah, menenangkan, dan non‑menghakimi.
- Bahasa percakapan sederhana, jelas, dan sopan. Utamakan Bahasa Indonesia (userLocale: ${userLocale}).
- Hindari format list/bullet. Jawab dalam paragraf pendek 1–3 kalimat per paragraf.
- Jangan berlebihan kapitalisasi.

ATURAN RESPON
- Salam pembuka hanya pada pesan pertama percakapan (includeGreeting=${includeGreeting}). Jika true, awali jawaban dengan: "Halo, aku Eva." Jika false, jangan ulangi perkenalan.
- Validasi emosi, dengarkan, ajukan pertanyaan terbuka yang ringan bila relevan.
- Jangan memberi instruksi teknis/langkah rinci pada mode dukungan umum.

KONTEKS PENGGUNA (PRIVAT — JANGAN DIEKSPOS LANGSUNG)
- Nama (jika ada): "${userName}"
- Usia (tahun, jika terhitung dari Tgl Lahir): ${ctx.ageYears ?? ""}
- Jenis kelamin (opsional): ${ctx.gender ?? ""}
- Lokasi kasar (kota/negara, jika ada): ${ctx.city || ctx.country || ""}

MEMORI JANGKA PANJANG (FAKTA PENGGUNA)
Gunakan fakta ini untuk membuat percakapan lebih personal, tapi jangan sebutkan secara kaku (misal: "Sesuai dataku, kamu punya kucing"). Gunakan secara natural (misal: "Bagaimana kabar Mochi kucingmu?").
${userFacts.length > 0 ? userFacts.map(f => `- ${f}`).join("\n") : "- Belum ada fakta tersimpan."}

ATURAN PRIVASI & PENGGUNAAN KONTEXT
- Gunakan konteks ini hanya untuk menyesuaikan empati, contoh, dan nada bahasa.
- Jangan menyebutkan atau membocorkan data spesifik (tgl lahir, alamat lengkap, kota/negara, jenis kelamin) kecuali pengguna telah menyebutkannya dalam chat saat ini.
- Jika perlu menyebut usia, gunakan cara implisit (mis. "di tahap hidupmu") — hindari menyebut angka usia kecuali pengguna sudah menyebutkannya lebih dulu.
- Untuk lokasi, hindari menyebut nama kota/negara kecuali pengguna sudah menyebutkannya.

PENYEBUTAN NAMA
- Jika nama tersedia ("${userName}"), kamu HARUS mengingatnya.
- Jika pengguna bertanya "siapa namaku" atau "apakah kamu tahu namaku", JAWABLAH dengan menyebutkan nama mereka ("${userName}").
- Jika nama tidak tersedia: jelaskan bahwa kamu belum tahu, lalu tanya bagaimana mereka ingin dipanggil.
- Jangan menebak atau mengarang nama.

DISAMBIGUASI PERTANYAAN "NAMA"
- Jika pengguna menanyakan nama kamu (kata kunci: "namamu", "siapa namamu", "siapa kamu"): jawab singkat "Aku Eva" lalu kembali ke fokus dukungan.
- Jika pengguna menanyakan apakah kamu tahu nama mereka: IKUTI ATURAN PENYEBUTAN NAMA di atas.

INSTRUKSI KHUSUS:
Jawablah langsung sebagai Eva. Jangan sertakan JSON atau format lain. Langsung teks percakapan.
`;
};

const createSafetyAnalysisPrompt = (userMessage: string) => {
  return `
ANALISIS KESELAMATAN
Tugas Anda adalah menganalisis pesan pengguna untuk mendeteksi indikasi bahaya mendesak.

KRITERIA BAHAYA (URGENT):
- Ide bunuh diri atau keinginan menyakiti diri sendiri.
- Ancaman kekerasan terhadap orang lain.
- Situasi krisis mental akut yang membahayakan nyawa.

PESAN PENGGUNA:
---
${userMessage}
---

Keluaran HANYA JSON:
{
  "flag": true/false,
  "reason": "Alasan singkat jika true"
}
`;
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

KONTEKS PENGGUNA
- Nama (jika ada): ${userContext?.name ?? ""}
- Usia (tahun, jika ada): ${userContext?.ageYears ?? ""}
- Jenis kelamin (opsional): ${userContext?.gender ?? ""}
- Lokasi kasar (opsional): ${userContext?.city || userContext?.country || ""}

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
- Berikan jawaban dalam format Markdown yang terstruktur.
- Gunakan heading "## Analisis" untuk analisis situasi.
- Gunakan heading "## Saran Tindakan" untuk langkah-langkah praktis (gunakan format checklist "- [ ]").
- Gunakan heading "## Sumber Bacaan" untuk referensi jika ada.
- Hindari paragraf panjang yang membingungkan.
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
    const { message, conversation_id, user_id, history } = await req.json();
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

    // Fetch user context (privacy-preserving)
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", user_id)
      .maybeSingle();
    const userCtx = buildUserContext(profile as any);

    // Fetch User Facts (Long-term Memory)
    const userFacts = await fetchUserFacts(supabaseAdmin, user_id);

    // --- ALUR 1: PERCAKAPAN KONSULTASI (Non-Streaming for now, or Stream if needed) ---
    if (conversationData?.conversation_type === "consultation") {
      // ... existing consultation logic (keep non-streaming for safety/structure or update later) ...
      // For now, let's keep consultation as is but return JSON to avoid breaking it.
      // Or better, update it to return JSON but client handles it.
      // Wait, if we change client to expect stream, we must stream everything.
      // Let's stream consultation too.
      
      console.log(`[AI] Generating CONSULTATION response for: ${conversation_id}`);
      const consultationSummary = conversationData.full_summary || "Tidak ada rangkuman detail.";
      const consultationPrompt = createConsultationPrompt(message, consultationSummary, userCtx);
      
      const stream = await model.generateContentStream(consultationPrompt);
      
      // Create a TransformStream to process chunks and save to DB at the end
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const encoder = new TextEncoder();
      
      // Background processing
      (async () => {
        let fullResponse = "";
        try {
          for await (const chunk of stream.stream) {
            const text = chunk.text();
            fullResponse += text;
            await writer.write(encoder.encode(text));
          }
        } catch (e) {
          console.error("Stream error:", e);
          await writer.write(encoder.encode("\n[Error generating response]"));
        } finally {
          await writer.close();
          
          // Save to DB
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
              content: fullResponse,
              sender: "ai",
              created_at: new Date(requestTimestamp.getTime() + 1).toISOString()
            }
          ]);
        }
      })();

      return new Response(readable, {
        headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
      });

    } else {
      // --- ALUR 2: PERCAKAPAN BIASA (STREAMING + PARALLEL SAFETY CHECK) ---
      console.log(`[AI] Generating GENERAL response for: ${conversation_id}`);

      const isFirstMessage = (conversationData?.messages_count || 0) === 0;
      
      // 1. Construct Chat Prompt (Persona)
      const systemInstruction = createPersonaPrompt({ 
        includeGreeting: isFirstMessage, 
        userLocale, 
        userContext: userCtx,
        facts: userFacts
      });
      
      // Prepare history for Gemini
      // history passed from client is array of { role: 'user'|'model', parts: [{text: ...}] }
      // We need to prepend system instruction or use systemInstruction property if available in API
      // Gemini API supports systemInstruction in model config, but here we can just prepend to history or use generateContent
      
      // Let's use the chat history properly
      const chat = model.startChat({
        history: history || [],
        systemInstruction: { role: "system", parts: [{ text: systemInstruction }] }
      });

      // 2. Start Streaming Generation
      const result = await chat.sendMessageStream(message);
      
      // 3. Start Safety Analysis in Parallel (Fire and Forget / Background)
      const safetyAnalysisPromise = (async () => {
        try {
          const safetyPrompt = createSafetyAnalysisPrompt(message);
          const safetyResult = await model.generateContent(safetyPrompt);
          const safetyText = safetyResult.response.text();
          const jsonMatch = safetyText.match(/{[\s\S]*}/);
          if (jsonMatch) {
            const { flag } = JSON.parse(jsonMatch[0]);
            return flag === true || flag === "true";
          }
        } catch (e) {
          console.error("Safety analysis failed:", e);
        }
        return false;
      })();

      // 3b. Start Fact Extraction in Parallel (Fire and Forget)
      (async () => {
        try {
          const factPrompt = createFactExtractionPrompt(message, userFacts);
          const factResult = await model.generateContent(factPrompt);
          const factText = factResult.response.text();
          const jsonMatch = factText.match(/{[\s\S]*}/);
          if (jsonMatch) {
            const { facts } = JSON.parse(jsonMatch[0]);
            if (facts && Array.isArray(facts) && facts.length > 0) {
              const inserts = facts.map((f: string) => ({ user_id, content: f }));
              await supabaseAdmin.from("ai_user_facts").insert(inserts);
              console.log(`[FACTS] Saved ${facts.length} new facts.`);
            }
          }
        } catch (e) {
          console.error("Fact extraction failed:", e);
        }
      })();

      // 4. Handle Stream & DB Saving
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const encoder = new TextEncoder();

      (async () => {
        let fullResponse = "";
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            fullResponse += text;
            await writer.write(encoder.encode(text));
          }
        } catch (e) {
          console.error("Stream error:", e);
          await writer.write(encoder.encode("\n[Maaf, terjadi kesalahan koneksi]"));
        } finally {
          await writer.close();

          // Wait for safety analysis
          const isUrgent = await safetyAnalysisPromise;
          
          // Save to DB
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
              content: fullResponse, // Use the accumulated text
              sender: "ai",
              created_at: new Date(requestTimestamp.getTime() + 1).toISOString(),
              flag_urgent: false
            }
          ]);

          console.log(`[DB] Messages saved. Urgent: ${isUrgent}`);

          // Handle Urgent Case Creation
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
                // We need the ID of the user message we just inserted. 
                // Since we did a batch insert, we might not get the ID back easily without select.
                // Let's fetch it.
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
                  console.log(`[CASE CREATED] New urgent case for conversation ${conversation_id}`);
                  
                  supabaseAdmin.functions.invoke("notify-parent", {
                    body: {
                      messageContent: message,
                      flaggedByUserId: user_id,
                      conversationId: conversation_id
                    }
                  }).catch((err: unknown) => console.error("Error invoking notify-parent:", err));
                }
              }
            }
          }

          // Handle Summary Update
          const { full_summary: existingSummary, messages_count: oldCount } = conversationData;
          const newMessagesCount = (oldCount || 0) + 2;
          let contextForSummary: string | null = null;
          let summaryMode: "INITIAL" | "UPDATE" | null = null;

          // Generate Title & Initial Summary after ~2 user messages (4 total)
          // Only if summary doesn't exist yet
          if (newMessagesCount >= 4 && !existingSummary) {
            summaryMode = "INITIAL";
            const { data: msgs } = await supabaseAdmin
              .from("ai_messages")
              .select("content, sender")
              .eq("conversation_id", conversation_id)
              .order("created_at", { ascending: true })
              .limit(4);
            contextForSummary = msgs?.map((m: { sender: string; content: string }) => `${m.sender}: ${m.content}`).join("\n") || null;
          } 
          // Update Summary ONLY (keep title) every 10 messages to reduce load and prevent title jitter
          else if (newMessagesCount > 4 && existingSummary && newMessagesCount % 10 === 0) {
            summaryMode = "UPDATE";
            const { data: msgs } = await supabaseAdmin
              .from("ai_messages")
              .select("content, sender")
              .eq("conversation_id", conversation_id)
              .order("created_at", { ascending: false })
              .limit(6); // Context from last 6 messages
            contextForSummary = msgs?.reverse().map((m: { sender: string; content: string }) => `${m.sender}: ${m.content}`).join("\n") || null;
          }

          if (contextForSummary && summaryMode) {
            console.log(`[SUMMARY] Triggered: ${summaryMode}.`);
            model.generateContent(createOptimizedSummaryPrompt(contextForSummary!, existingSummary))
              .then(async (summaryResponse: any) => {
                 const summaryJsonMatch = summaryResponse.response.text().match(/{[\s\S]*}/);
                 if (summaryJsonMatch) {
                   const { title, summary } = JSON.parse(summaryJsonMatch[0]);
                   
                   const updateData: any = {
                     full_summary: summary,
                     updated_at: new Date().toISOString()
                   };

                   // Only update title if it's the INITIAL generation
                   if (summaryMode === "INITIAL") {
                     updateData.summary = title; // 'summary' column is used for Title in DB schema
                     updateData.title = title;   // Update title column if it exists separately, or just rely on 'summary' column mapping
                   }

                   await supabaseAdmin
                    .from("ai_conversations")
                    .update(updateData)
                    .eq("id", conversation_id);
                 }
              })
              .catch((e: unknown) => console.error("Summary update failed:", e));
          }
        }
      })();

      return new Response(readable, {
        headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  } catch (error) {
    console.error("[FATAL]", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
