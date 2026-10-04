-- Amir Graph production store schema
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null default '',
  price_toman bigint not null check (price_toman >= 0),
  image_url text,
  file_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  mobile text not null,
  email text,
  amount_toman bigint not null check (amount_toman >= 0),
  status text not null default 'pending' check (status in ('pending','paid','failed','cancelled')),
  payment_authority text,
  payment_ref_id text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  title text not null,
  price_toman bigint not null,
  quantity integer not null default 1 check (quantity > 0)
);

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "public can read active products"
on public.products for select
using (active = true);

-- Service role used by Vercel API bypasses RLS.
insert into public.products (slug,title,description,price_toman,active)
values
('cinematic-ai-portrait','پک پرتره سینمایی AI','پک حرفه‌ای پرامپت و قالب پرتره سینمایی.',299000,true),
('3d-atelier-kit','کیت آتلیه سه‌بعدی','مجموعه صحنه و بک‌گراند دیجیتال.',490000,true),
('advertising-design-pack','پک طراحی تبلیغاتی','قالب‌های آماده پوستر، استوری و تبلیغات.',390000,true)
on conflict (slug) do nothing;
