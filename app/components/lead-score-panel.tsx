"use client";

import { useChat } from "@ai-sdk/react";
import { LeadScoreCard, LeadScoreError } from "./lead-score-card";
import type { Contact } from "../types/crm";

export function LeadScorePanel({ contact, onClose }: { contact: Contact; onClose: () => void }) {
 const { messages, sendMessage, status, regenerate, error, stop } = useChat();

  const runScore = () => {
    const created = new Date(contact.createdAt);
    const lastActivity = contact.lastActivityAt ? new Date(contact.lastActivityAt) : created;
    const now = new Date();
    const daysSinceCreated = Math.round((now.getTime() - created.getTime()) / 86400000);
    const daysSinceLastActivity = Math.round((now.getTime() - lastActivity.getTime()) / 86400000);

    sendMessage({
      text: `Score this lead: ${contact.name} at ${contact.company}. Deal value $${contact.dealValue}, stage "${contact.stage}", created ${daysSinceCreated} days ago, last activity ${daysSinceLastActivity} days ago. Notes: ${contact.engagementNotes ?? "none"}.`,
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">AI Lead Score — {contact.name}</h3>
        <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700">
          Close
        </button>
      </div>

      {messages.length === 0 && !error ? (
        <button
          onClick={runScore}
          disabled={status === "streaming" || status === "submitted"}
          className={`ai-score-btn ${status === "streaming" || status === "submitted" ? "is-loading" : ""} ${error ? "is-error" : ""}`}
        >
          <span className="btn-label">
            {status === "streaming" || status === "submitted"
              ? "Scoring..."
              : error
              ? "Try again"
              : "Score with AI"}
          </span>
          {(status === "streaming" || status === "submitted") && <span className="btn-spinner" aria-hidden="true" />}
        </button>
      ) : null}

      {(status === "streaming" || status === "submitted") && (
        <button
          type="button"
          onClick={() => stop()}
          className="mt-2 text-sm font-semibold text-slate-700 underline"
        >
          Stop generating
        </button>
      )}

      {error && messages.length === 0 && (
        <div className="mt-4">
          <LeadScoreError message="Couldn't reach the AI service — check your connection." />
          <button
            onClick={() => runScore()}
            className="mt-2 text-sm font-semibold text-slate-700 underline"
          >
            Try again
          </button>
        </div>
      )}

      <div className="mt-4 space-y-3" aria-live="polite" aria-atomic="false" role="log">
        {messages.map((message) =>
          message.parts.map((part, i) => {
            if (part.type === "text") {
              return (
                <p key={i} className="text-sm text-slate-600">
                  {part.text}
                </p>
              );
            }

            if (part.type === "tool-scoreLead") {
              if (part.state === "input-streaming") {
                return (
                  <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                    Analyzing {contact.name}...
                  </div>
                );
              }
              if (part.state === "input-available") {
                return (
                  <div key={i} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                    <span className="h-2 w-2 animate-ping rounded-full bg-sky-500" />
                    Scoring lead against your pipeline...
                  </div>
                );
              }
              if (part.state === "output-available") {
                return <LeadScoreCard key={i} result={part.output as any} />;
              }
              if (part.state === "output-error") {
                return (
                  <div key={i}>
                    <LeadScoreError message={part.errorText ?? "unknown error"} />
                    <button
                      onClick={() => regenerate()}
                      className="mt-2 text-sm font-semibold text-slate-700 underline"
                    >
                      Try again
                    </button>
                  </div>
                );
              }
            }

            return null;
          })
        )}
      </div>
    </div>
  );
}