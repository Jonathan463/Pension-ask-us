import type { Source } from "../api/types";

interface Props {
  sources: Source[];
}

export function SourceList({ sources }: Props) {
  if (sources.length === 0) {
    return null;
  }
  return (
    <div className="sources">
      <h3 className="sources__heading">Sources</h3>
      <ul className="sources__list">
        {sources.map((source) => (
          <li className="sources__item" key={`${source.url}-${source.title}`}>
            <a
              className="sources__link"
              href={source.url}
              target="_blank"
              rel="noreferrer noopener"
            >
              {source.title}
            </a>
            <span className="sources__score" aria-label="similarity score">
              {source.score.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
