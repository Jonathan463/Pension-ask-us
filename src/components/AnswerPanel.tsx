import type { AskResponse } from "../api/types";
import { ShareForm } from "./ShareForm";
import { TopArticle } from "./TopArticle";

interface Props {
  answer: AskResponse;
}

export function AnswerPanel({ answer }: Props) {
  const topSource = answer.top_source ?? answer.sources[0] ?? null;

  return (
    <section className="answer" aria-label="Answer">
      <h2 className="answer__heading">Answer</h2>
      <pre className="answer__body">{answer.answer}</pre>
      {topSource && <TopArticle source={topSource} />}
      {topSource && (
        <ShareForm question={answer.question} article={topSource} />
      )}
    </section>
  );
}
