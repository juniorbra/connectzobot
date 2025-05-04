-- Migration: Create subscription table
-- Date: 2025-05-04

create table public.subscription (
  id uuid primary key references public.profiles(id) on delete cascade,
  number_workflows int4 default 0,
  subscription boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add comment to the table
comment on table public.subscription is 'Table to store user subscription information';

-- Add comments to columns
comment on column public.subscription.id is 'Foreign key to profiles.id';
comment on column public.subscription.number_workflows is 'Number of workflows created by the user';
comment on column public.subscription.subscription is 'Whether the user is a subscriber or not';
