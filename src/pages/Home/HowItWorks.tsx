import React from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import {
  SearchRounded as SearchIcon,
  PlayCircleOutlineRounded as PlayIcon,
  EmojiEventsRounded as TrophyIcon,
} from '@mui/icons-material';

const STEPS = [
  {
    icon: SearchIcon,
    number: '01',
    title: 'Escolha seu curso',
    description:
      'Explore o catálogo e encontre o curso certo para o seu nível e objetivo. Cursos organizados por área e trilha de aprendizado.',
    color: '#6C63FF',
    bg: 'rgba(108,99,255,0.08)',
  },
  {
    icon: PlayIcon,
    number: '02',
    title: 'Aprenda no seu ritmo',
    description:
      'Assista às aulas quando e onde quiser. Acompanhe seu progresso, faça quizzes e marque os módulos concluídos.',
    color: '#FF6584',
    bg: 'rgba(255,101,132,0.08)',
  },
  {
    icon: TrophyIcon,
    number: '03',
    title: 'Conquiste seu certificado',
    description:
      'Conclua o curso e receba seu certificado de conclusão. Compartilhe sua conquista e avance na carreira.',
    color: '#2ECC71',
    bg: 'rgba(46,204,113,0.08)',
  },
];

const HowItWorks: React.FC = () => {
  return (
    <Box
      id="como-funciona"
      component="section"
      sx={{ py: { xs: 14, md: 20 }, bgcolor: 'background.paper' }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 12 } }}>
          <Typography
            variant="overline"
            sx={{
              color: 'primary.main',
              fontWeight: 700,
              letterSpacing: '0.12em',
              display: 'block',
              mb: 1.5,
            }}
          >
            Como funciona
          </Typography>
          <Typography
            variant="h2"
            sx={{
              color: 'text.primary',
              mb: 2.5,
              fontSize: { xs: '1.75rem', md: '2rem' },
              letterSpacing: '-0.02em',
            }}
          >
            Três passos para evoluir
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: 'text.secondary', maxWidth: 480, mx: 'auto', lineHeight: 1.7 }}
          >
            Do cadastro ao certificado, a plataforma guia cada etapa da sua
            jornada de aprendizado.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <Grid key={step.number} size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    position: 'relative',
                    height: '100%',
                    p: { xs: 4, md: 5 },
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
                    '&:hover': {
                      borderColor: step.color,
                      boxShadow: `0 8px 32px ${step.color}18`,
                      transform: 'translateY(-3px)',
                    },
                  }}
                >
                  {/* Step number — decorative */}
                  <Typography
                    sx={{
                      position: 'absolute',
                      top: 20,
                      right: 24,
                      fontSize: '3.5rem',
                      fontWeight: 800,
                      color: step.bg,
                      lineHeight: 1,
                      userSelect: 'none',
                    }}
                  >
                    {step.number}
                  </Typography>

                  {/* Connector line (between cards on desktop) */}
                  {index < STEPS.length - 1 && (
                    <Box
                      aria-hidden
                      sx={{
                        display: { xs: 'none', md: 'block' },
                        position: 'absolute',
                        top: '30%',
                        right: -32,
                        width: 28,
                        height: 2,
                        bgcolor: 'divider',
                        zIndex: 1,
                      }}
                    />
                  )}

                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 3,
                      bgcolor: step.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                    }}
                  >
                    <Icon sx={{ color: step.color, fontSize: 28 }} />
                  </Box>

                  <Typography
                    variant="h5"
                    sx={{ color: 'text.primary', mb: 1.5, fontWeight: 600 }}
                  >
                    {step.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                    {step.description}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};

export default HowItWorks;
