import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { program } = await req.json();
    
    if (!program || !["hibrida-cbt", "spiritual-budaya"].includes(program)) {
      throw new Error("Invalid program. Must be 'hibrida-cbt' or 'spiritual-budaya'");
    }

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Use service role for database operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const tableName = program === "hibrida-cbt" 
      ? "CBT_Hibrida_enrollments" 
      : "SB_enrollments";

    // Check if user is already enrolled
    const { data: existingEnrollment } = await supabaseAdmin
      .from(tableName)
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingEnrollment) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Anda sudah terdaftar pada program ini",
          enrollment: existingEnrollment,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Create new enrollment with 'pending' status
    const { data: newEnrollment, error: enrollError } = await supabaseAdmin
      .from(tableName)
      .insert({
        user_id: user.id,
        role: "reguler",
        enrollment_status: "pending",
        enrollment_requested_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (enrollError) {
      throw enrollError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Pendaftaran berhasil! Menunggu persetujuan admin.",
        enrollment: newEnrollment,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in enroll-program:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
