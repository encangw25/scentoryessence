import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Page, Empty, SectionTitle } from "@/components/neu";

export const Route = createFileRoute("/jual")({
  head: () => ({
    meta: [
      { title: "Jual — Scentory Essence" },
      { name: "description", content: "Buat sales order dan lihat riwayat penjualan parfum." },
      { property: "og:title", content: "Jual — Scentory Essence" },
      { property: "og:description", content: "Sales order dan riwayat penjualan." },
    ],
  }),
  component: Jual,
});

const channels = ["Offline", "Shopee", "Tokopedia", "TikTok Shop", "WhatsApp"];

function Jual() {
  return (
    <Page
      title="Penjualan"
      subtitle="Order & riwayat"
      action={
        <button aria-label="Order baru" className="neu-sm neu-press grid h-12 w-12 place-items-center rounded-full text-primary">
          <Plus className="h-5 w-5" />
        </button>
      }
    >
      <div>
        <SectionTitle>Kanal</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {channels.map((c) => (
            <span key={c} className="neu-sm rounded-full px-4 py-2 text-xs font-semibold">{c}</span>
          ))}
        </div>
      </div>
      <div>
        <SectionTitle>Riwayat order</SectionTitle>
        <Empty title="Belum ada order" text="Order yang dibuat akan tampil di sini beserta statusnya." />
      </div>
    </Page>
  );
}
