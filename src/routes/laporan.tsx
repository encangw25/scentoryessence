import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Page, Card, SectionTitle, Loading, ErrorState, Empty } from "@/components/neu";
import { fmt } from "@/lib/db";

export const Route = createFileRoute("/laporan")({
  head: () => ({
    meta: [
      { title: "Laporan Operasional — Scentory Essence" },
      { name: "description", content: "Ringkasan produksi, repack, barang masuk, dan penjualan 30 hari terakhir." },
      { property: "og:title", content: "Laporan Operasional — Scentory Essence" },
      { property: "og:description", content: "Ringkasan operasional 30 hari." },
    ],
  }),
  component: Laporan,
});

function Laporan() {
  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  const q = useQuery({
    queryKey: ["report", since.slice(0, 10)],
    queryFn: async () => {
      const [b, r, p, s] = await Promise.all([
        supabase.from("bulk_productions").select("volume_ml").gte("created_at", since),
        supabase.from("repacks").select("qty").gte("created_at", since),
        supabase.from("purchases").select("id").gte("created_at", since),
        supabase.from("sales_orders").select("channel, status, sales_items(qty, products(name))").gte("created_at", since),
      ]);
      const e = b.error || r.error || p.error || s.error;
      if (e) throw new Error(e.message);
      return { b: b.data!, r: r.data!, p: p.data!, s: s.data! };
    },
  });
  if (q.isLoading) return <Page back title="Laporan"><Loading /></Page>;
  if (q.error) return <Page back title="Laporan"><ErrorState error={q.error} /></Page>;
  const d = q.data!;
  const active = d.s.filter((o) => o.status !== "cancelled");
  const units = active.reduce((t, o) => t + o.sales_items.reduce((x, i) => x + i.qty, 0), 0);
  const byChannel = Object.entries(active.reduce<Record<string, number>>((m, o) => ({ ...m, [o.channel]: (m[o.channel] ?? 0) + o.sales_items.reduce((x, i) => x + i.qty, 0) }), {})).sort((a, b) => b[1] - a[1]);
  const byProduct = Object.entries(active.flatMap((o) => o.sales_items).reduce<Record<string, number>>((m, i) => ({ ...m, [i.products?.name ?? "-"]: (m[i.products?.name ?? "-"] ?? 0) + i.qty }), {})).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const stats = [
    ["Batch bulk", `${d.b.length}`, `${fmt(d.b.reduce((t, x) => t + Number(x.volume_ml), 0))} ml`],
    ["Repack", `${d.r.reduce((t, x) => t + x.qty, 0)}`, "botol"],
    ["Barang masuk", `${d.p.length}`, "transaksi"],
    ["Order aktif", `${active.length}`, `${units} unit`],
  ];
  const Bars = ({ rows }: { rows: [string, number][] }) => {
    const max = Math.max(1, ...rows.map((r) => r[1]));
    return rows.length ? (
      <ul className="space-y-3">{rows.map(([k, v]) => (
        <li key={k} className="space-y-1 text-sm"><div className="flex justify-between"><span className="truncate">{k}</span><span className="font-bold">{v}</span></div>
          <div className="neu-inset h-3 overflow-hidden rounded-full"><div className="h-full rounded-full bg-primary/70" style={{ width: `${(v / max) * 100}%` }} /></div></li>
      ))}</ul>
    ) : <Empty title="Belum ada penjualan" text="Data muncul setelah ada order." />;
  };
  return (
    <Page back title="Laporan" subtitle="30 hari terakhir">
      <div className="grid grid-cols-2 gap-3">
        {stats.map(([l, v, s]) => (
          <Card key={l} className="p-4"><p className="text-xs text-muted-foreground">{l}</p><p className="mt-1 text-2xl font-extrabold">{v}</p><p className="text-xs text-muted-foreground">{s}</p></Card>
        ))}
      </div>
      <div><SectionTitle>Unit terjual per kanal</SectionTitle><Card><Bars rows={byChannel} /></Card></div>
      <div><SectionTitle>Produk terlaris</SectionTitle><Card><Bars rows={byProduct} /></Card></div>
    </Page>
  );
}
