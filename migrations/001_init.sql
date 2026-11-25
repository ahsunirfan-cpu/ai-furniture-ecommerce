create type user_role as enum ('USER', 'ADMIN');
create type room_type as enum ('bedroom', 'living_room', 'dining_room', 'office', 'kitchen');
create type product_category as enum (
  'beds', 'sofas', 'chairs', 'tables', 'wardrobes', 'cabinets',
  'dining_sets', 'office', 'decor'
);
create type room_analysis_status as enum ('PENDING', 'COMPLETE', 'FAILED');
create type order_status as enum ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
create type payment_method as enum ('STRIPE', 'COD');
create type payment_status as enum ('PENDING', 'PAID', 'FAILED');

create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text not null default '',
  role user_role not null default 'USER',
  created_at timestamptz not null default now()
);

create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  label text not null default 'Home',
  line1 text not null,
  line2 text,
  city text not null,
  postal_code text not null,
  country text not null default 'United Kingdom',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price_cents integer not null,
  category product_category not null,
  colors text[] not null default '{}',
  dimensions jsonb not null default '{"widthCm":0,"depthCm":0,"heightCm":0}',
  material text not null default '',
  style_tags text[] not null default '{}',
  images text[] not null default '{}',
  stock integer not null default 0,
  popularity integer not null default 0,
  created_at timestamptz not null default now()
);

create index products_category_idx on products(category);
create index products_price_idx on products(price_cents);
create index products_created_idx on products(created_at desc);

create table room_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  room_type room_type not null,
  image_path text not null,
  status room_analysis_status not null default 'PENDING',
  analysis_json jsonb,
  error_message text,
  created_at timestamptz not null default now()
);

create table recommendation_sessions (
  id uuid primary key default gen_random_uuid(),
  room_analysis_id uuid not null references room_analyses(id) on delete cascade,
  filter_json jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table recommendation_items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references recommendation_sessions(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  score numeric not null,
  explanation text not null default '',
  unique (session_id, product_id)
);

create table carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  updated_at timestamptz not null default now()
);

create table cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references carts(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  unique (cart_id, product_id)
);

create table wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete restrict,
  status order_status not null default 'PENDING',
  payment_method payment_method not null,
  payment_status payment_status not null default 'PENDING',
  stripe_session_id text,
  subtotal_cents integer not null,
  delivery_cents integer not null default 0,
  total_cents integer not null,
  delivery_address jsonb not null,
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  quantity integer not null,
  unit_price_cents integer not null,
  product_name text not null
);

create index orders_user_idx on orders(user_id, created_at desc);