import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function countWords(
  text: string | null | undefined,
  allowMultipleSpaces = false
): number {
  if (!text) return 0
  const pattern = allowMultipleSpaces ? /\s+/ : /\s+/
  return text.trim().split(pattern).filter(Boolean).length
}
