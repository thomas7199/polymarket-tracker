// netlify/functions/polymarket.js
// This serverless function proxies requests to Polymarket's API
// Uses the current strapi-matic endpoint (gamma-api is deprecated)

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

    // Use the current strapi-matic endpoint (gamma-api is deprecated)
    // This returns events with their markets
    const polymarketUrl = `https://strapi-matic.poly.market/events?slug=${encodeURIComponent(
      slug
    )}`;

    const response = await fetch(polymarketUrl);
    const data = await response.json();

    // strapi returns an array, we'll return the first event if it exists
    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ error: "Market not found", data: [] }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return the data with proper CORS headers
    return new Response(JSON.stringify(data[0]), {
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