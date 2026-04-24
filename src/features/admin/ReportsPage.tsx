import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Card, CardContent, CircularProgress, Grid, Typography, LinearProgress, Divider,
} from '@mui/material';
import { People, School, VideoLibrary, CheckCircle } from '@mui/icons-material';
import { supabase } from '../../services/supabase/client';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

const useReportData = () =>
  useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const [students, courses, videos, enrollments, completions] = await Promise.all([
        db.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        db.from('courses').select('id', { count: 'exact', head: true }).eq('is_published', true),
        db.from('videos').select('id', { count: 'exact', head: true }),
        db.from('enrollments').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        db.from('video_progress').select('id', { count: 'exact', head: true }).eq('is_completed', true),
      ]);
      return {
        students: students.count ?? 0,
        courses: courses.count ?? 0,
        videos: videos.count ?? 0,
        enrollments: enrollments.count ?? 0,
        completions: completions.count ?? 0,
      };
    },
  });

const useTopCourses = () =>
  useQuery({
    queryKey: ['reports-top-courses'],
    queryFn: async () => {
      const { data, error } = await db
        .from('enrollments')
        .select('course_id, courses(title)')
        .eq('status', 'active');
      if (error) throw error;
      const counts: Record<string, { title: string; count: number }> = {};
      for (const row of data ?? []) {
        const id = row.course_id;
        if (!counts[id]) counts[id] = { title: row.courses?.title ?? id, count: 0 };
        counts[id].count++;
      }
      return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5);
    },
  });

const ReportsPage: React.FC = () => {
  const { data: stats, isLoading } = useReportData();
  const { data: topCourses } = useTopCourses();
  const maxEnrollments = topCourses?.[0]?.count ?? 1;

  return (
    <Box>
      <PageHeader
        title="Relatórios"
        subtitle="Visão geral de desempenho da plataforma"
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Relatórios' }]}
      />

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard title="Alunos cadastrados" value={stats?.students ?? 0} icon={<People />} color="primary.main" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard title="Cursos publicados" value={stats?.courses ?? 0} icon={<School />} color="secondary.main" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard title="Total de vídeos" value={stats?.videos ?? 0} icon={<VideoLibrary />} color="warning.main" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard title="Matrículas ativas" value={stats?.enrollments ?? 0} icon={<CheckCircle />} color="success.main" />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card elevation={0}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Cursos mais matriculados
                  </Typography>
                  {!topCourses?.length ? (
                    <Typography variant="body2" color="text.secondary">Nenhuma matrícula ainda.</Typography>
                  ) : (
                    topCourses.map((course) => (
                      <Box key={course.title} sx={{ mb: 2.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{course.title}</Typography>
                          <Typography variant="body2" color="text.secondary">{course.count} alunos</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(course.count / maxEnrollments) * 100}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    ))
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card elevation={0}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Resumo geral
                  </Typography>
                  {[
                    { label: 'Total de matrículas', value: stats?.enrollments ?? 0 },
                    { label: 'Vídeos concluídos', value: stats?.completions ?? 0 },
                    {
                      label: 'Média de vídeos por aluno',
                      value: stats?.students
                        ? (stats.completions / stats.students).toFixed(1)
                        : '0',
                    },
                    {
                      label: 'Média de matrículas por curso',
                      value: stats?.courses
                        ? (stats.enrollments / stats.courses).toFixed(1)
                        : '0',
                    },
                  ].map((item, i, arr) => (
                    <Box key={item.label}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5 }}>
                        <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.value}</Typography>
                      </Box>
                      {i < arr.length - 1 && <Divider />}
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default ReportsPage;
