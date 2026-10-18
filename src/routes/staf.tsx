import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Page, Card, Field, Btn, QueryView, Row, neuInput } from "@/components/neu";
import { useAction, log } from "@/lib/db";

export const Route = createFileRoute("/staf")({
  head: () => ({
    meta: [
      { title: "Staf — Scentory Essence" },
      { name: "description", content: "Kelola email staf yang boleh mengakses data toko." },
      { property: "og:title", content: "Staf — Scentory Essence" },
      { property: "og:description", content: "Daftar akses staf Scentory Essence." },
    ],
  }),
  component: Staf,
});

function Staf() {
  const { session } = useAuth();
  const me = session?.user.email?.toLowerCase();
  const [email, setEmail] = useState("");
  const list = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const { data, error } = await supabase.from("staff_members").select("*").order("created_at");
      if (error) throw new Error(error.message);
      return data;
    },
  });
  const add = useAction(async (e: string) => {
    const r = await supabase.from("staff_members").insert({ email: e, added_by: me ?? null });
    if (!r.error) await log("Tambah Staf", e);
    return r;
  }, "Staf ditambahkan");
  const del = useAction(async (e: string) => {
    const r = await supabase.from("staff_members").delete().eq("email", e);
    if (!r.error) await log("Hapus Staf", e);
    return r;
  }, "Akses staf dicabut");
  const clean = email.trim().toLowerCase();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);

  return (
    <Page back title="Staf" subtitle="Hanya email ini yang bisa membuka data">
      <Card className="space-y-4">
        <Field label="Email staf baru" hint="Staf lalu mendaftar/masuk dengan email ini.">
          <input type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} className={neuInput} placeholder="nama@email.com" />
        </Field>
        <Btn className="w-full" disabled={!valid || add.isPending} onClick={() => add.mutate(clean, { onSuccess: () => setEmail("") })}>TAMBAHKAN</Btn>
      </Card>
      <QueryView q={list} empty={["Belum ada staf", "Tambahkan email staf di atas."]}>
        {(d) => (
          <ul className="space-y-3">
            {d.map((s) => (
              <li key={s.email}>
                <Row title={s.email} sub={s.email === me ? "Anda" : `Ditambahkan oleh ${s.added_by ?? "-"}`}
                  right={s.email !== me && (
                    <button aria-label={`Cabut akses ${s.email}`} onClick={() => confirm(`Cabut akses ${s.email}?`) && del.mutate(s.email)} className="neu-sm neu-press grid h-11 w-11 place-items-center rounded-full text-critical"><Trash2 className="h-4 w-4" /></button>
                  )} />
              </li>
            ))}
          </ul>
        )}
      </QueryView>
    </Page>
  );
}
