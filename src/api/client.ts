import type {
  ApiErrorBody,
  AskRequest,
  AskResponse,
  HealthResponse,
  IngestRequest,
  IngestResponse,
  ShareRequest,
  ShareResponse,
} from "./types";

const DEFAULT_BASE_URL = "http://127.0.0.1:8000";

function resolveBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL;
  return (typeof fromEnv === "string" && fromEnv.length > 0
    ? fromEnv
    : DEFAULT_BASE_URL
  ).replace(/\/+$/, "");
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: Record<string, unknown>;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message || body.error || `HTTP ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.code = body.error;
    this.details = body.details ?? {};
  }
}

export interface ApiClientOptions {
  baseUrl?: string;
  fetch?: typeof fetch;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? resolveBaseUrl()).replace(/\/+$/, "");
    // Bind so callers can pass `globalThis.fetch` without losing `this`.
    this.fetchImpl = (options.fetch ?? globalThis.fetch).bind(globalThis);
  }

  async health(): Promise<HealthResponse> {
    return this.request<HealthResponse>("GET", "/health");
  }

  async ask(payload: AskRequest): Promise<AskResponse> {
    return this.request<AskResponse>("POST", "/ask", payload);
  }

  async ingest(payload: IngestRequest = {}): Promise<IngestResponse> {
    return this.request<IngestResponse>("POST", "/ingest", payload);
  }

  async share(payload: ShareRequest): Promise<ShareResponse> {
    return this.request<ShareResponse>("POST", "/share", payload);
  }

  private async request<T>(
    method: "GET" | "POST",
    path: string,
    body?: unknown,
  ): Promise<T> {
    const init: RequestInit = {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    };
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, init);
    if (!response.ok) {
      throw await this.toApiError(response);
    }
    return (await response.json()) as T;
  }

  private async toApiError(response: Response): Promise<ApiError> {
    let parsed: ApiErrorBody;
    try {
      parsed = (await response.json()) as ApiErrorBody;
    } catch {
      parsed = {
        error: "non_json_response",
        message: `HTTP ${response.status} ${response.statusText}`.trim(),
        details: {},
      };
    }
    return new ApiError(response.status, parsed);
  }
}

export const apiClient = new ApiClient();
