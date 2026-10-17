import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Page, Card, Field, Btn, QueryView, Row, StatusBadge, neuInput } from "@/components/neu";
import { useProducts, useFormulas, useMaterials, useAction, log, stockLevel, fmt } from "@/lib/db";

export const Route = createFileRoute("/produk")({
  head: () => ({
    meta: [
      { title: "Produk Jadi — Scentory Essence" },
      { name: "description", content: "Kelola varian produk jadi parfum dan ukuran botol." },
      { property: "og:title", content: "Produk Jadi — Scentory Essence" },
      { property: "og:description", content: "Daftar produk jadi dan stoknya." },
    ],
  }),
  component: ProdukPage,
});

type Form = { id?: string; name: string; formula_id: string; bottle_material_id: string; size_ml: string; min_stock: string };

function ProdukPage() {
  const prods = useProducts();
  const formulas = useFormulas();
  const mats = useMaterials();
  const [form, setForm] = useState<Form | null>(null);
  const save = useAction(async (f: Form) => {
    const row = { name: f.name.trim(), formula_id: f.formula_id, bottle_material_id: f.bottle_material_id || null, size_ml: Number(f.size_ml), min_stock: Math.floor(Number(f.min_stock)) };
    const r = f.id ? await supabase.from("products").update(row).eq("id", f.id) : await supabase.from("products").insert(row);
    if (!r.error) await log(f.id ? "Ubah Produk" : "Tambah Produk", row.name);
    return r;
  }, "Produk tersimpan");
  const err = form && (!form.name.trim() ? "Nama wajib diisi" : !form.formula_id ? "Pilih formula" : !(Number(form.size_ml) > 0) ? "Ukuran harus lebih dari 0" : "");

  return (
    <Page back title="Produk Jadi" subtitle="Varian & ukuran"
      action={<button aria-label={form ? "Tutup" : "Tambah produk"} onClick={() => setForm(form ? null : { name: "", formula_id: "", bottle_material_id: "", size_ml: "", min_stock: "0" })} className="neu-sm neu-press grid h-12 w-12 place-items-center rounded-full text-primary">{form ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}</button>}>
      {form && (formulas.data?.length === 0 ? (
        <Card><p className="text-sm text-muted-foreground">Buat <Link to="/formula" className="font-bold text-primary">formula</Link> terlebih dahulu.</p></Card>
      ) : (
        <Card className="space-y-4">
          <p className="font-extrabold">{form.id ? "Ubah produk" : "Produk baru"}</p>
          <Field label="Nama produk"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={neuInput} placeholder="mis. Ocean Breeze 30ml" /></Field>
          <Field label="Formula / cairan bulk"><select value={form.formula_id} onChange={(e) => setForm({ ...form, formula_id: e.target.value })} className={neuInput}><option value="">Pilih…</option>{formulas.data?.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select></Field>
          <Field label="Material botol (opsional)" hint="Stok botol dipotong otomatis saat repack"><select value={form.bottle_material_id} onChange={(e) => setForm({ ...form, bottle_material_id: e.target.value })} className={neuInput}><option value="">Tidak ada</option>{mats.data?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Isi per botol (ml)"><input type="number" inputMode="decimal" min={0} value={form.size_ml} onChange={(e) => setForm({ ...form, size_ml: e.target.value })} className={neuInput} /></Field>
            <Field label="Batas minimum"><input type="number" inputMode="numeric" min={0} value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: e.target.value })} className={neuInput} /></Field>
          </div>
          {err && <p className="text-xs font-semibold text-critical">{err}</p>}
          <Btn className="w-full" disabled={!!err || save.isPending} onClick={() => save.mutate(form, { onSuccess: () => setForm(null) })}>{save.isPending ? "MENYIMPAN…" : "SIMPAN"}</Btn>
        </Card>
      ))}
      <QueryView q={prods} empty={["Belum ada produk", "Tekan + untuk menambahkan produk jadi."]}>
        {(d) => (
          <ul className="space-y-3">
            {d.map((p) => (
              <li key={p.id}>
                <Row onClick={() => setForm({ id: p.id, name: p.name, formula_id: p.formula_id, bottle_material_id: p.bottle_material_id ?? "", size_ml: String(p.size_ml), min_stock: String(p.min_stock) })}
                  title={p.name} sub={`${fmt(Number(p.size_ml))} ml · ${p.formulas?.name ?? ""}`}
                  right={<div className="flex flex-col items-end gap-1"><span className="text-sm font-extrabold">{p.stock} pcs</span><StatusBadge level={stockLevel(p.stock, p.min_stock)} /></div>} />
              </li>
            ))}
          </ul>
        )}
      </QueryView>
    </Page>
  );
}
