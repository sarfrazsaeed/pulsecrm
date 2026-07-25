export default function Home() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
        Foundation ready
      </p>
      <h2 className="mt-3 text-3xl font-semibold text-slate-900">
        PulseCRM data model and store are scaffolded.
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
        The next step is to build the interactive pages on top of this foundation.
        The store already contains realistic sample contacts, stage transitions, and
        basic analytics helpers for the pipeline, contacts, analytics, and health views.
      </p>
    </section>
  );
}
