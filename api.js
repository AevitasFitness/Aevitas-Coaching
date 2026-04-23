export async function onRequest(context) {
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyH4cDx0ls_R_mHRVC16pFIUsnm1FuRfn9cghVP7tse8JARyJyPZZ-FZfFnPT6JEMLlWw/exec";

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  const request = context.request;

  // Handle preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let response;
    const url = new URL(request.url);

    if (request.method === "GET") {
      const targetUrl = APPS_SCRIPT_URL + "?" + url.searchParams.toString();
      response = await fetch(targetUrl);
    } else if (request.method === "POST") {
      const body = await request.text();
      response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: body
      });
    }

    const text = await response.text();
    return new Response(text, { headers: corsHeaders });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}