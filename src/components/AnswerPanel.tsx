import type { AskResponse } from "../api/types";
import { SourceList } from "./SourceList";

interface Props {
  answer: AskResponse;
}

export function AnswerPanel({ answer }: Props) {
  return (
    <section className="answer" aria-label="Answer">
      <h2 className="answer__heading">Answer</h2>
      <pre className="answer__body">{answer.answer}</pre>
      <SourceList sources={answer.sources} />
    </section>
  );
}
