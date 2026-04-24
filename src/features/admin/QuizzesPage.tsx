import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Alert, Box, Button, Card, CardContent, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, Grid, IconButton, MenuItem, TextField,
  Typography, Chip, Tooltip,
} from '@mui/material';
import { Delete, Quiz, AddCircleOutlined } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getCourses } from '../../services/supabase/courses';
import { getModulesByCourse } from '../../services/supabase/modules';
import { getQuizByModule, createQuiz, addQuestion, addOption, deleteQuiz } from '../../services/supabase/quiz';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const quizSchema = z.object({
  module_id: z.string().min(1),
  title: z.string().min(3),
  description: z.string(),
  passing_score: z.number().min(0).max(100),
  max_attempts: z.number().min(1),
});

type QuizForm = z.infer<typeof quizSchema>;

const QuizzesPage: React.FC = () => {
  const qc = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [options, setOptions] = useState([
    { text: '', is_correct: false },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
  ]);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [questionError, setQuestionError] = useState('');

  const { data: courses } = useQuery({ queryKey: ['courses'], queryFn: () => getCourses() });
  const { data: modules } = useQuery({ queryKey: ['modules', selectedCourse], queryFn: () => getModulesByCourse(selectedCourse), enabled: !!selectedCourse });
  const { data: quiz, isLoading } = useQuery({ queryKey: ['quiz', selectedModule], queryFn: () => getQuizByModule(selectedModule), enabled: !!selectedModule });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<QuizForm>({
    resolver: zodResolver(quizSchema),
    defaultValues: { module_id: '', title: '', description: '', passing_score: 70, max_attempts: 3 },
  });

  const createMutation = useMutation({
    mutationFn: (data: QuizForm) => createQuiz(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['quiz'] }); setQuizDialogOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteQuiz,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['quiz'] }); setDeleteId(null); },
  });

  const addQuestionMutation = useMutation({
    mutationFn: async () => {
      if (!quiz) throw new Error('Quiz não encontrado');
      const filledOptions = options.filter((o) => o.text.trim());
      if (filledOptions.length < 2) throw new Error('Preencha ao menos 2 opções');
      if (!filledOptions.some((o) => o.is_correct)) throw new Error('Marque uma opção como correta');
      const q = await addQuestion(quiz.id, questionText.trim(), (quiz.questions?.length ?? 0) + 1, explanation.trim() || undefined);
      for (const opt of filledOptions) {
        await addOption(q.id, opt.text.trim(), opt.is_correct);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quiz'] });
      setAddingQuestion(false);
      setQuestionText('');
      setExplanation('');
      setQuestionError('');
      setOptions([{ text: '', is_correct: false }, { text: '', is_correct: false }, { text: '', is_correct: false }, { text: '', is_correct: false }]);
    },
    onError: (err: Error) => {
      setQuestionError(err.message);
    },
  });

  return (
    <Box>
      <PageHeader
        title="Quizzes"
        subtitle="Configure os quizzes de avaliação por módulo"
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Quizzes' }]}
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
        <EmptyState icon={<Quiz />} title="Selecione um módulo" description="Escolha um curso e módulo para gerenciar o quiz." />
      ) : isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : !quiz ? (
        <EmptyState
          icon={<Quiz />}
          title="Nenhum quiz cadastrado"
          description="Este módulo ainda não tem um quiz final."
          actionLabel="Criar quiz"
          onAction={() => { reset({ module_id: selectedModule, title: '', description: '', passing_score: 70, max_attempts: 3 }); setQuizDialogOpen(true); }}
        />
      ) : (
        <Box>
          <Card elevation={0} sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{quiz.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{quiz.description}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip label={`Nota mínima: ${quiz.passing_score}%`} color="primary" />
                  <Chip label={`Tentativas: ${quiz.max_attempts}`} />
                  <Tooltip title="Excluir quiz">
                    <IconButton color="error" size="small" onClick={() => setDeleteId(quiz.id)}><Delete /></IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2">{quiz.questions?.length ?? 0} perguntas</Typography>
                <Button startIcon={<AddCircleOutlined />} size="small" onClick={() => setAddingQuestion(true)}>
                  Adicionar pergunta
                </Button>
              </Box>
              {(quiz.questions ?? []).map((q, i) => (
                <Box key={q.id} sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{i + 1}. {q.question_text}</Typography>
                  {(q.options ?? []).map((opt) => (
                    <Box key={opt.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, ml: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: opt.is_correct ? 'success.main' : 'text.disabled' }} />
                      <Typography variant="caption" color={opt.is_correct ? 'success.main' : 'text.secondary'}>{opt.option_text}</Typography>
                    </Box>
                  ))}
                </Box>
              ))}
            </CardContent>
          </Card>

          {addingQuestion && (
            <Card elevation={0}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Nova pergunta</Typography>
                {questionError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setQuestionError('')}>{questionError}</Alert>}
                <TextField label="Pergunta" fullWidth value={questionText} onChange={(e) => setQuestionText(e.target.value)} sx={{ mb: 2 }} />
                {options.map((opt, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 2, mb: 1.5, alignItems: 'center' }}>
                    <TextField label={`Opção ${i + 1}`} fullWidth value={opt.text} onChange={(e) => setOptions((prev) => prev.map((o, j) => j === i ? { ...o, text: e.target.value } : o))} size="small" />
                    <Button
                      variant={opt.is_correct ? 'contained' : 'outlined'}
                      color={opt.is_correct ? 'success' : 'inherit'}
                      size="small"
                      onClick={() => setOptions((prev) => prev.map((o, j) => ({ ...o, is_correct: j === i })))}
                    >
                      {opt.is_correct ? 'Correta' : 'Marcar'}
                    </Button>
                  </Box>
                ))}
                <TextField label="Explicação (opcional)" fullWidth multiline rows={2} value={explanation} onChange={(e) => setExplanation(e.target.value)} sx={{ mt: 1 }} />
                <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'flex-end' }}>
                  <Button onClick={() => setAddingQuestion(false)}>Cancelar</Button>
                  <Button variant="contained" onClick={() => addQuestionMutation.mutate()} disabled={addQuestionMutation.isPending || !questionText}>
                    {addQuestionMutation.isPending ? 'Salvando...' : 'Salvar pergunta'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      <Dialog open={quizDialogOpen} onClose={() => setQuizDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Criar quiz</DialogTitle>
        <DialogContent>
          {createMutation.isError && <Alert severity="error" sx={{ mb: 2 }}>{(createMutation.error as Error).message}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField label="Título do quiz" fullWidth {...register('title')} error={!!errors.title} helperText={errors.title?.message} />
            <TextField label="Descrição" fullWidth multiline rows={2} {...register('description')} />
            <Grid container spacing={2}>
              <Grid size={6}><TextField label="Nota mínima (%)" type="number" fullWidth {...register('passing_score', { valueAsNumber: true })} /></Grid>
              <Grid size={6}><TextField label="Máx. tentativas" type="number" fullWidth {...register('max_attempts', { valueAsNumber: true })} /></Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setQuizDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit((d) => createMutation.mutate({ ...d, module_id: selectedModule }))} disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Criando...' : 'Criar quiz'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir quiz"
        description="Todas as perguntas e tentativas serão removidas."
        confirmLabel="Excluir"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
};

export default QuizzesPage;
