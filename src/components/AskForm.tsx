import { FormEvent, useState } from "react";

interface Props {
  onSubmit: (question: string) => void | Promise<void>;
  loading: boolean;
}

export function AskForm({ onSubmit, loading }: Props) {
  const [question, setQuestion] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || loading) {
      return;
    }
    void onSubmit(trimmed);
  };

  return (
    <form className="ask-form" onSubmit={handleSubmit} aria-label="Ask a question">
      <label className="ask-form__label" htmlFor="question">
        Ask a pension question
      </label>
      <textarea
        id="question"
        className="ask-form__input"
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        placeholder="e.g. How much do I contribute to my NHS pension?"
        rows={3}
        disabled={loading}
      />
      <button
        type="submit"
        className="ask-form__submit"
        disabled={loading || question.trim().length < 2}
      >
        {loading ? "Asking…" : "Ask"}
      </button>
    </form>
  );
}
