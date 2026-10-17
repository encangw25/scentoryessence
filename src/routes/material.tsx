import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Page, Card, Field, Btn, QueryView, Row, StatusBadge, neuInput } from "@/components/neu";
import { useMaterials, useAction, log, stockLevel, fmt, type Material } from "@/lib/db";

export const Route = createFileRoute("/material")({
  head: () => ({
    meta: [
      { title: "Master Material — Scentory Essence" },
      { name: "description", content: "Kelola bibit parfum, solvent, fixative, botol, label, dan packaging." },
      { property: "og:title", content: "Master Material — Scentory Essence" },
      { property: "og:description", content: "Data material bahan baku dan kemasan." },
    ],
  }),
  component: MaterialPage,
});

const categories = ["Bibit", "Solvent", "Fixative", "Botol", "Label", "Packaging"];
const units = ["ml", "gram", "pcs"];
type Form = { id?: string; name: string; category: string; unit: string; stock: string; min_stock: string };
const blank: Form = { name: "", category: "Bibit", unit: "ml", stock: "0", min_stock: "0" };

function MaterialPage() {
  const mats = useMaterials();
  const [form, setForm] = useState<Form | null>(null);
  const save = useAction(async (f: Form) => {
    const row = { name: f.name.trim(), category: f.category, unit: f.unit, min_stock: Number(f.min_stock) };
    const r = f.id
      ? await supabase.from("materials").update(row).eq("id", f.id)
      : await supabase.from("materials").insert({ ...row, stock: Number(f.stock) });
    if (!r.error) await log(f.id ? "Ubah Material" : "Tambah Material", row.name);
    return r;
  }, "Material tersimpan");

  const edit = (m: Material) => setForm({ id: m.id, name: m.name, category: m.category, unit: m.unit, stock: String(m.stock), min_stock: String(m.min_stock) });
  const err = form && (!form.name.trim() ? "Nama wajib diisi" : Number(form.min_stock) < 0 || Number(form.stock) < 0 ? "Angka tidak boleh negatif" : "");

  return (
    <Page back title="Master Material" subtitle="Bahan baku & kemasan"
      action={<button aria-label={form ? "Tutup" : "Tambah material"} onClick={() => setForm(form ? null : blank)} className="neu-sm neu-press grid h-12 w-12 place-items-center rounded-full text-primary">{form ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}</button>}>
      {form && (
        <Card className="space-y-4">
          <p className="font-extrabold">{form.id ? "Ubah material" : "Material baru"}</p>
          <Field label="Nama"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={neuInput} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kategori"><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={neuInput}>{categories.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Satuan"><select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className={neuInput}>{units.map((c) => <option key={c}>{c}</option>)}</select></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Stok awal" hint={form.id ? "Ubah lewat Barang Masuk" : undefined}><input type="number" inputMode="decimal" min={0} disabled={!!form.id} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={neuInput} /></Field>
            <Field label="Batas minimum"><input type="number" inputMode="decimal" min={0} value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: e.target.value })} className={neuInput} /></Field>
          </div>
          {err && <p className="text-xs font-semibold text-critical">{err}</p>}
          <Btn className="w-full" disabled={!!err || save.isPending} onClick={() => save.mutate(form, { onSuccess: () => setForm(null) })}>{save.isPending ? "MENYIMPAN…" : "SIMPAN"}</Btn>
        </Card>
      )}
      <QueryView q={mats} empty={["Belum ada material", "Tekan + untuk menambahkan material pertama."]}>
        {(d) => (
          <ul className="space-y-3">
            {d.map((m) => (
              <li key={m.id}>
                <Row onClick={() => edit(m)} title={m.name} sub={`${m.category} · min ${fmt(Number(m.min_stock))} ${m.unit}`}
                  right={<div className="flex flex-col items-end gap-1"><span className="text-sm font-extrabold">{fmt(Number(m.stock))} {m.unit}</span><StatusBadge level={stockLevel(Number(m.stock), Number(m.min_stock))} /></div>} />
              </li>
            ))}
          </ul>
        )}
      </QueryView>
    </Page>
  );
}
