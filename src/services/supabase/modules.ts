import { supabase } from './client';
import type { Module } from '../../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export const getModulesByCourse = async (courseId: string) => {
  const { data, error } = await db
    .from('modules')
    .select('*, videos(*)')
    .eq('course_id', courseId)
    .order('order_index');
  if (error) throw error;
  return (data ?? []) as unknown as Module[];
};

export const getModuleById = async (id: string) => {
  const { data, error } = await db
    .from('modules')
    .select('*, videos(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as unknown as Module;
};

export const createModule = async (module: Omit<Module, 'id' | 'created_at' | 'updated_at' | 'videos'>) => {
  const { data, error } = await db.from('modules').insert(module).select().single();
  if (error) throw error;
  return data as unknown as Module;
};

export const updateModule = async (id: string, updates: Partial<Omit<Module, 'videos'>>) => {
  const { data, error } = await db
    .from('modules')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as Module;
};

export const deleteModule = async (id: string) => {
  const { error } = await db.from('modules').delete().eq('id', id);
  if (error) throw error;
};

export const reorderModules = async (updates: { id: string; order_index: number }[]) => {
  const promises = updates.map(({ id, order_index }) =>
    db.from('modules').update({ order_index }).eq('id', id)
  );
  await Promise.all(promises);
};
