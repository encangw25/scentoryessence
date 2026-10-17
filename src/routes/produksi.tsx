import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Page, NeuTabs, Card, Field, Btn, SectionTitle, QueryView, Row, neuInput } from "@/components/neu";
import { useFormulas, useBulk, useProducts, useMaterials, useProductions, useAction, fmt, fmtDate } from "@/lib/db";

type Tab = "bulk" | "repack";
export const Route = createFileRoute("/produksi")({
  validateSearch: (s: Record<string, unknown>): { tab?: Tab } => ({ tab: s.tab === "repack" ? "repack" : s.tab === "bulk" ? "bulk" : undefined }),
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

function Produksi() {
  const search = Route.useSearch();
  const [tab, setTab] = useState<Tab>(search.tab ?? "bulk");
  const hist = useProductions();
  return (
    <Page title="Produksi" subtitle="Catat proses kerja">
      <NeuTabs value={tab} onChange={setTab} options={[{ value: "bulk", label: "Produksi Bulk" }, { value: "repack", label: "Bottling & Repack" }]} />
      {tab === "bulk" ? <BulkForm /> : <RepackForm />}
      <div>
        <SectionTitle>Riwayat {tab === "bulk" ? "batch" : "repack"}</SectionTitle>
        <QueryView
          q={{ data: tab === "bulk" ? hist.data?.bulk : hist.data?.repack, isLoading: hist.isLoading, error: hist.error }}
          empty={["Belum ada riwayat", "Transaksi tersimpan akan muncul di sini."]}
        >
          {(d) => (
            <ul className="space-y-3">
              {d.map((h: any) => (
                <li key={h.id}>
                  <Row
                    title={tab === "bulk" ? h.formulas?.name : h.products?.name}
                    sub={fmtDate(h.created_at)}
                    right={<span className="text-sm font-extrabold">{tab === "bulk" ? `${fmt(h.volume_ml)} ml` : `${h.qty} pcs`}</span>}
                  />
                </li>
              ))}
            </ul>
          )}
        </QueryView>
      </div>
    </Page>
  );
}

function Confirm({ lines, ok, onCancel, onOk, busy }: { lines: string[]; ok: boolean; onCancel: () => void; onOk: () => void; busy: boolean }) {
  return (
    <div className="neu-inset space-y-3 rounded-2xl p-4 text-sm">
      <p className="font-bold">Konfirmasi dampak ke stok</p>
      <ul className="space-y-1 text-muted-foreground">{lines.map((l) => <li key={l}>{l}</li>)}</ul>
      <div className="grid grid-cols-2 gap-3">
        <Btn type="button" variant="ghost" onClick={onCancel}>Batal</Btn>
        <Btn type="button" disabled={!ok || busy} onClick={onOk}>{busy ? "Menyimpan…" : "Simpan"}</Btn>
      </div>
    </div>
  );
}

function BulkForm() {
  const formulas = useFormulas();
  const [fid, setFid] = useState("");
  const [vol, setVol] = useState("");
  const [confirm, setConfirm] = useState(false);
  const act = useAction((a: { f: string; v: number }) => supabase.rpc("produce_bulk", { _formula: a.f, _volume: a.v }), "Batch bulk tersimpan");
  const f = formulas.data?.find((x) => x.id === fid);
  const v = Number(vol);
  const needs = (f?.formula_items ?? []).map((i) => {
    const need = (Number(i.qty_per_100ml) * v) / 100;
    const stock = Number(i.materials?.stock ?? 0);
    return { name: i.materials?.name ?? "-", unit: i.materials?.unit ?? "", need, stock, ok: stock >= need };
  });
  const valid = !!f && v > 0 && needs.length > 0 && needs.every((n) => n.ok);

  if (!formulas.isLoading && !formulas.data?.length)
    return <Card><p className="text-sm text-muted-foreground">Belum ada formula. <Link to="/formula" className="font-bold text-primary">Buat formula racikan</Link> terlebih dahulu.</p></Card>;

  return (
    <Card className="space-y-5">
      <Field label="Formula / aroma">
        <select value={fid} onChange={(e) => { setFid(e.target.value); setConfirm(false); }} className={neuInput}>
          <option value="">Pilih formula…</option>
          {formulas.data?.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
      </Field>
      <Field label="Volume produksi (ml)">
        <input type="number" inputMode="decimal" min={0} step="any" value={vol} onChange={(e) => { setVol(e.target.value); setConfirm(false); }} placeholder="0" className={neuInput} />
      </Field>
      {f && (
        <div className="neu-inset rounded-2xl p-4 text-sm">
          <p className="mb-2 font-bold">Kebutuhan bahan</p>
          {needs.length === 0 ? <p className="text-critical">Formula belum memiliki komposisi.</p> : (
            <ul className="space-y-1">
              {needs.map((n) => (
                <li key={n.name} className="flex justify-between gap-2">
                  <span className="truncate">{n.name}</span>
                  <span className={n.ok ? "text-safe" : "font-bold text-critical"}>{fmt(n.need)} / {fmt(n.stock)} {n.unit}{!n.ok && " · kurang"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {confirm ? (
        <Confirm busy={act.isPending} ok={valid} onCancel={() => setConfirm(false)}
          lines={[...needs.map((n) => `− ${fmt(n.need)} ${n.unit} ${n.name}`), `+ ${fmt(v)} ml cairan bulk ${f?.name}`]}
          onOk={() => act.mutate({ f: fid, v }, { onSuccess: () => { setVol(""); setConfirm(false); } })} />
      ) : (
        <Btn type="button" className="w-full" disabled={!valid} onClick={() => setConfirm(true)}>LANJUTKAN</Btn>
      )}
    </Card>
  );
}

function RepackForm() {
  const prods = useProducts();
  const bulk = useBulk();
  const mats = useMaterials();
  const [pid, setPid] = useState("");
  const [qty, setQty] = useState("");
  const [confirm, setConfirm] = useState(false);
  const act = useAction((a: { p: string; q: number }) => supabase.rpc("repack_product", { _product: a.p, _qty: a.q }), "Repack tersimpan");
  const p = prods.data?.find((x) => x.id === pid);
  const q = Math.floor(Number(qty));
  const need = p ? Number(p.size_ml) * q : 0;
  const avail = Number(bulk.data?.find((b) => b.formula_id === p?.formula_id)?.volume_ml ?? 0);
  const bottle = mats.data?.find((m) => m.id === p?.bottle_material_id);
  const bottleOk = !bottle || Number(bottle.stock) >= q;
  const valid = !!p && q > 0 && avail >= need && bottleOk;

  if (!prods.isLoading && !prods.data?.length)
    return <Card><p className="text-sm text-muted-foreground">Belum ada produk jadi. <Link to="/produk" className="font-bold text-primary">Tambahkan produk</Link> terlebih dahulu.</p></Card>;

  return (
    <Card className="space-y-5">
      <Field label="Produk (ukuran botol)">
        <select value={pid} onChange={(e) => { setPid(e.target.value); setConfirm(false); }} className={neuInput}>
          <option value="">Pilih produk…</option>
          {prods.data?.map((x) => <option key={x.id} value={x.id}>{x.name} · {fmt(Number(x.size_ml))} ml</option>)}
        </select>
      </Field>
      <Field label="Jumlah botol">
        <input type="number" inputMode="numeric" min={1} step={1} value={qty} onChange={(e) => { setQty(e.target.value); setConfirm(false); }} placeholder="0" className={neuInput} />
      </Field>
      {p && (
        <div className="neu-inset space-y-1 rounded-2xl p-4 text-sm">
          <p className="flex justify-between"><span>Cairan bulk {p.formulas?.name}</span><span className={avail >= need ? "text-safe" : "font-bold text-critical"}>{fmt(need)} / {fmt(avail)} ml</span></p>
          {bottle && <p className="flex justify-between"><span>{bottle.name}</span><span className={bottleOk ? "text-safe" : "font-bold text-critical"}>{q || 0} / {fmt(Number(bottle.stock))} {bottle.unit}</span></p>}
        </div>
      )}
      {confirm ? (
        <Confirm busy={act.isPending} ok={valid} onCancel={() => setConfirm(false)}
          lines={[`− ${fmt(need)} ml cairan bulk`, ...(bottle ? [`− ${q} ${bottle.name}`] : []), `+ ${q} pcs ${p?.name}`]}
          onOk={() => act.mutate({ p: pid, q }, { onSuccess: () => { setQty(""); setConfirm(false); } })} />
      ) : (
        <Btn type="button" className="w-full" disabled={!valid} onClick={() => setConfirm(true)}>LANJUTKAN</Btn>
      )}
    </Card>
  );
}
