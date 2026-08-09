"use client";

import { useMemo, useState } from "react";
import { useCRMStore } from "../store/crm-store";
import type { Contact, PipelineStage } from "../types/crm";

const stages: PipelineStage[] = ["New", "Contacted", "Proposal", "Won", "Lost"];
const accents: Record<PipelineStage, { dot: string; tint: string }> = {
  New: { dot: "#625bf6", tint: "#f2f1ff" }, Contacted: { dot: "#22b8cf", tint: "#e9fafd" },
  Proposal: { dot: "#f4a340", tint: "#fff7e9" }, Won: { dot: "#19a974", tint: "#eaf8f2" }, Lost: { dot: "#e1586b", tint: "#fff0f2" },
};
const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export default function PipelinePage() {
  const contacts = useCRMStore((state) => state.contacts);
  const updateContactStage = useCRMStore((state) => state.updateContactStage);
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [draggedContactId, setDraggedContactId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const columns = useMemo(() => stages.map((stage) => ({ stage, items: contacts.filter((contact) => contact.stage === stage) })), [contacts]);
  const activeValue = contacts.filter((contact) => !["Won", "Lost"].includes(contact.stage)).reduce((sum, contact) => sum + contact.dealValue, 0);
  const leadingStage = [...columns].sort((a, b) => b.items.reduce((sum, item) => sum + item.dealValue, 0) - a.items.reduce((sum, item) => sum + item.dealValue, 0))[0]?.stage ?? "—";

  const move = (contact: Contact, stage: PipelineStage) => {
    if (contact.stage === stage) return;
    updateContactStage(contact.id, stage); setActiveContactId(null); setDraggedContactId(null); setNotice(`${contact.name} moved to ${stage}.`);
    window.setTimeout(() => setNotice(null), 2600);
  };
  const drop = (stage: PipelineStage) => { const contact = contacts.find((item) => item.id === draggedContactId); if (contact) move(contact, stage); };

  return <section className="motion-rise space-y-7">
    <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-white via-white/85 to-[#f1f0ff] px-6 py-7 shadow-[0_18px_45px_rgba(52,45,150,.08)] sm:px-8 sm:py-9 md:flex md:flex-row md:items-end md:justify-between">
      <div><p className="eyebrow">Revenue flow</p><h1 className="page-title mt-3">Pipeline</h1><p className="page-copy mt-3">Move each opportunity with intent. Your changes are saved locally.</p></div>
      <div className="mt-5 flex gap-3 md:mt-0"><div className="panel premium-panel rounded-2xl px-4 py-3.5"><p className="section-kicker">Active pipeline</p><p className="mt-2 text-xl font-bold tracking-[-.06em]">{money(activeValue)}</p></div><div data-testid="metric-best-stage" className="panel premium-panel rounded-2xl px-4 py-3.5"><p className="section-kicker">Leading stage</p><p className="mt-2 text-xl font-bold tracking-[-.06em]">{leadingStage}</p></div></div>
    </div>
    {notice && <p role="status" className="rounded-xl border border-[#b8e8d5] bg-[#eaf8f2] px-4 py-3 text-sm font-medium text-[#117b54]">{notice}</p>}
    <div className="grid snap-x snap-mandatory grid-flow-col auto-cols-[minmax(17rem,1fr)] gap-4 overflow-x-auto pb-3 xl:grid-flow-row xl:grid-cols-5 xl:overflow-visible">
      {columns.map(({ stage, items }) => <section key={stage} aria-labelledby={`stage-${stage}`} onDragOver={(event) => event.preventDefault()} onDrop={() => drop(stage)} style={{ "--stage": accents[stage].dot, "--stage-wash": accents[stage].tint } as React.CSSProperties} className="stage-column snap-start rounded-2xl border p-3.5">
        <div className="mb-5 flex items-center justify-between px-1"><div className="flex items-center gap-2"><span className="size-2.5 rounded-full shadow-[0_0_0_4px_rgba(255,255,255,.55)]" style={{ backgroundColor: accents[stage].dot }} /><h3 id={`stage-${stage}`} className="text-sm font-bold tracking-[-.025em] text-[#101827]">{stage}</h3></div><span className="rounded-full px-2.5 py-1 text-xs font-bold text-[#344054] shadow-sm" style={{ backgroundColor: accents[stage].tint }}>{items.length}</span></div>
        <div className="min-h-28 space-y-3">{items.map((contact) => <article key={contact.id} draggable onDragStart={() => setDraggedContactId(contact.id)} onDragEnd={() => setDraggedContactId(null)} className="stage-card interactive-surface group rounded-xl border border-[#e6e8f0] bg-white p-4">
          <button type="button" onClick={() => setActiveContactId(activeContactId === contact.id ? null : contact.id)} className="block w-full cursor-grab text-left active:cursor-grabbing" aria-expanded={activeContactId === contact.id}>
            <div className="flex items-start justify-between gap-3"><div><p data-testid={`contact-name-${contact.id}`} className="font-semibold tracking-[-.02em] text-[#101827]">{contact.name}</p><p data-testid={`contact-company-${contact.id}`} className="mt-0.5 text-xs text-[#667085]">{contact.company}</p></div><p className="shrink-0 text-sm font-bold tracking-[-.03em] text-[#101827]">{money(contact.dealValue)}</p></div>
            <p className="mt-4 truncate text-xs text-[#667085]">{contact.email}</p>
          </button>
          {activeContactId === contact.id && <div className="mt-4 border-t border-[#eef0f5] pt-3"><label htmlFor={`stage-select-${contact.id}`} className="text-[.65rem] font-bold tracking-[.14em] text-[#667085] uppercase">Move opportunity</label><select id={`stage-select-${contact.id}`} data-testid={`stage-select-${contact.id}`} value={contact.stage} onChange={(event) => move(contact, event.target.value as PipelineStage)} className="mt-2 w-full rounded-lg border bg-white px-2.5 py-2 text-sm font-medium text-[#101827]">{stages.map((item) => <option key={item}>{item}</option>)}</select></div>}
        </article>)}{items.length === 0 && <div className="empty-state rounded-xl px-4 py-8 text-center"><p className="text-sm font-semibold text-[#344054]">Ready for an opportunity</p><p className="mt-1 text-xs leading-5 text-[#667085]">Drop a card here to update its stage.</p></div>}</div>
      </section>)}
    </div>
  </section>;
}
