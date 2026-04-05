import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export default defineEventHandler((event) => {
  const query = getQuery(event);

  const filePath = resolve(
    process.cwd(),
    "server/routes/share/templates/social-media-card.html"
  );

  try {
    let html = readFileSync(filePath, "utf-8");

    // Construct the metadata text from label and category if provided
    const label = (query.label as string) || "Article";
    const category = (query.category as string) || "adventures.nodeland.dev";
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
        (query.logo as string) || "http://localhost:3000/favicon-2048x2048.png",
    };

    // Apply replacements
    Object.entries(replacements).forEach(([oldValue, newValue]) => {
      html = html.split(oldValue).join(newValue);
    });

    setResponseHeader(event, "Content-Type", "text/html");
    return html;
  } catch (error) {
    throw createError({
      statusCode: 404,
      statusMessage: `Template not found: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
  }
});
