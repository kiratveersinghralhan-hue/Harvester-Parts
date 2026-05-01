-- HARVESTER PARTS — FULL CLEAN PRODUCTION DATABASE RESET
-- WARNING: This deletes all PUBLIC tables/data and rebuilds the marketplace schema fresh.
-- Auth users remain in Supabase Auth. Existing auth users are re-linked into public.users.
-- Admin email is already set to: kiratveersinghralhan@gmail.com

DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON SCHEMA public TO postgres, service_role;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user','buyer','seller','dealer','admin')),
  full_name TEXT,
  gender TEXT,
  profile_image TEXT,
  user_uid TEXT UNIQUE,
  badge_title TEXT DEFAULT 'New Member',
  badge_color TEXT DEFAULT 'green',
  profile_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES public.users(auth_id) ON DELETE CASCADE,
  business_name TEXT,
  phone TEXT,
  state TEXT,
  district TEXT,
  city TEXT,
  address TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','provisional','approved','rejected')),
  verification_status TEXT DEFAULT 'pending',
  aadhaar_front TEXT,
  aadhaar_back TEXT,
  shop_photo TEXT,
  ai_review_note TEXT,
  rejection_reason TEXT,
  approved_at TIMESTAMPTZ,
  reviewed_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(auth_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC DEFAULT 0,
  sale_type TEXT DEFAULT 'machine' CHECK (sale_type IN ('machine','spare_part')),
  category TEXT,
  brand TEXT,
  model TEXT,
  condition TEXT,
  year INTEGER,
  engine_number TEXT,
  chassis_number TEXT,
  hours_used NUMERIC,
  weight_kg NUMERIC DEFAULT 0,
  state TEXT,
  district TEXT,
  city TEXT,
  village TEXT,
  image_url TEXT,
  image_urls TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','provisional','approved','rejected','sold','draft')),
  views INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_boosted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES public.users(auth_id),
  user_id UUID REFERENCES public.users(auth_id),
  amount NUMERIC DEFAULT 0,
  shipping_amount NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','cancelled','shipped','delivered','refunded')),
  payment_id TEXT,
  razorpay_order_id TEXT,
  tracking_id TEXT,
  tracking_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER DEFAULT 1,
  price NUMERIC DEFAULT 0
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.users(auth_id),
  receiver_id UUID REFERENCES public.users(auth_id),
  product_id UUID REFERENCES public.products(id),
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(auth_id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(auth_id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(auth_id) ON DELETE CASCADE,
  title TEXT,
  message TEXT,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.users(auth_id),
  target_type TEXT,
  target_id UUID,
  reason TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','reviewed','resolved','closed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE,
  discount_type TEXT DEFAULT 'percentage',
  discount_value NUMERIC DEFAULT 0,
  min_order_value NUMERIC DEFAULT 0,
  max_discount NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.seller_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(auth_id) ON DELETE CASCADE,
  plan_name TEXT,
  amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.coupons(code, discount_type, discount_value, min_order_value, max_discount, is_active) VALUES
('HP2000','percentage',3,2000,100,true),
('HP10000','percentage',5,10000,700,true),
('HP100000','percentage',15,100000,10000,true)
ON CONFLICT (code) DO NOTHING;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users(auth_id, email, phone, role, full_name, user_uid)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    CASE WHEN lower(NEW.email) = lower('kiratveersinghralhan@gmail.com') THEN 'admin' ELSE 'user' END,
    COALESCE(NEW.raw_user_meta_data->>'full_name',''),
    'HP-' || upper(substr(replace(NEW.id::text,'-',''),1,8))
  )
  ON CONFLICT (auth_id) DO UPDATE SET
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    role = CASE WHEN lower(EXCLUDED.email)=lower('kiratveersinghralhan@gmail.com') THEN 'admin' ELSE public.users.role END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.users(auth_id, email, phone, role, user_uid)
SELECT
  id,
  email,
  phone,
  CASE WHEN lower(email)=lower('kiratveersinghralhan@gmail.com') THEN 'admin' ELSE 'user' END,
  'HP-' || upper(substr(replace(id::text,'-',''),1,8))
FROM auth.users
ON CONFLICT (auth_id) DO UPDATE SET
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  role = CASE WHEN lower(EXCLUDED.email)=lower('kiratveersinghralhan@gmail.com') THEN 'admin' ELSE public.users.role END;

UPDATE public.users SET role='admin' WHERE lower(email)=lower('kiratveersinghralhan@gmail.com');

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'admin');
$$;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT ON public.coupons TO anon;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select ON public.users FOR SELECT TO authenticated USING (auth.uid()=auth_id OR public.is_admin());
CREATE POLICY users_insert ON public.users FOR INSERT TO authenticated WITH CHECK (auth.uid()=auth_id OR public.is_admin());
CREATE POLICY users_update ON public.users FOR UPDATE TO authenticated USING (auth.uid()=auth_id OR public.is_admin()) WITH CHECK (auth.uid()=auth_id OR public.is_admin());

CREATE POLICY sellers_select ON public.sellers FOR SELECT TO authenticated USING (auth.uid()=user_id OR public.is_admin());
CREATE POLICY sellers_insert ON public.sellers FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id OR public.is_admin());
CREATE POLICY sellers_update ON public.sellers FOR UPDATE TO authenticated USING (auth.uid()=user_id OR public.is_admin()) WITH CHECK (auth.uid()=user_id OR public.is_admin());
CREATE POLICY sellers_delete ON public.sellers FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY products_public_select ON public.products FOR SELECT TO anon, authenticated USING (status='approved' OR auth.uid()=user_id OR public.is_admin());
CREATE POLICY products_insert ON public.products FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id OR public.is_admin());
CREATE POLICY products_update ON public.products FOR UPDATE TO authenticated USING (auth.uid()=user_id OR public.is_admin()) WITH CHECK (auth.uid()=user_id OR public.is_admin());
CREATE POLICY products_delete ON public.products FOR DELETE TO authenticated USING (auth.uid()=user_id OR public.is_admin());

