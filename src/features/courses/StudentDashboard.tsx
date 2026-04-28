import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Button, Card, CardActionArea, CardContent,
  Chip, Divider, Grid, LinearProgress, Skeleton, Typography,
} from '@mui/material';
import {
  CheckCircle, Explore, MenuBook, PlayArrow, School,
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { getStudentEnrollments, getCourseProgress } from '../../services/supabase/progress';
import CategoryChips from '../../components/common/CategoryChips';

interface CourseData {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  category: string;
  level?: string;
}

interface EnrollmentWithCourse {
  id: string;
  user_id: string;
  course_id: string;
  status: string;
  enrolled_at: string;
  courses: CourseData;
}

// ─── HeroBanner ───────────────────────────────────────────────────────────────

const HeroBanner: React.FC<{ firstName: string; totalCourses: number }> = ({
  firstName,
  totalCourses,
}) => (
  <Card elevation={0} sx={{ mb: 4, p: { xs: 3, md: 4 } }}>
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { sm: 'center' },
        justifyContent: 'space-between',
        gap: 3,
      }}
    >
      <Box>
        <Typography variant="overline" sx={{ color: 'text.disabled', letterSpacing: 1.5 }}>
          Bem-vindo de volta
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.25, mb: 0.75, color: 'text.primary' }}>
          Olá, {firstName}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {totalCourses > 0
            ? `Você tem ${totalCourses} ${totalCourses === 1 ? 'curso em andamento' : 'cursos em andamento'}.`
            : 'Explore o catálogo e comece a aprender hoje.'}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          px: 3,
          py: 2,
          flexShrink: 0,
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', lineHeight: 1 }}>
            {totalCourses}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.25, display: 'block' }}>
            {totalCourses === 1 ? 'Curso' : 'Cursos'}
          </Typography>
        </Box>

        <Divider orientation="vertical" flexItem />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MenuBook sx={{ fontSize: 20, color: 'text.secondary' }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Em andamento
          </Typography>
        </Box>
      </Box>
    </Box>
  </Card>
);

// ─── SectionTitle ─────────────────────────────────────────────────────────────

const SectionTitle: React.FC<{ title: string; action?: React.ReactNode }> = ({ title, action }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      mb: 2.5,
    }}
  >
    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
      {title}
    </Typography>
    {action}
  </Box>
);

// ─── CourseCard ───────────────────────────────────────────────────────────────

interface CourseCardProps {
  enrollment: EnrollmentWithCourse;
  userId: string;
  onContinue: (slug: string) => void;
}

const levelLabel: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

const CourseCard: React.FC<CourseCardProps> = ({ enrollment, userId, onContinue }) => {
  const course = enrollment.courses;
  const lvl = course.level ?? 'beginner';

  const { data: progress = 0, isLoading: progressLoading } = useQuery({
    queryKey: ['course-progress', userId, course.id],
    queryFn: () => getCourseProgress(userId, course.id),
    staleTime: 1000 * 60 * 5,
  });

  const completed = progress === 100;

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.2s',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
        },
      }}
    >
      {/* Thumbnail */}
      <CardActionArea onClick={() => onContinue(course.slug)}>
        <Box
          component="img"
          src={
            course.thumbnail_url ??
            `https://placehold.co/600x300/6C63FF/white?text=${encodeURIComponent(course.title)}`
          }
          alt={course.title}
          sx={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
        />
      </CardActionArea>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', pt: 2, pb: 2 }}>
        {/* Nível + categorias */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          <Chip
            label={levelLabel[lvl] ?? lvl}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: 11, height: 20, borderRadius: 1 }}
          />
          <CategoryChips category={course.category} size="small" />
        </Box>

        {/* Título */}
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            flexGrow: 1,
            mb: 2,
            color: 'text.primary',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {course.title}
        </Typography>

        {/* Progresso */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Progresso
            </Typography>
            {progressLoading ? (
              <Skeleton width={28} height={14} />
            ) : (
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: completed ? 'success.main' : 'text.secondary' }}
              >
                {progress}%
              </Typography>
            )}
          </Box>
          {progressLoading ? (
            <Skeleton variant="rectangular" height={4} sx={{ borderRadius: 2 }} />
          ) : (
            <LinearProgress
              variant="determinate"
              value={progress}
              color={completed ? 'success' : 'primary'}
              sx={{ height: 4, borderRadius: 2 }}
            />
          )}
        </Box>

        {/* Botão */}
        <Button
          fullWidth
          variant="contained"
          disableElevation
          startIcon={completed ? <CheckCircle sx={{ fontSize: 18 }} /> : <PlayArrow sx={{ fontSize: 18 }} />}
          onClick={() => onContinue(course.slug)}
          color={completed ? 'success' : 'primary'}
          sx={{ fontWeight: 600, textTransform: 'none', borderRadius: 1.5 }}
        >
          {completed ? 'Concluído' : progress > 0 ? 'Continuar' : 'Começar'}
        </Button>
      </CardContent>
    </Card>
  );
};

