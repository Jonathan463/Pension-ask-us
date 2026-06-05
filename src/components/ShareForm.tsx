import { FormEvent, useState } from "react";
import { ApiError, apiClient } from "../api/client";
import type { ShareResponse, Source } from "../api/types";

interface Props {
  question: string;
  article: Source;
}

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; result: ShareResponse }
  | { kind: "error"; error: ApiError };

export function ShareForm({ question, article }: Props) {
  const [recipient, setRecipient] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleaned = recipient.trim();
    if (!cleaned || status.kind === "loading") {
      return;
    }
    setStatus({ kind: "loading" });
    try {
      const result = await apiClient.share({
        recipient: cleaned,
        question,
        article_title: article.title,
        article_url: article.url,
        note: note.trim() ? note.trim() : null,
      });
      setStatus({ kind: "success", result });
      setRecipient("");
      setNote("");
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
    <form
      className="share-form"
      onSubmit={handleSubmit}
      aria-label="Share the top article"
    >
      <h3 className="share-form__heading">Share this article</h3>
      <p className="share-form__hint">
        Send the link to <strong>{article.title}</strong> by email.
      </p>

      <label className="share-form__label" htmlFor="share-recipient">
        Recipient email
      </label>
      <input
        id="share-recipient"
        type="email"
        className="share-form__input"
        value={recipient}
        onChange={(event) => setRecipient(event.target.value)}
        placeholder="name@example.com"
        disabled={isLoading}
        required
      />

      <label className="share-form__label" htmlFor="share-note">
        Note (optional)
      </label>
      <textarea
        id="share-note"
        className="share-form__textarea"
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Anything you want to add?"
        rows={2}
        disabled={isLoading}
      />

      <button
        type="submit"
        className="share-form__submit"
        disabled={isLoading || recipient.trim().length < 3}
      >
        {isLoading ? "Sending…" : "Send email"}
      </button>

      {status.kind === "success" && (
        <div className="alert alert--ok" role="status">
          Sent to {status.result.recipient} via {status.result.delivered_via}.
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
    </form>
  );
}
