import { Paddle, Environment } from "@paddle/paddle-node-sdk";

/**
 * GET /api/prices
 * Fetches real-time pricing data from Paddle for the configured plans.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  
  if (!config.private.paddleKey) {
    console.error("[Prices API] Missing PADDLE_API_KEY");
    throw createError({ statusCode: 500, statusMessage: "Paddle not configured" });
  }

  // Explicitly set environment to sandbox for development
  const paddle = new Paddle(config.private.paddleKey, {
    environment: config.public.paddleEnv === 'production' ? Environment.production : Environment.sandbox
  });

  const priceIds = [
    config.public.prices.read,
    config.public.prices.digest,
    config.public.prices.deep
  ].filter(Boolean) as string[];

  console.log("[Prices API] Querying Paddle for IDs:", priceIds);

  try {
    // 1. Try to fetch specific prices
    const pricesCollection = paddle.prices.list({
      id: priceIds,
      status: ["active"] // Only fetch active ones
    });
    
    const prices = await pricesCollection.next();

    console.log("[Prices API] Raw Collection Size:", prices.length);
    
    if (prices.length === 0) {
      console.warn("[Prices API] No prices found for specific IDs. Attempting to list ALL active prices to debug...");
      const allPrices = await paddle.prices.list({ status: ["active"] }).next();
      console.log("[Prices API] All Active Price IDs in Account:", allPrices.map(p => p.id));
    }

    // Map the results
    const priceMap = prices.map(p => {
      // Log individual price object structure to terminal
      console.log(`[Prices API] Processing Price: ${p.id}`, JSON.stringify({
        id: p.id,
        amount: p.unitPrice.amount,
        currency: p.unitPrice.currencyCode
      }));

      return {
        id: String(p.id),
        amount: p.unitPrice.amount,
        currency: p.unitPrice.currencyCode,
        formatted: (parseInt(p.unitPrice.amount) / 100).toFixed(0),
      };
    });

    return { prices: priceMap };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[Prices API] PADDLE SDK ERROR:", msg);
    return { 
      prices: [], 
      error: msg,
      debug: { requestedIds: priceIds }
    };
  }
});
