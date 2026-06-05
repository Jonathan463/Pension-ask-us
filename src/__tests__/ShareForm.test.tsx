import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShareForm } from "../components/ShareForm";
import { apiClient, ApiError } from "../api/client";

const article = {
  title: "What is annual allowance?",
  url: "https://e/ka-1",
  score: 0.91,
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ShareForm", () => {
  it("submits the share request and renders the success state", async () => {
    const share = vi.spyOn(apiClient, "share").mockResolvedValue({
      recipient: "friend@example.com",
      article_url: article.url,
    });
    const user = userEvent.setup();

    render(<ShareForm question="What is AA?" article={article} />);
    await user.type(
      screen.getByLabelText(/recipient email/i),
      "friend@example.com",
    );
    await user.click(screen.getByRole("button", { name: /send email/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/email sent to friend@example.com/i),
      ).toBeInTheDocument();
    });
    expect(share).toHaveBeenCalledTimes(1);
    expect(share).toHaveBeenCalledWith({
      recipient: "friend@example.com",
      question: "What is AA?",
      article_title: article.title,
      article_url: article.url,
      note: null,
    });
  });

  it("renders the backend error code on invalid_email", async () => {
    vi.spyOn(apiClient, "share").mockRejectedValue(
      new ApiError(400, {
        error: "invalid_email",
        message: "Recipient email address is not valid.",
        details: { recipient: "nope" },
      }),
    );
    const user = userEvent.setup();

    render(<ShareForm question="What is AA?" article={article} />);
    await user.type(screen.getByLabelText(/recipient email/i), "nope@x");
    await user.click(screen.getByRole("button", { name: /send email/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid_email/i)).toBeInTheDocument();
    });
  });

  it("keeps the submit button disabled while the recipient is too short", () => {
    render(<ShareForm question="q?" article={article} />);
    expect(
      screen.getByRole("button", { name: /send email/i }),
    ).toBeDisabled();
  });
});