// ─── CardSkeleton ─────────────────────────────────────────────────────────────

const CardSkeleton: React.FC = () => (
  <Card elevation={0} sx={{ height: '100%' }}>
    <Skeleton variant="rectangular" height={160} />
    <CardContent>
      <Skeleton width="40%" height={18} sx={{ mb: 1 }} />
      <Skeleton width="90%" height={22} />
      <Skeleton width="65%" height={22} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" height={4} sx={{ borderRadius: 2, mb: 2 }} />
      <Skeleton variant="rectangular" height={38} sx={{ borderRadius: 1.5 }} />
    </CardContent>
  </Card>
);

// ─── StudentDashboard ─────────────────────────────────────────────────────────

const StudentDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const firstName = profile?.full_name?.split(' ')[0] ?? 'aluno';

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['enrollments', user?.id],
    queryFn: () => getStudentEnrollments(user!.id),
    enabled: !!user,
  });

  const typedEnrollments = (enrollments ?? []) as unknown as EnrollmentWithCourse[];
  const inProgress = typedEnrollments.filter((e) => e.status === 'active');

  return (
    <Box>
      <HeroBanner firstName={firstName} totalCourses={isLoading ? 0 : inProgress.length} />

      <SectionTitle
        title="Meus Cursos"
        action={
          <Button
            size="small"
            variant="text"
            startIcon={<Explore sx={{ fontSize: 16 }} />}
            onClick={() => navigate('/app/courses')}
            sx={{ fontWeight: 600, color: 'text.secondary' }}
          >
            Ver catálogo
          </Button>
        }
      />

      {isLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <CardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : inProgress.length === 0 ? (
        <Box
          sx={{
            py: 8,
            textAlign: 'center',
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <School sx={{ fontSize: 40, color: 'text.disabled', mb: 1.5 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
            Nenhum curso em andamento
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Explore o catálogo e matricule-se no primeiro curso.
          </Typography>
          <Button
            variant="contained"
            disableElevation
            startIcon={<Explore />}
            onClick={() => navigate('/app/courses')}
            sx={{ fontWeight: 600 }}
          >
            Explorar cursos
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {inProgress.map((enrollment) => (
            <Grid key={enrollment.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <CourseCard
                enrollment={enrollment}
                userId={user!.id}
                onContinue={(slug) => navigate(`/app/courses/${slug}`)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* CTA — só aparece com cursos */}
      {!isLoading && inProgress.length > 0 && (
        <Box
          sx={{
            mt: 5,
            p: { xs: 3, md: 3.5 },
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
              Quer aprender mais?
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Conheça todos os cursos disponíveis no catálogo.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            disableElevation
            onClick={() => navigate('/app/courses')}
            sx={{ fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            Ver catálogo completo
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default StudentDashboard;
