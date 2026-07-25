"use client";

import { useMemo } from "react";
import { Bar, Line } from "react-chartjs-2";
import { useCRMStore } from "../store/crm-store";
import type { PipelineStage } from "../types/crm";
import "chart.js/auto";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AnalyticsPage() {
  const contacts = useCRMStore((state) => state.contacts);

  const pipelineStages: PipelineStage[] = ["New", "Contacted", "Proposal", "Won", "Lost"];

  const dealValueByStage = useMemo(
    () =>
      pipelineStages.map((stage) => ({
        stage,
        total: contacts.filter((c) => c.stage === stage).reduce((sum, c) => sum + c.dealValue, 0),
      })),
    [contacts],
  );

  const dealsByMonth = useMemo(() => {
    const monthlyCounts = new Map<string, number>();

    contacts.forEach((contact) => {
      const month = contact.createdAt.slice(0, 7);
      monthlyCounts.set(month, (monthlyCounts.get(month) ?? 0) + 1);
    });

    return Array.from(monthlyCounts.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));
  }, [contacts]);

  const barData = useMemo(
    () => ({
      labels: dealValueByStage.map((item) => item.stage),
      datasets: [
        {
          label: "Deal value",
          data: dealValueByStage.map((item) => item.total),
          backgroundColor: "rgba(14, 165, 233, 0.7)",
          borderRadius: 6,
        },
      ],
    }),
    [dealValueByStage],
  );

  const lineData = useMemo(
    () => ({
      labels: dealsByMonth.map((item) => item.month),
      datasets: [
        {
          label: "Deals created",
          data: dealsByMonth.map((item) => item.count),
          borderColor: "rgba(16, 185, 129, 1)",
          backgroundColor: "rgba(16, 185, 129, 0.2)",
          tension: 0.35,
          fill: true,
        },
      ],
    }),
    [dealsByMonth],
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
          Analytics
        </p>
        <h2 className="text-3xl font-semibold text-slate-900">
          Track revenue movement and momentum
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div data-testid="metric-best-stage" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Best stage</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {dealValueByStage.sort((left, right) => right.total - left.total)[0]?.stage ?? "—"}
          </p>
        </div>
        <div data-testid="metric-total-value" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total pipeline value</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatCurrency(dealValueByStage.reduce((sum, item) => sum + item.total, 0))}
          </p>
        </div>
        <div data-testid="metric-peak-month" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Peak month</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {dealsByMonth.sort((left, right) => right.count - left.count)[0]?.month ?? "—"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Deal value by stage</h3>
          <div className="mt-4 h-72">
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Deals created per month</h3>
          <div className="mt-4 h-72">
            <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </section>
  );
}
