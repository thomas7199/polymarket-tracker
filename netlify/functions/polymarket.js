// netlify/functions/polymarket.js
// This serverless function proxies requests to Polymarket's Gamma API
// It runs on Netlify's backend and bypasses CORS issues completely

export default async (request) => {
  // Only allow GET requests
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Extract the market slug from the query parameter
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");

    if (!slug) {
      return new Response(
        JSON.stringify({ error: "Market slug is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Make the request to Polymarket's Gamma API from the backend
    // (no CORS issues here because it's server-to-server)
    const polymarketUrl = `https://gamma-api.polymarket.com/markets?slug=${encodeURIComponent(
      slug
    )}`;

    const response = await fetch(polymarketUrl);
    const data = await response.json();

    // Return the data with proper CORS headers
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
