import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home, Boxes, FlaskConical, ShoppingBag, LayoutGrid, Inbox, Loader2, AlertCircle, ChevronLeft,
  AlertTriangle, CheckCircle2, CircleAlert, type LucideIcon,
} from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Level } from "@/lib/db";

const tabs = [
  { to: "/", label: "Beranda", icon: Home },
  { to: "/stok", label: "Stok", icon: Boxes },
  { to: "/produksi", label: "Produksi", icon: FlaskConical },
  { to: "/jual", label: "Jual", icon: ShoppingBag },
  { to: "/menu", label: "Menu", icon: LayoutGrid },
] as const;
const menuPaths = ["/menu", "/material", "/formula", "/produk", "/pembelian", "/aset", "/laporan", "/log"];

export function BottomNav() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <nav aria-label="Navigasi utama" className="fixed inset-x-0 bottom-0 z-40 px-3 pb-safe">
      <ul className="neu mx-auto grid max-w-md grid-cols-5 gap-1 rounded-3xl p-2">
        {tabs.map((t) => {
          const active = t.to === "/" ? path === "/" : t.to === "/menu" ? menuPaths.some((p) => path.startsWith(p)) : path.startsWith(t.to);
          return (
            <li key={t.to}>
              <Link
                to={t.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-semibold transition-all focus-visible:outline-2 focus-visible:outline-ring",
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

export function Page({ title, subtitle, children, action, back }: { title: string; subtitle?: string; children: ReactNode; action?: ReactNode; back?: boolean }) {
  return (
    <main className="mx-auto min-h-screen max-w-md px-5 pb-32 pt-8 md:max-w-3xl">
      <header className="mb-6 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        {back ? (
          <Link to="/menu" aria-label="Kembali" className="neu-sm neu-press grid h-11 w-11 place-items-center rounded-full text-muted-foreground">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        ) : <span />}
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-extrabold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-0.5 truncate text-sm text-muted-foreground">{subtitle}</p>}
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

export function Loading() {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" /> Memuat data…
    </div>
  );
}

export function ErrorState({ error }: { error: Error }) {
  return (
    <div role="alert" className="neu-inset flex items-start gap-3 rounded-3xl p-5 text-sm">
      <AlertCircle className="h-5 w-5 shrink-0 text-critical" />
      <div><p className="font-bold">Data gagal dimuat</p><p className="text-muted-foreground">{error.message}</p></div>
    </div>
  );
}

/** Renders loading / error / empty / content states for a query. */
export function QueryView<D>({ q, empty, children }: { q: { data?: D[] | null | undefined; isLoading: boolean; error: Error | null }; empty: [string, string]; children: (d: D[]) => ReactNode }) {
  if (q.isLoading) return <Loading />;
  if (q.error) return <ErrorState error={q.error} />;
  if (!q.data?.length) return <Empty title={empty[0]} text={empty[1]} />;
  return <>{children(q.data)}</>;
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
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn("min-h-11 rounded-xl px-2 text-xs font-bold transition-all", value === o.value ? "neu-sm text-primary" : "text-muted-foreground")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const levelMeta: Record<Level, { label: string; icon: LucideIcon; cls: string }> = {
  critical: { label: "Kritis", icon: AlertTriangle, cls: "text-critical" },
  low: { label: "Rendah", icon: CircleAlert, cls: "text-low" },
  safe: { label: "Aman", icon: CheckCircle2, cls: "text-safe" },
};
export function StatusBadge({ level }: { level: Level }) {
  const m = levelMeta[level];
  return (
    <span className={cn("neu-inset inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold", m.cls)}>
      <m.icon className="h-3.5 w-3.5" aria-hidden /> {m.label}
    </span>
  );
}

export function Btn({ className, variant = "primary", ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  return (
    <button
      {...p}
      className={cn(
        "neu neu-press min-h-12 rounded-2xl px-5 text-sm font-extrabold tracking-wide disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "text-primary",
        variant === "ghost" && "text-muted-foreground",
        variant === "danger" && "text-critical",
        className,
      )}
    />
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string | undefined }) {
  return (
    <label className="block space-y-2">
      <span className="px-1 text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="block px-1 text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function Row({ title, sub, right, onClick }: { title: ReactNode; sub?: ReactNode; right?: ReactNode; onClick?: () => void }) {
  const inner = (
    <>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-bold">{title}</span>
        {sub && <span className="block truncate text-xs text-muted-foreground">{sub}</span>}
      </span>
      {right}
    </>
  );
  const cls = "neu flex w-full items-center gap-3 rounded-2xl p-4 text-left";
  return onClick ? <button type="button" onClick={onClick} className={cn(cls, "neu-press")}>{inner}</button> : <div className={cls}>{inner}</div>;
}

export const neuInput =
  "neu-inset w-full min-h-12 rounded-2xl px-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60";
