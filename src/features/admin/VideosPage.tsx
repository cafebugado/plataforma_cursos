import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Alert, Box, Button, Card, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, FormControlLabel, Grid, IconButton, MenuItem,
  Switch, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import { Add, Delete, Edit, VideoLibrary } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getCourses } from '../../services/supabase/courses';
import { getModulesByCourse } from '../../services/supabase/modules';
import { getVideosByModule, createVideo, updateVideo, deleteVideo } from '../../services/supabase/videos';
import { extractYouTubeId, getYouTubeThumbnail } from '../../services/youtube';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import type { Video } from '../../types';

const schema = z.object({
  course_id: z.string().min(1, 'Selecione um curso'),
  module_id: z.string().min(1, 'Selecione um módulo'),
  youtube_url: z.string().url('URL inválida').refine((u) => !!extractYouTubeId(u), 'URL do YouTube inválida'),
  title: z.string().min(3, 'Título obrigatório'),
  description: z.string(),
  order_index: z.number().min(1),
  is_preview: z.boolean(),
});

type FormData = z.infer<typeof schema>;

const VideosPage: React.FC = () => {
  const qc = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: courses } = useQuery({ queryKey: ['courses'], queryFn: () => getCourses() });
  const { data: modules } = useQuery({
    queryKey: ['modules', selectedCourse],
    queryFn: () => getModulesByCourse(selectedCourse),
    enabled: !!selectedCourse,
  });
  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos', selectedModule],
    queryFn: () => getVideosByModule(selectedModule),
    enabled: !!selectedModule,
  });

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { course_id: '', module_id: '', youtube_url: '', title: '', description: '', order_index: 1, is_preview: false },
  });

  const openCreate = () => {
    reset({ course_id: selectedCourse, module_id: selectedModule, youtube_url: '', title: '', description: '', order_index: (videos?.length ?? 0) + 1, is_preview: false });
    setEditingVideo(null);
    setDialogOpen(true);
  };

  const openEdit = (v: Video) => {
    reset({ course_id: v.course_id, module_id: v.module_id, youtube_url: v.youtube_url, title: v.title, description: v.description, order_index: v.order_index, is_preview: v.is_preview });
    setEditingVideo(v);
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (data: FormData) => {
      const youtubeVideoId = extractYouTubeId(data.youtube_url)!;
      const thumbnailUrl = getYouTubeThumbnail(youtubeVideoId);
      const payload = { ...data, youtube_video_id: youtubeVideoId, thumbnail_url: thumbnailUrl, summary_status: 'none' as const, playlist_id: null, duration_seconds: null };
      if (editingVideo) return updateVideo(editingVideo.id, payload);
      return createVideo(payload as Omit<Video, 'id' | 'created_at' | 'updated_at'>);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['videos'] }); setDialogOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVideo,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['videos'] }); setDeleteId(null); },
  });

  return (
    <Box>
      <PageHeader
        title="Vídeos"
        subtitle="Gerencie os vídeos do YouTube por módulo"
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Vídeos' }]}
        action={<Button variant="contained" startIcon={<Add />} onClick={openCreate} disabled={!selectedModule}>Adicionar vídeo</Button>}
      />

      <Card elevation={0} sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField select label="Curso" value={selectedCourse} onChange={(e) => { setSelectedCourse(e.target.value); setSelectedModule(''); }} fullWidth>
              {(courses ?? []).map((c) => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField select label="Módulo" value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)} fullWidth disabled={!selectedCourse}>
              {(modules ?? []).map((m) => <MenuItem key={m.id} value={m.id}>{m.order_index}. {m.title}</MenuItem>)}
            </TextField>
          </Grid>
        </Grid>
      </Card>

      {!selectedModule ? (
        <EmptyState icon={<VideoLibrary />} title="Selecione um módulo" description="Escolha um curso e módulo para ver os vídeos." />
      ) : isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : !videos?.length ? (
        <EmptyState icon={<VideoLibrary />} title="Nenhum vídeo" description="Adicione o primeiro vídeo deste módulo." actionLabel="Adicionar vídeo" onAction={openCreate} />
      ) : (
        <Card elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Vídeo</TableCell>
                <TableCell>Preview</TableCell>
                <TableCell>Resumo</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {videos.map((v) => (
                <TableRow key={v.id} hover>
                  <TableCell>{v.order_index}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box component="img" src={v.thumbnail_url ?? `https://img.youtube.com/vi/${v.youtube_video_id}/mqdefault.jpg`} alt="" sx={{ width: 80, height: 45, objectFit: 'cover', borderRadius: 1 }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{v.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{v.youtube_video_id}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell><Chip label={v.is_preview ? 'Sim' : 'Não'} size="small" color={v.is_preview ? 'info' : 'default'} /></TableCell>
                  <TableCell><Chip label={v.summary_status} size="small" /></TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar"><IconButton size="small" onClick={() => openEdit(v)}><Edit fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Excluir"><IconButton size="small" color="error" onClick={() => setDeleteId(v.id)}><Delete fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>{editingVideo ? 'Editar vídeo' : 'Adicionar vídeo'}</DialogTitle>
        <DialogContent>
          {saveMutation.isError && <Alert severity="error" sx={{ mb: 2 }}>{(saveMutation.error as Error).message}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField select label="Curso" fullWidth defaultValue={selectedCourse} {...register('course_id')} error={!!errors.course_id} helperText={errors.course_id?.message}>
              {(courses ?? []).map((c) => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}
            </TextField>
            <TextField select label="Módulo" fullWidth defaultValue={selectedModule} {...register('module_id')} error={!!errors.module_id} helperText={errors.module_id?.message}>
              {(modules ?? []).map((m) => <MenuItem key={m.id} value={m.id}>{m.title}</MenuItem>)}
            </TextField>
            <TextField label="URL do YouTube" fullWidth {...register('youtube_url')} error={!!errors.youtube_url} helperText={errors.youtube_url?.message} placeholder="https://youtube.com/watch?v=..." />
            <TextField label="Título" fullWidth {...register('title')} error={!!errors.title} helperText={errors.title?.message} />
            <TextField label="Descrição" fullWidth multiline rows={2} {...register('description')} />
            <Grid container spacing={2}>
              <Grid size={4}>
                <TextField label="Ordem" type="number" fullWidth {...register('order_index')} />
              </Grid>
              <Grid size={8}>
                <Controller name="is_preview" control={control} render={({ field }) => (
                  <FormControlLabel control={<Switch checked={field.value} onChange={(_, v) => field.onChange(v)} />} label="Disponível como preview" />
                )} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit((d) => saveMutation.mutate(d))} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir vídeo"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
};

export default VideosPage;
