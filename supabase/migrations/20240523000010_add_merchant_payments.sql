-- Add Stripe keys to stores table
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS stripe_publishable_key text,
ADD COLUMN IF NOT EXISTS stripe_secret_key text;

-- Add payment fields to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_intent_id text,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending'; -- pending, paid, failed

-- Update create_order function to include payment_intent_id and payment_status
CREATE OR REPLACE FUNCTION create_order(
  p_store_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_address jsonb,
  p_total_amount numeric,
  p_items jsonb,
  p_shipping_cost numeric DEFAULT 0,
  p_customer_email text DEFAULT null,
  p_payment_intent_id text DEFAULT null,
  p_payment_status text DEFAULT 'pending'
) RETURNS uuid AS $$
DECLARE
  v_order_id uuid;
  v_item jsonb;
  v_product_stock integer;
BEGIN
  -- 1. Create Order
  INSERT INTO public.orders (
    store_id, 
    customer_name, 
    customer_email, 
    customer_phone, 
    address, 
    total_amount, 
    shipping_cost,
    payment_intent_id,
    payment_status
  )
  VALUES (
    p_store_id, 
    p_customer_name, 
    p_customer_email, 
    p_customer_phone, 
    p_address, 
    p_total_amount, 
    p_shipping_cost,
    p_payment_intent_id,
    p_payment_status
  )
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
