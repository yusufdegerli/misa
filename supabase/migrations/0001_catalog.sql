-- Mişa Silver catalogue schema.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
--
-- Security model: the public site reads published rows with the publishable (anon) key.
-- Nothing is writable with that key. The admin panel writes on the server with the secret
-- key after checking the signed-in user is on the ADMIN_EMAILS allowlist.

create extension if not exists pgcrypto;

-- Seasonal issues ("sayı"). Localized text is stored as {"tr": "...", "en": "...", ...}.
create table if not exists public.issues (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  number integer not null check (number > 0),
  collection_name jsonb not null default '{}'::jsonb,
  season jsonb not null default '{}'::jsonb,
  intro jsonb not null default '{}'::jsonb,
  published_at date not null default current_date,
  cover_product_code text,
  pdf_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9]+(-[A-Z0-9]+)*$'),
  name text not null,
  description jsonb,
  category text not null check (category in ('rings', 'necklaces', 'earrings', 'bracelets', 'sets')),
  issue_id uuid references public.issues (id) on delete set null,
  weight_grams numeric(8, 2) not null check (weight_grams > 0),
  sizes text,
  min_order integer not null default 12 check (min_order > 0),
  featured boolean not null default false,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_issue_idx on public.products (issue_id, sort_order);
create index if not exists products_category_idx on public.products (category);

-- Each photo is stored as three WebP widths under <path_prefix>/<width>.webp in the
-- "product-images" bucket, so pages can send each device a suitable size.
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  position integer not null default 0,
  path_prefix text not null unique,
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  blur_data_url text,
  created_at timestamptz not null default now()
);
create index if not exists product_images_product_idx on public.product_images (product_id, position);

-- Keep updated_at current.
create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists issues_touch on public.issues;
create trigger issues_touch before update on public.issues
  for each row execute function public.touch_updated_at();
drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- Row level security: public read of published content only, no public writes.
alter table public.issues enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;

drop policy if exists "Published issues are public" on public.issues;
create policy "Published issues are public" on public.issues
  for select to anon, authenticated using (is_published);

drop policy if exists "Published products are public" on public.products;
create policy "Published products are public" on public.products
  for select to anon, authenticated using (is_published);

drop policy if exists "Images of published products are public" on public.product_images;
create policy "Images of published products are public" on public.product_images
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.is_published));

-- Public bucket for product photos: anyone can view, only the server (secret key) can write.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 10485760, array['image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
