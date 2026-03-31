
// layers/admin/app/lib/formatters.ts

/**
 * Formats a number with commas or returns 'N/A' if null/undefined.
 * @param value The number to format.
 */
export const formatNumber = (value: number | null | undefined): string => {
  return value ? value.toLocaleString() : "N/A";
};

/**
 * Formats a time in milliseconds to a string like "12.3s" or returns 'N/A'.
 * @param value The time in milliseconds to format.
 */
export const formatTime = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "N/A";
  return `${(value / 1000).toFixed(2)}s`;
};
