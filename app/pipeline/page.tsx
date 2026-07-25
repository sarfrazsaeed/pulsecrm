"use client";

import { useMemo, useState } from "react";
import { useCRMStore } from "../store/crm-store";
import type { Contact, PipelineStage } from "../types/crm";

const columns = [
  { key: "new", label: "New", stages: ["New"] as PipelineStage[] },
  { key: "contacted", label: "Contacted", stages: ["Contacted"] as PipelineStage[] },
  { key: "proposal", label: "Proposal", stages: ["Proposal"] as PipelineStage[] },
  { key: "won-lost", label: "Won / Lost", stages: ["Won", "Lost"] as PipelineStage[] },
];

const stageOptions: PipelineStage[] = ["New", "Contacted", "Proposal", "Won", "Lost"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PipelinePage() {
  const contacts = useCRMStore((state) => state.contacts);
  const updateContactStage = useCRMStore((state) => state.updateContactStage);
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [draggedContactId, setDraggedContactId] = useState<string | null>(null);

  const groupedContacts = useMemo(
    () =>
      columns.map((column) => ({
        ...column,
        items: contacts.filter((contact) => column.stages.includes(contact.stage)),
      })),
    [contacts],
  );

  const handleStageChange = (contact: Contact, stage: PipelineStage) => {
    updateContactStage(contact.id, stage);
    setActiveContactId(null);
    setDraggedContactId(null);
  };

  const handleDrop = (stage: PipelineStage) => {
    if (!draggedContactId) {
      return;
    }

    const contact = contacts.find((item) => item.id === draggedContactId);
    if (contact) {
      handleStageChange(contact, stage);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
          Pipeline board
        </p>
        <h2 className="text-3xl font-semibold text-slate-900">
          Move opportunities through the funnel
        </h2>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {groupedContacts.map((column) => (
          <div
            key={column.key}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDrop(column.stages[0])}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">{column.label}</h3>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {column.items.length}
              </span>
            </div>

            <div className="space-y-3">
              {column.items.map((contact) => (
                <div
                  key={contact.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-sky-300 hover:bg-sky-50"
                  draggable
                  onDragStart={() => setDraggedContactId(contact.id)}
                  onDragEnd={() => setDraggedContactId(null)}
                >
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => setActiveContactId(contact.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p data-testid={`contact-name-${contact.id}`} className="font-semibold text-slate-900">{contact.name}</p>
                        <p data-testid={`contact-company-${contact.id}`} className="text-sm text-slate-600">{contact.company}</p>
                      </div>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                        {formatCurrency(contact.dealValue)}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-sm text-slate-500">
                      <p>{contact.email}</p>
                      <p>{contact.phone}</p>
                    </div>
                  </button>

                    {activeContactId === contact.id ? (
                    <div className="mt-4 rounded-lg border border-sky-200 bg-white p-3">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Change stage
                      </label>
                      <select
                        data-testid={`stage-select-${contact.id}`}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                        value={contact.stage}
                        onChange={(event) =>
                          handleStageChange(contact, event.target.value as PipelineStage)
                        }
                        onClick={(event) => event.stopPropagation()}
                      >
                        {stageOptions.map((stage) => (
                          <option key={stage} value={stage}>
                            {stage}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">Click to update the stage</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
