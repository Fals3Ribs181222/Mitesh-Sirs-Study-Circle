-- Allow classes to be created without a batch (open classes tied to a grade).

-- 1. Add grade column to classes (used when batch_id is null)
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS grade TEXT;

-- 2. Backfill grade from the linked batch for all existing classes
UPDATE public.classes c
SET grade = b.grade
FROM public.batches b
WHERE c.batch_id = b.id AND c.grade IS NULL;

-- 3. Update classes SELECT policy to allow null batch_id for teachers
--    (batchless classes are visible if classes.grade matches teacher access)
DROP POLICY IF EXISTS "Grade-scoped class visibility" ON public.classes;

CREATE POLICY "Grade-scoped class visibility" ON public.classes
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      (public.get_my_role() = 'teacher'
          AND (
              (classes.batch_id IS NULL AND public.teacher_can_access_grade(classes.grade))
              OR classes.batch_id IN (
                  SELECT id FROM public.batches
                  WHERE public.teacher_can_access_grade(grade)
              )
          ))
      OR (public.get_my_role() = 'student'
          AND classes.batch_id IN (
              SELECT id FROM public.batches WHERE grade = public.get_my_grade()
          ))
    )
  );

-- 4. Update attendance SELECT policy to allow null batch_id
--    (join through class to get grade when batch_id is null)
DROP POLICY IF EXISTS "Grade-scoped attendance visibility" ON public.attendance;

CREATE POLICY "Grade-scoped attendance visibility" ON public.attendance
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      (public.get_my_role() = 'teacher'
          AND (
              (attendance.batch_id IS NULL AND EXISTS (
                  SELECT 1 FROM public.classes c
                  WHERE c.id = attendance.class_id
                  AND public.teacher_can_access_grade(c.grade)
              ))
              OR attendance.batch_id IN (
                  SELECT id FROM public.batches
                  WHERE public.teacher_can_access_grade(grade)
              )
          ))
      OR (public.get_my_role() = 'student' AND attendance.student_id = auth.uid())
    )
  );
