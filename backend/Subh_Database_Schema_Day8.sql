-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug character varying NOT NULL UNIQUE,
  name_ar character varying NOT NULL,
  description_ar character varying,
  scope USER-DEFINED NOT NULL DEFAULT 'global'::role_scope,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT roles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug character varying NOT NULL UNIQUE,
  name_ar character varying NOT NULL,
  description_ar character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT permissions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email USER-DEFINED NOT NULL UNIQUE,
  phone character varying NOT NULL UNIQUE,
  password_hash character varying NOT NULL,
  full_name character varying NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  is_guest boolean NOT NULL DEFAULT false,
  email_verified_at timestamp with time zone,
  last_login_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.role_permissions (
  role_id uuid NOT NULL,
  permission_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES public.roles(id),
  CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES public.permissions(id)
);
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role_id uuid NOT NULL,
  merchant_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES public.roles(id)
);
CREATE TABLE public.addresses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recipient_name character varying NOT NULL,
  phone character varying NOT NULL,
  line1 character varying NOT NULL,
  line2 character varying,
  city character varying NOT NULL,
  region character varying NOT NULL,
  postal_code character varying,
  lat numeric,
  lng numeric,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT addresses_pkey PRIMARY KEY (id),
  CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug character varying NOT NULL UNIQUE,
  name_ar character varying NOT NULL,
  billing_period USER-DEFINED NOT NULL,
  price_sar numeric NOT NULL CHECK (price_sar >= 0::numeric),
  is_active boolean NOT NULL DEFAULT true,
  features jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT plans_pkey PRIMARY KEY (id)
);
CREATE TABLE public.merchant_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::application_status,
  commercial_name character varying NOT NULL,
  commercial_registration_no character varying NOT NULL,
  vat_number character varying,
  iban character varying NOT NULL,
  notes text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  rejection_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT merchant_applications_pkey PRIMARY KEY (id),
  CONSTRAINT fk_applications_user FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.merchants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  status USER-DEFINED NOT NULL DEFAULT 'active'::merchant_status,
  commercial_name character varying NOT NULL,
  commercial_registration_no character varying NOT NULL UNIQUE,
  vat_number character varying UNIQUE,
  iban character varying NOT NULL,
  commission_rate numeric NOT NULL DEFAULT 0.0 CHECK (commission_rate >= 0::numeric AND commission_rate <= 1::numeric),
  rating_avg numeric NOT NULL DEFAULT 0 CHECK (rating_avg >= 0::numeric AND rating_avg <= 5::numeric),
  rating_count integer NOT NULL DEFAULT 0,
  approved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT merchants_pkey PRIMARY KEY (id),
  CONSTRAINT fk_merchants_user FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.merchant_employees (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role USER-DEFINED NOT NULL,
  permissions jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT merchant_employees_pkey PRIMARY KEY (id),
  CONSTRAINT fk_merchant_employees_merchant FOREIGN KEY (merchant_id) REFERENCES public.merchants(id),
  CONSTRAINT fk_merchant_employees_user FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.merchant_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'active'::subscription_status,
  started_at timestamp with time zone NOT NULL,
  current_period_end timestamp with time zone NOT NULL,
  external_reference character varying UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT merchant_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT fk_subscriptions_merchant FOREIGN KEY (merchant_id) REFERENCES public.merchants(id),
  CONSTRAINT fk_subscriptions_plan FOREIGN KEY (plan_id) REFERENCES public.plans(id)
);
CREATE TABLE public.admin_employees (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  department USER-DEFINED NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'admin_staff'::admin_role,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT admin_employees_pkey PRIMARY KEY (id),
  CONSTRAINT fk_admin_employees_user FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  parent_id uuid,
  slug character varying NOT NULL UNIQUE,
  name_ar character varying NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES public.categories(id)
);
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id uuid,
  sku character varying NOT NULL UNIQUE,
  slug character varying NOT NULL UNIQUE,
  name_ar character varying NOT NULL,
  description_ar text,
  price_sar numeric NOT NULL CHECK (price_sar >= 0::numeric),
  vat_rate numeric NOT NULL DEFAULT 0.15 CHECK (vat_rate >= 0::numeric AND vat_rate <= 1::numeric),
  status USER-DEFINED NOT NULL DEFAULT 'draft'::catalog_status,
  weight_grams integer CHECK (weight_grams IS NULL OR weight_grams >= 0),
  is_package boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.product_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  url character varying NOT NULL,
  alt_text_ar character varying,
  sort_order integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT product_images_pkey PRIMARY KEY (id),
  CONSTRAINT fk_images_product FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.packages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sku character varying NOT NULL UNIQUE,
  slug character varying NOT NULL UNIQUE,
  name_ar character varying NOT NULL,
  description_ar text,
  price_sar numeric NOT NULL CHECK (price_sar >= 0::numeric),
  vat_rate numeric NOT NULL DEFAULT 0.15 CHECK (vat_rate >= 0::numeric AND vat_rate <= 1::numeric),
  status USER-DEFINED NOT NULL DEFAULT 'draft'::catalog_status,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT packages_pkey PRIMARY KEY (id)
);
CREATE TABLE public.package_items (
  package_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT package_items_pkey PRIMARY KEY (package_id, product_id),
  CONSTRAINT fk_package_items_package FOREIGN KEY (package_id) REFERENCES public.packages(id),
  CONSTRAINT fk_package_items_product FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.merchant_products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL,
  product_id uuid,
  package_id uuid,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT merchant_products_pkey PRIMARY KEY (id),
  CONSTRAINT fk_mp_merchant FOREIGN KEY (merchant_id) REFERENCES public.merchants(id),
  CONSTRAINT fk_mp_product FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT fk_mp_package FOREIGN KEY (package_id) REFERENCES public.packages(id)
);
CREATE TABLE public.inventory (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sellable_type USER-DEFINED NOT NULL,
  sellable_id uuid NOT NULL,
  sku character varying NOT NULL,
  on_hand integer NOT NULL DEFAULT 0 CHECK (on_hand >= 0),
  reserved integer NOT NULL DEFAULT 0,
  reorder_threshold integer NOT NULL DEFAULT 5 CHECK (reorder_threshold >= 0),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT inventory_pkey PRIMARY KEY (id)
);
CREATE TABLE public.stock_reservations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  inventory_id uuid NOT NULL,
  cart_id uuid,
  order_id uuid,
  quantity integer NOT NULL CHECK (quantity >= 1),
  status USER-DEFINED NOT NULL DEFAULT 'active'::reservation_status,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT stock_reservations_pkey PRIMARY KEY (id),
  CONSTRAINT fk_reservations_inventory FOREIGN KEY (inventory_id) REFERENCES public.inventory(id)
);
CREATE TABLE public.stock_movements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  inventory_id uuid NOT NULL,
  type USER-DEFINED NOT NULL,
  delta integer NOT NULL,
  reason character varying,
  reference_type character varying,
  reference_id uuid,
  actor_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT stock_movements_pkey PRIMARY KEY (id),
  CONSTRAINT fk_movements_inventory FOREIGN KEY (inventory_id) REFERENCES public.inventory(id)
);
CREATE TABLE public.carts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  session_id character varying UNIQUE,
  currency character varying NOT NULL DEFAULT 'SAR'::character varying,
  status USER-DEFINED NOT NULL DEFAULT 'active'::cart_status,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT carts_pkey PRIMARY KEY (id),
  CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.cart_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL,
  merchant_id uuid NOT NULL,
  product_id uuid,
  package_id uuid,
  quantity integer NOT NULL CHECK (quantity >= 1),
  unit_price_sar numeric NOT NULL CHECK (unit_price_sar >= 0::numeric),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT cart_items_pkey PRIMARY KEY (id),
  CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES public.carts(id),
  CONSTRAINT fk_cart_items_merchant FOREIGN KEY (merchant_id) REFERENCES public.merchants(id),
  CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT fk_cart_items_package FOREIGN KEY (package_id) REFERENCES public.packages(id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  number character varying NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  merchant_id uuid NOT NULL,
  parent_order_id uuid,
  shipping_address_id uuid NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'pending_payment'::order_status,
  currency character varying NOT NULL DEFAULT 'SAR'::character varying,
  subtotal_sar numeric NOT NULL CHECK (subtotal_sar >= 0::numeric),
  discount_sar numeric NOT NULL DEFAULT 0 CHECK (discount_sar >= 0::numeric),
  shipping_sar numeric NOT NULL DEFAULT 0 CHECK (shipping_sar >= 0::numeric),
  vat_sar numeric NOT NULL DEFAULT 0 CHECK (vat_sar >= 0::numeric),
  total_sar numeric NOT NULL CHECK (total_sar >= 0::numeric),
  notes_ar text,
  placed_at timestamp with time zone,
  paid_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT fk_orders_merchant FOREIGN KEY (merchant_id) REFERENCES public.merchants(id),
  CONSTRAINT fk_orders_address FOREIGN KEY (shipping_address_id) REFERENCES public.addresses(id),
  CONSTRAINT fk_orders_parent FOREIGN KEY (parent_order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  merchant_id uuid NOT NULL,
  product_id uuid,
  package_id uuid,
  name_snapshot_ar character varying NOT NULL,
  sku_snapshot character varying NOT NULL,
  quantity integer NOT NULL CHECK (quantity >= 1),
  unit_price_sar numeric NOT NULL CHECK (unit_price_sar >= 0::numeric),
  vat_rate numeric NOT NULL DEFAULT 0.15 CHECK (vat_rate >= 0::numeric AND vat_rate <= 1::numeric),
  line_total_sar numeric NOT NULL CHECK (line_total_sar >= 0::numeric),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT fk_order_items_merchant FOREIGN KEY (merchant_id) REFERENCES public.merchants(id),
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT fk_order_items_package FOREIGN KEY (package_id) REFERENCES public.packages(id)
);
CREATE TABLE public.order_status_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  from_status character varying,
  to_status character varying NOT NULL,
  comment_ar text,
  actor_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT order_status_history_pkey PRIMARY KEY (id),
  CONSTRAINT fk_status_history_order FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.shipments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE,
  carrier character varying,
  tracking_number character varying,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::shipment_status,
  shipped_at timestamp with time zone,
  delivered_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT shipments_pkey PRIMARY KEY (id),
  CONSTRAINT fk_shipments_order FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  provider character varying NOT NULL,
  provider_reference character varying UNIQUE,
  method USER-DEFINED NOT NULL,
  amount_sar numeric NOT NULL CHECK (amount_sar >= 0::numeric),
  currency character varying NOT NULL DEFAULT 'SAR'::character varying,
  status USER-DEFINED NOT NULL DEFAULT 'initiated'::payment_status,
  captured_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.payment_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL,
  event_id character varying NOT NULL UNIQUE,
  event_type character varying NOT NULL,
  status character varying NOT NULL,
  payload jsonb NOT NULL,
  received_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT payment_events_pkey PRIMARY KEY (id),
  CONSTRAINT fk_payment_events_payment FOREIGN KEY (payment_id) REFERENCES public.payments(id)
);
CREATE TABLE public.refunds (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL,
  order_id uuid NOT NULL,
  amount_sar numeric NOT NULL CHECK (amount_sar >= 0::numeric),
  reason_ar character varying,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::refund_status,
  provider_reference character varying UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT refunds_pkey PRIMARY KEY (id),
  CONSTRAINT fk_refunds_payment FOREIGN KEY (payment_id) REFERENCES public.payments(id),
  CONSTRAINT fk_refunds_order FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE,
  number character varying NOT NULL UNIQUE,
  issued_at timestamp with time zone NOT NULL,
  buyer_name character varying NOT NULL,
  buyer_vat_number character varying,
  subtotal_sar numeric NOT NULL,
  vat_sar numeric NOT NULL,
  total_sar numeric NOT NULL,
  pdf_url character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT invoices_pkey PRIMARY KEY (id),
  CONSTRAINT fk_invoices_order FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  channel USER-DEFINED NOT NULL DEFAULT 'in_app'::notification_channel,
  title_ar character varying NOT NULL,
  body_ar text NOT NULL,
  payload jsonb,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_type character varying,
  action character varying NOT NULL,
  entity_type character varying NOT NULL,
  entity_id uuid,
  before jsonb,
  after jsonb,
  ip_address inet,
  user_agent character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.otp_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  phone character varying NOT NULL,
  code_hash character varying NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  is_used boolean NOT NULL DEFAULT false,
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT otp_codes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.support_tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  order_id uuid,
  subject_ar character varying NOT NULL,
  message_ar text NOT NULL,
  status character varying NOT NULL DEFAULT 'open'::character varying CHECK (status::text = ANY (ARRAY['open'::character varying, 'in_progress'::character varying, 'resolved'::character varying, 'closed'::character varying]::text[])),
  category character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT support_tickets_pkey PRIMARY KEY (id),
  CONSTRAINT support_tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT support_tickets_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.product_update_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL,
  merchant_product_id uuid,
  product_id uuid,
  package_id uuid,
  requested_change jsonb NOT NULL,
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'under_review'::character varying, 'approved'::character varying, 'rejected'::character varying, 'applied'::character varying]::text[])),
  reason_ar text,
  requested_by uuid NOT NULL,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  rejection_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT product_update_requests_pkey PRIMARY KEY (id),
  CONSTRAINT product_update_requests_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id)
);
CREATE TABLE public.settlements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL,
  period_from timestamp with time zone,
  period_to timestamp with time zone,
  gross_sales_sar numeric NOT NULL DEFAULT 0 CHECK (gross_sales_sar >= 0::numeric),
  commission_sar numeric NOT NULL DEFAULT 0 CHECK (commission_sar >= 0::numeric),
  refunds_sar numeric NOT NULL DEFAULT 0 CHECK (refunds_sar >= 0::numeric),
  net_payable_sar numeric NOT NULL DEFAULT 0 CHECK (net_payable_sar >= 0::numeric),
  currency character varying NOT NULL DEFAULT 'SAR'::character varying,
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'processing'::character varying, 'paid'::character varying, 'failed'::character varying]::text[])),
  paid_at timestamp with time zone,
  reference character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT settlements_pkey PRIMARY KEY (id),
  CONSTRAINT settlements_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id)
);
CREATE TABLE public.subscription_change_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL,
  current_plan_id uuid,
  requested_plan_id uuid NOT NULL,
  change_type character varying NOT NULL DEFAULT 'change_period'::character varying CHECK (change_type::text = ANY (ARRAY['upgrade'::character varying, 'downgrade'::character varying, 'change_period'::character varying]::text[])),
  reason_ar text,
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'applied'::character varying]::text[])),
  requested_by uuid NOT NULL,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  rejection_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT subscription_change_requests_pkey PRIMARY KEY (id),
  CONSTRAINT subscription_change_requests_requested_plan_id_fkey FOREIGN KEY (requested_plan_id) REFERENCES public.plans(id),
  CONSTRAINT subscription_change_requests_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchants(id),
  CONSTRAINT subscription_change_requests_current_plan_id_fkey FOREIGN KEY (current_plan_id) REFERENCES public.plans(id)
);
CREATE TABLE public.settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key character varying NOT NULL UNIQUE,
  label_ar character varying,
  value jsonb NOT NULL,
  group character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.SequelizeMeta (
  name character varying NOT NULL,
  CONSTRAINT SequelizeMeta_pkey PRIMARY KEY (name)
);
