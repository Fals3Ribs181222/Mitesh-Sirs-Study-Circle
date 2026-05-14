-- =============================================================================
-- Migration: playlists_rls
-- Purpose: Add grade-aware RLS to playlists, class_recordings, and
--          playlist_videos. Teachers always see everything regardless of their
--          grade scope. Students see playlists/recordings for their own grade
--          (or rows with a NULL grade).
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- class_recordings — no grade column, just YouTube metadata; all users see all
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.class_recordings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view recordings" ON class_recordings;

CREATE POLICY "Authenticated users can view recordings" ON class_recordings
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Teachers manage recordings
DROP POLICY IF EXISTS "Teachers can insert recordings" ON class_recordings;
DROP POLICY IF EXISTS "Teachers can update recordings" ON class_recordings;
DROP POLICY IF EXISTS "Teachers can delete recordings" ON class_recordings;

CREATE POLICY "Teachers can insert recordings" ON class_recordings
  FOR INSERT WITH CHECK (public.get_my_role() = 'teacher');

CREATE POLICY "Teachers can update recordings" ON class_recordings
  FOR UPDATE USING (public.get_my_role() = 'teacher');

CREATE POLICY "Teachers can delete recordings" ON class_recordings
  FOR DELETE USING (public.get_my_role() = 'teacher');


-- ─────────────────────────────────────────────────────────────────────────────
-- playlists — has a grade column; teachers see all, students see own grade
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Grade-scoped playlist visibility" ON playlists;

CREATE POLICY "Grade-scoped playlist visibility" ON playlists
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      public.get_my_role() = 'teacher'
      OR (public.get_my_role() = 'student'
          AND (playlists.grade IS NULL OR playlists.grade = public.get_my_grade()))
    )
  );

DROP POLICY IF EXISTS "Teachers can insert playlists" ON playlists;
DROP POLICY IF EXISTS "Teachers can update playlists" ON playlists;
DROP POLICY IF EXISTS "Teachers can delete playlists" ON playlists;

CREATE POLICY "Teachers can insert playlists" ON playlists
  FOR INSERT WITH CHECK (public.get_my_role() = 'teacher');

CREATE POLICY "Teachers can update playlists" ON playlists
  FOR UPDATE USING (public.get_my_role() = 'teacher');

CREATE POLICY "Teachers can delete playlists" ON playlists
  FOR DELETE USING (public.get_my_role() = 'teacher');


-- ─────────────────────────────────────────────────────────────────────────────
-- playlist_videos — join table; access mirrors the parent playlist
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.playlist_videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Playlist videos visible with parent playlist" ON playlist_videos;

CREATE POLICY "Playlist videos visible with parent playlist" ON playlist_videos
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      public.get_my_role() = 'teacher'
      OR (public.get_my_role() = 'student'
          AND playlist_videos.playlist_id IN (
              SELECT id FROM public.playlists
              WHERE grade IS NULL OR grade = public.get_my_grade()
          ))
    )
  );

DROP POLICY IF EXISTS "Teachers can insert playlist_videos" ON playlist_videos;
DROP POLICY IF EXISTS "Teachers can delete playlist_videos" ON playlist_videos;

CREATE POLICY "Teachers can insert playlist_videos" ON playlist_videos
  FOR INSERT WITH CHECK (public.get_my_role() = 'teacher');

CREATE POLICY "Teachers can delete playlist_videos" ON playlist_videos
  FOR DELETE USING (public.get_my_role() = 'teacher');
