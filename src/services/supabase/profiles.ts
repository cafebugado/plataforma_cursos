import { supabase } from './client';
import type { Profile } from '../../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export const getProfile = async (userId: string): Promise<Profile> => {
  const { data, error } = await db
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data as unknown as Profile;
};

export const updateProfile = async (
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'created_at'>>,
): Promise<Profile> => {
  const { data, error } = await db
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as Profile;
};

export const uploadAvatar = async (userId: string, file: File): Promise<string> => {
  const ext = file.name.split('.').pop();
  // Path uses userId as folder to satisfy RLS policy: (foldername(name))[1] = auth.uid()
  const path = `${userId}/avatar.${ext}`;
  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
};
