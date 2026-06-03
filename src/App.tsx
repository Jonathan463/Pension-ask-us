import { useCallback, useEffect, useState } from "react";
import { ApiError, apiClient } from "./api/client";
import type { AskResponse, HealthResponse } from "./api/types";
import { AskForm } from "./components/AskForm";
import { AnswerPanel } from "./components/AnswerPanel";
import { HealthBadge } from "./components/HealthBadge";
import { IngestPanel } from "./components/IngestPanel";

export function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [answer, setAnswer] = useState<AskResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshHealth = useCallback(async () => {
    try {
      setHealth(await apiClient.health());
    } catch {
      setHealth(null);
    }
  }, []);

  useEffect(() => {
    void refreshHealth();
  }, [refreshHealth]);

  const handleAsk = useCallback(
    async (question: string) => {
      setLoading(true);
      setError(null);
      setAnswer(null);
      try {
        const response = await apiClient.ask({ question });
        setAnswer(response);
      } catch (caught) {
        if (caught instanceof ApiError) {
          setError(caught);
        } else {
          setError(
            new ApiError(0, {
              error: "network_error",
              message:
                caught instanceof Error
                  ? caught.message
                  : "Could not reach the backend.",
              details: {},
            }),
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return (
    <div className="page">
      <header className="page-header">
        <h1>Pension Ask Us</h1>
        <HealthBadge health={health} onRefresh={refreshHealth} />
      </header>

      <main className="page-main">
        <AskForm onSubmit={handleAsk} loading={loading} />
        {error && (
          <div
            className={`alert ${error.status >= 500 ? "alert--error" : "alert--warn"}`}
            role="alert"
          >
            <strong>[{error.code}]</strong> {error.message}
          </div>
        )}
        {answer && <AnswerPanel answer={answer} />}
        <IngestPanel onIngested={refreshHealth} />
      </main>

      <footer className="page-footer">
        <small>
          Backend: <code>{import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000"}</code>
        </small>
      </footer>
    </div>
  );
}
