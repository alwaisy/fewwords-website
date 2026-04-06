import { defineEventHandler, getQuery, createError, setResponseHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  try {
    // useStorage('assets:server') is the production-safe way to read bundled assets
    const html = await useStorage('assets:server').getItem('share/social-media-card.html');

    if (!html) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Poster template not found. Ensure it exists in server/assets/share/',
      });
    }

    let processedHtml = html.toString();

    // Construct the metadata text from label and category if provided
    const label = (query.label as string) || "Article";
    const category = (query.category as string) || "fewwords.app";
    const metaText = query.meta ? (query.meta as string) : `${category} · ${label}`;

    // Mapping of hardcoded strings in HTML to query parameters
    const replacements: Record<string, string> = {
      // Title
      "How AI Is Changing Enterprise Software Development": 
        (query.title as string) || "How AI Is Changing Enterprise Software Development",
      
      // Metadata / Source Badge
      "adventures.nodeland.dev · Article": metaText,
      
      // Footer URL
      "fewwords.app/app/few-F4n": 
        (query.url as string) || "fewwords.app/app/few-F4n",

      // Logo
      "http://localhost:3000/favicon-2048x2048.png": 
        (query.logo as string) || "https://fewwords.app/favicon-2048x2048.png",
    };

    // Apply replacements
    Object.entries(replacements).forEach(([oldValue, newValue]) => {
      processedHtml = processedHtml.split(oldValue).join(newValue);
    });

    setResponseHeader(event, "Content-Type", "text/html");
    return processedHtml;
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: `Internal Server Error: ${err.message || "Unknown error"}`,
    });
  }
});
