import { supabase } from '../supabase/client';
import type { VideoSummary } from '../../types';

export const generateSummary = async (videoId: string): Promise<VideoSummary> => {
  const { data, error } = await supabase.functions.invoke('generate-summary', {
    body: { video_id: videoId },
  });
  if (error) throw error;
  return data as VideoSummary;
};

export const getSummary = async (videoId: string): Promise<VideoSummary | null> => {
  const { data, error } = await supabase
    .from('video_summaries')
    .select('*')
    .eq('video_id', videoId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data as VideoSummary | null;
};
