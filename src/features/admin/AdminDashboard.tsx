import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Card, CardContent, CircularProgress, Grid, Table, TableBody,
  TableCell, TableHead, TableRow, Typography, Avatar, Chip,
} from '@mui/material';
import { People, School, ViewModule, VideoLibrary, TrendingUp } from '@mui/icons-material';
import { supabase } from '../../services/supabase/client';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';

const useAdminStats = () =>
  useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [students, courses, modules, videos] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('modules').select('id', { count: 'exact', head: true }),
        supabase.from('videos').select('id', { count: 'exact', head: true }),
      ]);
      return {
        students: students.count ?? 0,
        courses: courses.count ?? 0,
        modules: modules.count ?? 0,
        videos: videos.count ?? 0,
      };
    },
  });

const useRecentStudents = () =>
  useQuery({
    queryKey: ['recent-students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return (data ?? []) as unknown as { id: string; full_name: string | null; created_at: string }[];
    },
  });

const useRecentCourses = () =>
  useQuery({
    queryKey: ['recent-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return (data ?? []) as unknown as { id: string; title: string; is_published: boolean }[];
    },
  });

const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: students } = useRecentStudents();
  const { data: courses } = useRecentCourses();

  return (
    <Box>
      <PageHeader title="Dashboard" subtitle="Visão geral da plataforma" />

      {statsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard title="Alunos" value={stats?.students ?? 0} icon={<People />} color="primary.main" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard title="Cursos" value={stats?.courses ?? 0} icon={<School />} color="secondary.main" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard title="Módulos" value={stats?.modules ?? 0} icon={<ViewModule />} color="success.main" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard title="Vídeos" value={stats?.videos ?? 0} icon={<VideoLibrary />} color="warning.main" />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Últimos alunos</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Aluno</TableCell>
                    <TableCell>Cadastro</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(students ?? []).map((s) => (
                    <TableRow key={s.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: 12 }}>
                            {s.full_name?.[0]}
                          </Avatar>
                          <Typography variant="body2">{s.full_name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(s.created_at).toLocaleDateString('pt-BR')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Últimos cursos</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Curso</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(courses ?? []).map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TrendingUp fontSize="small" color="action" />
                          <Typography variant="body2">{c.title}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={c.is_published ? 'Publicado' : 'Rascunho'}
                          size="small"
                          color={c.is_published ? 'success' : 'default'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
