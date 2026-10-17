CREATE TABLE public.materials (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, category text NOT NULL DEFAULT 'Bibit', unit text NOT NULL DEFAULT 'ml', stock numeric NOT NULL DEFAULT 0, min_stock numeric NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.formulas (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, notes text, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.formula_items (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), formula_id uuid NOT NULL REFERENCES public.formulas(id) ON DELETE CASCADE, material_id uuid NOT NULL REFERENCES public.materials(id), qty_per_100ml numeric NOT NULL CHECK (qty_per_100ml > 0));
CREATE TABLE public.bulk_liquids (formula_id uuid PRIMARY KEY REFERENCES public.formulas(id) ON DELETE CASCADE, volume_ml numeric NOT NULL DEFAULT 0, min_ml numeric NOT NULL DEFAULT 0);
CREATE TABLE public.products (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, formula_id uuid NOT NULL REFERENCES public.formulas(id), bottle_material_id uuid REFERENCES public.materials(id), size_ml numeric NOT NULL CHECK (size_ml > 0), stock integer NOT NULL DEFAULT 0, min_stock integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.bulk_productions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), formula_id uuid NOT NULL REFERENCES public.formulas(id), volume_ml numeric NOT NULL, created_by uuid, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.repacks (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), product_id uuid NOT NULL REFERENCES public.products(id), qty integer NOT NULL, bulk_used_ml numeric NOT NULL, created_by uuid, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.purchases (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), material_id uuid NOT NULL REFERENCES public.materials(id), qty numeric NOT NULL, supplier text, created_by uuid, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.sales_orders (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), channel text NOT NULL, status text NOT NULL DEFAULT 'paid', customer text, created_by uuid, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.sales_items (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid NOT NULL REFERENCES public.sales_orders(id) ON DELETE CASCADE, product_id uuid NOT NULL REFERENCES public.products(id), qty integer NOT NULL CHECK (qty > 0));
CREATE TABLE public.assets (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, qty integer NOT NULL DEFAULT 1, location text, condition text NOT NULL DEFAULT 'Baik', created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.audit_logs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), action text NOT NULL, detail text, user_email text, created_at timestamptz NOT NULL DEFAULT now());

