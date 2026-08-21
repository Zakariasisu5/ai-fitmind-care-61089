ALTER TABLE public.nutrition_entries
  ADD COLUMN IF NOT EXISTS water_intake integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dietary_tags text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS food_items_list text[] DEFAULT '{}'::text[];