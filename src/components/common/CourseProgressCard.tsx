import React from 'react';
import { Box, Button, Card, CardActionArea, CardContent, CardMedia, Chip, LinearProgress, Typography } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Course } from '../../types';
import CategoryChips from './CategoryChips';

interface Props {
  course: Course;
  progress?: number;
  showEnrollButton?: boolean;
  isEnrolled?: boolean;
  onEnroll?: () => void;
}

const CourseProgressCard: React.FC<Props> = ({ course, progress, showEnrollButton, isEnrolled, onEnroll }) => {
  const navigate = useNavigate();
  const thumbnail = course.thumbnail_url ?? `https://placehold.co/400x225/6C63FF/white?text=${encodeURIComponent(course.title)}`;

  const levelLabels: Record<string, string> = {
    beginner: 'Iniciante',
    intermediate: 'Intermediário',
    advanced: 'Avançado',
  };

  return (
    <Card elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea onClick={() => navigate(`/app/courses/${course.slug}`)}>
        <CardMedia component="img" height={160} image={thumbnail} alt={course.title} />
      </CardActionArea>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip label={levelLabels[course.level] ?? course.level} size="small" color="primary" variant="outlined" />
          <CategoryChips category={course.category} size="small" />
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
          {course.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
          {course.short_description}
        </Typography>
        {progress !== undefined && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">Progresso</Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }} color="primary">{progress}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3 }} />
          </Box>
        )}
        {showEnrollButton && (
          isEnrolled ? (
            <Button
              variant="contained"
              size="small"
              disabled
              startIcon={<CheckCircle fontSize="small" />}
              sx={{
                mt: 1,
                bgcolor: 'success.main',
                '&.Mui-disabled': { bgcolor: 'success.main', color: 'white', opacity: 1 },
              }}
            >
              Matriculado
            </Button>
          ) : (
            <Button variant="contained" size="small" onClick={onEnroll} sx={{ mt: 1 }}>
              Matricular-se
            </Button>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default CourseProgressCard;
