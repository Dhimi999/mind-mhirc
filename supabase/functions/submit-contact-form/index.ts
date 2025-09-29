
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Set up CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Handle pre-flight CORS request
const handleCors = (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        ...corsHeaders,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }
  return null;
};

// Interface for contact message
interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) {
    return corsResponse;
  }

  try {
    // Check for POST method
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
    
    // Parse request body
    const contactData: ContactMessage = await req.json();
    
    // Validate required fields
    if (!contactData.name || !contactData.email || !contactData.subject || !contactData.message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
    
    // Create Supabase client with admin privileges
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );
    
    // Insert data into contact_messages table with admin privileges
    const { error } = await supabaseClient
      .from("contact_messages")
      .insert([{
        name: contactData.name,
        email: contactData.email,
        subject: contactData.subject,
        message: contactData.message,
        status: "unread"
      }]);
    
    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to save contact message", details: error.message }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: "Contact message saved successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    // Handle general errors
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({ error: "Server error", details: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});
