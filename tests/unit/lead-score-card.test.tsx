import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LeadScoreCard, LeadScoreError } from "@/app/components/lead-score-card";

describe("LeadScoreCard", () => {
  it("renders the contact name, score, tier, reasons, and next action", () => {
    render(
      <LeadScoreCard
        result={{
          contactName: "Jane Doe",
          score: 82,
          tier: "hot",
          reasons: [
            "Deal value of $12,000 contributes 35 pts.",
            'Currently in "Proposal" stage.',
          ],
          nextAction: "Reach out today to move toward close.",
        }}
      />
    );

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("82")).toBeInTheDocument();
    expect(screen.getByText("hot")).toBeInTheDocument();
    expect(screen.getByText(/Deal value of \$12,000/)).toBeInTheDocument();
    expect(screen.getByText(/Reach out today/)).toBeInTheDocument();
  });

  it("renders the cold tier styling class for a low score", () => {
    render(
      <LeadScoreCard
        result={{
          contactName: "Cold Lead",
          score: 12,
          tier: "cold",
          reasons: ["No recent activity — lead may be going cold."],
          nextAction: "Send a re-engagement email or deprioritize.",
        }}
      />
    );

    expect(screen.getByText("cold")).toBeInTheDocument();
    expect(screen.getByText(/Send a re-engagement email/)).toBeInTheDocument();
  });
});

describe("LeadScoreError", () => {
  it("renders the provided error message", () => {
    render(<LeadScoreError message="network timeout" />);
    expect(
      screen.getByText(/Couldn.t score this lead — network timeout/)
    ).toBeInTheDocument();
  });
});