DO $$ DECLARE t text; BEGIN
FOREACH t IN ARRAY ARRAY['materials','formulas','formula_items','bulk_liquids','products','bulk_productions','repacks','purchases','sales_orders','sales_items','assets','audit_logs'] LOOP
  EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
  EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  EXECUTE format('CREATE POLICY "staff all" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t);
END LOOP; END $$;

CREATE OR REPLACE FUNCTION public.log_action(_action text, _detail text) RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path=public AS $$
  INSERT INTO public.audit_logs(action, detail, user_email) VALUES (_action, _detail, auth.jwt()->>'email');
$$;

CREATE OR REPLACE FUNCTION public.produce_bulk(_formula uuid, _volume numeric) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE r record; fname text;
BEGIN
  IF _volume IS NULL OR _volume <= 0 THEN RAISE EXCEPTION 'Volume harus lebih dari 0'; END IF;
  SELECT name INTO fname FROM formulas WHERE id=_formula;
  IF fname IS NULL THEN RAISE EXCEPTION 'Formula tidak ditemukan'; END IF;
  IF NOT EXISTS (SELECT 1 FROM formula_items WHERE formula_id=_formula) THEN RAISE EXCEPTION 'Formula belum memiliki komposisi'; END IF;
  FOR r IN SELECT m.id, m.name, m.stock, m.unit, fi.qty_per_100ml*_volume/100 AS need FROM formula_items fi JOIN materials m ON m.id=fi.material_id WHERE fi.formula_id=_formula FOR UPDATE OF m LOOP
    IF r.stock < r.need THEN RAISE EXCEPTION 'Stok % tidak cukup (butuh % %, tersedia %)', r.name, round(r.need,2), r.unit, r.stock; END IF;
    UPDATE materials SET stock = stock - r.need WHERE id=r.id;
  END LOOP;
  INSERT INTO bulk_liquids(formula_id, volume_ml) VALUES (_formula, _volume) ON CONFLICT (formula_id) DO UPDATE SET volume_ml = bulk_liquids.volume_ml + _volume;
  INSERT INTO bulk_productions(formula_id, volume_ml, created_by) VALUES (_formula, _volume, auth.uid());
  PERFORM log_action('Produksi Bulk', fname || ' ' || _volume || ' ml');
END $$;

CREATE OR REPLACE FUNCTION public.repack_product(_product uuid, _qty integer) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE p record; need numeric; avail numeric; bstock numeric;
BEGIN
  IF _qty IS NULL OR _qty <= 0 THEN RAISE EXCEPTION 'Jumlah botol harus lebih dari 0'; END IF;
  SELECT * INTO p FROM products WHERE id=_product FOR UPDATE;
  IF p IS NULL THEN RAISE EXCEPTION 'Produk tidak ditemukan'; END IF;
  need := p.size_ml * _qty;
  SELECT volume_ml INTO avail FROM bulk_liquids WHERE formula_id=p.formula_id FOR UPDATE;
  IF coalesce(avail,0) < need THEN RAISE EXCEPTION 'Cairan bulk tidak cukup (butuh % ml, tersedia % ml)', need, coalesce(avail,0); END IF;
  IF p.bottle_material_id IS NOT NULL THEN
    SELECT stock INTO bstock FROM materials WHERE id=p.bottle_material_id FOR UPDATE;
    IF bstock < _qty THEN RAISE EXCEPTION 'Stok botol tidak cukup (butuh %, tersedia %)', _qty, bstock; END IF;
    UPDATE materials SET stock = stock - _qty WHERE id=p.bottle_material_id;
  END IF;
  UPDATE bulk_liquids SET volume_ml = volume_ml - need WHERE formula_id=p.formula_id;
  UPDATE products SET stock = stock + _qty WHERE id=_product;
  INSERT INTO repacks(product_id, qty, bulk_used_ml, created_by) VALUES (_product, _qty, need, auth.uid());
  PERFORM log_action('Bottling & Repack', p.name || ' × ' || _qty);
END $$;

CREATE OR REPLACE FUNCTION public.receive_purchase(_material uuid, _qty numeric, _supplier text) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE mname text;
BEGIN
  IF _qty IS NULL OR _qty <= 0 THEN RAISE EXCEPTION 'Jumlah harus lebih dari 0'; END IF;
  UPDATE materials SET stock = stock + _qty WHERE id=_material RETURNING name INTO mname;
  IF mname IS NULL THEN RAISE EXCEPTION 'Material tidak ditemukan'; END IF;
  INSERT INTO purchases(material_id, qty, supplier, created_by) VALUES (_material, _qty, _supplier, auth.uid());
  PERFORM log_action('Barang Masuk', mname || ' +' || _qty || coalesce(' dari ' || nullif(_supplier,''), ''));
END $$;

CREATE OR REPLACE FUNCTION public.create_sale(_channel text, _status text, _customer text, _items jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE oid uuid; it jsonb; p record; q integer;
BEGIN
  IF jsonb_array_length(coalesce(_items,'[]')) = 0 THEN RAISE EXCEPTION 'Tambahkan minimal satu produk'; END IF;
  INSERT INTO sales_orders(channel, status, customer, created_by) VALUES (_channel, _status, _customer, auth.uid()) RETURNING id INTO oid;
  FOR it IN SELECT * FROM jsonb_array_elements(_items) LOOP
    q := (it->>'qty')::int;
    SELECT * INTO p FROM products WHERE id=(it->>'product_id')::uuid FOR UPDATE;
    IF p IS NULL OR q IS NULL OR q <= 0 THEN RAISE EXCEPTION 'Item order tidak valid'; END IF;
    IF _status <> 'cancelled' THEN
      IF p.stock < q THEN RAISE EXCEPTION 'Stok % tidak cukup (tersedia %)', p.name, p.stock; END IF;
      UPDATE products SET stock = stock - q WHERE id=p.id;
    END IF;
    INSERT INTO sales_items(order_id, product_id, qty) VALUES (oid, p.id, q);
  END LOOP;
  PERFORM log_action('Order Baru', _channel || ' (' || _status || ')');
  RETURN oid;
END $$;

CREATE OR REPLACE FUNCTION public.set_sale_status(_order uuid, _status text) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE o record;
BEGIN
  SELECT * INTO o FROM sales_orders WHERE id=_order FOR UPDATE;
  IF o IS NULL THEN RAISE EXCEPTION 'Order tidak ditemukan'; END IF;
  IF o.status = _status THEN RETURN; END IF;
  IF _status = 'cancelled' THEN
    UPDATE products p SET stock = p.stock + si.qty FROM sales_items si WHERE si.order_id=_order AND si.product_id=p.id;
  ELSIF o.status = 'cancelled' THEN
    IF EXISTS (SELECT 1 FROM sales_items si JOIN products p ON p.id=si.product_id WHERE si.order_id=_order AND p.stock < si.qty) THEN RAISE EXCEPTION 'Stok produk tidak cukup untuk mengaktifkan order'; END IF;
    UPDATE products p SET stock = p.stock - si.qty FROM sales_items si WHERE si.order_id=_order AND si.product_id=p.id;
  END IF;
  UPDATE sales_orders SET status=_status WHERE id=_order;
  PERFORM log_action('Status Order', o.channel || ': ' || o.status || ' → ' || _status);
END $$;

REVOKE EXECUTE ON FUNCTION public.log_action(text,text), public.produce_bulk(uuid,numeric), public.repack_product(uuid,integer), public.receive_purchase(uuid,numeric,text), public.create_sale(text,text,text,jsonb), public.set_sale_status(uuid,text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.log_action(text,text), public.produce_bulk(uuid,numeric), public.repack_product(uuid,integer), public.receive_purchase(uuid,numeric,text), public.create_sale(text,text,text,jsonb), public.set_sale_status(uuid,text) TO authenticated;