ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS investment integer,
  ADD COLUMN IF NOT EXISTS experience text;