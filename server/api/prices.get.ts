import { getPolarClient } from "../utils/polar";

export default defineEventHandler(async () => {
  const polar = getPolarClient();

  try {
    const products = await polar.products.list({
      isArchived: false,
      visibility: ["public"],
    });
    // console.log("Fetching products from Polar", products.result);

    // Let the frontend handle display, but filter out archived.
    // The SDK automatically camelCases the response, so we can check isRecurring.
    return (products.result.items ?? []).filter(p => p.isRecurring === true);
  } catch (error) {
    console.error("Failed to fetch products from Polar:", error);
    return [];
  }
});
