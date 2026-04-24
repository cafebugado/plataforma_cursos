import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, CircularProgress, Grid, InputAdornment, MenuItem, TextField,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { getCourses } from '../../services/supabase/courses';
import { enrollInCourse, getStudentEnrollments } from '../../services/supabase/progress';
import { useAuth } from '../auth/AuthContext';
import CourseProgressCard from '../../components/common/CourseProgressCard';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import { School } from '@mui/icons-material';

const CourseCatalog: React.FC = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses-published'],
    queryFn: () => getCourses(true),
  });

  const { data: enrollments } = useQuery({
    queryKey: ['enrollments', user?.id],
    queryFn: () => getStudentEnrollments(user!.id),
    enabled: !!user,
  });

  const enrolledCourseIds = new Set((enrollments ?? []).map((e) => e.course_id));

  const enrollMutation = useMutation({
    mutationFn: (courseId: string) => enrollInCourse(user!.id, courseId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['enrollments'] }),
  });

  const filtered = (courses ?? []).filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.short_description.toLowerCase().includes(search.toLowerCase());
    const matchLevel = !level || c.level === level;
    return matchSearch && matchLevel;
  });

  return (
    <Box>
      <PageHeader title="Catálogo de cursos" subtitle="Explore todos os cursos disponíveis" />

      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Buscar cursos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1, maxWidth: 400 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }}
          size="small"
        />
        <TextField
          select
          label="Nível"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          sx={{ minWidth: 160 }}
          size="small"
        >
          <MenuItem value="">Todos os níveis</MenuItem>
          <MenuItem value="beginner">Iniciante</MenuItem>
          <MenuItem value="intermediate">Intermediário</MenuItem>
          <MenuItem value="advanced">Avançado</MenuItem>
        </TextField>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : !filtered.length ? (
        <EmptyState
          icon={<School />}
          title="Nenhum curso encontrado"
          description={search ? 'Tente buscar com outros termos.' : 'Nenhum curso disponível ainda.'}
        />
      ) : (
        <Grid container spacing={3}>
          {filtered.map((course) => (
            <Grid key={course.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <CourseProgressCard
                course={course}
                showEnrollButton
                isEnrolled={enrolledCourseIds.has(course.id)}
                onEnroll={() => enrollMutation.mutate(course.id)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default CourseCatalog;
