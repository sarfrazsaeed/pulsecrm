"use client";

import { Bar, Line } from "react-chartjs-2";
import { useCRMStore } from "../store/crm-store";
import type { PipelineStage } from "../types/crm";
import "chart.js/auto";

const stages: PipelineStage[] = ["New", "Contacted", "Proposal", "Won", "Lost"];
const colors = ["#625bf6", "#22b8cf", "#f4a340", "#19a974", "#e1586b"];
const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export default function AnalyticsPage() {
  const contacts = useCRMStore((state) => state.contacts);
  const getDealValueByStage = useCRMStore((state) => state.getDealValueByStage);
  const getDealsCreatedPerMonth = useCRMStore((state) => state.getDealsCreatedPerMonth);
  const values = getDealValueByStage(); const monthly = getDealsCreatedPerMonth();
  const total = values.reduce((sum, item) => sum + item.total, 0); const won = values.find((item) => item.stage === "Won")?.total ?? 0;
  const active = values.filter((item) => !["Won", "Lost"].includes(item.stage)).reduce((sum, item) => sum + item.total, 0);
  const best = [...values].sort((a, b) => b.total - a.total)[0]?.stage ?? "—";
  const barData = { labels: values.map((item) => item.stage), datasets: [{ label: "Deal value", data: values.map((item) => item.total), backgroundColor: colors, borderRadius: 8, borderSkipped: false }] };
  const lineData = { labels: monthly.map((item) => new Date(`${item.month}-01T12:00:00`).toLocaleDateString(undefined, { month: "short" })), datasets: [{ label: "Deals created", data: monthly.map((item) => item.count), borderColor: "#625bf6", backgroundColor: "rgba(98,91,246,.10)", pointBackgroundColor: "#625bf6", pointRadius: 4, tension: .35, fill: true }] };
  const chartOptions = { responsive: true, maintainAspectRatio: false, animation: { duration: 750, easing: "easeOutQuart" as const }, plugins: { legend: { display: false }, tooltip: { backgroundColor: "#101827", padding: 14, cornerRadius: 10, titleColor: "#ffffff", bodyColor: "#d9dce7", titleFont: { weight: 700 }, bodyFont: { weight: 600 }, displayColors: false } }, scales: { x: { grid: { display: false }, border: { display: false }, ticks: { color: "#667085", font: { size: 11, weight: 600 }, padding: 10 } }, y: { border: { display: false }, grid: { color: "rgba(230,232,240,.8)" }, ticks: { color: "#667085", font: { size: 11, weight: 600 }, padding: 10 } } } };
  return <section className="motion-rise space-y-7"><div className="relative overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-white via-white/90 to-[#f2f1ff] px-6 py-7 shadow-[0_18px_45px_rgba(81,73,222,.08)] sm:px-8 sm:py-9"><p className="eyebrow">Revenue intelligence</p><h1 className="page-title mt-3">Analytics</h1><p className="page-copy mt-3 max-w-xl">A practical read on the value and momentum currently in your workspace.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Total pipeline value" value={money(total)} testId="metric-total-value" /><Metric label="Active pipeline" value={money(active)} /><Metric label="Won value" value={money(won)} /><Metric label="Leading stage" value={best} testId="metric-best-stage" /></div>
    <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]"><section className="panel premium-panel rounded-2xl p-5 sm:p-6"><div className="flex items-start justify-between"><div><h2 className="section-heading">Value by stage</h2><p className="mt-1 text-sm text-[#667085]">Where deal value is currently concentrated.</p></div><span className="rounded-full bg-[#f2f1ff] px-2.5 py-1 text-xs font-semibold text-[#5149de]">Live data</span></div><div className="bar-entrance mt-6 h-72">{contacts.length ? <Bar data={barData} options={{ ...chartOptions, scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, ticks: { ...chartOptions.scales.y.ticks, callback: (tick) => money(Number(tick)) } } } }} /> : <EmptyChart />}</div></section>
      <section className="panel premium-panel rounded-2xl p-5 sm:p-6"><h2 className="section-heading">Stage mix</h2><p className="mt-1 text-sm text-[#667085]">Opportunity count and value at a glance.</p><div className="mt-6 space-y-5">{stages.map((stage, index) => { const items = contacts.filter((item) => item.stage === stage); const value = values.find((item) => item.stage === stage)?.total ?? 0; const share = total ? (value / total) * 100 : 0; return <div key={stage}><div className="flex justify-between text-sm"><span className="flex items-center gap-2 font-medium"><span className="size-2.5 rounded-full shadow-[0_0_0_4px_rgba(255,255,255,.7)]" style={{ background: colors[index] }} />{stage} <span className="text-[#667085]">{items.length}</span></span><span className="font-semibold">{money(value)}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eef0f5] shadow-inner"><div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${share}%`, background: colors[index], boxShadow: `0 0 10px ${colors[index]}` }} /></div></div>; })}</div></section></div>
    <section className="panel premium-panel rounded-2xl p-5 sm:p-6"><div><h2 className="section-heading">New opportunity momentum</h2><p className="mt-1 text-sm text-[#667085]">Contacts created by month.</p></div><div className="bar-entrance mt-6 h-72">{contacts.length ? <Line data={lineData} options={chartOptions} /> : <EmptyChart />}</div></section>
  </section>;
}

function Metric({ label, value, testId }: { label: string; value: string; testId?: string }) { return <div data-testid={testId} className="panel premium-panel interactive-surface metric-card rounded-2xl p-5"><p className="section-kicker">{label}</p><p className="metric-value mt-4">{value}</p></div>; }
function EmptyChart() { return <div className="empty-state grid h-full place-items-center rounded-2xl px-5 text-center"><div><p className="font-semibold text-[#344054]">Insights will appear here</p><p className="mt-1 text-sm text-[#667085]">Add your first contact to begin tracking momentum.</p></div></div>; }
