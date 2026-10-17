import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
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
  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <form onSubmit={(e) => e.preventDefault()} className="neu w-full max-w-sm rounded-[2.5rem] px-7 py-10">
        <div className="flex flex-col items-center text-center">
          <IconBubble icon={Lock} className="h-20 w-20 text-secondary" />
          <h1 className="mt-6 text-3xl font-extrabold">Welcome</h1>
          <p className="mt-1 text-sm text-muted-foreground">Masuk untuk melanjutkan</p>
        </div>
        <div className="mt-8 space-y-5">
          <label className="block">
            <span className="sr-only">Email</span>
            <input type="email" inputMode="email" autoComplete="email" placeholder="Email Address" className={neuInput} />
          </label>
          <label className="relative block">
            <span className="sr-only">Password</span>
            <input type={show ? "text" : "password"} autoComplete="current-password" placeholder="Password" className={`${neuInput} pr-12`} />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Sembunyikan" : "Tampilkan"} className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center text-muted-foreground">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </label>
          <div className="flex items-center justify-between px-1 text-xs">
            <label className="flex items-center gap-2 text-muted-foreground"><input type="checkbox" className="accent-primary" /> Ingat saya</label>
            <span className="font-semibold text-primary">Lupa password?</span>
          </div>
          <button type="submit" className="neu neu-press min-h-14 w-full rounded-2xl font-extrabold tracking-widest text-primary">
            LOGIN
          </button>
          <Link to="/" className="block text-center text-xs text-muted-foreground">Kembali ke beranda</Link>
        </div>
      </form>
    </main>
  );
}
