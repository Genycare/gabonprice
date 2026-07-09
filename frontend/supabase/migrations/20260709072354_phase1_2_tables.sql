-- Extensions
create extension if not exists pgcrypto;

-- ============ users ============
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  phone text unique not null,
  username text not null,
  karma_score int not null default 0,
  level text not null default 'Débutant',
  preferred_province text,
  is_admin boolean not null default false,
  is_banned boolean not null default false,
  created_at timestamptz not null default now()
);

comment on column public.users.phone is 'Donnée personnelle sensible : ne jamais exposer publiquement (voir public.user_profiles pour la vue publique sans le numéro).';

-- ============ products ============
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  search_vector tsvector,
  median_price numeric,
  price_trend_7d numeric,
  created_at timestamptz not null default now()
);

create index products_search_vector_idx on public.products using gin (search_vector);
create index products_category_idx on public.products (category);

-- ============ prices ============
create table public.prices (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  amount numeric not null check (amount > 0),
  store_name text not null,
  province text not null,
  city text not null,
  neighborhood text,
  latitude numeric,
  longitude numeric,
  purchase_date date not null,
  photo_url text,
  status text not null default 'active' check (status in ('active', 'flagged', 'removed')),
  is_median_outlier boolean not null default false,
  helpful_votes int not null default 0,
  unhelpful_votes int not null default 0,
  created_at timestamptz not null default now()
);

create index prices_product_id_idx on public.prices (product_id);
create index prices_user_id_idx on public.prices (user_id);
create index prices_status_idx on public.prices (status);

-- ============ price_ratings ============
create table public.price_ratings (
  id uuid primary key default gen_random_uuid(),
  price_id uuid not null references public.prices (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  rating smallint not null check (rating in (1, -1)),
  created_at timestamptz not null default now(),
  unique (price_id, user_id)
);

-- ============ price_reports ============
create table public.price_reports (
  id uuid primary key default gen_random_uuid(),
  price_id uuid not null references public.prices (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'reviewed')),
  created_at timestamptz not null default now()
);

-- ============ price_history ============
create table public.price_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  median_price numeric not null,
  recorded_on date not null default current_date,
  unique (product_id, recorded_on)
);

create index price_history_product_id_idx on public.price_history (product_id);
