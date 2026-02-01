export function useErrorMessage() {
  const getRandomMessage = (): string => {
    const messages = [
      "This one's playing hard to get. Try another URL?",
      "The website said no. We're bummed too.",
      "Couldn't crack this one. Want to try something else?",
      "The content is on vacation. Try another link?",
      "This link's feeling shy. Give another one a shot?",
      "Well, that was awkward. Want to try a different URL?",
      "The website's not in the mood. Maybe another link?",
      "Oops! This one's being stubborn. Try another?",
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];
    return message || messages[0]!;
  };

  const getFriendlyErrorMessage = (errorMessage: string): string => {
    const raw = errorMessage || "";

    // Site protection/bot detection (Cloudflare, etc.)
    if (
      raw.includes("Just a moment") ||
      raw.includes("Checking your browser") ||
      raw.includes("bot protection") ||
      raw.includes("CAPTCHA") ||
      raw.includes("protected")
    ) {
      return getRandomMessage();
    }

    // Jina API errors
    if (raw.includes("500") || raw.includes("Internal Server Error")) {
      return "The site's taking a nap. Try again in a bit?";
    }
    if (raw.includes("Failed to fetch")) {
      return "Hmm, we can't find that page. Check the URL?";
    }
    if (raw.includes("timeout") || raw.includes("timed out")) {
      return "This is taking forever... let's try another one?";
    }

    // YouTube errors
    if (raw.includes("YouTube") || raw.includes("video")) {
      return "This video's feeling private. Want to try another?";
    }

    // Generic fallback
    return getRandomMessage();
  };

  return {
    getFriendlyErrorMessage,
  };
}
