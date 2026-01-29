// netlify/functions/polymarket.js
// This serverless function proxies requests to Polymarket's API

export default async (request) => {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");

    if (!slug) {
      return new Response(
        JSON.stringify({ error: "Market slug is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Try strapi-matic endpoint
    const polymarketUrl = `https://strapi-matic.poly.market/events?slug=${encodeURIComponent(slug)}`;

    const response = await fetch(polymarketUrl);
    
    // If strapi-matic fails, try gamma-api as fallback
    if (!response.ok) {
      const gammaUrl = `https://gamma-api.polymarket.com/markets?slug=${encodeURIComponent(slug)}`;
      const gammaResponse = await fetch(gammaUrl);
      const gammaData = await gammaResponse.json();
      
      return new Response(JSON.stringify({ source: "gamma", data: gammaData }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const data = await response.json();

    return new Response(JSON.stringify({ source: "strapi", data: data }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};