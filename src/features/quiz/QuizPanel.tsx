import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Alert, Box, Button, Card, CardContent, Chip, Divider, FormControl,
  FormControlLabel, Radio, RadioGroup, Typography,
} from '@mui/material';
import { Quiz, CheckCircle, Cancel, Replay } from '@mui/icons-material';
import { getAttemptsByUser, submitQuizAttempt } from '../../services/supabase/quiz';
import type { ModuleQuiz, QuizAttempt } from '../../types';

interface Props {
  quiz: ModuleQuiz;
  moduleId: string;
  userId: string;
}

const QuizPanel: React.FC<Props> = ({ quiz, moduleId, userId }) => {
  const qc = useQueryClient();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [lastAttempt, setLastAttempt] = useState<QuizAttempt | null>(null);
  const [showResults, setShowResults] = useState(false);

  const { data: attempts } = useQuery({
    queryKey: ['quiz-attempts', userId, quiz.id],
    queryFn: () => getAttemptsByUser(userId, quiz.id),
  });

  const submitMutation = useMutation({
    mutationFn: () => {
      const attemptNumber = (attempts?.length ?? 0) + 1;
      const answerList = Object.entries(answers).map(([question_id, option_id]) => ({ question_id, option_id }));
      return submitQuizAttempt(quiz.id, moduleId, userId, answerList, attemptNumber);
    },
    onSuccess: (attempt) => {
      setLastAttempt(attempt);
      setShowResults(true);
      qc.invalidateQueries({ queryKey: ['quiz-attempts'] });
    },
  });

  const attemptsUsed = attempts?.length ?? 0;
  const attemptsLeft = quiz.max_attempts - attemptsUsed;
  const bestAttempt = attempts?.reduce((best, a) => (!best || a.score > best.score ? a : best), null as QuizAttempt | null);
  const allAnswered = (quiz.questions ?? []).every((q) => answers[q.id]);

  const handleRetry = () => {
    setAnswers({});
    setLastAttempt(null);
    setShowResults(false);
  };

  if (showResults && lastAttempt) {
    return (
      <Card elevation={0} sx={{ border: '2px solid', borderColor: lastAttempt.passed ? 'success.main' : 'error.main' }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            {lastAttempt.passed ? (
              <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            ) : (
              <Cancel sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            )}
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {lastAttempt.passed ? 'Parabéns! Você passou!' : 'Tente novamente'}
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 800, mt: 1 }} color={lastAttempt.passed ? 'success.main' : 'error.main'}>
              {lastAttempt.score}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Nota mínima: {quiz.passing_score}%
            </Typography>
          </Box>

          {(quiz.questions ?? []).map((q) => {
            const selectedOption = answers[q.id];
            const isCorrect = q.options?.find((o) => o.id === selectedOption)?.is_correct;
            return (
              <Box key={q.id} sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: isCorrect ? 'success.light' : 'error.light' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{q.question_text}</Typography>
                {!isCorrect && q.explanation && (
                  <Alert severity="info" sx={{ mt: 1 }}>{q.explanation}</Alert>
                )}
              </Box>
            );
          })}

          {!lastAttempt.passed && attemptsLeft > 0 && (
            <Button fullWidth variant="contained" startIcon={<Replay />} onClick={handleRetry} sx={{ mt: 2 }}>
              Tentar novamente ({attemptsLeft} tentativa{attemptsLeft !== 1 ? 's' : ''} restante{attemptsLeft !== 1 ? 's' : ''})
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (attemptsLeft <= 0 && bestAttempt && !bestAttempt.passed) {
    return (
      <Alert severity="error" icon={<Quiz />}>
        Você esgotou todas as {quiz.max_attempts} tentativas. Melhor pontuação: {bestAttempt.score}%.
      </Alert>
    );
  }

  if (bestAttempt?.passed) {
    return (
      <Alert severity="success" icon={<CheckCircle />}>
        Você já concluiu este quiz com {bestAttempt.score}% de acertos.
      </Alert>
    );
  }

  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Quiz color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>{quiz.title}</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Chip label={`${attemptsLeft} tentativa${attemptsLeft !== 1 ? 's' : ''} restante${attemptsLeft !== 1 ? 's' : ''}`} size="small" />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{quiz.description}</Typography>
        <Divider sx={{ mb: 3 }} />

        {(quiz.questions ?? []).map((q, i) => (
          <Box key={q.id} sx={{ mb: 4 }}>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1.5 }}>
              {i + 1}. {q.question_text}
            </Typography>
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={answers[q.id] ?? ''}
                onChange={(_, v) => setAnswers((prev) => ({ ...prev, [q.id]: v }))}
              >
                {(q.options ?? []).map((opt) => (
                  <FormControlLabel
                    key={opt.id}
                    value={opt.id}
                    control={<Radio size="small" />}
                    label={opt.option_text}
                    sx={{
                      mb: 0.5,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: answers[q.id] === opt.id ? 'primary.main' : 'divider',
                      bgcolor: answers[q.id] === opt.id ? 'primary.50' : 'transparent',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
        ))}

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={() => submitMutation.mutate()}
          disabled={!allAnswered || submitMutation.isPending}
        >
          {submitMutation.isPending ? 'Enviando...' : 'Enviar respostas'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuizPanel;
