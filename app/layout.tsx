import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = { title: "PulseCRM — Sales workspace", description: "A thoughtful sales pipeline workspace" };

const navItems = [
  { href: "/", label: "Overview" }, { href: "/pipeline", label: "Pipeline" },
  { href: "/contacts", label: "Contacts" }, { href: "/analytics", label: "Analytics" }, { href: "/health", label: "Health" },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="h-full antialiased">
    <body className="min-h-full">
      <div className="app-shell min-h-screen">
        <header className="sticky top-0 z-30 border-b border-[#e6e8f0]/80 bg-[#f7f8fc]/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-4 py-3 sm:px-6">
            <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-lg">
              <span className="grid size-8 place-items-center rounded-xl bg-[#101827] text-sm font-bold text-white shadow-lg shadow-[#101827]/15">P</span>
              <span className="hidden text-sm font-bold tracking-[-.03em] text-[#101827] sm:block">PulseCRM</span>
            </Link>
            <nav aria-label="Primary navigation" className="flex max-w-full items-center gap-1 overflow-x-auto text-sm font-medium whitespace-nowrap text-[#667085]">
              {navItems.map((item) => <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 transition-colors hover:bg-white hover:text-[#101827] focus-visible:bg-white">{item.label}</Link>)}
            </nav>
            <span className="hidden items-center gap-2 text-xs font-medium text-[#667085] lg:flex"><span className="size-2 rounded-full bg-[#19a974]" /> Workspace live</span>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">{children}</main>
      </div>
    </body>
  </html>;
}
