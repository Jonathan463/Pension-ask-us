import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IngestPanel } from "../components/IngestPanel";
import { apiClient, ApiError } from "../api/client";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("IngestPanel", () => {
  it("calls apiClient.ingest and renders the success summary", async () => {
    const ingest = vi
      .spyOn(apiClient, "ingest")
      .mockResolvedValue({ articles_ingested: 14, chunks_indexed: 43 });
    const onIngested = vi.fn();
    const user = userEvent.setup();

    render(<IngestPanel onIngested={onIngested} />);
    await user.click(screen.getByRole("button", { name: /run ingest/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/14 articles · 43 chunks indexed/i),
      ).toBeInTheDocument();
    });
    expect(ingest).toHaveBeenCalledTimes(1);
    expect(onIngested).toHaveBeenCalledTimes(1);
  });

  it("shows the backend error code when ingest fails", async () => {
    vi.spyOn(apiClient, "ingest").mockRejectedValue(
      new ApiError(502, {
        error: "ingestion_failed",
        message: "Ingestion produced no usable articles.",
        details: { requested_urls: 1 },
      }),
    );
    const user = userEvent.setup();

    render(<IngestPanel />);
    await user.click(screen.getByRole("button", { name: /run ingest/i }));

    await waitFor(() => {
      expect(screen.getByText(/ingestion_failed/i)).toBeInTheDocument();
    });
    expect(
      screen.getByText(/produced no usable articles/i),
    ).toBeInTheDocument();
  });
});
