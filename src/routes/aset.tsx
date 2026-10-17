import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Page, Card, Field, Btn, QueryView, Row, neuInput } from "@/components/neu";
import { useAssets, useAction, log } from "@/lib/db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/aset")({
  head: () => ({
    meta: [
      { title: "Manajemen Aset — Scentory Essence" },
      { name: "description", content: "Catat kondisi, jumlah, dan lokasi peralatan operasional." },
      { property: "og:title", content: "Manajemen Aset — Scentory Essence" },
      { property: "og:description", content: "Data aset operasional toko parfum." },
    ],
  }),
  component: AsetPage,
});

const conditions = ["Baik", "Perlu Perawatan", "Rusak"];
const condCls: Record<string, string> = { Baik: "text-safe", "Perlu Perawatan": "text-low", Rusak: "text-critical" };
type Form = { id?: string; name: string; qty: string; location: string; condition: string };

function AsetPage() {
  const assets = useAssets();
  const [form, setForm] = useState<Form | null>(null);
  const save = useAction(async (f: Form) => {
    const row = { name: f.name.trim(), qty: Math.floor(Number(f.qty)), location: f.location, condition: f.condition };
    const r = f.id ? await supabase.from("assets").update(row).eq("id", f.id) : await supabase.from("assets").insert(row);
    if (!r.error) await log(f.id ? "Ubah Aset" : "Tambah Aset", `${row.name} (${row.condition})`);
    return r;
  }, "Aset tersimpan");
  const del = useAction(async (f: Form) => {
    const r = await supabase.from("assets").delete().eq("id", f.id!);
    if (!r.error) await log("Hapus Aset", f.name);
    return r;
  }, "Aset dihapus");
  const err = form && (!form.name.trim() ? "Nama wajib diisi" : !(Number(form.qty) >= 0) ? "Jumlah tidak valid" : "");

  return (
    <Page back title="Manajemen Aset" subtitle="Peralatan operasional"
      action={<button aria-label={form ? "Tutup" : "Tambah aset"} onClick={() => setForm(form ? null : { name: "", qty: "1", location: "", condition: "Baik" })} className="neu-sm neu-press grid h-12 w-12 place-items-center rounded-full text-primary">{form ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}</button>}>
      {form && (
        <Card className="space-y-4">
          <p className="font-extrabold">{form.id ? "Ubah aset" : "Aset baru"}</p>
          <Field label="Nama aset"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={neuInput} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Jumlah"><input type="number" inputMode="numeric" min={0} value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} className={neuInput} /></Field>
            <Field label="Lokasi"><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={neuInput} /></Field>
          </div>
          <Field label="Kondisi"><select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className={neuInput}>{conditions.map((c) => <option key={c}>{c}</option>)}</select></Field>
          {err && <p className="text-xs font-semibold text-critical">{err}</p>}
          <div className={cn("grid gap-3", form.id && "grid-cols-2")}>
            {form.id && <Btn variant="danger" disabled={del.isPending} onClick={() => confirm("Hapus aset ini?") && del.mutate(form, { onSuccess: () => setForm(null) })}>HAPUS</Btn>}
            <Btn disabled={!!err || save.isPending} onClick={() => save.mutate(form, { onSuccess: () => setForm(null) })}>{save.isPending ? "MENYIMPAN…" : "SIMPAN"}</Btn>
          </div>
        </Card>
      )}
      <QueryView q={assets} empty={["Belum ada aset", "Tekan + untuk mencatat aset."]}>
        {(d) => (
          <ul className="space-y-3">
            {d.map((a) => (
              <li key={a.id}>
                <Row onClick={() => setForm({ id: a.id, name: a.name, qty: String(a.qty), location: a.location ?? "", condition: a.condition })} title={a.name} sub={`${a.qty} unit${a.location ? ` · ${a.location}` : ""}`}
                  right={<span className={cn("neu-inset shrink-0 rounded-full px-3 py-1 text-[11px] font-bold", condCls[a.condition])}>{a.condition}</span>} />
              </li>
            ))}
          </ul>
        )}
      </QueryView>
    </Page>
  );
}
