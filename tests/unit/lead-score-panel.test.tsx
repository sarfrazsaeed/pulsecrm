import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { Contact } from "@/app/types/crm";

const useChatMock = vi.fn();

vi.mock("@ai-sdk/react", () => ({
  useChat: () => useChatMock(),
}));

// Imported after the mock so the component picks up the mocked hook.
import { LeadScorePanel } from "@/app/components/lead-score-panel";

const contact: Contact = {
  id: "c1",
  name: "Jane Doe",
  company: "Acme Co",
  email: "jane@acme.com",
  phone: "555-0100",
  dealValue: 12000,
  stage: "Proposal",
  createdAt: new Date().toISOString(),
  lastActivityAt: new Date().toISOString(),
  engagementNotes: "Met at conference",
};

beforeEach(() => {
  useChatMock.mockReset();
});

describe("LeadScorePanel — pending state", () => {
  it("shows the idle 'Score with AI' button before any message is sent", () => {
    useChatMock.mockReturnValue({
      messages: [],
      sendMessage: vi.fn(),
      status: "ready",
      regenerate: vi.fn(),
      error: undefined,
    });

    render(<LeadScorePanel contact={contact} onClose={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Score with AI" })).toBeInTheDocument();
  });

  it("calls sendMessage with lead context when the button is clicked", () => {
    const sendMessage = vi.fn();
    useChatMock.mockReturnValue({
      messages: [],
      sendMessage,
      status: "ready",
      regenerate: vi.fn(),
      error: undefined,
    });

    render(<LeadScorePanel contact={contact} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Score with AI" }));

    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(sendMessage.mock.calls[0][0].text).toContain("Jane Doe");
  });
});

describe("LeadScorePanel — streaming state", () => {
  it("shows the loading label and spinner while status is streaming", () => {
    useChatMock.mockReturnValue({
      messages: [],
      sendMessage: vi.fn(),
      status: "streaming",
      regenerate: vi.fn(),
      error: undefined,
    });

    render(<LeadScorePanel contact={contact} onClose={vi.fn()} />);

    const button = screen.getByRole("button", { name: "Scoring..." });
    expect(button).toBeDisabled();
    expect(button.querySelector(".btn-spinner")).toBeInTheDocument();
  });

  it("shows an in-progress tool card while the tool input is streaming", () => {
    useChatMock.mockReturnValue({
      messages: [
        {
          id: "m1",
          parts: [{ type: "tool-scoreLead", state: "input-streaming" }],
        },
      ],
      sendMessage: vi.fn(),
      status: "streaming",
      regenerate: vi.fn(),
      error: undefined,
    });

    render(<LeadScorePanel contact={contact} onClose={vi.fn()} />);

    expect(screen.getByText(/Analyzing Jane Doe/)).toBeInTheDocument();
  });
});

describe("LeadScorePanel — tool-result state", () => {
  it("renders the LeadScoreCard when the tool output is available", () => {
    useChatMock.mockReturnValue({
      messages: [
        {
          id: "m1",
          parts: [
            {
              type: "tool-scoreLead",
              state: "output-available",
              output: {
                contactName: "Jane Doe",
                score: 75,
                tier: "hot",
                reasons: ["Deal value of $12,000 contributes 35 pts."],
                nextAction: "Reach out today to move toward close.",
              },
            },
          ],
        },
      ],
      sendMessage: vi.fn(),
      status: "ready",
      regenerate: vi.fn(),
      error: undefined,
    });

    render(<LeadScorePanel contact={contact} onClose={vi.fn()} />);

    expect(screen.getByText("75")).toBeInTheDocument();
    expect(screen.getByText("hot")).toBeInTheDocument();
  });
});

describe("LeadScorePanel — error state", () => {
  it("shows a retry button when the tool call errors out and calls regenerate on click", () => {
    const regenerate = vi.fn();
    useChatMock.mockReturnValue({
      messages: [
        {
          id: "m1",
          parts: [
            {
              type: "tool-scoreLead",
              state: "output-error",
              errorText: "scoring service unavailable",
            },
          ],
        },
      ],
      sendMessage: vi.fn(),
      status: "ready",
      regenerate,
      error: undefined,
    });

    render(<LeadScorePanel contact={contact} onClose={vi.fn()} />);

    expect(screen.getByText(/scoring service unavailable/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(regenerate).toHaveBeenCalledTimes(1);
  });

  it("shows a connection error and lets the user retry when the whole request fails", () => {
    const sendMessage = vi.fn();
    useChatMock.mockReturnValue({
      messages: [],
      sendMessage,
      status: "error",
      regenerate: vi.fn(),
      error: new Error("network down"),
    });

    render(<LeadScorePanel contact={contact} onClose={vi.fn()} />);

    expect(screen.getByText(/Couldn.t reach the AI service/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(sendMessage).toHaveBeenCalledTimes(1);
  });
});