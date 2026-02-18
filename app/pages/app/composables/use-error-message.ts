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
      "This link is in a committed relationship with error messages.",
      "The content went out for milk and never came back.",
      "404: Summary not found (but we checked everywhere).",
      "This URL is having an existential crisis.",
      "The website's guard dog wouldn't let us in.",
      "This one's confused about its life choices.",
      "The content is metaphorically in Canada.",
      "We tried, but the website was not impressed.",
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];
    return message || messages[0]!;
  };

  const getFriendlyErrorMessage = (errorMessage: string): string => {
    const raw = errorMessage || "";

    // Video length errors (specific messages)
    if (raw.includes("Video too short")) {
      return "Videos under 5 minutes are too brief to summarize meaningfully. Try a longer video.";
    }
    if (raw.includes("Video too long")) {
      return "Videos over 3 hours exceed the maximum supported length. Try a shorter video.";
    }
    if (raw.includes("Not worth watching")) {
      return raw; // Show the full "Not worth watching" message with reasoning
    }
    if (raw.includes("Live streams")) {
      return "Live streams aren't supported yet. Wait for the stream to end and try again.";
    }

    // YouTube specific errors
    if (raw.includes("Invalid YouTube URL") || raw.includes("Could not extract video ID")) {
      return "That doesn't look like a valid YouTube URL. Check the link?";
    }
    if (raw.includes("Video not found") || raw.includes("private")) {
      return "This video's private or unavailable. Want to try another?";
    }
    if (raw.includes("age") && raw.includes("restricted")) {
      return "This video is age-restricted and can't be summarized.";
    }

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

    // Generic fallback
    return getRandomMessage();
  };

  return {
    getFriendlyErrorMessage,
  };
}
