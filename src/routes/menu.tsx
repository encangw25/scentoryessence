import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Beaker, BookOpen, Truck, Wrench, BarChart3, History, Package, LogOut, ChevronRight, UserCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Page, IconBubble, Card } from "@/components/neu";

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
  { to: "/material", label: "Master Material", desc: "Bibit, solvent, botol, label", icon: Beaker },
  { to: "/formula", label: "Formula Racikan / BOM", desc: "Komposisi standar per 100 ml", icon: BookOpen },
  { to: "/produk", label: "Produk Jadi", desc: "Varian & ukuran botol", icon: Package },
  { to: "/pembelian", label: "Pembelian & Barang Masuk", desc: "Catat dari supplier", icon: Truck },
  { to: "/aset", label: "Manajemen Aset", desc: "Peralatan operasional", icon: Wrench },
  { to: "/laporan", label: "Laporan Operasional", desc: "Ringkasan 30 hari", icon: BarChart3 },
  { to: "/log", label: "Log Aktivitas", desc: "Audit log", icon: History },
] as const;

function Menu() {
  const { session } = useAuth();
  const nav = useNavigate();
  return (
    <Page title="Menu" subtitle="Semua modul">
      <Card className="flex items-center gap-4 p-4">
        <IconBubble icon={UserCircle} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">{session?.user.email}</p>
          <p className="text-xs text-muted-foreground">Owner / Staf Toko</p>
        </div>
      </Card>
      <ul className="space-y-4">
        {items.map((i) => (
          <li key={i.to}>
            <Link to={i.to} className="neu neu-press flex w-full items-center gap-4 rounded-3xl p-4">
              <IconBubble icon={i.icon} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{i.label}</span>
                <span className="block truncate text-xs text-muted-foreground">{i.desc}</span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        ))}
        <li>
          <button type="button" onClick={async () => { await supabase.auth.signOut(); nav({ to: "/login" }); }} className="neu neu-press flex w-full items-center gap-4 rounded-3xl p-4 text-left">
            <IconBubble icon={LogOut} className="text-critical" />
            <span className="flex-1 font-bold text-critical">Keluar</span>
          </button>
        </li>
      </ul>
    </Page>
  );
}
