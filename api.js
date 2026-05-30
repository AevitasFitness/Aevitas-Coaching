export async function onRequest(context) {
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxYfF_mHzImT348OVH8qwvR8M5kfEqygA4wASb-GAQZLO_lzzwprwUf-OQBJoWxaxZJog/exec";

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  const request = context.request;

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(request.url);
    let response;

    if (request.method === "GET") {
      const targetUrl = APPS_SCRIPT_URL + "?" + url.searchParams.toString();
      // Follow redirects manually
      response = await fetch(targetUrl, { redirect: "follow" });
    } else if (request.method === "POST") {
      const body = await request.text();
      response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: body,
        redirect: "follow"
      });
    }

    const text = await response.text();

    // Check if we got HTML instead of JSON (login redirect)
    if (text.trim().startsWith("<")) {
      return new Response(
        JSON.stringify({ error: "Apps Script returned HTML - check deployment permissions" }),
        { status: 502, headers: corsHeaders }
      );
    }

    return new Response(text, { headers: corsHeaders });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}