// supabase/functions/test-caller/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (_req) => {
  console.log("[test-caller] Starting invocation...");

  try {
    const response = await fetch(
      `${Deno.env.get("SUPABASE_URL")!}/functions/v1/test-callee`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: "Hello from caller!" })
      }
    );

    console.log(
      `[test-caller] Invocation finished. Status: ${response.status}`
    );

    const responseData = await response.json();
    console.log("[test-caller] Response from callee:", responseData);

    return new Response(
      JSON.stringify({ success: true, data_from_callee: responseData }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[test-caller] Invocation failed:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
