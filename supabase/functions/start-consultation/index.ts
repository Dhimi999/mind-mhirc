import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type"
};
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { case_id, parent_user_id } = await req.json();
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Ambil data kasus
    const { data: caseData, error: caseError } = await supabaseAdmin
      .from("urgent_cases")
      .select(
        "*, source_conversation:source_conversation_id(full_summary, title)"
      )
      .eq("id", case_id)
      .single();

    if (caseError || !caseData) throw new Error("Case not found.");

    // 2. Jika sudah ada ruang konsultasi, langsung kembalikan
    if (caseData.parent_consultation_id) {
      const { data: existingConv } = await supabaseAdmin
        .from("ai_conversations")
        .select("*")
        .eq("id", caseData.parent_consultation_id)
        .single();
      return new Response(JSON.stringify(existingConv), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 3. Buat ruang konsultasi baru untuk orang tua
    const childsSummary =
      caseData.source_conversation.full_summary ||
      `Membahas percakapan anak: "${caseData.source_conversation.title}"`;
    const initialAiMessageContent = `Halo. Saya mendeteksi adanya percakapan yang memerlukan perhatian pada anak Anda. Berikut adalah rangkuman dari percakapan tersebut:\n\n---\n"${childsSummary}"\n---\n\nSaya di sini untuk membantu Anda memahami situasi ini dan mendiskusikan langkah-langkah selanjutnya. Apa yang ingin Anda tanyakan?`;

    // Buat percakapan baru untuk orang tua
    const { data: newConversation, error: newConvError } = await supabaseAdmin
      .from("ai_conversations")
      .insert({
        user_id: parent_user_id,
        title: `Konsultasi: ${caseData.source_conversation.title}`,
        conversation_type: "consultation" // <-- TAMBAHAN DI SINI
      })
      .select()
      .single();

    if (newConvError) throw newConvError;

    // Tambahkan pesan pertama dari AI ke percakapan baru
    await supabaseAdmin.from("ai_messages").insert({
      conversation_id: newConversation.id,
      user_id: parent_user_id,
      content: initialAiMessageContent,
      sender: "ai"
    });

    // 4. Update tabel kasus dengan ID konsultasi baru dan tandai sebagai selesai
    await supabaseAdmin
      .from("urgent_cases")
      .update({
        parent_consultation_id: newConversation.id,
        is_resolved: true
      })
      .eq("id", case_id);

    // 5. Kembalikan data percakapan baru ke frontend
    return new Response(JSON.stringify(newConversation), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("[FATAL] Error in start-consultation:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
