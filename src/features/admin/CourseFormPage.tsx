import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Alert, Box, Button, Card, CardContent, Chip, FormControlLabel, FormHelperText,
  Grid, MenuItem, Switch, TextField, Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createCourse, getCourseById, updateCourse, uploadCourseThumbnail } from '../../services/supabase/courses';
import { useAuth } from '../auth/AuthContext';
import PageHeader from '../../components/common/PageHeader';
import ThumbnailUpload from '../../components/common/ThumbnailUpload';

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

function generateId(): string {
  return crypto.randomUUID();
}

const CourseFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const isEditing = !!id;

  const pendingIdRef = useRef<string>(generateId());

  const { data: course } = useQuery({
    queryKey: ['course', id],
    queryFn: () => getCourseById(id!),
    enabled: isEditing,
  });

  const {
    handleSubmit, control, reset, watch, setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
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
  const thumbnailValue = watch('thumbnail_url');

  useEffect(() => {
    if (!isEditing && titleValue) {
      setValue(
        'slug',
        titleValue.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        { shouldDirty: true },
      );
    }
  }, [titleValue, isEditing, setValue]);

  const handleUpload = async (file: File): Promise<string> => {
    const courseId = isEditing ? id! : pendingIdRef.current;
    return uploadCourseThumbnail(courseId, file);
  };

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = { ...data, thumbnail_url: data.thumbnail_url || null };
      if (isEditing) return updateCourse(id!, payload);
      return createCourse({ ...payload, created_by: user!.id, id: pendingIdRef.current });
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
        breadcrumbs={[
          { label: 'Admin', to: '/admin' },
          { label: 'Cursos', to: '/admin/courses' },
          { label: isEditing ? 'Editar' : 'Novo' },
        ]}
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
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Título"
                      fullWidth
                      error={!!errors.title}
                      helperText={errors.title?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="slug"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Slug"
                      fullWidth
                      error={!!errors.slug}
                      helperText={errors.slug?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={12}>
                <Controller
                  name="short_description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Descrição curta"
                      fullWidth
                      multiline
                      rows={2}
                      error={!!errors.short_description}
                      helperText={errors.short_description?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Descrição completa"
                      fullWidth
                      multiline
                      rows={5}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="level"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Nível"
                      fullWidth
                      error={!!errors.level}
                      helperText={errors.level?.message}
                    >
                      <MenuItem value="beginner">Iniciante</MenuItem>
                      <MenuItem value="intermediate">Intermediário</MenuItem>
                      <MenuItem value="advanced">Avançado</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => {
                    const cats = field.value ? field.value.split(',').map((c: string) => c.trim()).filter(Boolean) : [];
                    return (
                      <Box>
                        <Typography variant="caption" color={errors.category ? 'error' : 'text.secondary'} sx={{ mb: 0.5, display: 'block' }}>
                          Categorias
                        </Typography>
                        <Box
                          sx={{
                            border: '1px solid',
                            borderColor: errors.category ? 'error.main' : 'divider',
                            borderRadius: 1,
                            p: '8px 12px',
                            minHeight: 56,
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 0.5,
                            alignItems: 'center',
                            '&:focus-within': { borderColor: errors.category ? 'error.main' : 'primary.main', borderWidth: 2 },
                          }}
                        >
                          {cats.map((cat: string) => (
                            <Chip
                              key={cat}
                              label={cat}
                              size="small"
                              variant="outlined"
                              onDelete={() => {
                                const next = cats.filter((c: string) => c !== cat).join(', ');
                                field.onChange(next);
                              }}
                            />
                          ))}
                          <Box
                            component="input"
                            placeholder={cats.length === 0 ? 'Digite e pressione vírgula...' : ''}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                              const input = e.currentTarget;
                              if (e.key === ',' || e.key === 'Enter') {
                                e.preventDefault();
                                const val = input.value.trim();
                                if (val && !cats.includes(val)) {
                                  field.onChange([...cats, val].join(', '));
                                }
                                input.value = '';
                              } else if (e.key === 'Backspace' && input.value === '' && cats.length > 0) {
                                field.onChange(cats.slice(0, -1).join(', '));
                              }
                            }}
                            onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                              const val = e.currentTarget.value.trim();
                              if (val && !cats.includes(val)) {
                                field.onChange([...cats, val].join(', '));
                                e.currentTarget.value = '';
                              }
                              field.onBlur();
                            }}
                            sx={{
                              border: 'none', outline: 'none', flex: 1, minWidth: 80,
                              fontSize: '0.875rem', fontFamily: 'inherit', bgcolor: 'transparent',
                              color: 'text.primary', p: 0,
                            }}
                          />
                        </Box>
                        {errors.category && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                            {errors.category.message}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          Pressione vírgula ou Enter para adicionar
                        </Typography>
                      </Box>
                    );
                  }}
                />
              </Grid>

              <Grid size={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                  Capa do curso
                </Typography>
                <ThumbnailUpload
                  value={thumbnailValue}
                  onChange={(url) => setValue('thumbnail_url', url, { shouldValidate: true, shouldDirty: true })}
                  onUpload={handleUpload}
                  error={errors.thumbnail_url?.message}
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
