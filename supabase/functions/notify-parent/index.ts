import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type"
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { messageContent, flaggedByUserId, conversationId } =
      await req.json();

    if (!messageContent || !flaggedByUserId || !conversationId) {
      throw new Error("Missing required notification details.");
    }

    console.log(`[ALERT] Urgent flag detected for user: ${flaggedByUserId}`);

    // --- [MODIFIKASI] Logika Pencarian Email Orang Tua Dua Langkah ---

    // Langkah 1: Dapatkan parent_id dari profil anak
    const { data: childProfile, error: childProfileError } = await supabaseAdmin
      .from("profiles")
      .select("parent_id")
      .eq("id", flaggedByUserId)
      .single();

    if (childProfileError) {
      throw new Error(
        `Error fetching child profile: ${childProfileError.message}`
      );
    }
    if (!childProfile || !childProfile.parent_id) {
      throw new Error(
        `Parent ID not found for user ${flaggedByUserId}. Notification cannot be sent.`
      );
    }

    const parentId = childProfile.parent_id;
    console.log(
      `[INFO] Found parent_id: ${parentId} for child: ${flaggedByUserId}`
    );

    // Langkah 2: Gunakan parent_id untuk mendapatkan email forwarding orang tua
    const { data: parentProfile, error: parentProfileError } =
      await supabaseAdmin
        .from("profiles")
        .select("forwarding")
        .eq("id", parentId)
        .single();

    if (parentProfileError) {
      throw new Error(
        `Error fetching parent profile: ${parentProfileError.message}`
      );
    }
    if (!parentProfile || !parentProfile.forwarding) {
      throw new Error(`Forwarding email not found for parent ${parentId}.`);
    }

    const parentEmail = parentProfile.forwarding;
    // --------------------------------------------------------------------

    if (!RESEND_API_KEY || !SENDER_EMAIL) {
      console.warn("Resend API Key or Sender Email is not set.");
      throw new Error("Notification service is not configured.");
    }

    const subject = "Peringatan Penting Mengenai Aktivitas Anak Anda";
    const htmlBody = `
      <h1>Peringatan Konten Berbahaya Terdeteksi</h1>
      <p>Halo,</p>
      <p>Sistem kami mendeteksi pesan yang berpotensi berbahaya dari anak Anda. Kami menyarankan Anda untuk segera meninjau percakapan dan berbicara dengan anak Anda.</p>
      <hr>
      <p><strong>Pesan yang ditandai:</strong></p>
      <blockquote style="border-left: 4px solid #ccc; padding-left: 1em; margin: 1em 0; color: #555;">
        ${messageContent}
      </blockquote>
      <hr>
      <p><strong>Detail Teknis (untuk referensi):</strong></p>
      <ul>
        <li><strong>User ID Anak:</strong> <code>${flaggedByUserId}</code></li>
        <li><strong>Conversation ID:</strong> <code>${conversationId}</code></li>
      </ul>
      <p>Terima kasih atas perhatian Anda.</p>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: SENDER_EMAIL,
        to: parentEmail,
        subject: subject,
        html: htmlBody
      })
    });

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.json();
      throw new Error(`Failed to send email: ${JSON.stringify(errorBody)}`);
    }

    console.log(`[SUCCESS] Notification email sent to ${parentEmail}`);

    return new Response(
      JSON.stringify({ success: true, message: "Notification email sent." }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (error) {
    console.error("[FATAL] Error in notify-parent function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
