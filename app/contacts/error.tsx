"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
      <p className="font-semibold text-rose-700">Something went wrong loading contacts.</p>
      <button onClick={reset} className="mt-3 rounded-full bg-slate-900 px-4 py-2 text-sm text-white">
        Try again
      </button>
    </div>
  );
}