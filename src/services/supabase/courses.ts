import { supabase } from './client';
import type { Course } from '../../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export const getCourses = async (publishedOnly = false) => {
  let query = db.from('courses').select('*').order('created_at', { ascending: false });
  if (publishedOnly) query = query.eq('is_published', true);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Course[];
};

export const getCourseById = async (id: string) => {
  const { data, error } = await db
    .from('courses')
    .select('*, modules(*, videos(*))')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as unknown as Course;
};

export const getCourseBySlug = async (slug: string) => {
  const { data, error } = await db
    .from('courses')
    .select('*, modules(*, videos(*))')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data as unknown as Course;
};

export const createCourse = async (course: Omit<Course, 'id' | 'created_at' | 'updated_at' | 'modules'> & { id?: string }) => {
  const { data, error } = await db
    .from('courses')
    .insert(course)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as Course;
};

export const updateCourse = async (id: string, updates: Partial<Omit<Course, 'modules'>>) => {
  const { data, error } = await db
    .from('courses')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as Course;
};

export const deleteCourse = async (id: string) => {
  const { error } = await db.from('courses').delete().eq('id', id);
  if (error) throw error;
};

export const uploadCourseThumbnail = async (courseId: string, file: File): Promise<string> => {
  const ext = file.name.split('.').pop();
  const path = `courses/${courseId}/thumbnail.${ext}`;
  const { error } = await supabase.storage.from('course-assets').upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('course-assets').getPublicUrl(path);
  return data.publicUrl;
};
