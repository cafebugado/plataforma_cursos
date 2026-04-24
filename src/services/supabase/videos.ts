import { supabase } from './client';
import type { Video } from '../../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export const getVideosByModule = async (moduleId: string) => {
  const { data, error } = await db
    .from('videos')
    .select('*')
    .eq('module_id', moduleId)
    .order('order_index');
  if (error) throw error;
  return (data ?? []) as unknown as Video[];
};

export const getVideoById = async (id: string) => {
  const { data, error } = await db.from('videos').select('*').eq('id', id).single();
  if (error) throw error;
  return data as unknown as Video;
};

export const createVideo = async (video: Omit<Video, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await db.from('videos').insert(video).select().single();
  if (error) throw error;
  return data as unknown as Video;
};

export const updateVideo = async (id: string, updates: Partial<Video>) => {
  const { data, error } = await db
    .from('videos')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as Video;
};

export const deleteVideo = async (id: string) => {
  const { error } = await db.from('videos').delete().eq('id', id);
  if (error) throw error;
};

export const reorderVideos = async (updates: { id: string; order_index: number }[]) => {
  const promises = updates.map(({ id, order_index }) =>
    db.from('videos').update({ order_index }).eq('id', id)
  );
  await Promise.all(promises);
};
