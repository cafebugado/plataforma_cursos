import { supabase } from './client';
import type { ModuleQuiz, QuizAttempt } from '../../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export const getQuizByModule = async (moduleId: string) => {
  const { data, error } = await db
    .from('module_quizzes')
    .select('*, quiz_questions(*, quiz_options(*))')
    .eq('module_id', moduleId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  if (!data) return null;
  // Supabase returns joined tables with the table name as key — map to domain type
  const raw = data as Record<string, unknown>;
  return {
    ...raw,
    questions: ((raw.quiz_questions as Record<string, unknown>[] ?? []).map((q) => ({
      ...q,
      options: q.quiz_options ?? [],
    }))),
  } as unknown as ModuleQuiz;
};

export const createQuiz = async (quiz: Omit<ModuleQuiz, 'id' | 'created_at' | 'questions'>) => {
  const { data, error } = await db
    .from('module_quizzes')
    .insert(quiz)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as ModuleQuiz;
};

export const updateQuiz = async (id: string, updates: Partial<ModuleQuiz>) => {
  const { data, error } = await db
    .from('module_quizzes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as ModuleQuiz;
};

export const deleteQuiz = async (id: string) => {
  const { error } = await db.from('module_quizzes').delete().eq('id', id);
  if (error) throw error;
};

export const addQuestion = async (
  quizId: string,
  questionText: string,
  orderIndex: number,
  explanation?: string,
) => {
  const { data, error } = await db
    .from('quiz_questions')
    .insert({ quiz_id: quizId, question_text: questionText, order_index: orderIndex, explanation: explanation ?? null })
    .select()
    .single();
  if (error) throw error;
  return data as unknown as { id: string };
};

export const addOption = async (questionId: string, optionText: string, isCorrect: boolean) => {
  const { data, error } = await db
    .from('quiz_options')
    .insert({ question_id: questionId, option_text: optionText, is_correct: isCorrect })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getAttemptsByUser = async (userId: string, quizId: string) => {
  const { data, error } = await db
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('quiz_id', quizId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as QuizAttempt[];
};

export const submitQuizAttempt = async (
  quizId: string,
  moduleId: string,
  userId: string,
  answers: { question_id: string; option_id: string }[],
  attemptNumber: number,
): Promise<QuizAttempt> => {
  const { data: options, error: optErr } = await db
    .from('quiz_options')
    .select('id, is_correct')
    .in('id', answers.map((a) => a.option_id));
  if (optErr) throw optErr;

  const { data: totalQ, error: totalErr } = await db
    .from('quiz_questions')
    .select('id')
    .eq('quiz_id', quizId);
  if (totalErr) throw totalErr;

  const correctSet = new Set(
    (options ?? [])
      .filter((o: { is_correct: boolean }) => o.is_correct)
      .map((o: { id: string }) => o.id),
  );
  const correctCount = answers.filter((a) => correctSet.has(a.option_id)).length;
  const total = totalQ?.length ?? 1;
  const score = Math.round((correctCount / total) * 100);

  const { data: quiz } = await db
    .from('module_quizzes')
    .select('passing_score')
    .eq('id', quizId)
    .single();

  const passed = score >= ((quiz as { passing_score: number } | null)?.passing_score ?? 70);

  const { data: attempt, error: attErr } = await db
    .from('quiz_attempts')
    .insert({ quiz_id: quizId, module_id: moduleId, user_id: userId, score, passed, attempt_number: attemptNumber })
    .select()
    .single();
  if (attErr) throw attErr;

  const answerRows = answers.map((a) => ({
    attempt_id: (attempt as { id: string }).id,
    question_id: a.question_id,
    option_id: a.option_id,
    is_correct: correctSet.has(a.option_id),
  }));
  await db.from('quiz_answers').insert(answerRows);

  return attempt as unknown as QuizAttempt;
};
