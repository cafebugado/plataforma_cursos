import { supabase } from './client';
import type { VideoProgress, Enrollment } from '../../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export const getEnrollment = async (userId: string, courseId: string) => {
  const { data, error } = await db
    .from('enrollments')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data as unknown as Enrollment | null;
};

export const enrollInCourse = async (userId: string, courseId: string) => {
  const { data, error } = await db
    .from('enrollments')
    .insert({ user_id: userId, course_id: courseId, status: 'active' })
    .select()
    .single();
  if (error) throw error;
  return data as unknown as Enrollment;
};

export const getStudentEnrollments = async (userId: string) => {
  const { data, error } = await db
    .from('enrollments')
    .select('*, courses(*)')
    .eq('user_id', userId)
    .eq('status', 'active');
  if (error) throw error;
  return (data ?? []) as unknown as (Enrollment & { courses: Record<string, unknown> })[];
};

export const getVideoProgress = async (userId: string, videoId: string) => {
  const { data, error } = await db
    .from('video_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('video_id', videoId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data as unknown as VideoProgress | null;
};

export const upsertVideoProgress = async (progress: Omit<VideoProgress, 'id'>) => {
  const { data, error } = await db
    .from('video_progress')
    .upsert(progress, { onConflict: 'user_id,video_id' })
    .select()
    .single();
  if (error) throw error;
  return data as unknown as VideoProgress;
};

export const getCourseAllProgress = async (userId: string, courseId: string): Promise<VideoProgress[]> => {
  const { data, error } = await db
    .from('video_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId);
  if (error) throw error;
  return (data ?? []) as unknown as VideoProgress[];
};

export const getCourseProgress = async (userId: string, courseId: string): Promise<number> => {
  const { data: videos, error: videosError } = await db
    .from('videos')
    .select('id')
    .eq('course_id', courseId);
  if (videosError) throw videosError;

  const { data: progress, error: progressError } = await db
    .from('video_progress')
    .select('is_completed')
    .eq('user_id', userId)
    .eq('course_id', courseId);
  if (progressError) throw progressError;

  const total = videos?.length ?? 0;
  const completed = (progress ?? []).filter((p: { is_completed: boolean }) => p.is_completed).length;
  return total > 0 ? Math.round((completed / total) * 100) : 0;
};

export const getModuleProgress = async (userId: string, moduleId: string): Promise<number> => {
  const { data: videos, error: videosError } = await db
    .from('videos')
    .select('id')
    .eq('module_id', moduleId);
  if (videosError) throw videosError;

  const { data: progress, error: progressError } = await db
    .from('video_progress')
    .select('is_completed')
    .eq('user_id', userId)
    .eq('module_id', moduleId);
  if (progressError) throw progressError;

  const total = videos?.length ?? 0;
  const completed = (progress ?? []).filter((p: { is_completed: boolean }) => p.is_completed).length;
  return total > 0 ? Math.round((completed / total) * 100) : 0;
};
