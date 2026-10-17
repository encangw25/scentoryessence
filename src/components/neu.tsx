import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Boxes, FlaskConical, ShoppingBag, LayoutGrid, Inbox, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Beranda", icon: Home },
  { to: "/stok", label: "Stok", icon: Boxes },
  { to: "/produksi", label: "Produksi", icon: FlaskConical },
  { to: "/jual", label: "Jual", icon: ShoppingBag },
  { to: "/menu", label: "Menu", icon: LayoutGrid },
] as const;

export function BottomNav() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  if (path === "/login") return null;
  return (
    <nav aria-label="Navigasi utama" className="fixed inset-x-0 bottom-0 z-40 px-3 pb-safe">
      <ul className="neu mx-auto grid max-w-md grid-cols-5 gap-1 rounded-3xl p-2">
        {tabs.map((t) => {
          const active = t.to === "/" ? path === "/" : path.startsWith(t.to);
          return (
            <li key={t.to}>
              <Link
                to={t.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-semibold transition-all",
                  active ? "neu-inset text-primary" : "text-muted-foreground",
                )}
              >
                <t.icon className="h-5 w-5" aria-hidden />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Page({ title, subtitle, children, action }: { title: string; subtitle?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <main className="mx-auto min-h-screen max-w-md px-5 pb-32 pt-8 md:max-w-3xl">
      <header className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-extrabold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </header>
      <div className="space-y-6">{children}</div>
    </main>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("neu rounded-3xl p-5", className)}>{children}</section>;
}

export function IconBubble({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <span className={cn("neu-sm grid h-12 w-12 shrink-0 place-items-center rounded-full text-primary", className)}>
      <Icon className="h-5 w-5" aria-hidden />
    </span>
  );
}

export function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="neu-inset flex flex-col items-center rounded-3xl px-6 py-10 text-center">
      <IconBubble icon={Inbox} className="text-muted-foreground" />
      <p className="mt-4 font-bold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-3 px-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">{children}</h2>;
}

export function NeuTabs<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div role="tablist" className="neu-inset grid gap-1 rounded-2xl p-1.5" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "min-h-11 rounded-xl px-2 text-xs font-bold transition-all",
            value === o.value ? "neu-sm text-primary" : "text-muted-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const neuInput =
  "neu-inset w-full min-h-12 rounded-2xl px-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring";
