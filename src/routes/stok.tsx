import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { Page, NeuTabs, Empty, neuInput } from "@/components/neu";

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
const labels: Record<Tab, string> = { material: "material mentah", bulk: "cairan bulk", fg: "produk jadi" };

function Stok() {
  const [tab, setTab] = useState<Tab>("material");
  return (
    <Page title="Stok" subtitle="Monitoring persediaan">
      <NeuTabs value={tab} onChange={setTab} options={[{ value: "material", label: "Material" }, { value: "bulk", label: "Bulk" }, { value: "fg", label: "Produk Jadi" }]} />
      <label className="relative block">
        <span className="sr-only">Cari item</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input type="search" placeholder="Cari nama item…" className={`${neuInput} pl-11`} />
      </label>
      <div className="flex gap-2 text-xs font-semibold">
        <span className="neu-sm rounded-full px-3 py-1.5 text-critical">● Kritis</span>
        <span className="neu-sm rounded-full px-3 py-1.5 text-low">● Rendah</span>
        <span className="neu-sm rounded-full px-3 py-1.5 text-safe">● Aman</span>
      </div>
      <Empty title={`Belum ada ${labels[tab]}`} text="Daftar stok akan tampil setelah data tersedia." />
    </Page>
  );
}