CREATE POLICY orders_select ON public.orders FOR SELECT TO authenticated USING (auth.uid()=buyer_id OR auth.uid()=user_id OR public.is_admin());
CREATE POLICY orders_insert ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid()=buyer_id OR auth.uid()=user_id OR public.is_admin());
CREATE POLICY orders_update ON public.orders FOR UPDATE TO authenticated USING (auth.uid()=buyer_id OR auth.uid()=user_id OR public.is_admin()) WITH CHECK (auth.uid()=buyer_id OR auth.uid()=user_id OR public.is_admin());

CREATE POLICY order_items_select ON public.order_items FOR SELECT TO authenticated USING (public.is_admin() OR EXISTS (SELECT 1 FROM public.orders o WHERE o.id=order_id AND (o.buyer_id=auth.uid() OR o.user_id=auth.uid())));
CREATE POLICY order_items_insert ON public.order_items FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR EXISTS (SELECT 1 FROM public.orders o WHERE o.id=order_id AND (o.buyer_id=auth.uid() OR o.user_id=auth.uid())));

CREATE POLICY messages_select ON public.messages FOR SELECT TO authenticated USING (auth.uid()=sender_id OR auth.uid()=receiver_id OR public.is_admin());
CREATE POLICY messages_insert ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid()=sender_id OR public.is_admin());
CREATE POLICY messages_update ON public.messages FOR UPDATE TO authenticated USING (auth.uid()=sender_id OR auth.uid()=receiver_id OR public.is_admin()) WITH CHECK (auth.uid()=sender_id OR auth.uid()=receiver_id OR public.is_admin());

CREATE POLICY reviews_select ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY reviews_insert ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id);
CREATE POLICY reviews_update ON public.reviews FOR UPDATE TO authenticated USING (auth.uid()=user_id OR public.is_admin()) WITH CHECK (auth.uid()=user_id OR public.is_admin());

CREATE POLICY wishlist_select ON public.wishlist FOR SELECT TO authenticated USING (auth.uid()=user_id OR public.is_admin());
CREATE POLICY wishlist_insert ON public.wishlist FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id OR public.is_admin());
CREATE POLICY wishlist_delete ON public.wishlist FOR DELETE TO authenticated USING (auth.uid()=user_id OR public.is_admin());

CREATE POLICY notifications_select ON public.notifications FOR SELECT TO authenticated USING (auth.uid()=user_id OR public.is_admin());
CREATE POLICY notifications_insert ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id OR public.is_admin());
CREATE POLICY notifications_update ON public.notifications FOR UPDATE TO authenticated USING (auth.uid()=user_id OR public.is_admin()) WITH CHECK (auth.uid()=user_id OR public.is_admin());

CREATE POLICY reports_insert ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid()=reporter_id OR public.is_admin());
CREATE POLICY reports_select ON public.reports FOR SELECT TO authenticated USING (auth.uid()=reporter_id OR public.is_admin());
CREATE POLICY reports_update ON public.reports FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY coupons_select ON public.coupons FOR SELECT TO anon, authenticated USING (is_active=true OR public.is_admin());
CREATE POLICY coupons_admin ON public.coupons FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY seller_plans_select ON public.seller_plans FOR SELECT TO authenticated USING (auth.uid()=user_id OR public.is_admin());
CREATE POLICY seller_plans_insert ON public.seller_plans FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id OR public.is_admin());

INSERT INTO storage.buckets(id, name, public) VALUES
('product-images','product-images',true),
('profile-images','profile-images',true),
('verification-docs','verification-docs',false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "hp product images public read" ON storage.objects;
DROP POLICY IF EXISTS "hp product images upload" ON storage.objects;
DROP POLICY IF EXISTS "hp profile images public read" ON storage.objects;
DROP POLICY IF EXISTS "hp profile images upload" ON storage.objects;
DROP POLICY IF EXISTS "hp verification docs owner admin read" ON storage.objects;
DROP POLICY IF EXISTS "hp verification docs owner upload" ON storage.objects;

CREATE POLICY "hp product images public read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id='product-images');
CREATE POLICY "hp product images upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='product-images' AND auth.uid() IS NOT NULL);
CREATE POLICY "hp profile images public read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id='profile-images');
CREATE POLICY "hp profile images upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='profile-images' AND auth.uid() IS NOT NULL);
CREATE POLICY "hp verification docs owner upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='verification-docs' AND auth.uid() IS NOT NULL);
CREATE POLICY "hp verification docs owner admin read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id='verification-docs' AND (public.is_admin() OR (storage.foldername(name))[2] = auth.uid()::text));

SELECT email, role, auth_id FROM public.users WHERE lower(email)=lower('kiratveersinghralhan@gmail.com');
