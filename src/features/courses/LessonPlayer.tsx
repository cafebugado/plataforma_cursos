import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Alert, Accordion, AccordionDetails, AccordionSummary, Box, Button, Chip,
  CircularProgress, Divider, Grid, Tooltip, Typography,
} from '@mui/material';
import { ArrowBack, ArrowForward, CheckCircle, AutoAwesome, ExpandMore, Quiz, Lock } from '@mui/icons-material';
import { getCourseById } from '../../services/supabase/courses';
import { getVideoById } from '../../services/supabase/videos';
import { getVideoProgress, upsertVideoProgress, getCourseAllProgress } from '../../services/supabase/progress';
import { getQuizByModule, getQuizPassedByModule } from '../../services/supabase/quiz';
import { generateSummary, getSummary } from '../../services/gemini';
import { getYouTubeEmbedUrl } from '../../services/youtube';
import { useAuth } from '../auth/AuthContext';
import VideoCard from '../../components/common/VideoCard';
import StepQuizPanel from '../quiz/StepQuizPanel';
import SummaryPanel from '../summaries/SummaryPanel';
import type { Video, Module } from '../../types';

const LessonPlayer: React.FC = () => {
  const { courseId, moduleId, videoId } = useParams<{ courseId: string; moduleId: string; videoId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const progressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const watchedSecondsRef = useRef<number>(0);
  const watchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [expandedModule, setExpandedModule] = useState<string | null>(moduleId ?? null);
  // null = watching video, string = showing quiz for that moduleId
  const [activeQuizModuleId, setActiveQuizModuleId] = useState<string | null>(null);

  useEffect(() => {
    setExpandedModule(moduleId ?? null);
    setActiveQuizModuleId(null);
  }, [moduleId]);

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

  const { data: allProgress } = useQuery({
    queryKey: ['progress-all', user?.id, courseId],
    queryFn: () => getCourseAllProgress(user!.id, courseId!),
    enabled: !!user && !!courseId,
  });

  const { data: currentModuleQuiz } = useQuery({
    queryKey: ['quiz', moduleId],
    queryFn: () => getQuizByModule(moduleId!),
    enabled: !!moduleId,
  });

  const { data: activeQuiz } = useQuery({
    queryKey: ['quiz', activeQuizModuleId],
    queryFn: () => getQuizByModule(activeQuizModuleId!),
    enabled: !!activeQuizModuleId && activeQuizModuleId !== moduleId,
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
        watched_seconds: watchedSecondsRef.current,
        last_position_seconds: watchedSecondsRef.current,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['progress'] });
      qc.invalidateQueries({ queryKey: ['progress-all'] });
    },
  });

  const generateSummaryMutation = useMutation({
    mutationFn: () => generateSummary(videoId!),
    onSuccess: () => refetchSummary(),
  });

  useEffect(() => {
    watchedSecondsRef.current = progress?.watched_seconds ?? 0;

    watchIntervalRef.current = setInterval(() => {
      if (user && videoId && courseId && moduleId && !progress?.is_completed) {
        watchedSecondsRef.current += 10;
        upsertVideoProgress({
          user_id: user.id,
          course_id: courseId,
          module_id: moduleId,
          video_id: videoId,
          is_completed: false,
          watched_seconds: watchedSecondsRef.current,
          last_position_seconds: watchedSecondsRef.current,
          completed_at: null,
          updated_at: new Date().toISOString(),
        }).then(() => qc.invalidateQueries({ queryKey: ['progress-all'] }));
      }
    }, 10000);

    progressTimer.current = setTimeout(() => {
      if (user && videoId && courseId && moduleId && !progress?.is_completed) {
        markCompleteMutation.mutate();
      }
    }, 30000);

    return () => {
      if (progressTimer.current) clearTimeout(progressTimer.current);
      if (watchIntervalRef.current) clearInterval(watchIntervalRef.current);
    };
  }, [videoId]);

  const currentModule = course?.modules?.find((m) => m.id === moduleId);
  const allVideos = course?.modules?.flatMap((m) => m.videos ?? []) ?? [];
  const currentIdx = allVideos.findIndex((v) => v.id === videoId);
  const prevVideo = currentIdx > 0 ? allVideos[currentIdx - 1] : null;
  const nextVideo = currentIdx < allVideos.length - 1 ? allVideos[currentIdx + 1] : null;

  const progressMap = new Map((allProgress ?? []).map((p) => [p.video_id, p]));

  // A video is unlocked if it's the first overall, OR its previous video is completed/80%
  // AND if it's the first video of a module (not the first module), the previous module's quiz must be passed
  const isVideoUnlocked = (v: Video): boolean => {
    const idx = allVideos.findIndex((av) => av.id === v.id);
    if (idx === 0) return true;

    const prev = allVideos[idx - 1];
    const prevProg = progressMap.get(prev.id);
    if (!prevProg) return false;

    const prevCompleted =
      prevProg.is_completed ||
      (prev.duration_seconds && prev.duration_seconds > 0
        ? prevProg.watched_seconds / prev.duration_seconds >= 0.8
        : false);

    if (!prevCompleted) return false;

    // Check if this video starts a new module
    if (prev.module_id !== v.module_id) {
      // Previous module must have its quiz passed (checked via quizPassedMap below)
      return quizPassedMap.get(prev.module_id) ?? false;
    }

    return true;
  };

  // Build a map of module quizzes passed status from cache
  // We'll store it as a mutable ref to allow isVideoUnlocked to read it
  const quizPassedMap = new Map<string, boolean>();
  course?.modules?.forEach((mod) => {
    const passed = qc.getQueryData<boolean>(['quiz-passed', user?.id, mod.id]);
    quizPassedMap.set(mod.id, passed ?? false);
  });

  // Pre-fetch quiz-passed status for all modules
  course?.modules?.forEach((mod) => {
    if (user && !qc.getQueryData(['quiz-passed', user.id, mod.id])) {
      qc.fetchQuery({
        queryKey: ['quiz-passed', user.id, mod.id],
        queryFn: () => getQuizPassedByModule(user.id, mod.id),
        staleTime: 30000,
      });
    }
  });

  // Whether a module's quiz is unlocked (last video of module must be completed/80%)
  const isQuizUnlocked = (mod: Module): boolean => {
    const videos = mod.videos ?? [];
    if (videos.length === 0) return false;
    const lastVideo = videos[videos.length - 1];
    const lastProg = progressMap.get(lastVideo.id);
    if (!lastProg) return false;
    if (lastProg.is_completed) return true;
    if (lastVideo.duration_seconds && lastVideo.duration_seconds > 0) {
      return lastProg.watched_seconds / lastVideo.duration_seconds >= 0.8;
    }
    return false;
  };

  const goToVideo = (v: Video) => {
    if (!isVideoUnlocked(v)) return;
    navigate(`/app/learn/${courseId}/${v.module_id}/${v.id}`);
  };

  const displayQuiz = activeQuizModuleId
    ? (activeQuizModuleId === moduleId ? currentModuleQuiz : activeQuiz) ?? null
    : null;

  if (courseLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress /></Box>;
  if (!course || !video) return <Alert severity="error">Conteúdo não encontrado.</Alert>;

  return (
    <Grid container spacing={0} sx={{ minHeight: '100%', bgcolor: 'background.default' }}>
      {/* Main content */}
      <Grid size={{ xs: 12, md: 8 }}>
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          {activeQuizModuleId && displayQuiz ? (
            <>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => setActiveQuizModuleId(null)}
                sx={{ mb: 2 }}
              >
                Voltar para a aula
              </Button>
              <StepQuizPanel
                quiz={displayQuiz}
                moduleId={activeQuizModuleId}
                userId={user!.id}
                onPassed={() => {
                  qc.invalidateQueries({ queryKey: ['quiz-passed'] });
                  qc.invalidateQueries({ queryKey: ['progress-all'] });
                }}
              />
            </>
          ) : (
            <>
              {/* Video player */}
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
                  disabled={!nextVideo || !isVideoUnlocked(nextVideo)}
                >
                  Próxima aula
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Grid>

      {/* Sidebar */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Box sx={{
          height: { md: 'calc(100vh - 64px)' },
          overflowY: 'auto',
          borderLeft: '1px solid',
          borderColor: 'divider',
          p: 2,
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Aulas do curso</Typography>

          {course.modules?.map((mod) => {
            const hasQuiz = mod.has_final_quiz;
            const quizUnlocked = isQuizUnlocked(mod);
            const quizPassed = quizPassedMap.get(mod.id) ?? false;
            const isQuizActive = activeQuizModuleId === mod.id;

            return (
              <Accordion
                key={mod.id}
                expanded={expandedModule === mod.id}
                onChange={(_, open) => setExpandedModule(open ? mod.id : null)}
                elevation={0}
                disableGutters
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  mb: 1,
                  borderRadius: '8px !important',
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 1.5, py: 0.5, minHeight: 'unset' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                    Módulo {mod.order_index}: {mod.title}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 1, pt: 0 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {(mod.videos ?? []).map((v) => (
                      <VideoCard
                        key={v.id}
                        video={v}
                        isCurrent={v.id === videoId && !activeQuizModuleId}
                        isCompleted={progressMap.get(v.id)?.is_completed}
                        isLocked={!isVideoUnlocked(v)}
                        onClick={() => { setActiveQuizModuleId(null); goToVideo(v); }}
                      />
                    ))}

                    {/* Quiz card after last video */}
                    {hasQuiz && (
                      <Tooltip
                        title={!quizUnlocked ? 'Assista a última aula para desbloquear o quiz' : ''}
                        placement="left"
                        arrow
                      >
                        <Box
                          onClick={() => { if (quizUnlocked) setActiveQuizModuleId(mod.id); }}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            p: 1.5,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: isQuizActive
                              ? 'primary.main'
                              : quizPassed
                                ? 'success.main'
                                : quizUnlocked
                                  ? 'warning.main'
                                  : 'divider',
                            bgcolor: isQuizActive
                              ? 'primary.50'
                              : quizPassed
                                ? 'success.50'
                                : quizUnlocked
                                  ? 'warning.50'
                                  : 'action.hover',
                            cursor: quizUnlocked ? 'pointer' : 'not-allowed',
                            opacity: quizUnlocked ? 1 : 0.6,
                            transition: 'all 0.2s',
                            '&:hover': quizUnlocked ? { filter: 'brightness(0.96)' } : {},
                          }}
                        >
                          {quizPassed ? (
                            <CheckCircle sx={{ color: 'success.main', fontSize: 22, flexShrink: 0 }} />
                          ) : quizUnlocked ? (
                            <Quiz sx={{ color: 'warning.main', fontSize: 22, flexShrink: 0 }} />
                          ) : (
                            <Lock sx={{ color: 'text.disabled', fontSize: 22, flexShrink: 0 }} />
                          )}
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: quizUnlocked ? 'text.primary' : 'text.disabled' }}>
                              Avaliação do módulo
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {quizPassed
                                ? 'Concluído'
                                : quizUnlocked
                                  ? 'Disponível — clique para iniciar'
                                  : 'Assista a última aula'}
                            </Typography>
                          </Box>
                          {quizPassed && (
                            <Chip label="OK" size="small" color="success" sx={{ ml: 'auto', flexShrink: 0 }} />
                          )}
                        </Box>
                      </Tooltip>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      </Grid>
    </Grid>
  );
};

export default LessonPlayer;
