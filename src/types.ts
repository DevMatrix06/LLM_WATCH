export interface LogPayload {
  timestamp: string;
  model: string;
  prompt: string;
  completion: string;
  latency_ms: number;
  tokens_used: number;
  cost_usd: number;
  error_type?: string;
  error_message?: string;
  projectId?: string;
  userId?: string;
  sessionId?: string;
  tags?: string[];
}

export interface WatchOptions {
  /** Omit or leave empty to enable local dev mode (logs to console). */
  apiKey?: string;
  endpoint?: string;
  onError?: (err: Error) => void;
  metadata?: Record<string, unknown>;
  projectId?: string;
  userId?: string;
  sessionId?: string;
  tags?: string[];
  /** When true, replaces prompt and completion with [masked] before sending. */
  maskPrompts?: boolean;
}
