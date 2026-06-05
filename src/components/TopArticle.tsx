import type { Source } from "../api/types";

interface Props {
  source: Source;
}

export function TopArticle({ source }: Props) {
  return (
    <div className="top-article" aria-label="Most relevant article">
      <h3 className="top-article__heading">Most relevant article</h3>
      <a
        className="top-article__link"
        href={source.url}
        target="_blank"
        rel="noreferrer noopener"
      >
        {source.title}
      </a>
      <span className="top-article__score" aria-label="similarity score">
        {source.score.toFixed(2)}
      </span>
    </div>
  );
}
