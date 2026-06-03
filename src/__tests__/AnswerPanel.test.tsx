import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnswerPanel } from "../components/AnswerPanel";

describe("AnswerPanel", () => {
  it("renders the answer body and the sources", () => {
    render(
      <AnswerPanel
        answer={{
          question: "How much do I contribute?",
          answer: "Based on 2 relevant articles:\n- ...",
          sources: [
            { title: "What are pension contributions?", url: "https://e/ka-1", score: 0.91 },
            { title: "Earnings Cap", url: "https://e/ka-2", score: 0.7 },
          ],
        }}
      />,
    );

    expect(screen.getByText(/Based on 2 relevant articles/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /what are pension contributions/i }),
    ).toHaveAttribute("href", "https://e/ka-1");
    expect(screen.getByText("0.91")).toBeInTheDocument();
  });
});
