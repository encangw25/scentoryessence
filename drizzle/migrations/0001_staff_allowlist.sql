CREATE TABLE public.staff_members (email text PRIMARY KEY, added_by text, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, DELETE ON public.staff_members TO authenticated;
GRANT ALL ON public.staff_members TO service_role;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_staff() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (SELECT 1 FROM public.staff_members WHERE email = lower(auth.jwt()->>'email'));
$$;

-- First account claims the store; afterwards only existing staff can add others.
CREATE OR REPLACE FUNCTION public.claim_first_staff() RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE e text := lower(auth.jwt()->>'email');
BEGIN
  IF auth.uid() IS NULL OR e IS NULL THEN RETURN false; END IF;
  LOCK TABLE public.staff_members IN EXCLUSIVE MODE;
  IF NOT EXISTS (SELECT 1 FROM public.staff_members) THEN
    INSERT INTO public.staff_members(email, added_by) VALUES (e, e);
  END IF;
  RETURN public.is_staff();
END $$;
REVOKE EXECUTE ON FUNCTION public.is_staff(), public.claim_first_staff() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_staff(), public.claim_first_staff() TO authenticated;

CREATE POLICY "staff read staff" ON public.staff_members FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "staff add staff" ON public.staff_members FOR INSERT TO authenticated WITH CHECK (public.is_staff() AND email = lower(email));
CREATE POLICY "staff remove staff" ON public.staff_members FOR DELETE TO authenticated USING (public.is_staff() AND email <> lower(auth.jwt()->>'email'));

DO $$ DECLARE t text; BEGIN
FOREACH t IN ARRAY ARRAY['materials','formulas','formula_items','bulk_liquids','products','bulk_productions','repacks','purchases','sales_orders','sales_items','assets','audit_logs'] LOOP
  EXECUTE format('DROP POLICY "staff all" ON public.%I', t);
  EXECUTE format('CREATE POLICY "staff only" ON public.%I FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff())', t);
END LOOP; END $$;