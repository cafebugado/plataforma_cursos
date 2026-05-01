import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Alert, Accordion, AccordionDetails, AccordionSummary, Box, Button, Chip,
  CircularProgress, Divider, Grid, List, ListItem, ListItemIcon, ListItemText,
  Typography,
} from '@mui/material';
import { ExpandMore, PlayCircle, Lock } from '@mui/icons-material';
import { getCourseBySlug } from '../../services/supabase/courses';
import { getEnrollment, enrollInCourse } from '../../services/supabase/progress';
import { useAuth } from '../auth/AuthContext';
import PageHeader from '../../components/common/PageHeader';
import CategoryChips from '../../components/common/CategoryChips';

const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: course, isLoading } = useQuery({
    queryKey: ['course-slug', slug],
    queryFn: () => getCourseBySlug(slug!),
    enabled: !!slug,
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', user?.id, course?.id],
    queryFn: () => getEnrollment(user!.id, course!.id),
    enabled: !!user && !!course,
  });

  const enrollMutation = useMutation({
    mutationFn: () => enrollInCourse(user!.id, course!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enrollment'] });
      qc.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });

  const levelLabels: Record<string, string> = { beginner: 'Iniciante', intermediate: 'Intermediário', advanced: 'Avançado' };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress /></Box>;
  if (!course) return <Alert severity="error">Curso não encontrado.</Alert>;

  const firstVideo = course.modules?.[0]?.videos?.[0];

  return (
    <Box>
      <PageHeader
        title={course.title}
        breadcrumbs={[{ label: 'Cursos', to: '/app/courses' }, { label: course.title }]}
      />

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box
            component="img"
            src={course.thumbnail_url ?? `https://placehold.co/800x400/6C63FF/white?text=${encodeURIComponent(course.title)}`}
            alt={course.title}
            sx={{ width: '100%', borderRadius: 3, mb: 3, maxHeight: 360, objectFit: 'cover' }}
          />
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Chip label={levelLabels[course.level] ?? course.level} color="primary" />
            <CategoryChips category={course.category} />
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {course.description}
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Conteúdo do curso</Typography>
          {(course.modules ?? []).map((mod) => (
            <Accordion key={mod.id} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 1, '&:before': { display: 'none' }, borderRadius: '12px !important' }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography sx={{ fontWeight: 600 }}>{mod.order_index}. {mod.title}</Typography>
                <Chip label={`${mod.videos?.length ?? 0} aulas`} size="small" sx={{ ml: 2 }} />
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{mod.description}</Typography>
                <List dense disablePadding>
                  {(mod.videos ?? []).map((v) => (
                    <ListItem key={v.id} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {enrollment ? <PlayCircle color="primary" fontSize="small" /> : <Lock fontSize="small" color="disabled" />}
                      </ListItemIcon>
                      <ListItemText primary={v.title} slotProps={{ primary: { style: { fontSize: '0.875rem' } } }} />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}

        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ position: 'sticky', top: 100, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              {enrollment ? 'Você está matriculado' : 'Comece a aprender'}
            </Typography>
            {enrollment ? (
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<PlayCircle />}
                onClick={() => firstVideo && navigate(`/app/learn/${course.id}/${firstVideo.module_id}/${firstVideo.id}`)}
                disabled={!firstVideo}
              >
                {firstVideo ? 'Continuar curso' : 'Sem aulas ainda'}
              </Button>
            ) : (
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => enrollMutation.mutate()}
                disabled={enrollMutation.isPending}
              >
                {enrollMutation.isPending ? 'Matriculando...' : 'Matricular-se gratuitamente'}
              </Button>
            )}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2"><strong>{course.modules?.length ?? 0}</strong> módulos</Typography>
              <Typography variant="body2">
                <strong>{course.modules?.reduce((a, m) => a + (m.videos?.length ?? 0), 0) ?? 0}</strong> aulas no total
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CourseDetailPage;
