import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Page, Card, Field, Btn, SectionTitle, QueryView, NeuTabs, neuInput } from "@/components/neu";
import { useOrders, useProducts, useAction, fmt, fmtDate } from "@/lib/db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/jual")({
  validateSearch: (s: Record<string, unknown>): { baru?: boolean } => ({ baru: s.baru === true || s.baru === "true" ? true : undefined }),
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
const statuses = [
  { v: "paid", l: "Paid", c: "text-safe" },
  { v: "pending", l: "Pending", c: "text-low" },
  { v: "cancelled", l: "Cancelled", c: "text-critical" },
];
const statusCls = (s: string) => statuses.find((x) => x.v === s)?.c ?? "";

function Jual() {
  const search = Route.useSearch();
  const [open, setOpen] = useState(!!search.baru);
  const orders = useOrders();
  const [range, setRange] = useState<"day" | "week" | "month">("week");
  const setStatus = useAction((a: { id: string; s: string }) => supabase.rpc("set_sale_status", { _order: a.id, _status: a.s }), "Status order diperbarui");

  const chart = useMemo(() => {
    const now = new Date();
    const n = range === "day" ? 7 : range === "week" ? 6 : 6;
    const buckets = Array.from({ length: n }, (_, i) => {
      const d = new Date(now);
      if (range === "day") d.setDate(d.getDate() - (n - 1 - i));
      if (range === "week") d.setDate(d.getDate() - 7 * (n - 1 - i));
      if (range === "month") d.setMonth(d.getMonth() - (n - 1 - i));
      return { key: key(d, range), label: range === "month" ? d.toLocaleDateString("id-ID", { month: "short" }) : d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }), units: 0 };
    });
    for (const o of orders.data ?? []) {
      if (o.status === "cancelled") continue;
      const b = buckets.find((x) => x.key === key(new Date(o.created_at), range));
      if (b) b.units += o.sales_items.reduce((s, i) => s + i.qty, 0);
    }
    return buckets;
  }, [orders.data, range]);
  const max = Math.max(1, ...chart.map((c) => c.units));

  return (
    <Page
      title="Penjualan"
      subtitle="Order & riwayat"
      action={
        <button aria-label={open ? "Tutup form" : "Order baru"} onClick={() => setOpen(!open)} className="neu-sm neu-press grid h-12 w-12 place-items-center rounded-full text-primary">
          {open ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </button>
      }
    >
      {open && <OrderForm onDone={() => setOpen(false)} />}

      <Card className="space-y-4">
        <div className="flex items-center justify-between"><p className="text-sm font-bold">Unit terjual</p></div>
        <NeuTabs value={range} onChange={setRange} options={[{ value: "day", label: "Harian" }, { value: "week", label: "Mingguan" }, { value: "month", label: "Bulanan" }]} />
        <div className="flex h-36 items-end gap-2" aria-label="Grafik unit terjual">
          {chart.map((c) => (
            <div key={c.key} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] font-bold">{c.units || ""}</span>
              <div className="neu-inset flex h-24 w-full items-end overflow-hidden rounded-xl">
                <div className="w-full rounded-xl bg-primary/70" style={{ height: `${(c.units / max) * 100}%` }} />
              </div>
              <span className="text-[10px] text-muted-foreground">{c.label}</span>
            </div>
          ))}
        </div>
      </Card>

      <div>
        <SectionTitle>Riwayat order</SectionTitle>
        <QueryView q={orders} empty={["Belum ada order", "Tekan tombol + untuk membuat order."]}>
          {(d) => (
            <ul className="space-y-3">
              {d.map((o) => (
                <li key={o.id} className="neu space-y-3 rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-bold">{o.channel}{o.customer ? ` · ${o.customer}` : ""}</p>
                      <p className="text-xs text-muted-foreground">{fmtDate(o.created_at)}</p>
                    </div>
                    <span className={cn("neu-inset shrink-0 rounded-full px-3 py-1 text-[11px] font-bold capitalize", statusCls(o.status))}>{o.status}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{o.sales_items.map((i) => `${i.products?.name} × ${i.qty}`).join(", ")}</p>
                  <label className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Ubah status:</span>
                    <select value={o.status} disabled={setStatus.isPending} onChange={(e) => setStatus.mutate({ id: o.id, s: e.target.value })} className="neu-inset min-h-10 flex-1 rounded-xl px-3 outline-none">
                      {statuses.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
                    </select>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </QueryView>
      </div>
    </Page>
  );
}

function key(d: Date, r: "day" | "week" | "month") {
  if (r === "month") return `${d.getFullYear()}-${d.getMonth()}`;
  if (r === "day") return d.toDateString();
  const s = new Date(d); s.setHours(0, 0, 0, 0); s.setDate(s.getDate() - ((s.getDay() + 6) % 7));
  return s.toDateString();
}

function OrderForm({ onDone }: { onDone: () => void }) {
  const prods = useProducts();
  const [channel, setChannel] = useState("Offline");
  const [status, setStatusV] = useState("paid");
  const [customer, setCustomer] = useState("");
  const [items, setItems] = useState<{ product_id: string; qty: string }[]>([{ product_id: "", qty: "1" }]);
  const act = useAction(
    (a: { items: { product_id: string; qty: number }[] }) => supabase.rpc("create_sale", { _channel: channel, _status: status, _customer: customer, _items: a.items }),
    "Order tersimpan",
  );
  const parsed = items.filter((i) => i.product_id).map((i) => ({ product_id: i.product_id, qty: Math.floor(Number(i.qty)) }));
  const errors = parsed.map((i) => {
    const p = prods.data?.find((x) => x.id === i.product_id);
    if (!(i.qty > 0)) return "Jumlah harus lebih dari 0";
    const total = parsed.filter((x) => x.product_id === i.product_id).reduce((s, x) => s + x.qty, 0);
    if (status !== "cancelled" && p && total > p.stock) return `Stok tidak cukup (tersedia ${p.stock})`;
    return "";
  });
  const valid = parsed.length > 0 && errors.every((e) => !e);

  if (!prods.isLoading && !prods.data?.length)
    return <Card><p className="text-sm text-muted-foreground">Belum ada produk jadi. <Link to="/produk" className="font-bold text-primary">Tambahkan produk</Link> dan lakukan repack dulu.</p></Card>;

  return (
    <Card className="space-y-5">
      <p className="font-extrabold">Sales Order Baru</p>
      <div>
        <p className="mb-2 px-1 text-sm font-semibold">Kanal</p>
        <div className="flex flex-wrap gap-2">
          {channels.map((c) => (
            <button key={c} type="button" aria-pressed={channel === c} onClick={() => setChannel(c)} className={cn("min-h-10 rounded-full px-4 text-xs font-bold", channel === c ? "neu-inset text-primary" : "neu-sm")}>{c}</button>
          ))}
        </div>
      </div>
      <Field label="Nama pelanggan (opsional)"><input value={customer} onChange={(e) => setCustomer(e.target.value)} className={neuInput} placeholder="—" /></Field>
      <div className="space-y-3">
        <p className="px-1 text-sm font-semibold">Produk</p>
        {items.map((it, idx) => (
          <div key={idx} className="space-y-1">
            <div className="grid grid-cols-[minmax(0,1fr)_5rem_auto] gap-2">
              <select aria-label="Produk" value={it.product_id} onChange={(e) => setItems(items.map((x, i) => (i === idx ? { ...x, product_id: e.target.value } : x)))} className={neuInput}>
                <option value="">Pilih…</option>
                {prods.data?.map((p) => <option key={p.id} value={p.id}>{p.name} (stok {p.stock})</option>)}
              </select>
              <input aria-label="Jumlah" type="number" inputMode="numeric" min={1} value={it.qty} onChange={(e) => setItems(items.map((x, i) => (i === idx ? { ...x, qty: e.target.value } : x)))} className={neuInput} />
              <button type="button" aria-label="Hapus baris" disabled={items.length === 1} onClick={() => setItems(items.filter((_, i) => i !== idx))} className="neu-sm neu-press grid h-12 w-12 place-items-center rounded-2xl text-critical disabled:opacity-40"><Trash2 className="h-4 w-4" /></button>
            </div>
            {it.product_id && errors[parsed.findIndex((p) => p === parsed.filter((x) => x.product_id).find((_, j) => j === items.slice(0, idx + 1).filter((x) => x.product_id).length - 1))] && (
              <p className="px-1 text-xs font-semibold text-critical">{errors[items.slice(0, idx + 1).filter((x) => x.product_id).length - 1]}</p>
            )}
          </div>
        ))}
        <Btn type="button" variant="ghost" className="w-full" onClick={() => setItems([...items, { product_id: "", qty: "1" }])}>+ Tambah produk</Btn>
      </div>
      <Field label="Status">
        <select value={status} onChange={(e) => setStatusV(e.target.value)} className={neuInput}>
          {statuses.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
        </select>
      </Field>
      {valid && (
        <p className="neu-inset rounded-2xl p-4 text-sm text-muted-foreground">
          Stok produk jadi berkurang: {status === "cancelled" ? "tidak ada (cancelled)" : parsed.map((i) => `${prods.data?.find((p) => p.id === i.product_id)?.name} −${fmt(i.qty)}`).join(", ")}
        </p>
      )}
      <Btn type="button" className="w-full" disabled={!valid || act.isPending} onClick={() => act.mutate({ items: parsed }, { onSuccess: onDone })}>
        {act.isPending ? "MENYIMPAN…" : "SIMPAN ORDER"}
      </Btn>
    </Card>
  );
}
