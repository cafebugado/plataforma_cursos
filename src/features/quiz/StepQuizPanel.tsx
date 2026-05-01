import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Alert, Box, Button, Card, CardContent, Chip, Divider,
  FormControlLabel, LinearProgress, Radio, RadioGroup, Typography,
} from '@mui/material';
import { CheckCircle, Cancel, Replay, Quiz, ArrowForward, EmojiEvents } from '@mui/icons-material';
import { getAttemptsByUser, submitQuizAttempt } from '../../services/supabase/quiz';
import type { ModuleQuiz, QuizAttempt } from '../../types';

interface Props {
  quiz: ModuleQuiz;
  moduleId: string;
  userId: string;
  onPassed?: () => void;
}

type Phase = 'answering' | 'feedback' | 'result';

const StepQuizPanel: React.FC<Props> = ({ quiz, moduleId, userId, onPassed }) => {
  const qc = useQueryClient();
  const questions = quiz.questions ?? [];

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string>('');
  const [phase, setPhase] = useState<Phase>('answering');
  const [lastAttempt, setLastAttempt] = useState<QuizAttempt | null>(null);

  const { data: attempts } = useQuery({
    queryKey: ['quiz-attempts', userId, quiz.id],
    queryFn: () => getAttemptsByUser(userId, quiz.id),
  });

  const submitMutation = useMutation({
    mutationFn: (finalAnswers: Record<string, string>) => {
      const attemptNumber = (attempts?.length ?? 0) + 1;
      const answerList = Object.entries(finalAnswers).map(([question_id, option_id]) => ({ question_id, option_id }));
      return submitQuizAttempt(quiz.id, moduleId, userId, answerList, attemptNumber);
    },
    onSuccess: (attempt) => {
      setLastAttempt(attempt);
      setPhase('result');
      qc.invalidateQueries({ queryKey: ['quiz-attempts'] });
      qc.invalidateQueries({ queryKey: ['quiz-passed'] });
      if (attempt.passed) onPassed?.();
    },
  });

  const attemptsUsed = attempts?.length ?? 0;
  const attemptsLeft = quiz.max_attempts - attemptsUsed;
  const bestAttempt = attempts?.reduce(
    (best, a) => (!best || a.score > best.score ? a : best),
    null as QuizAttempt | null,
  );

  const handleRetry = () => {
    setStep(0);
    setAnswers({});
    setSelected('');
    setPhase('answering');
    setLastAttempt(null);
  };

  // Already passed
  if (bestAttempt?.passed) {
    return (
      <Card elevation={0} sx={{ border: '2px solid', borderColor: 'success.main', borderRadius: 3 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <EmojiEvents sx={{ fontSize: 56, color: 'success.main', mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
            Quiz concluído!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Sua melhor pontuação: <strong>{bestAttempt.score}%</strong>
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Exhausted attempts
  if (attemptsLeft <= 0 && !bestAttempt?.passed) {
    return (
      <Alert severity="error" icon={<Quiz />}>
        Tentativas esgotadas. Melhor pontuação: {bestAttempt?.score ?? 0}%.
      </Alert>
    );
  }

  // Result screen
  if (phase === 'result' && lastAttempt) {
    return (
      <Card elevation={0} sx={{ border: '2px solid', borderColor: lastAttempt.passed ? 'success.main' : 'error.main', borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            {lastAttempt.passed ? (
              <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 1 }} />
            ) : (
              <Cancel sx={{ fontSize: 64, color: 'error.main', mb: 1 }} />
            )}
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {lastAttempt.passed ? 'Parabéns! Você passou!' : 'Não foi dessa vez'}
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 800, mt: 1 }} color={lastAttempt.passed ? 'success.main' : 'error.main'}>
              {lastAttempt.score}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Nota mínima: {quiz.passing_score}%
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {questions.map((q, i) => {
            const chosenId = answers[q.id];
            const chosenOption = q.options?.find((o) => o.id === chosenId);
            const correctOption = q.options?.find((o) => o.is_correct);
            const isCorrect = chosenOption?.is_correct;
            return (
              <Box key={q.id} sx={{ mb: 2, p: 2, borderRadius: 2, border: '1px solid', borderColor: isCorrect ? 'success.light' : 'error.light', bgcolor: isCorrect ? 'success.50' : 'error.50' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {i + 1}. {q.question_text}
                </Typography>
                <Typography variant="body2" color={isCorrect ? 'success.main' : 'error.main'}>
                  Sua resposta: {chosenOption?.option_text ?? '—'}
                </Typography>
                {!isCorrect && correctOption && (
                  <Typography variant="body2" color="success.main">
                    Resposta correta: {correctOption.option_text}
                  </Typography>
                )}
                {!isCorrect && q.explanation && (
                  <Alert severity="info" sx={{ mt: 1, py: 0 }}>{q.explanation}</Alert>
                )}
              </Box>
            );
          })}

          {!lastAttempt.passed && attemptsLeft > 1 && (
            <Button fullWidth variant="contained" startIcon={<Replay />} onClick={handleRetry} sx={{ mt: 1 }}>
              Tentar novamente ({attemptsLeft - 1} tentativa{attemptsLeft - 1 !== 1 ? 's' : ''} restante{attemptsLeft - 1 !== 1 ? 's' : ''})
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Step-by-step answering
  const currentQuestion = questions[step];
  const isLastStep = step === questions.length - 1;
  const handleConfirm = () => {
    if (!selected || !currentQuestion) return;
    const newAnswers = { ...answers, [currentQuestion.id]: selected };
    setAnswers(newAnswers);

    if (phase === 'answering') {
      setPhase('feedback');
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      submitMutation.mutate(answers);
    } else {
      setStep((s) => s + 1);
      setSelected('');
      setPhase('answering');
    }
  };

  if (!currentQuestion) return null;

  const selectedOption = currentQuestion.options?.find((o) => o.id === selected);
  const isCorrectAnswer = selectedOption?.is_correct;
  const correctOption = currentQuestion.options?.find((o) => o.is_correct);

  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Quiz color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>{quiz.title}</Typography>
          <Chip label={`${attemptsLeft} tentativa${attemptsLeft !== 1 ? 's' : ''}`} size="small" />
        </Box>

        {/* Progress bar */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Questão {step + 1} de {questions.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {Math.round(((step) / questions.length) * 100)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(step / questions.length) * 100}
            sx={{ borderRadius: 4, height: 6 }}
          />
        </Box>

        {/* Question */}
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
          {step + 1}. {currentQuestion.question_text}
        </Typography>

        {/* Options */}
        <RadioGroup
          value={phase === 'feedback' ? answers[currentQuestion.id] ?? '' : selected}
          onChange={(_, v) => { if (phase === 'answering') setSelected(v); }}
        >
          {(currentQuestion.options ?? []).map((opt) => {
            let borderColor = 'divider';
            let bgcolor = 'transparent';

            if (phase === 'feedback') {
              if (opt.is_correct) { borderColor = 'success.main'; bgcolor = 'success.50'; }
              else if (opt.id === answers[currentQuestion.id] && !opt.is_correct) { borderColor = 'error.main'; bgcolor = 'error.50'; }
            } else if (selected === opt.id) {
              borderColor = 'primary.main';
              bgcolor = 'primary.50';
            }

            return (
              <FormControlLabel
                key={opt.id}
                value={opt.id}
                disabled={phase === 'feedback'}
                control={<Radio size="small" />}
                label={opt.option_text}
                sx={{
                  mb: 1, px: 1.5, py: 0.75, borderRadius: 2,
                  border: '1px solid', borderColor, bgcolor,
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: phase === 'answering' ? 'action.hover' : bgcolor },
                }}
              />
            );
          })}
        </RadioGroup>

        {/* Feedback after confirming */}
        {phase === 'feedback' && (
          <Alert severity={isCorrectAnswer ? 'success' : 'error'} sx={{ mt: 2 }}>
            {isCorrectAnswer
              ? 'Correto!'
              : `Incorreto. A resposta certa era: ${correctOption?.option_text}`}
            {!isCorrectAnswer && currentQuestion.explanation && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>{currentQuestion.explanation}</Typography>
            )}
          </Alert>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Actions */}
        {phase === 'answering' ? (
          <Button
            fullWidth
            variant="contained"
            onClick={handleConfirm}
            disabled={!selected}
          >
            Confirmar resposta
          </Button>
        ) : (
          <Button
            fullWidth
            variant="contained"
            endIcon={<ArrowForward />}
            onClick={handleNext}
            disabled={submitMutation.isPending}
          >
            {isLastStep
              ? (submitMutation.isPending ? 'Enviando...' : 'Ver resultado')
              : 'Próxima questão'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default StepQuizPanel;
