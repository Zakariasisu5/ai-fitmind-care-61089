-- Update mood_entries table to support comprehensive mood tracking
ALTER TABLE public.mood_entries
ADD COLUMN IF NOT EXISTS mood_score integer,
ADD COLUMN IF NOT EXISTS energy_level integer,
ADD COLUMN IF NOT EXISTS stress_level integer,
ADD COLUMN IF NOT EXISTS anxiety_level integer,
ADD COLUMN IF NOT EXISTS sleep_quality integer,
ADD COLUMN IF NOT EXISTS activities text[],
ADD COLUMN IF NOT EXISTS triggers text[];

-- Add check constraints for valid score ranges
ALTER TABLE public.mood_entries
ADD CONSTRAINT mood_score_range CHECK (mood_score >= 1 AND mood_score <= 10),
ADD CONSTRAINT energy_level_range CHECK (energy_level >= 1 AND energy_level <= 10),
ADD CONSTRAINT stress_level_range CHECK (stress_level >= 1 AND stress_level <= 10),
ADD CONSTRAINT anxiety_level_range CHECK (anxiety_level >= 1 AND anxiety_level <= 10),
ADD CONSTRAINT sleep_quality_range CHECK (sleep_quality >= 1 AND sleep_quality <= 10);

-- Update symptoms table to support more detailed tracking
ALTER TABLE public.symptoms
ADD COLUMN IF NOT EXISTS body_area text,
ADD COLUMN IF NOT EXISTS duration text;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_voice_logs_user_created ON public.voice_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_symptoms_user_created ON public.symptoms(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_created ON public.mood_entries(user_id, created_at DESC);