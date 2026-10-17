import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type T = Database["public"]["Tables"];
export type Material = T["materials"]["Row"];
export type Formula = T["formulas"]["Row"];
export type Product = T["products"]["Row"];
export type Asset = T["assets"]["Row"];

async function run<R>(p: PromiseLike<{ data: R; error: { message: string } | null }>): Promise<R> {
  const { data, error } = await p;
  if (error) throw new Error(error.message);
  return data;
}

export const useMaterials = () =>
  useQuery({ queryKey: ["materials"], queryFn: () => run(supabase.from("materials").select("*").order("name")) });
export const useFormulas = () =>
  useQuery({
    queryKey: ["formulas"],
    queryFn: () => run(supabase.from("formulas").select("*, formula_items(id, qty_per_100ml, material_id, materials(name, unit, stock))").order("name")),
  });
export const useBulk = () =>
  useQuery({ queryKey: ["bulk"], queryFn: () => run(supabase.from("bulk_liquids").select("*, formulas(name)")) });
export const useProducts = () =>
  useQuery({ queryKey: ["products"], queryFn: () => run(supabase.from("products").select("*, formulas(name), materials(name)").order("name")) });
export const useAssets = () =>
  useQuery({ queryKey: ["assets"], queryFn: () => run(supabase.from("assets").select("*").order("name")) });
export const useLogs = (limit = 50) =>
  useQuery({ queryKey: ["logs", limit], queryFn: () => run(supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(limit)) });
export const usePurchases = () =>
  useQuery({ queryKey: ["purchases"], queryFn: () => run(supabase.from("purchases").select("*, materials(name, unit)").order("created_at", { ascending: false }).limit(50)) });
export const useOrders = () =>
  useQuery({
    queryKey: ["orders"],
    queryFn: () => run(supabase.from("sales_orders").select("*, sales_items(qty, products(name))").order("created_at", { ascending: false }).limit(100)),
  });
export const useProductions = () =>
  useQuery({
    queryKey: ["productions"],
    queryFn: async () => ({
      bulk: await run(supabase.from("bulk_productions").select("*, formulas(name)").order("created_at", { ascending: false }).limit(20)),
      repack: await run(supabase.from("repacks").select("*, products(name)").order("created_at", { ascending: false }).limit(20)),
    }),
  });

/** Wrap a write; refreshes all data and shows a toast. */
export function useAction<A>(fn: (a: A) => PromiseLike<{ error: { message: string } | null }>, success: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (a: A) => {
      const { error } = await fn(a);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success(success);
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export const log = (action: string, detail: string) => supabase.rpc("log_action", { _action: action, _detail: detail });

export type Level = "critical" | "low" | "safe";
export function stockLevel(stock: number, min: number): Level {
  if (stock <= 0 || (min > 0 && stock < min / 2)) return "critical";
  if (stock <= min) return "low";
  return "safe";
}

export const fmt = (n: number) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(n);
export const fmtDate = (s: string) =>
  new Date(s).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
