// Mirrors pension_ask_us/schemas.py. Keep in sync with the backend.

export interface AskRequest {
  question: string;
  top_k?: number | null;
}

export interface Source {
  title: string;
  url: string;
  score: number;
}

export interface AskResponse {
  question: string;
  answer: string;
  sources: Source[];
}

export interface IngestRequest {
  urls?: string[] | null;
}

export interface IngestResponse {
  articles_ingested: number;
  chunks_indexed: number;
}

export interface HealthResponse {
  status: string;
  indexed_chunks: number;
}

// Matches the JSON body produced by
// pension_ask_us/api/exception_handlers.py.
export interface ApiErrorBody {
  error: string;
  message: string;
  details: Record<string, unknown>;
}
