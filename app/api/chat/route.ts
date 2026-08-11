import { google } from "@ai-sdk/google";
import { streamText, tool, convertToModelMessages, type UIMessage } from "ai";
import { z } from "zod";

export const maxDuration = 30;

function scoreLead(input: {
  dealValue: number;
  stage: string;
  daysSinceCreated: number;
  daysSinceLastActivity: number;
  engagementNotes?: string;
}) {
  let score = 0;

  // Deal value weight (up to 35 points)
  score += Math.min(35, Math.round((input.dealValue / 8000) * 35));

  // Stage progression weight (up to 30 points)
  const stageWeights: Record<string, number> = {
    New: 5,
    Contacted: 15,
    Proposal: 25,
    Won: 30,
    Lost: 0,
  };
  score += stageWeights[input.stage] ?? 0;

  // Recency weight (up to 25 points) — fresher activity scores higher
  const recencyScore = Math.max(0, 25 - input.daysSinceLastActivity);
  score += Math.min(25, recencyScore);

  // Urgency penalty for stale deals (up to -10)
  if (input.daysSinceCreated > 30 && input.stage !== "Won") {
    score -= 10;
  }

  score = Math.max(0, Math.min(100, score));

  const tier = score >= 70 ? "hot" : score >= 40 ? "warm" : "cold";

  const reasons: string[] = [];
  reasons.push(`Deal value of $${input.dealValue.toLocaleString()} contributes ${Math.min(35, Math.round((input.dealValue / 8000) * 35))} pts.`);
  reasons.push(`Currently in "${input.stage}" stage.`);
  if (input.daysSinceLastActivity <= 3) {
    reasons.push("Recent activity — lead is warm.");
  } else if (input.daysSinceLastActivity > 14) {
    reasons.push("No recent activity — lead may be going cold.");
  }

  const nextAction =
    tier === "hot"
      ? "Reach out today to move toward close."
      : tier === "warm"
      ? "Schedule a follow-up this week."
      : "Send a re-engagement email or deprioritize.";

  return { score, tier, reasons, nextAction };
}
function listStaleLeads(contacts: Array<{
  id: string; name: string; company: string; stage: string; lastActivityAt?: string; createdAt: string;
}>) {
  const now = new Date();
  return contacts
    .filter((c) => c.stage !== "Won" && c.stage !== "Lost")
    .map((c) => {
      const last = c.lastActivityAt ? new Date(c.lastActivityAt) : new Date(c.createdAt);
      const daysSinceActivity = Math.round((now.getTime() - last.getTime()) / 86400000);
      return { ...c, daysSinceActivity };
    })
    .filter((c) => c.daysSinceActivity >= 7);
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: google("gemini-2.0-flash"),
    system:
      "You are a CRM assistant. When the user asks you to score a lead, call the scoreLead tool. When the user asks you to review leads for follow-up, first call listStaleLeads with the contacts they provide, then call draftFollowUpEmail for each stale lead returned. Never claim an email was sent — you only draft. After tools return, briefly summarize what you found in one or two sentences.",
    messages: modelMessages,
    tools: {
      scoreLead: tool({
        description:
          "Score a CRM lead from 0-100 based on deal value, pipeline stage, and activity recency. Returns a score, tier, reasoning, and recommended next action.",
        inputSchema: z.object({
          contactName: z.string().describe("The lead's name"),
          dealValue: z.number().describe("Deal value in USD"),
          stage: z
            .enum(["New", "Contacted", "Proposal", "Won", "Lost"])
            .describe("Current pipeline stage"),
          daysSinceCreated: z.number().describe("Days since the lead was created"),
          daysSinceLastActivity: z
            .number()
            .describe("Days since last recorded activity"),
          engagementNotes: z
            .string()
            .optional()
            .describe("Any notes about engagement history"),
        }),
        execute: async (input) => {
          const result = scoreLead(input);
          return { contactName: input.contactName, ...result };
        },
      }),
      listStaleLeads: tool({
        description: "List CRM contacts that are stale (7+ days without activity) and not already closed.",
        inputSchema: z.object({
          contacts: z.array(z.object({
            id: z.string(),
            name: z.string(),
            company: z.string(),
            stage: z.enum(["New", "Contacted", "Proposal", "Won", "Lost"]),
            lastActivityAt: z.string().optional(),
            createdAt: z.string(),
          })),
        }),
        execute: async ({ contacts }) => ({ staleLeads: listStaleLeads(contacts) }),
      }),
      draftFollowUpEmail: tool({
        description: "Draft a short, specific follow-up email for one CRM lead based on their real stage and context.",
        inputSchema: z.object({
          contactName: z.string(),
          company: z.string(),
          stage: z.string(),
          engagementNotes: z.string().optional(),
        }),
        execute: async ({ contactName, company, stage, engagementNotes }) => {
          return {
            contactName,
            subject: `Following up — ${company}`,
            body:
              `Hi ${contactName},\n\nWanted to check in since we last connected about ${company}'s ` +
              `${stage.toLowerCase()} — ${engagementNotes ?? "let me know if now's a good time to pick this back up."}\n\n` +
              `Happy to jump on a quick call if useful.\n\nBest,\nSarfraz`,
          };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}