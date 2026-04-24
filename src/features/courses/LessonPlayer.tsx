import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Alert, Box, Button, Chip, CircularProgress, Divider, Grid, Tooltip, Typography,
} from '@mui/material';
import { ArrowBack, ArrowForward, CheckCircle, AutoAwesome } from '@mui/icons-material';
import { getCourseById } from '../../services/supabase/courses';
import { getVideoById } from '../../services/supabase/videos';
import { getVideoProgress, upsertVideoProgress } from '../../services/supabase/progress';
import { getQuizByModule } from '../../services/supabase/quiz';
import { generateSummary, getSummary } from '../../services/gemini';
import { getYouTubeEmbedUrl } from '../../services/youtube';
import { useAuth } from '../auth/AuthContext';
import VideoCard from '../../components/common/VideoCard';
import QuizPanel from '../quiz/QuizPanel';
import SummaryPanel from '../summaries/SummaryPanel';
import type { Video } from '../../types';

const LessonPlayer: React.FC = () => {
  const { courseId, moduleId, videoId } = useParams<{ courseId: string; moduleId: string; videoId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const progressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseById(courseId!),
    enabled: !!courseId,
  });

  const { data: video } = useQuery({
    queryKey: ['video', videoId],
    queryFn: () => getVideoById(videoId!),
    enabled: !!videoId,
  });

  const { data: progress } = useQuery({
    queryKey: ['progress', user?.id, videoId],
    queryFn: () => getVideoProgress(user!.id, videoId!),
    enabled: !!user && !!videoId,
  });

  const { data: quiz } = useQuery({
    queryKey: ['quiz', moduleId],
    queryFn: () => getQuizByModule(moduleId!),
    enabled: !!moduleId,
  });

  const { data: summary, refetch: refetchSummary } = useQuery({
    queryKey: ['summary', videoId],
    queryFn: () => getSummary(videoId!),
    enabled: !!videoId,
  });

  const markCompleteMutation = useMutation({
    mutationFn: () =>
      upsertVideoProgress({
        user_id: user!.id,
        course_id: courseId!,
        module_id: moduleId!,
        video_id: videoId!,
        is_completed: true,
        watched_seconds: 0,
        last_position_seconds: 0,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['progress'] }),
  });

  const generateSummaryMutation = useMutation({
    mutationFn: () => generateSummary(videoId!),
    onSuccess: () => refetchSummary(),
  });

  useEffect(() => {
    progressTimer.current = setTimeout(() => {
      if (user && videoId && courseId && moduleId && !progress?.is_completed) {
        markCompleteMutation.mutate();
      }
    }, 30000);
    return () => { if (progressTimer.current) clearTimeout(progressTimer.current); };
  }, [videoId]);

  const currentModule = course?.modules?.find((m) => m.id === moduleId);
  const allVideos = course?.modules?.flatMap((m) => m.videos ?? []) ?? [];
  const currentIdx = allVideos.findIndex((v) => v.id === videoId);
  const prevVideo = currentIdx > 0 ? allVideos[currentIdx - 1] : null;
  const nextVideo = currentIdx < allVideos.length - 1 ? allVideos[currentIdx + 1] : null;

  const isLastInModule = currentModule?.videos
    ? currentModule.videos[currentModule.videos.length - 1]?.id === videoId
    : false;
  const showQuiz = isLastInModule && quiz && currentModule?.has_final_quiz;

  const goToVideo = (v: Video) => navigate(`/app/learn/${courseId}/${v.module_id}/${v.id}`);

  if (courseLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress /></Box>;
  if (!course || !video) return <Alert severity="error">Conteúdo não encontrado.</Alert>;

  return (
    <Grid container spacing={0} sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default' }}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <Box sx={{ position: 'relative', paddingTop: '56.25%', bgcolor: '#000', borderRadius: 3, overflow: 'hidden', mb: 3 }}>
            <Box
              component="iframe"
              src={getYouTubeEmbedUrl(video.youtube_video_id)}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{video.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{currentModule?.title}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, ml: 2 }}>
              {progress?.is_completed && <Chip icon={<CheckCircle />} label="Concluída" color="success" />}
              <Tooltip title="Gerar resumo com IA">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AutoAwesome />}
                  onClick={() => generateSummaryMutation.mutate()}
                  disabled={generateSummaryMutation.isPending}
                >
                  {generateSummaryMutation.isPending ? 'Gerando...' : 'Resumo IA'}
                </Button>
              </Tooltip>
              {!progress?.is_completed && (
                <Button variant="contained" size="small" onClick={() => markCompleteMutation.mutate()} disabled={markCompleteMutation.isPending}>
                  Marcar como concluída
                </Button>
              )}
            </Box>
          </Box>

          {video.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {video.description}
            </Typography>
          )}

          {summary && <SummaryPanel summary={summary} />}

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => prevVideo && goToVideo(prevVideo)}
              disabled={!prevVideo}
            >
              Aula anterior
            </Button>
            <Button
              variant="contained"
              endIcon={<ArrowForward />}
              onClick={() => nextVideo && goToVideo(nextVideo)}
              disabled={!nextVideo}
            >
              Próxima aula
            </Button>
          </Box>

          {showQuiz && (
            <Box sx={{ mt: 4 }}>
              <QuizPanel quiz={quiz!} moduleId={moduleId!} userId={user!.id} />
            </Box>
          )}
        </Box>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Box sx={{
          height: { md: 'calc(100vh - 64px)' },
          overflowY: 'auto',
          borderLeft: '1px solid',
          borderColor: 'divider',
          p: 2,
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Aulas do curso</Typography>
          {course.modules?.map((mod) => (
            <Box key={mod.id} sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Módulo {mod.order_index}: {mod.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {(mod.videos ?? []).map((v) => (
                  <VideoCard
                    key={v.id}
                    video={v}
                    isCurrent={v.id === videoId}
                    onClick={() => goToVideo(v)}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Grid>
    </Grid>
  );
};

export default LessonPlayer;
