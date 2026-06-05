import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnswerPanel } from "../components/AnswerPanel";

describe("AnswerPanel", () => {
  it("renders the answer body, the top article, and the share form", () => {
    render(
      <AnswerPanel
        answer={{
          question: "How much do I contribute?",
          answer: "Based on 2 relevant articles:\n- ...",
          sources: [
            {
              title: "What are pension contributions?",
              url: "https://e/ka-1",
              score: 0.91,
            },
            { title: "Earnings Cap", url: "https://e/ka-2", score: 0.7 },
          ],
          top_source: {
            title: "What are pension contributions?",
            url: "https://e/ka-1",
            score: 0.91,
          },
        }}
      />,
    );

    expect(screen.getByText(/Based on 2 relevant articles/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /most relevant article/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /what are pension contributions/i }),
    ).toHaveAttribute("href", "https://e/ka-1");
    expect(screen.getByText("0.91")).toBeInTheDocument();
    expect(
      screen.getByRole("form", { name: /share the top article/i }),
    ).toBeInTheDocument();
  });

  it("falls back to sources[0] when top_source is missing", () => {
    render(
      <AnswerPanel
        answer={{
          question: "anything?",
          answer: "...",
          sources: [
            { title: "Only one", url: "https://e/only", score: 0.5 },
          ],
        }}
      />,
    );
    expect(
      screen.getByRole("link", { name: /only one/i }),
    ).toHaveAttribute("href", "https://e/only");
  });

  it("omits the share form when there is no source at all", () => {
    render(
      <AnswerPanel
        answer={{
          question: "anything?",
          answer: "I don't know.",
          sources: [],
        }}
      />,
    );
    expect(
      screen.queryByRole("form", { name: /share the top article/i }),
    ).not.toBeInTheDocument();
  });
});
