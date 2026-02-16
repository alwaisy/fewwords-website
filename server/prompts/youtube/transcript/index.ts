// Transcript extraction prompts for different video lengths
import { TRANSCRIPT_PROMPT as LONG_PROMPT } from './long';
import { TRANSCRIPT_PROMPT as MEDIUM_PROMPT } from './medium';
import { TRANSCRIPT_PROMPT as SUPERLONG_PROMPT } from './super-long';

export const TRANSCRIPT_PROMPTS = {
  MEDIUM: MEDIUM_PROMPT,
  LONG: LONG_PROMPT,
  SUPERLONG: SUPERLONG_PROMPT,
};

export type TranscriptPromptSize = keyof typeof TRANSCRIPT_PROMPTS;
