import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Page, Card, Field, Btn, QueryView, neuInput } from "@/components/neu";
import { useFormulas, useMaterials, useAction, log, fmt } from "@/lib/db";

export const Route = createFileRoute("/formula")({
  head: () => ({
    meta: [
      { title: "Formula Racikan — Scentory Essence" },
      { name: "description", content: "Kelola formula racikan parfum dan komposisi bahan per 100 ml." },
      { property: "og:title", content: "Formula Racikan — Scentory Essence" },
      { property: "og:description", content: "Formula standar untuk produksi bulk." },
    ],
  }),
  component: FormulaPage,
});

type Item = { material_id: string; qty: string };
type Form = { id?: string; name: string; notes: string; items: Item[] };

function FormulaPage() {
  const formulas = useFormulas();
  const mats = useMaterials();
  const [form, setForm] = useState<Form | null>(null);

  const save = useAction(async (f: Form) => {
    let id = f.id;
    if (id) {
      const r = await supabase.from("formulas").update({ name: f.name.trim(), notes: f.notes }).eq("id", id);
      if (r.error) return r;
      const d = await supabase.from("formula_items").delete().eq("formula_id", id);
      if (d.error) return d;
    } else {
      const r = await supabase.from("formulas").insert({ name: f.name.trim(), notes: f.notes }).select("id").single();
      if (r.error) return r;
      id = r.data.id;
    }
    const r = await supabase.from("formula_items").insert(f.items.map((i) => ({ formula_id: id!, material_id: i.material_id, qty_per_100ml: Number(i.qty) })));
    if (!r.error) await log(f.id ? "Ubah Formula" : "Tambah Formula", f.name);
    return r;
  }, "Formula tersimpan");

  const err = form && (!form.name.trim() ? "Nama formula wajib diisi" : !form.items.length ? "Tambahkan minimal satu bahan" : form.items.some((i) => !i.material_id || !(Number(i.qty) > 0)) ? "Lengkapi bahan dan jumlah (> 0)" : "");
  const setItem = (idx: number, p: Partial<Item>) => form && setForm({ ...form, items: form.items.map((x, i) => (i === idx ? { ...x, ...p } : x)) });

  return (
    <Page back title="Formula Racikan" subtitle="BOM per 100 ml cairan"
      action={<button aria-label={form ? "Tutup" : "Tambah formula"} onClick={() => setForm(form ? null : { name: "", notes: "", items: [{ material_id: "", qty: "" }] })} className="neu-sm neu-press grid h-12 w-12 place-items-center rounded-full text-primary">{form ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}</button>}>
      {form && (
        mats.data?.length === 0 ? (
          <Card><p className="text-sm text-muted-foreground">Tambahkan <Link to="/material" className="font-bold text-primary">material</Link> terlebih dahulu.</p></Card>
        ) : (
        <Card className="space-y-4">
          <p className="font-extrabold">{form.id ? "Ubah formula" : "Formula baru"}</p>
          <Field label="Nama formula / aroma"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={neuInput} /></Field>
          <Field label="Catatan (opsional)"><input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={neuInput} /></Field>
          <p className="px-1 text-sm font-semibold">Komposisi per 100 ml</p>
          {form.items.map((it, idx) => (
            <div key={idx} className="grid grid-cols-[minmax(0,1fr)_5.5rem_auto] gap-2">
              <select aria-label="Material" value={it.material_id} onChange={(e) => setItem(idx, { material_id: e.target.value })} className={neuInput}>
                <option value="">Pilih bahan…</option>
                {mats.data?.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
              </select>
              <input aria-label="Jumlah" type="number" inputMode="decimal" min={0} step="any" placeholder="Qty" value={it.qty} onChange={(e) => setItem(idx, { qty: e.target.value })} className={neuInput} />
              <button type="button" aria-label="Hapus bahan" onClick={() => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })} className="neu-sm neu-press grid h-12 w-12 place-items-center rounded-2xl text-critical"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <Btn variant="ghost" className="w-full" onClick={() => setForm({ ...form, items: [...form.items, { material_id: "", qty: "" }] })}>+ Tambah bahan</Btn>
          {err && <p className="text-xs font-semibold text-critical">{err}</p>}
          <Btn className="w-full" disabled={!!err || save.isPending} onClick={() => save.mutate(form, { onSuccess: () => setForm(null) })}>{save.isPending ? "MENYIMPAN…" : "SIMPAN"}</Btn>
        </Card>)
      )}
      <QueryView q={formulas} empty={["Belum ada formula", "Tekan + untuk membuat formula racikan."]}>
        {(d) => (
          <ul className="space-y-3">
            {d.map((f) => (
              <li key={f.id}>
                <button type="button" onClick={() => setForm({ id: f.id, name: f.name, notes: f.notes ?? "", items: f.formula_items.map((i) => ({ material_id: i.material_id, qty: String(i.qty_per_100ml) })) })} className="neu neu-press w-full rounded-2xl p-4 text-left">
                  <p className="font-bold">{f.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{f.formula_items.map((i) => `${i.materials?.name} ${fmt(Number(i.qty_per_100ml))} ${i.materials?.unit}`).join(" · ") || "Belum ada komposisi"}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </QueryView>
    </Page>
  );
}
