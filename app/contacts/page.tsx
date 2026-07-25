"use client";

import { useMemo, useState } from "react";
import { useCRMStore } from "../store/crm-store";
import type { ContactDraft, PipelineStage } from "../types/crm";

const sortOptions = [
  { value: "name", label: "Name" },
  { value: "company", label: "Company" },
  { value: "dealValue", label: "Deal value" },
] as const;

const stageOptions: PipelineStage[] = ["New", "Contacted", "Proposal", "Won", "Lost"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ContactsPage() {
  const contacts = useCRMStore((state) => state.contacts);
  const addContact = useCRMStore((state) => state.addContact);
  const [sortKey, setSortKey] = useState<(typeof sortOptions)[number]["value"]>("name");
  const [draft, setDraft] = useState<ContactDraft>({
    name: "",
    company: "",
    email: "",
    phone: "",
    dealValue: 0,
    stage: "New",
  });
  const [message, setMessage] = useState<string | null>(null);

  const sortedContacts = useMemo(() => {
    const list = [...contacts];
    list.sort((left, right) => {
      if (sortKey === "dealValue") {
        return right.dealValue - left.dealValue;
      }

      return left[sortKey].localeCompare(right[sortKey]);
    });

    return list;
  }, [contacts, sortKey]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!draft.name || !draft.company || !draft.email) {
      setMessage("Please fill in the required contact details.");
      return;
    }

    addContact(draft);
    setDraft({
      name: "",
      company: "",
      email: "",
      phone: "",
      dealValue: 0,
      stage: "New",
    });
    setMessage("Contact added to the CRM.");
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
          Contacts
        </p>
        <h2 className="text-3xl font-semibold text-slate-900">
          Review your leads and add new ones
        </h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h3 className="font-semibold text-slate-900">All contacts</h3>
              <p className="text-sm text-slate-500">Sort the table by the fields you care about most.</p>
            </div>
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as (typeof sortOptions)[number]["value"])}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Company</th>
                  <th className="px-5 py-3 font-medium">Stage</th>
                  <th className="px-5 py-3 font-medium">Deal value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {sortedContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-slate-900">{contact.name}</div>
                      <div className="text-xs text-slate-500">{contact.email}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{contact.company}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
                        {contact.stage}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {formatCurrency(contact.dealValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <form data-testid="add-contact-form" onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Add contact</h3>
              <p className="mt-1 text-sm text-slate-500">Capture new leads quickly from a single form.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              New lead
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Name
                <input data-testid="input-name"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                  required
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Company
                <input data-testid="input-company"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={draft.company}
                  onChange={(event) => setDraft({ ...draft, company: event.target.value })}
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Email
                <input data-testid="input-email"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  type="email"
                  value={draft.email}
                  onChange={(event) => setDraft({ ...draft, email: event.target.value })}
                  required
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Phone
                <input data-testid="input-phone"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={draft.phone}
                  onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Deal value
                <input data-testid="input-dealValue"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  type="number"
                  min="0"
                  value={draft.dealValue}
                  onChange={(event) => setDraft({ ...draft, dealValue: Number(event.target.value) })}
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Stage
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={draft.stage}
                  onChange={(event) => setDraft({ ...draft, stage: event.target.value as PipelineStage })}
                >
                  {stageOptions.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <button
            type="submit"
            data-testid="save-contact-button"
            className="mt-6 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Save contact
          </button>

          {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
        </form>
      </div>
    </section>
  );
}
