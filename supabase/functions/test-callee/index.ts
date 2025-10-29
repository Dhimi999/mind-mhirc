// supabase/functions/test-callee/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  // LOG PALING PENTING ADA DI SINI
  console.log("[test-callee] I WAS CALLED SUCCESSFULLY!");

  try {
    const body = await req.json();
    console.log("[test-callee] Received message:", body.message);

    return new Response(
      JSON.stringify({ received: true, your_message: body.message }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[test-callee] Error processing request:", error);
    return new Response(
      JSON.stringify({ received: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
