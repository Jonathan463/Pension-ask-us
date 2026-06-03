import { useState } from "react";
import { ApiError, apiClient } from "../api/client";
import type { IngestResponse } from "../api/types";

interface Props {
  onIngested?: () => void;
}

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; result: IngestResponse }
  | { kind: "error"; error: ApiError };

export function IngestPanel({ onIngested }: Props) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const handleIngest = async () => {
    setStatus({ kind: "loading" });
    try {
      const result = await apiClient.ingest();
      setStatus({ kind: "success", result });
      onIngested?.();
    } catch (caught) {
      const apiError =
        caught instanceof ApiError
          ? caught
          : new ApiError(0, {
              error: "network_error",
              message:
                caught instanceof Error
                  ? caught.message
                  : "Could not reach the backend.",
              details: {},
            });
      setStatus({ kind: "error", error: apiError });
    }
  };

  const isLoading = status.kind === "loading";

  return (
    <section className="ingest" aria-label="Re-index knowledge base">
      <div className="ingest__row">
        <div>
          <h2 className="ingest__heading">Knowledge base</h2>
          <p className="ingest__hint">
            Fetch the configured NHSBSA articles and rebuild the vector index.
          </p>
        </div>
        <button
          type="button"
          className="ingest__button"
          onClick={handleIngest}
          disabled={isLoading}
        >
          {isLoading ? "Ingesting…" : "Run ingest"}
        </button>
      </div>

      {status.kind === "success" && (
        <div className="alert alert--ok" role="status">
          Ingested {status.result.articles_ingested} articles ·{" "}
          {status.result.chunks_indexed} chunks indexed.
        </div>
      )}

      {status.kind === "error" && (
        <div
          className={`alert ${
            status.error.status >= 500 ? "alert--error" : "alert--warn"
          }`}
          role="alert"
        >
          <strong>[{status.error.code}]</strong> {status.error.message}
        </div>
      )}
    </section>
  );
}
