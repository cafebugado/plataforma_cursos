import React from 'react';
import { Box, Button, Container, Grid, Typography } from '@mui/material';
import {
  CheckCircleRounded as CheckIcon,
  SchoolRounded as StudentIcon,
  AdminPanelSettingsRounded as AdminIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface CardData {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  benefits: string[];
  cta: string;
  route: string;
  accent: string;
  bg: string;
  borderHover: string;
}

const CARDS: CardData[] = [
  {
    icon: StudentIcon,
    title: 'Para Alunos',
    subtitle: 'Evolua na sua carreira aprendendo com cursos práticos e estruturados.',
    benefits: [
      'Acesso a centenas de aulas em vídeo',
      'Trilhas de aprendizado estruturadas',
      'Quizzes para fixar o conteúdo',
      'Progresso rastreável por módulo',
      'Certificado de conclusão',
    ],
    cta: 'Começar agora',
    route: '/auth/register',
    accent: '#6C63FF',
    bg: 'rgba(108,99,255,0.04)',
    borderHover: 'rgba(108,99,255,0.4)',
  },
  {
    icon: AdminIcon,
    title: 'Para Instrutores',
    subtitle: 'Compartilhe seu conhecimento e gerencie seus cursos com facilidade.',
    benefits: [
      'Criação de cursos com vídeos do YouTube',
      'Organização em módulos e playlists',
      'Dashboard com métricas de desempenho',
      'Gestão completa de usuários',
      'Relatórios e progresso dos alunos',
    ],
    cta: 'Fale com a gente',
    route: '/auth/login',
    accent: '#FF6584',
    bg: 'rgba(255,101,132,0.04)',
    borderHover: 'rgba(255,101,132,0.4)',
  },
];

const ForWho: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      id="para-quem"
      component="section"
      sx={{ py: { xs: 14, md: 20 }, bgcolor: 'background.default' }}
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
            Para quem é
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
            Uma plataforma, dois perfis
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: 'text.secondary', maxWidth: 460, mx: 'auto', lineHeight: 1.7 }}
          >
            Seja para aprender ou para ensinar, a EduPlatform tem o que você precisa.
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
          {CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Grid key={card.title} size={{ xs: 12, sm: 10, md: 6 }}>
                <Box
                  sx={{
                    height: '100%',
                    p: { xs: 4, md: 5 },
                    borderRadius: 4,
                    border: '1.5px solid',
                    borderColor: 'divider',
                    bgcolor: card.bg,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
                    '&:hover': {
                      borderColor: card.borderHover,
                      boxShadow: `0 8px 40px ${card.accent}14`,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 3,
                      bgcolor: card.accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                    }}
                  >
                    <Icon sx={{ color: 'white', fontSize: 30 }} />
                  </Box>

                  <Typography
                    variant="h4"
                    sx={{ color: 'text.primary', fontWeight: 700, mb: 1.5, fontSize: '1.35rem' }}
                  >
                    {card.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', mb: 3.5, lineHeight: 1.7 }}
                  >
                    {card.subtitle}
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 4, flex: 1 }}>
                    {card.benefits.map((benefit) => (
                      <Box key={benefit} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <CheckIcon sx={{ color: card.accent, fontSize: 18, mt: 0.25, flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6 }}>
                          {benefit}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate(card.route)}
                    sx={{
                      fontWeight: 700,
                      py: 1.5,
                      bgcolor: card.accent,
                      '&:hover': {
                        bgcolor: card.accent,
                        filter: 'brightness(0.9)',
                        transform: 'translateY(-1px)',
                      },
                      '&:active': { transform: 'translateY(0)' },
                      transition: 'transform 0.15s, filter 0.15s',
                    }}
                  >
                    {card.cta}
                  </Button>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};

export default ForWho;
