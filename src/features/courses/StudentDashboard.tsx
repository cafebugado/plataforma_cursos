import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Button, Card, CardContent, Chip, CircularProgress, Grid,
  LinearProgress, Typography,
} from '@mui/material';
import { PlayArrow, School } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { getStudentEnrollments } from '../../services/supabase/progress';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';

const StudentDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['enrollments', user?.id],
    queryFn: () => getStudentEnrollments(user!.id),
    enabled: !!user,
  });

  return (
    <Box>
      <PageHeader
        title={`Olá, ${profile?.full_name?.split(' ')[0] ?? 'aluno'}!`}
        subtitle="Aqui estão seus cursos em andamento"
      />

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : !enrollments?.length ? (
        <EmptyState
          icon={<School />}
          title="Você ainda não está matriculado em nenhum curso"
          description="Explore o catálogo e comece a aprender hoje."
          actionLabel="Ver cursos"
          onAction={() => navigate('/app/courses')}
        />
      ) : (
        <Grid container spacing={3}>
          {enrollments.map((enrollment) => {
            const course = (enrollment as unknown as Record<string, unknown>).courses as { id: string; title: string; slug: string; thumbnail_url: string | null; category: string } | undefined;
            if (!course) return null;
            return (
              <Grid key={enrollment.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card elevation={0} sx={{ height: '100%' }}>
                  <Box
                    component="img"
                    src={course.thumbnail_url ?? `https://placehold.co/400x200/6C63FF/white?text=${encodeURIComponent(course.title)}`}
                    alt={course.title}
                    sx={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: '12px 12px 0 0' }}
                  />
                  <CardContent>
                    <Chip label={course.category} size="small" variant="outlined" sx={{ mb: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>{course.title}</Typography>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">Progresso</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }} color="primary">0%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={0} sx={{ height: 6, borderRadius: 3 }} />
                    </Box>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={() => navigate(`/app/courses/${course.slug}`)}
                    >
                      Continuar
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default StudentDashboard;
