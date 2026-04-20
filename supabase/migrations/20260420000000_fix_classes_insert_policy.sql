-- Fix: explicitly add WITH CHECK to the classes management policy
-- The FOR ALL USING-only policy can silently block inserts in some Supabase versions.

DROP POLICY IF EXISTS "Teachers can manage classes" ON classes;

CREATE POLICY "Teachers can manage classes" ON classes
  FOR ALL
  USING (public.is_teacher())
  WITH CHECK (public.is_teacher());
