import { createFileRoute, Link } from "@tanstack/react-router";
import { Beaker, BookOpen, Truck, Wrench, BarChart3, History, UserCircle, ChevronRight } from "lucide-react";
import { Page, IconBubble } from "@/components/neu";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — Scentory Essence" },
      { name: "description", content: "Akses modul material, formula, pembelian, aset, laporan, dan log aktivitas." },
      { property: "og:title", content: "Menu — Scentory Essence" },
      { property: "og:description", content: "Semua modul operasional Scentory Essence." },
    ],
  }),
  component: Menu,
});

const items = [
  { label: "Master Material", desc: "Bibit, solvent, botol, label", icon: Beaker },
  { label: "Formula Racikan / BOM", desc: "Komposisi standar", icon: BookOpen },
  { label: "Pembelian & Barang Masuk", desc: "Catat dari supplier", icon: Truck },
  { label: "Manajemen Aset", desc: "Peralatan operasional", icon: Wrench },
  { label: "Laporan Operasional", desc: "Ringkasan evaluasi", icon: BarChart3 },
  { label: "Log Aktivitas", desc: "Audit log", icon: History },
];

function Menu() {
  return (
    <Page title="Menu" subtitle="Semua modul">
      <ul className="space-y-4">
        {items.map((i) => (
          <li key={i.label}>
            <button className="neu neu-press flex w-full items-center gap-4 rounded-3xl p-4 text-left">
              <IconBubble icon={i.icon} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{i.label}</span>
                <span className="block truncate text-xs text-muted-foreground">{i.desc}</span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            </button>
          </li>
        ))}
        <li>
          <Link to="/login" className="neu neu-press flex w-full items-center gap-4 rounded-3xl p-4">
            <IconBubble icon={UserCircle} />
            <span className="flex-1 font-bold">Akun / Login</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        </li>
      </ul>
    </Page>
  );
}
