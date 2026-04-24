import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Button, Card, Chip, CircularProgress, IconButton,
  Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography,
} from '@mui/material';
import { Add, Edit, Delete, Visibility, VisibilityOff } from '@mui/icons-material';
import { getCourses, deleteCourse, updateCourse } from '../../services/supabase/courses';
import PageHeader from '../../components/common/PageHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { School } from '@mui/icons-material';

const CoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => getCourses(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); setDeleteId(null); },
  });

  const togglePublish = useMutation({
    mutationFn: ({ id, is_published }: { id: string; is_published: boolean }) =>
      updateCourse(id, { is_published }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  });

  const levelLabels: Record<string, string> = {
    beginner: 'Iniciante',
    intermediate: 'Intermediário',
    advanced: 'Avançado',
  };

  return (
    <Box>
      <PageHeader
        title="Cursos"
        subtitle="Gerencie os cursos da plataforma"
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Cursos' }]}
        action={
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/admin/courses/new')}>
            Novo curso
          </Button>
        }
      />

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : !courses?.length ? (
        <EmptyState
          icon={<School />}
          title="Nenhum curso cadastrado"
          description="Crie seu primeiro curso para começar."
          actionLabel="Criar curso"
          onAction={() => navigate('/admin/courses/new')}
        />
      ) : (
        <Card elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Nível</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Criado em</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{course.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{course.slug}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={levelLabels[course.level] ?? course.level} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{course.category}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={course.is_published ? 'Publicado' : 'Rascunho'}
                      size="small"
                      color={course.is_published ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(course.created_at).toLocaleDateString('pt-BR')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={course.is_published ? 'Despublicar' : 'Publicar'}>
                      <IconButton
                        size="small"
                        onClick={() => togglePublish.mutate({ id: course.id, is_published: !course.is_published })}
                      >
                        {course.is_published ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => navigate(`/admin/courses/${course.id}/edit`)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton size="small" color="error" onClick={() => setDeleteId(course.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir curso"
        description="Esta ação não pode ser desfeita. Todos os módulos e vídeos associados também serão removidos."
        confirmLabel="Excluir"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
};

export default CoursesPage;
