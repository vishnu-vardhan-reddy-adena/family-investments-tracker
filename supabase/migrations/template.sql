# Migration Template
# Copy this file when creating new migrations

-- Migration: [FEATURE_NAME]
-- Created: [DATE]
-- Description: [WHAT THIS MIGRATION DOES]
-- Author: [YOUR_NAME]

-- Example patterns:

-- 1. ADD TABLE
CREATE TABLE IF NOT EXISTS public.table_name (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_table_name_user_id ON public.table_name(user_id);

ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own records" ON public.table_name
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. ADD COLUMN
ALTER TABLE public.existing_table
ADD COLUMN IF NOT EXISTS new_column TEXT;

CREATE INDEX IF NOT EXISTS idx_existing_table_new_column
  ON public.existing_table(new_column)
  WHERE new_column IS NOT NULL;

-- 3. ADD ENUM VALUE
DO $$ BEGIN
  ALTER TYPE existing_enum ADD VALUE IF NOT EXISTS 'new_value';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 4. UPDATE RLS POLICY
DROP POLICY IF EXISTS "old_policy_name" ON public.table_name;

CREATE POLICY "new_policy_name" ON public.table_name
  FOR ALL USING (auth.uid() = user_id);

-- 5. ADD FUNCTION
CREATE OR REPLACE FUNCTION public.function_name(param UUID)
RETURNS TABLE(result TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT column_name::TEXT
  FROM public.table_name
  WHERE id = param;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 6. ADD TRIGGER
CREATE OR REPLACE FUNCTION public.trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_name ON public.table_name;

CREATE TRIGGER trigger_name
  BEFORE UPDATE ON public.table_name
  FOR EACH ROW EXECUTE FUNCTION public.trigger_function();

-- 7. MIGRATION VERIFICATION
-- Add a comment to help track what was changed
COMMENT ON TABLE public.table_name IS 'Added in migration [DATE] - [DESCRIPTION]';
