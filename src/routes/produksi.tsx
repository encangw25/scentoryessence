import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, NeuTabs, Card, neuInput } from "@/components/neu";

export const Route = createFileRoute("/produksi")({
  head: () => ({
    meta: [
      { title: "Produksi — Scentory Essence" },
      { name: "description", content: "Catat produksi bulk serta bottling dan repack parfum." },
      { property: "og:title", content: "Produksi — Scentory Essence" },
      { property: "og:description", content: "Produksi bulk dan bottling & repack." },
    ],
  }),
  component: Produksi,
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="px-1 text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}

function Produksi() {
  const [tab, setTab] = useState<"bulk" | "repack">("bulk");
  return (
    <Page title="Produksi" subtitle="Catat proses kerja">
      <NeuTabs value={tab} onChange={setTab} options={[{ value: "bulk", label: "Produksi Bulk" }, { value: "repack", label: "Bottling & Repack" }]} />
      <Card className="space-y-5">
        {tab === "bulk" ? (
          <>
            <Field label="Formula / aroma">
              <select disabled className={neuInput}><option>Belum ada formula</option></select>
            </Field>
            <Field label="Volume produksi (ml)">
              <input type="number" inputMode="decimal" min={0} placeholder="0" className={neuInput} />
            </Field>
          </>
        ) : (
          <>
            <Field label="Cairan bulk">
              <select disabled className={neuInput}><option>Belum ada cairan bulk</option></select>
            </Field>
            <Field label="Ukuran botol">
              <select disabled className={neuInput}><option>Belum ada material botol</option></select>
            </Field>
            <Field label="Jumlah botol">
              <input type="number" inputMode="numeric" min={0} placeholder="0" className={neuInput} />
            </Field>
          </>
        )}
        <p className="neu-inset rounded-2xl p-4 text-sm text-muted-foreground">
          Kebutuhan bahan dan dampak ke stok akan dihitung setelah data formula dan material tersedia.
        </p>
        <button disabled className="neu neu-press min-h-14 w-full rounded-2xl font-extrabold tracking-wider text-primary disabled:opacity-60">
          SIMPAN
        </button>
      </Card>
    </Page>
  );
}
