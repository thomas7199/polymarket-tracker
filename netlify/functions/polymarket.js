// netlify/functions/polymarket.js

export default async (request) => {
  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");

    if (!slug) {
      return new Response(JSON.stringify({ error: "No slug provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Try fetching from strapi-matic first
    try {
      const strapiUrl = `https://strapi-matic.poly.market/events?slug=${encodeURIComponent(slug)}`;
      const strapiResponse = await fetch(strapiUrl, {
        timeout: 5000
      });
      
      if (strapiResponse.ok) {
        const strapiData = await strapiResponse.json();
        return new Response(JSON.stringify({ 
          source: "strapi",
          data: strapiData 
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
    } catch (strapiError) {
      console.log("Strapi failed, trying gamma-api:", strapiError.message);
    }

    // Fallback to gamma-api
    try {
      const gammaUrl = `https://gamma-api.polymarket.com/markets?slug=${encodeURIComponent(slug)}`;
      const gammaResponse = await fetch(gammaUrl, {
        timeout: 5000
      });

      if (gammaResponse.ok) {
        const gammaData = await gammaResponse.json();
        return new Response(JSON.stringify({ 
          source: "gamma",
          data: gammaData 
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } else {
        return new Response(JSON.stringify({ 
          error: "Market not found",
          status: gammaResponse.status 
        }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (gammaError) {
      return new Response(JSON.stringify({ 
        error: "Failed to fetch from API",
        details: gammaError.message
      }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: "Function error",
      message: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};