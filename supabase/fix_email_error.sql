-- 1. Drop the email column from the orders table
ALTER TABLE public.orders DROP COLUMN IF EXISTS customer_email;

-- 2. Drop the OLD create_order function (the one that took email)
-- We need to specify the exact signature to drop it correctly
DROP FUNCTION IF EXISTS create_order(text, text, text, jsonb, numeric, jsonb);

-- 3. Create the NEW create_order function (without email)
CREATE OR REPLACE FUNCTION create_order(
  p_customer_name text,
  p_customer_phone text,
  p_address jsonb,
  p_total_amount numeric,
  p_items jsonb
) RETURNS uuid AS $$
DECLARE
  v_order_id uuid;
  v_item jsonb;
  v_product_stock integer;
BEGIN
  -- 1. Create Order
  INSERT INTO public.orders (customer_name, customer_phone, address, total_amount)
  VALUES (p_customer_name, p_customer_phone, p_address, p_total_amount)
  RETURNING id INTO v_order_id;

  -- 2. Process Items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Check stock
    SELECT stock INTO v_product_stock FROM public.products WHERE id = (v_item->>'id')::uuid;
    
    IF v_product_stock < (v_item->>'quantity')::integer THEN
      RAISE EXCEPTION 'Insufficient stock for product %', (v_item->>'id');
    END IF;

    -- Insert Order Item
    INSERT INTO public.order_items (order_id, product_id, quantity, price_at_purchase)
    VALUES (
      v_order_id,
      (v_item->>'id')::uuid,
      (v_item->>'quantity')::integer,
      (v_item->>'price')::numeric
    );

    -- Update Stock
    UPDATE public.products
    SET stock = stock - (v_item->>'quantity')::integer
    WHERE id = (v_item->>'id')::uuid;
  END LOOP;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
