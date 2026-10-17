import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Droplets, Package, FlaskConical, Repeat, ShoppingCart, PackagePlus, Bell } from "lucide-react";
import { Page, Card, IconBubble, Empty, SectionTitle } from "@/components/neu";

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

const metrics = [
  { label: "Material kritis/rendah", icon: AlertTriangle, tone: "text-critical" },
  { label: "Volume bulk tersedia", icon: Droplets, tone: "text-primary" },
  { label: "Unit produk jadi", icon: Package, tone: "text-low" },
];

const actions = [
  { label: "Batch Bulk", icon: FlaskConical, to: "/produksi" },
  { label: "Repack", icon: Repeat, to: "/produksi" },
  { label: "Order Baru", icon: ShoppingCart, to: "/jual" },
  { label: "Barang Masuk", icon: PackagePlus, to: "/menu" },
] as const;

function Index() {
  return (
    <Page
      title="Scentory Essence"
      subtitle="Selamat datang kembali"
      action={
        <button aria-label="Notifikasi" className="neu-sm neu-press grid h-12 w-12 place-items-center rounded-full text-muted-foreground">
          <Bell className="h-5 w-5" />
        </button>
      }
    >
      <div className="grid grid-cols-3 gap-3">
        {metrics.map((m) => (
          <Card key={m.label} className="flex flex-col items-center p-4 text-center">
            <m.icon className={`h-5 w-5 ${m.tone}`} aria-hidden />
            <span className="mt-2 text-2xl font-extrabold">—</span>
            <span className="mt-1 text-[11px] leading-tight text-muted-foreground">{m.label}</span>
          </Card>
        ))}
      </div>

      <div>
        <SectionTitle>Aksi cepat</SectionTitle>
        <div className="grid grid-cols-4 gap-3">
          {actions.map((a) => (
            <Link key={a.label} to={a.to} className="neu-press flex flex-col items-center gap-2 rounded-2xl text-center text-[11px] font-semibold">
              <IconBubble icon={a.icon} className="h-16 w-16" />
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>Stok yang perlu perhatian</SectionTitle>
        <Empty title="Belum ada data stok" text="Data akan muncul setelah aplikasi terhubung ke database." />
      </div>

      <div>
        <SectionTitle>Aktivitas terbaru</SectionTitle>
        <Empty title="Belum ada aktivitas" text="Riwayat dari audit log akan tampil di sini." />
      </div>
    </Page>
  );
}
