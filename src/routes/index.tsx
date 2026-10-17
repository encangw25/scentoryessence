import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Droplets, Package, FlaskConical, Repeat, ShoppingCart, PackagePlus, History } from "lucide-react";
import { Page, Card, IconBubble, SectionTitle, QueryView, StatusBadge, Row } from "@/components/neu";
import { useMaterials, useBulk, useProducts, useLogs, stockLevel, fmt, fmtDate } from "@/lib/db";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Beranda — Scentory Essence" },
      { name: "description", content: "Ringkasan stok, aksi cepat, dan aktivitas operasional parfum Scentory Essence." },
      { property: "og:title", content: "Beranda — Scentory Essence" },
      { property: "og:description", content: "Ringkasan stok dan aktivitas operasional parfum." },
    ],
  }),
  component: Index,
});

const actions = [
  { label: "Batch Bulk", icon: FlaskConical, to: "/produksi", search: { tab: "bulk" } },
  { label: "Repack", icon: Repeat, to: "/produksi", search: { tab: "repack" } },
  { label: "Order Baru", icon: ShoppingCart, to: "/jual", search: { baru: true } },
  { label: "Barang Masuk", icon: PackagePlus, to: "/pembelian", search: {} },
] as const;

function Index() {
  const { session } = useAuth();
  const mats = useMaterials();
  const bulk = useBulk();
  const prods = useProducts();
  const logs = useLogs(8);

  const attention = [
    ...(mats.data ?? []).map((m) => ({ id: m.id, name: m.name, stock: Number(m.stock), min: Number(m.min_stock), unit: m.unit, to: "/material" as const })),
    ...(prods.data ?? []).map((p) => ({ id: p.id, name: p.name, stock: p.stock, min: p.min_stock, unit: "pcs", to: "/produk" as const })),
  ]
    .map((i) => ({ ...i, level: stockLevel(i.stock, i.min) }))
    .filter((i) => i.level !== "safe")
    .sort((a, b) => (a.level === b.level ? 0 : a.level === "critical" ? -1 : 1));

  const lowMats = (mats.data ?? []).filter((m) => stockLevel(Number(m.stock), Number(m.min_stock)) !== "safe").length;
  const bulkTotal = (bulk.data ?? []).reduce((s, b) => s + Number(b.volume_ml), 0);
  const unitTotal = (prods.data ?? []).reduce((s, p) => s + p.stock, 0);
  const metrics = [
    { label: "Material kritis/rendah", value: mats.isLoading ? "…" : fmt(lowMats), icon: AlertTriangle, tone: "text-critical" },
    { label: "Volume bulk (ml)", value: bulk.isLoading ? "…" : fmt(bulkTotal), icon: Droplets, tone: "text-primary" },
    { label: "Unit produk jadi", value: prods.isLoading ? "…" : fmt(unitTotal), icon: Package, tone: "text-low" },
  ];

  return (
    <Page title="Scentory Essence" subtitle={session?.user.email ?? ""}>
      <div className="grid grid-cols-3 gap-3">
        {metrics.map((m) => (
          <Card key={m.label} className="flex flex-col items-center p-4 text-center">
            <m.icon className={`h-5 w-5 ${m.tone}`} aria-hidden />
            <span className="mt-2 text-xl font-extrabold">{m.value}</span>
            <span className="mt-1 text-[11px] leading-tight text-muted-foreground">{m.label}</span>
          </Card>
        ))}
      </div>

      <div>
        <SectionTitle>Aksi cepat</SectionTitle>
        <div className="grid grid-cols-4 gap-3">
          {actions.map((a) => (
            <Link key={a.label} to={a.to} search={a.search as never} className="neu-press flex flex-col items-center gap-2 rounded-2xl text-center text-[11px] font-semibold">
              <IconBubble icon={a.icon} className="h-16 w-16" />
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>Stok yang perlu perhatian</SectionTitle>
        <QueryView q={{ data: attention, isLoading: mats.isLoading || prods.isLoading, error: mats.error || prods.error }} empty={["Semua stok aman", "Tidak ada item di bawah batas minimum."]}>
          {(d) => (
            <ul className="space-y-3">
              {d.slice(0, 8).map((i) => (
                <li key={i.id}>
                  <Link to={i.to}>
                    <Row title={i.name} sub={`${fmt(i.stock)} ${i.unit} · min ${fmt(i.min)}`} right={<StatusBadge level={i.level} />} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </QueryView>
      </div>

      <div>
        <div className="flex items-center justify-between"><SectionTitle>Aktivitas terbaru</SectionTitle><Link to="/log" className="mb-3 text-xs font-bold text-primary">Semua</Link></div>
        <QueryView q={logs} empty={["Belum ada aktivitas", "Transaksi yang dicatat akan tampil di sini."]}>
          {(d) => (
            <ul className="neu space-y-1 rounded-3xl p-3">
              {d.map((l) => (
                <li key={l.id} className="flex items-start gap-3 rounded-2xl p-2">
                  <History className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{l.action}</p>
                    <p className="truncate text-xs text-muted-foreground">{l.detail}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{fmtDate(l.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </QueryView>
      </div>
    </Page>
  );
}
