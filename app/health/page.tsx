"use client";

import { useEffect, useState } from "react";
import { useCRMStore } from "../store/crm-store";

export default function HealthPage() {
  const [contactCount, setContactCount] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    // Read current store state on mount to avoid server/client markup mismatch
    const state = useCRMStore.getState();
    setContactCount(state.getContactCount());
    setLastUpdated(state.lastUpdated);

    // Subscribe to store updates so the health view stays live
    const unsub = useCRMStore.subscribe((s) => {
      setContactCount(s.getContactCount());
      setLastUpdated(s.lastUpdated);
    });

    return () => unsub();
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
          Health check
        </p>
        <h2 className="text-3xl font-semibold text-slate-900">
          Confirm the CRM store is live and responding
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total contacts</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{contactCount ?? "—"}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Last updated</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {lastUpdated ? new Date(lastUpdated).toLocaleString() : "—"}
          </p>
        </div>
      </div>
    </section>
  );
}
