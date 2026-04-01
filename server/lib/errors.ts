export interface ProcessingError {
  type: "email" | "llm" | "transcript" | "youtube_api" | "redis" | "db" | "unknown";
  message: string;
  timestamp: string;
  retryCount?: number;
  raw?: string;
}

export type ErrorLog = ProcessingError[];

export function parseErrorLog(raw: string | null): ErrorLog {
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [{ type: "unknown", message: raw, timestamp: new Date().toISOString() }];
  }
}

export function stringifyErrorLog(log: ErrorLog): string {
  return JSON.stringify(log);
}

export function addError(
  existingLog: string | null,
  error: Omit<ProcessingError, "timestamp">,
): string {
  const log = parseErrorLog(existingLog);
  log.push({
    ...error,
    timestamp: new Date().toISOString(),
  });
  return stringifyErrorLog(log);
}
