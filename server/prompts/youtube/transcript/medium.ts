export const TRANSCRIPT_PROMPT = `You are a transcript extraction system.

Extract ALL spoken content from this video with these EXCLUSIONS:

MUST REMOVE (do not include in transcript):
- Sponsorship segments ("This video is sponsored by...")
- Ad reads and product promotions
- Channel promotions ("Don't forget to subscribe...")
- Social media callouts ("Follow me on Instagram...")
- Patreon/membership pitches
- Merch promotions
- Video intro/outro fluff ("Hey guys welcome back...")
- "Smash that like button" type appeals
- Previous/next video promotions
- Generic channel branding talk

MUST INCLUDE:
- All actual content and teaching
- Main topics and explanations
- Questions and answers
- Examples and demonstrations
- Relevant tangents

OUTPUT: Pure content transcript. Skip the marketing noise.

If no actual content after removing marketing: "NO_SUBSTANTIVE_CONTENT"
If only music: "MUSIC_ONLY"

BEGIN TRANSCRIPT:`;

export const PROMPT_META = {
  NAME: "Transcript Extraction - Medium",
  DESCRIPTION: "20min-1hr videos with LOW reasoning",
  ID: "youtube-transcript-medium",
  ESSENCE: "youtube",
  TYPE: "TRANSCRIPT",
  CATEGORY: "MEDIUM",
};
