import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Card, CardContent, CircularProgress, Grid, LinearProgress, Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getStudentEnrollments, getCourseProgress } from '../../services/supabase/progress';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import CategoryChips from '../../components/common/CategoryChips';
import { TrendingUp } from '@mui/icons-material';

const ProgressPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['enrollments', user?.id],
    queryFn: () => getStudentEnrollments(user!.id),
    enabled: !!user,
  });

  return (
    <Box>
      <PageHeader title="Meu Progresso" subtitle="Acompanhe sua evolução nos cursos" />

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : !enrollments?.length ? (
        <EmptyState
          icon={<TrendingUp />}
          title="Nenhum curso em andamento"
          description="Matricule-se em um curso para acompanhar seu progresso."
          actionLabel="Ver cursos"
          onAction={() => navigate('/app/courses')}
        />
      ) : (
        <Grid container spacing={3}>
          {enrollments.map((enrollment) => {
            const course = (enrollment as unknown as Record<string, unknown>).courses as { id: string; title: string; slug: string; category: string; thumbnail_url: string | null } | undefined;
            if (!course) return null;
            return (
              <Grid key={enrollment.id} size={{ xs: 12, md: 6 }}>
                <CourseProgressItem
                  courseId={course.id}
                  courseTitle={course.title}
                  courseSlug={course.slug}
                  category={course.category}
                  thumbnail={course.thumbnail_url}
                  userId={user!.id}
                  enrolledAt={enrollment.enrolled_at}
                />
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

const CourseProgressItem: React.FC<{
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  category: string;
  thumbnail: string | null;
  userId: string;
  enrolledAt: string;
}> = ({ courseId, courseTitle, courseSlug, category, thumbnail, userId, enrolledAt }) => {
  const navigate = useNavigate();
  const { data: progress = 0 } = useQuery({
    queryKey: ['course-progress', userId, courseId],
    queryFn: () => getCourseProgress(userId, courseId),
  });

  return (
    <Card
      elevation={0}
      sx={{ cursor: 'pointer', '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }, transition: 'box-shadow 0.2s' }}
      onClick={() => navigate(`/app/courses/${courseSlug}`)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box
            component="img"
            src={thumbnail ?? `https://placehold.co/80x80/6C63FF/white?text=${encodeURIComponent(courseTitle[0])}`}
            alt={courseTitle}
            sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ mb: 0.5 }}><CategoryChips category={category} size="small" /></Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{courseTitle}</Typography>
            <Typography variant="caption" color="text.secondary">
              Matriculado em {new Date(enrolledAt).toLocaleDateString('pt-BR')}
            </Typography>
            <Box sx={{ mt: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">Concluído</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }} color={progress === 100 ? 'success.main' : 'primary.main'}>
                  {progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                color={progress === 100 ? 'success' : 'primary'}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProgressPage;
