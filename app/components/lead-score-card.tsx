type LeadScoreResult = {
  contactName: string;
  score: number;
  tier: "hot" | "warm" | "cold";
  reasons: string[];
  nextAction: string;
};

const tierStyles: Record<string, { badge: string; ring: string }> = {
  hot: { badge: "bg-rose-50 text-rose-700", ring: "stroke-rose-500" },
  warm: { badge: "bg-amber-50 text-amber-700", ring: "stroke-amber-500" },
  cold: { badge: "bg-sky-50 text-sky-700", ring: "stroke-sky-500" },
};

export function LeadScoreCard({ result }: { result: LeadScoreResult }) {
  const style = tierStyles[result.tier];
  const circumference = 2 * Math.PI * 34;
  const offset = circumference - (result.score / 100) * circumference;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <svg width="80" height="80" viewBox="0 0 80 80" className="shrink-0">
          <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="8" />
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 40 40)"
            className={style.ring}
          />
          <text x="40" y="46" textAnchor="middle" className="fill-slate-900 text-lg font-semibold">
            {result.score}
          </text>
        </svg>

        <div>
          <p className="font-semibold text-slate-900">{result.contactName}</p>
          <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${style.badge}`}>
            {result.tier}
          </span>
        </div>
      </div>

      <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
        {result.reasons.map((reason, i) => (
          <li key={i}>• {reason}</li>
        ))}
      </ul>

      <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800">
        Next: {result.nextAction}
      </div>
    </div>
  );
}

export function LeadScoreError({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
      Couldn&apos;t score this lead — {message}
    </div>
  );
}