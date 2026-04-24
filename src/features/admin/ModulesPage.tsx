import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Alert, Box, Button, Card, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, FormControlLabel, Grid, IconButton, MenuItem, Switch,
  Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import { Add, Delete, Edit, ViewModule } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getCourses } from '../../services/supabase/courses';
import { getModulesByCourse, createModule, updateModule, deleteModule } from '../../services/supabase/modules';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import type { Module } from '../../types';

const schema = z.object({
  course_id: z.string().min(1, 'Selecione um curso'),
  title: z.string().min(3, 'Título obrigatório'),
  description: z.string().min(5, 'Descrição obrigatória'),
  order_index: z.number().min(1),
  is_published: z.boolean(),
  has_final_quiz: z.boolean(),
});

type FormData = z.infer<typeof schema>;

const ModulesPage: React.FC = () => {
  const qc = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: courses } = useQuery({ queryKey: ['courses'], queryFn: () => getCourses() });
  const { data: modules, isLoading } = useQuery({
    queryKey: ['modules', selectedCourse],
    queryFn: () => getModulesByCourse(selectedCourse),
    enabled: !!selectedCourse,
  });

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { course_id: '', title: '', description: '', order_index: 1, is_published: true, has_final_quiz: false },
  });

  const openCreate = () => { reset({ course_id: selectedCourse, title: '', description: '', order_index: (modules?.length ?? 0) + 1, is_published: true, has_final_quiz: false }); setEditingModule(null); setDialogOpen(true); };
  const openEdit = (mod: Module) => { reset({ ...mod }); setEditingModule(mod); setDialogOpen(true); };

  const saveMutation = useMutation({
    mutationFn: (data: FormData) => {
      if (editingModule) return updateModule(editingModule.id, data);
      return createModule(data as Omit<Module, 'id' | 'created_at' | 'updated_at'>);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['modules'] }); setDialogOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteModule,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['modules'] }); setDeleteId(null); },
  });

  return (
    <Box>
      <PageHeader
        title="Módulos"
        subtitle="Organize o conteúdo em módulos por curso"
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Módulos' }]}
        action={<Button variant="contained" startIcon={<Add />} onClick={openCreate} disabled={!selectedCourse}>Novo módulo</Button>}
      />

      <Card elevation={0} sx={{ mb: 3, p: 2 }}>
        <TextField
          select
          label="Selecionar curso"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          sx={{ minWidth: 300 }}
        >
          {(courses ?? []).map((c) => (
            <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>
          ))}
        </TextField>
      </Card>

      {!selectedCourse ? (
        <EmptyState icon={<ViewModule />} title="Selecione um curso" description="Escolha um curso acima para ver seus módulos." />
      ) : isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : !modules?.length ? (
        <EmptyState icon={<ViewModule />} title="Nenhum módulo" description="Crie o primeiro módulo deste curso." actionLabel="Criar módulo" onAction={openCreate} />
      ) : (
        <Card elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Título</TableCell>
                <TableCell>Quiz final</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {modules.map((mod) => (
                <TableRow key={mod.id} hover>
                  <TableCell>{mod.order_index}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{mod.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{mod.description}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={mod.has_final_quiz ? 'Sim' : 'Não'} size="small" color={mod.has_final_quiz ? 'primary' : 'default'} />
                  </TableCell>
                  <TableCell>
                    <Chip label={mod.is_published ? 'Publicado' : 'Rascunho'} size="small" color={mod.is_published ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar"><IconButton size="small" onClick={() => openEdit(mod)}><Edit fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Excluir"><IconButton size="small" color="error" onClick={() => setDeleteId(mod.id)}><Delete fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>{editingModule ? 'Editar módulo' : 'Novo módulo'}</DialogTitle>
        <DialogContent>
          {saveMutation.isError && <Alert severity="error" sx={{ mb: 2 }}>{(saveMutation.error as Error).message}</Alert>}
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField select label="Curso" fullWidth {...register('course_id')} error={!!errors.course_id} helperText={errors.course_id?.message} defaultValue={selectedCourse}>
              {(courses ?? []).map((c) => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}
            </TextField>
            <TextField label="Título" fullWidth {...register('title')} error={!!errors.title} helperText={errors.title?.message} />
            <TextField label="Descrição" fullWidth multiline rows={3} {...register('description')} error={!!errors.description} helperText={errors.description?.message} />
            <Grid container spacing={2}>
              <Grid size={4}>
                <TextField label="Ordem" type="number" fullWidth {...register('order_index')} error={!!errors.order_index} helperText={errors.order_index?.message} />
              </Grid>
              <Grid size={4}>
                <Controller name="is_published" control={control} render={({ field }) => (
                  <FormControlLabel control={<Switch checked={field.value} onChange={(_, v) => field.onChange(v)} />} label="Publicado" />
                )} />
              </Grid>
              <Grid size={4}>
                <Controller name="has_final_quiz" control={control} render={({ field }) => (
                  <FormControlLabel control={<Switch checked={field.value} onChange={(_, v) => field.onChange(v)} />} label="Quiz final" />
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
        title="Excluir módulo"
        description="Todos os vídeos deste módulo também serão removidos."
        confirmLabel="Excluir"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
};

export default ModulesPage;
