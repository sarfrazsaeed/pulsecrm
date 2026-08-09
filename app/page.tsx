import Link from "next/link";

const destinations = [
  ["Pipeline", "Track each opportunity from first signal to close.", "/pipeline", "#625bf6"],
  ["Contacts", "A clear, searchable view of every relationship.", "/contacts", "#22b8cf"],
  ["Analytics", "Find the momentum behind your revenue.", "/analytics", "#19a974"],
  ["Health", "Keep your workspace data useful and complete.", "/health", "#f4a340"],
] as const;

export default function Home() {
  return <section className="motion-rise">
    <div className="panel overflow-hidden rounded-3xl p-7 sm:p-10">
      <p className="eyebrow">PulseCRM workspace</p>
      <div className="mt-5 max-w-2xl">
        <h1 className="page-title text-4xl sm:text-5xl">A calmer way to move revenue forward.</h1>
        <p className="page-copy mt-5 max-w-xl">Your opportunities, relationships, and pipeline signals—brought into one focused operating view.</p>
      </div>
      <Link href="/pipeline" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#101827] px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#252f41]">Open pipeline <span aria-hidden="true">→</span></Link>
    </div>
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {destinations.map(([name, copy, href, color]) => <Link key={name} href={href} className="panel group rounded-2xl p-5 transition duration-200 hover:-translate-y-1 hover:shadow-lg">
        <span className="mb-6 block size-2.5 rounded-full" style={{ backgroundColor: color }} />
        <h2 className="font-semibold tracking-[-.02em] text-[#101827]">{name}</h2><p className="mt-2 text-sm leading-6 text-[#667085]">{copy}</p>
        <span className="mt-5 inline-block text-sm font-semibold text-[#101827] transition-transform group-hover:translate-x-1">Explore →</span>
      </Link>)}
    </div>
  </section>;
}
