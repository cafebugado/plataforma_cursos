import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Alert, Box, Button, Card, CardContent, FormControlLabel, FormHelperText,
  Grid, MenuItem, Switch, TextField,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createCourse, getCourseById, updateCourse } from '../../services/supabase/courses';
import { useAuth } from '../auth/AuthContext';
import PageHeader from '../../components/common/PageHeader';

const schema = z.object({
  title: z.string().min(3, 'Título obrigatório'),
  slug: z.string().min(3, 'Slug obrigatório').regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífens'),
  short_description: z.string().min(10, 'Descrição curta obrigatória'),
  description: z.string().min(20, 'Descrição completa obrigatória'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  category: z.string().min(2, 'Categoria obrigatória'),
  thumbnail_url: z.string().url('URL inválida').or(z.literal('')),
  is_published: z.boolean(),
});

type FormData = z.infer<typeof schema>;

const CourseFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const isEditing = !!id;

  const { data: course } = useQuery({
    queryKey: ['course', id],
    queryFn: () => getCourseById(id!),
    enabled: isEditing,
  });

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '', slug: '', short_description: '', description: '',
      level: 'beginner', category: '', thumbnail_url: '', is_published: false,
    },
  });

  useEffect(() => {
    if (course) reset({ ...course, thumbnail_url: course.thumbnail_url ?? '' });
  }, [course, reset]);

  const titleValue = watch('title');
  useEffect(() => {
    if (!isEditing && titleValue) {
      setValue('slug', titleValue.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  }, [titleValue, isEditing, setValue]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = { ...data, thumbnail_url: data.thumbnail_url || null };
      if (isEditing) return updateCourse(id!, payload);
      return createCourse({ ...payload, created_by: user!.id });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] });
      navigate('/admin/courses');
    },
  });

  return (
    <Box>
      <PageHeader
        title={isEditing ? 'Editar curso' : 'Novo curso'}
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Cursos', to: '/admin/courses' }, { label: isEditing ? 'Editar' : 'Novo' }]}
      />

      {mutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {(mutation.error as Error).message}
        </Alert>
      )}

      <Card elevation={0}>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit((d) => mutation.mutate(d))}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  label="Título"
                  fullWidth
                  {...register('title')}
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Slug"
                  fullWidth
                  {...register('slug')}
                  error={!!errors.slug}
                  helperText={errors.slug?.message}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Descrição curta"
                  fullWidth
                  multiline
                  rows={2}
                  {...register('short_description')}
                  error={!!errors.short_description}
                  helperText={errors.short_description?.message}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Descrição completa"
                  fullWidth
                  multiline
                  rows={5}
                  {...register('description')}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  label="Nível"
                  fullWidth
                  defaultValue="beginner"
                  {...register('level')}
                  error={!!errors.level}
                  helperText={errors.level?.message}
                >
                  <MenuItem value="beginner">Iniciante</MenuItem>
                  <MenuItem value="intermediate">Intermediário</MenuItem>
                  <MenuItem value="advanced">Avançado</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Categoria"
                  fullWidth
                  {...register('category')}
                  error={!!errors.category}
                  helperText={errors.category?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="URL da capa (opcional)"
                  fullWidth
                  {...register('thumbnail_url')}
                  error={!!errors.thumbnail_url}
                  helperText={errors.thumbnail_url?.message}
                />
              </Grid>
              <Grid size={12}>
                <Controller
                  name="is_published"
                  control={control}
                  render={({ field }) => (
                    <Box>
                      <FormControlLabel
                        control={<Switch checked={field.value} onChange={(_, v) => field.onChange(v)} />}
                        label="Publicar curso"
                      />
                      <FormHelperText>Alunos só verão o curso quando publicado</FormHelperText>
                    </Box>
                  )}
                />
              </Grid>
              <Grid size={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button onClick={() => navigate('/admin/courses')}>Cancelar</Button>
                  <Button type="submit" variant="contained" disabled={isSubmitting || mutation.isPending}>
                    {mutation.isPending ? 'Salvando...' : 'Salvar curso'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CourseFormPage;
