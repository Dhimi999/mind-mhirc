import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (_req) => {
  try {
    // Bagian ini tidak berubah
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: conversations, error: convoError } = await supabaseAdmin
      .from("ai_conversations")
      .select("id, summary, full_summary, messages_count")
      .lt("updated_at", fiveMinutesAgo)
      .or("summary.is.null,full_summary.is.null");

    if (convoError) throw convoError;
    if (!conversations || conversations.length === 0) {
      return new Response(
        JSON.stringify({ message: "No conversations needed summarizing." }),
        { status: 200 }
      );
    }

    console.log(
      `Cron job will attempt to process ${conversations.length} conversations.`
    );

    let processedCount = 0;
    for (const convo of conversations) {
      try {
        const needsSummary =
          convo.summary === null && convo.messages_count >= 4;
        const needsFullSummary =
          convo.full_summary === null && convo.messages_count >= 10;

        if (!needsSummary && !needsFullSummary) continue;

        processedCount++;
        console.log(
          `Processing conversation ${convo.id}... Needs summary: ${needsSummary}, Needs full summary: ${needsFullSummary}`
        );

        // Bagian ini tidak berubah
        const { data: messages, error: msgError } = await supabaseAdmin
          .from("ai_messages")
          .select("content, sender")
          .eq("conversation_id", convo.id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (msgError) throw msgError;
        if (messages.length === 0) continue;

        const conversationContext = messages
          .reverse()
          .map(
            (msg: any) =>
              `${msg.sender === "user" ? "User" : "AI"}: ${msg.content}`
          )
          .join("\n");

        // ====================================================================
        // PERUBAHAN UTAMA: Ganti .invoke() dengan fetch()
        // ====================================================================
        const tasksToRun = [];

        if (needsSummary) {
          tasksToRun.push({ task: "summarize", context: conversationContext });
        }
        if (needsFullSummary) {
          tasksToRun.push({
            task: "full_summarize",
            context: conversationContext
          });
        }

        for (const taskDetail of tasksToRun) {
          console.log(
            `[HTTP-FETCH] Invoking task '${taskDetail.task}' for conversation ${convo.id}`
          );

          const response = await fetch(
            `${Deno.env.get("SUPABASE_URL")!}/functions/v1/chat-ai`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${Deno.env.get(
                  "SUPABASE_SERVICE_ROLE_KEY"
                )!}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                task: taskDetail.task,
                message: taskDetail.context,
                conversation_id: convo.id
              })
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            console.error(
              `Failed to invoke ${taskDetail.task} for ${convo.id}. Status: ${response.status}`,
              errorData
            );
          } else {
            console.log(
              `Successfully invoked ${taskDetail.task} for ${convo.id}. Status: ${response.status}`
            );
          }
        }
        // ====================================================================
      } catch (innerError) {
        console.error(
          `Failed to process conversation ${convo.id}:`,
          innerError.message
        );
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${processedCount} out of ${conversations.length} inactive conversations.`
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Cron job failed:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    });
  }
});
