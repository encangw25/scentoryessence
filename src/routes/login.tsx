import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { IconBubble, neuInput } from "@/components/neu";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Masuk — Scentory Essence" },
      { name: "description", content: "Masuk ke aplikasi operasional Scentory Essence." },
      { property: "og:title", content: "Masuk — Scentory Essence" },
      { property: "og:description", content: "Login Owner dan Staf Toko." },
    ],
  }),
  component: Login,
});

function Login() {
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const { session } = useAuth();
  const nav = useNavigate();
  useEffect(() => { if (session) nav({ to: "/" }); }, [session, nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (pw.length < 6) return setMsg("Password minimal 6 karakter.");
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (error) setMsg(error.message === "Invalid login credentials" ? "Email atau password salah." : error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password: pw, options: { emailRedirectTo: window.location.origin } });
      if (error) setMsg(error.message);
      else toast.success("Akun dibuat. Cek email untuk konfirmasi, lalu masuk.");
    }
    setBusy(false);
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) setMsg("Gagal masuk dengan Google.");
  }

  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <form onSubmit={submit} className="neu w-full max-w-sm rounded-[2.5rem] px-7 py-10">
        <div className="flex flex-col items-center text-center">
          <IconBubble icon={Lock} className="h-20 w-20 text-secondary" />
          <h1 className="mt-6 text-3xl font-extrabold">{mode === "in" ? "Welcome" : "Buat Akun"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Scentory Essence · Owner & Staf Toko</p>
        </div>
        <div className="mt-8 space-y-5">
          <label className="block">
            <span className="sr-only">Email</span>
            <input required type="email" inputMode="email" autoComplete="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className={neuInput} />
          </label>
          <label className="relative block">
            <span className="sr-only">Password</span>
            <input required type={show ? "text" : "password"} autoComplete={mode === "in" ? "current-password" : "new-password"} placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} className={`${neuInput} pr-12`} />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Sembunyikan password" : "Tampilkan password"} className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center text-muted-foreground">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </label>
          {msg && <p role="alert" className="neu-inset rounded-2xl p-3 text-center text-xs font-semibold text-critical">{msg}</p>}
          <button type="submit" disabled={busy} className="neu neu-press min-h-14 w-full rounded-2xl font-extrabold tracking-widest text-primary disabled:opacity-60">
            {busy ? "MEMPROSES…" : mode === "in" ? "LOGIN" : "DAFTAR"}
          </button>
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
            {mode === "in" ? "Belum punya akun?" : "Sudah punya akun?"}
            <button type="button" onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(""); }} className="neu-sm neu-press rounded-full px-4 py-2 font-bold text-primary">
              {mode === "in" ? "Daftar" : "Masuk"}
            </button>
          </div>
          <button type="button" onClick={google} className="neu-sm neu-press flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold">
            <span className="font-extrabold text-primary">G</span> Lanjutkan dengan Google
          </button>
        </div>
      </form>
    </main>
  );
}
