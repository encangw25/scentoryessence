import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Page, Card, Field, Btn, SectionTitle, QueryView, Row, neuInput } from "@/components/neu";
import { useMaterials, usePurchases, useAction, fmt, fmtDate } from "@/lib/db";

export const Route = createFileRoute("/pembelian")({
  head: () => ({
    meta: [
      { title: "Barang Masuk — Scentory Essence" },
      { name: "description", content: "Catat pembelian material dari supplier dan perbarui stok." },
      { property: "og:title", content: "Barang Masuk — Scentory Essence" },
      { property: "og:description", content: "Pembelian dan barang masuk material." },
    ],
  }),
  component: Pembelian,
});

function Pembelian() {
  const mats = useMaterials();
  const hist = usePurchases();
  const [mid, setMid] = useState("");
  const [qty, setQty] = useState("");
  const [supplier, setSupplier] = useState("");
  const act = useAction(() => supabase.rpc("receive_purchase", { _material: mid, _qty: Number(qty), _supplier: supplier }), "Barang masuk tercatat");
  const m = mats.data?.find((x) => x.id === mid);
  const valid = !!m && Number(qty) > 0;

  return (
    <Page back title="Barang Masuk" subtitle="Pembelian dari supplier">
      {!mats.isLoading && !mats.data?.length ? (
        <Card><p className="text-sm text-muted-foreground">Tambahkan <Link to="/material" className="font-bold text-primary">material</Link> terlebih dahulu.</p></Card>
      ) : (
        <Card className="space-y-4">
          <Field label="Material"><select value={mid} onChange={(e) => setMid(e.target.value)} className={neuInput}><option value="">Pilih material…</option>{mats.data?.map((x) => <option key={x.id} value={x.id}>{x.name} (stok {fmt(Number(x.stock))} {x.unit})</option>)}</select></Field>
          <Field label={`Jumlah masuk${m ? ` (${m.unit})` : ""}`}><input type="number" inputMode="decimal" min={0} step="any" value={qty} onChange={(e) => setQty(e.target.value)} className={neuInput} placeholder="0" /></Field>
          <Field label="Supplier (opsional)"><input value={supplier} onChange={(e) => setSupplier(e.target.value)} className={neuInput} /></Field>
          {valid && <p className="neu-inset rounded-2xl p-4 text-sm text-muted-foreground">Stok {m!.name}: {fmt(Number(m!.stock))} → <span className="font-bold text-safe">{fmt(Number(m!.stock) + Number(qty))} {m!.unit}</span></p>}
          <Btn className="w-full" disabled={!valid || act.isPending} onClick={() => act.mutate(undefined, { onSuccess: () => { setQty(""); setSupplier(""); } })}>{act.isPending ? "MENYIMPAN…" : "SIMPAN"}</Btn>
        </Card>
      )}
      <div>
        <SectionTitle>Riwayat barang masuk</SectionTitle>
        <QueryView q={hist} empty={["Belum ada riwayat", "Pembelian yang dicatat akan tampil di sini."]}>
          {(d) => (
            <ul className="space-y-3">
              {d.map((p) => (
                <li key={p.id}><Row title={p.materials?.name} sub={`${fmtDate(p.created_at)}${p.supplier ? ` · ${p.supplier}` : ""}`} right={<span className="text-sm font-extrabold text-safe">+{fmt(Number(p.qty))} {p.materials?.unit}</span>} /></li>
              ))}
            </ul>
          )}
        </QueryView>
      </div>
    </Page>
  );
}
