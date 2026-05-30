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

    const browserHeaders = {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5"
    };

    if (request.method === "GET") {
      const targetUrl = APPS_SCRIPT_URL + "?" + url.searchParams.toString();
      response = await fetch(targetUrl, {
        redirect: "follow",
        headers: browserHeaders
      });
    } else if (request.method === "POST") {
      const body = await request.text();
      response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { ...browserHeaders, "Content-Type": "text/plain" },
        body: body,
        redirect: "follow"
      });
    }

    const text = await response.text();

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