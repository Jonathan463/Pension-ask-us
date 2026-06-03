import type { HealthResponse } from "../api/types";

interface Props {
  health: HealthResponse | null;
  onRefresh: () => void;
}

export function HealthBadge({ health, onRefresh }: Props) {
  const isUp = health !== null && health.status === "ok";
  const label = isUp
    ? `Backend OK · ${health!.indexed_chunks} chunks`
    : "Backend unreachable";

  return (
    <button
      type="button"
      className={`health-badge ${isUp ? "health-badge--ok" : "health-badge--down"}`}
      onClick={onRefresh}
      aria-label="Refresh backend status"
      title="Click to re-check the backend"
    >
      <span className="health-badge__dot" aria-hidden />
      {label}
    </button>
  );
}
