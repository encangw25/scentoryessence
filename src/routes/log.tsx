import { createFileRoute } from "@tanstack/react-router";
import { History } from "lucide-react";
import { Page, QueryView } from "@/components/neu";
import { useLogs, fmtDate } from "@/lib/db";

export const Route = createFileRoute("/log")({
  head: () => ({
    meta: [
      { title: "Log Aktivitas — Scentory Essence" },
      { name: "description", content: "Riwayat aktivitas dan perubahan data di Scentory Essence." },
      { property: "og:title", content: "Log Aktivitas — Scentory Essence" },
      { property: "og:description", content: "Audit log aktivitas sistem." },
    ],
  }),
  component: LogPage,
});

function LogPage() {
  const logs = useLogs(200);
  return (
    <Page back title="Log Aktivitas" subtitle="200 aktivitas terakhir">
      <QueryView q={logs} empty={["Belum ada aktivitas", "Setiap transaksi dan perubahan data tercatat di sini."]}>
        {(d) => (
          <ul className="space-y-3">
            {d.map((l) => (
              <li key={l.id} className="neu flex items-start gap-3 rounded-2xl p-4">
                <History className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{l.action}</p>
                  <p className="text-sm text-muted-foreground">{l.detail}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{l.user_email} · {fmtDate(l.created_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </QueryView>
    </Page>
  );
}
