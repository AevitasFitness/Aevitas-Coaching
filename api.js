addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxYfF_mHzImT348OVH8qwvR8M5kfEqygA4wASb-GAQZLO_lzzwprwUf-OQBJoWxaxZJog/exec";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};

async function handleRequest(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(request.url);
  const params = url.searchParams.toString();

  try {
    let response;

    if (request.method === "GET") {
      let currentUrl = APPS_SCRIPT_URL + (params ? "?" + params : "");
      let attempts = 0;
      while (attempts < 5) {
        response = await fetch(currentUrl, { redirect: "manual" });
        if (response.status >= 300 && response.status < 400) {
          currentUrl = response.headers.get("location");
          attempts++;
        } else {
          break;
        }
      }
    } else if (request.method === "POST") {
      const body = await request.text();
      let currentUrl = APPS_SCRIPT_URL;
      let attempts = 0;
      while (attempts < 5) {
        response = await fetch(currentUrl, {
          method: attempts === 0 ? "POST" : "GET",
          headers: { "Content-Type": "text/plain" },
          body: attempts === 0 ? body : undefined,
          redirect: "manual"
        });
        if (response.status >= 300 && response.status < 400) {
          currentUrl = response.headers.get("location");
          attempts++;
        } else {
          break;
        }
      }
    }

    const text = await response.text();

    if (text.trim().startsWith("<")) {
      return new Response(
        JSON.stringify({ error: "Apps Script returned HTML" }),
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