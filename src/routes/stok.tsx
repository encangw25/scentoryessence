import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { Page, NeuTabs, QueryView, Row, StatusBadge, neuInput } from "@/components/neu";
import { useMaterials, useBulk, useProducts, stockLevel, fmt, type Level } from "@/lib/db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/stok")({
  head: () => ({
    meta: [
      { title: "Stok — Scentory Essence" },
      { name: "description", content: "Pantau stok material mentah, cairan bulk, dan produk jadi." },
      { property: "og:title", content: "Stok — Scentory Essence" },
      { property: "og:description", content: "Monitoring stok material, bulk, dan produk jadi." },
    ],
  }),
  component: Stok,
});

type Tab = "material" | "bulk" | "fg";
type Item = { id: string; name: string; sub: string; stock: number; min: number; unit: string; level: Level };

function Stok() {
  const [tab, setTab] = useState<Tab>("material");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Level | "all">("all");
  const mats = useMaterials();
  const bulk = useBulk();
  const prods = useProducts();

  const src = tab === "material" ? mats : tab === "bulk" ? bulk : prods;
  const items: Item[] =
    tab === "material"
      ? (mats.data ?? []).map((m) => ({ id: m.id, name: m.name, sub: m.category, stock: Number(m.stock), min: Number(m.min_stock), unit: m.unit, level: stockLevel(Number(m.stock), Number(m.min_stock)) }))
      : tab === "bulk"
        ? (bulk.data ?? []).map((b) => ({ id: b.formula_id, name: b.formulas?.name ?? "-", sub: "Cairan bulk", stock: Number(b.volume_ml), min: Number(b.min_ml), unit: "ml", level: stockLevel(Number(b.volume_ml), Number(b.min_ml)) }))
        : (prods.data ?? []).map((p) => ({ id: p.id, name: p.name, sub: `${fmt(Number(p.size_ml))} ml · ${p.formulas?.name ?? ""}`, stock: p.stock, min: p.min_stock, unit: "pcs", level: stockLevel(p.stock, p.min_stock) }));
  const shown = items
    .filter((i) => i.name.toLowerCase().includes(q.toLowerCase()) && (filter === "all" || i.level === filter))
    .sort((a, b) => a.stock - b.stock);
  const to = tab === "material" ? "/material" : tab === "bulk" ? "/produksi" : "/produk";

  return (
    <Page title="Stok" subtitle="Monitoring persediaan">
      <NeuTabs value={tab} onChange={setTab} options={[{ value: "material", label: "Material" }, { value: "bulk", label: "Bulk" }, { value: "fg", label: "Produk Jadi" }]} />
      <label className="relative block">
        <span className="sr-only">Cari item</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama item…" className={`${neuInput} pl-11`} />
      </label>
      <div className="flex flex-wrap gap-2 text-xs font-bold">
        {([["all", "Semua", "text-foreground"], ["critical", "Kritis", "text-critical"], ["low", "Rendah", "text-low"], ["safe", "Aman", "text-safe"]] as const).map(([v, l, c]) => (
          <button key={v} type="button" aria-pressed={filter === v} onClick={() => setFilter(v)} className={cn("min-h-10 rounded-full px-4", c, filter === v ? "neu-inset" : "neu-sm")}>{l}</button>
        ))}
      </div>
      <QueryView q={{ data: shown, isLoading: src.isLoading, error: src.error }} empty={["Tidak ada item", items.length ? "Tidak ada yang cocok dengan pencarian/filter." : "Tambahkan data dari menu terkait."]}>
        {(d) => (
          <ul className="space-y-3">
            {d.map((i) => (
              <li key={i.id}>
                <Link to={to} search={(to === "/produksi" ? { tab: "bulk" } : {}) as never}>
                  <Row title={i.name} sub={`${i.sub} · min ${fmt(i.min)} ${i.unit}`} right={<div className="flex flex-col items-end gap-1"><span className="text-sm font-extrabold">{fmt(i.stock)} <span className="text-xs font-semibold text-muted-foreground">{i.unit}</span></span><StatusBadge level={i.level} /></div>} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </QueryView>
    </Page>
  );
}
