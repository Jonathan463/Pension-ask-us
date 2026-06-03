import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AskForm } from "../components/AskForm";

describe("AskForm", () => {
  it("disables the submit button until the question has 2+ characters", () => {
    render(<AskForm onSubmit={vi.fn()} loading={false} />);
    const submit = screen.getByRole("button", { name: /ask/i });
    expect(submit).toBeDisabled();
  });

  it("calls onSubmit with the trimmed question", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<AskForm onSubmit={onSubmit} loading={false} />);

    await user.type(
      screen.getByLabelText(/ask a pension question/i),
      "  How much do I contribute?  ",
    );
    await user.click(screen.getByRole("button", { name: /ask/i }));

    expect(onSubmit).toHaveBeenCalledWith("How much do I contribute?");
  });

  it("disables the form while loading and shows the loading label", () => {
    render(<AskForm onSubmit={vi.fn()} loading={true} />);
    expect(screen.getByLabelText(/ask a pension question/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /asking/i })).toBeDisabled();
  });
});
