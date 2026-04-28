import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import {
  CheckCircleRounded as CheckIcon,
  SchoolRounded as StudentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const BENEFITS = [
  'Acesso gratuito a centenas de vídeos curados',
  'Trilhas organizadas por tema e nível',
  'Acompanhe seu progresso por módulo',
  'Conteúdo selecionado do YouTube em um só lugar',
  'Aprenda no seu ritmo, quando e onde quiser',
];

const ForWho: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      id="para-quem"
      component="section"
      sx={{ py: { xs: 14, md: 20 }, bgcolor: 'background.default' }}
    >
      <Container maxWidth="sm">
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
            Feito para quem quer aprender
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: 'text.secondary', maxWidth: 420, mx: 'auto', lineHeight: 1.7 }}
          >
            Reunimos os melhores vídeos gratuitos do YouTube em trilhas estruturadas para você evoluir de verdade.
          </Typography>
        </Box>

        <Box
          sx={{
            p: { xs: 4, md: 5 },
            borderRadius: 4,
            border: '1.5px solid',
            borderColor: 'divider',
            bgcolor: 'rgba(108,99,255,0.04)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
            '&:hover': {
              borderColor: 'rgba(108,99,255,0.4)',
              boxShadow: '0 8px 40px rgba(108,99,255,0.08)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              bgcolor: '#6C63FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <StudentIcon sx={{ color: 'white', fontSize: 30 }} />
          </Box>

          <Typography
            variant="h4"
            sx={{ color: 'text.primary', fontWeight: 700, mb: 1.5, fontSize: '1.35rem' }}
          >
            Para Alunos
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', mb: 3.5, lineHeight: 1.7 }}
          >
            Aprenda com os melhores conteúdos gratuitos do YouTube, organizados em trilhas para você evoluir na carreira.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 4 }}>
            {BENEFITS.map((benefit) => (
              <Box key={benefit} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <CheckIcon sx={{ color: '#6C63FF', fontSize: 18, mt: 0.25, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6 }}>
                  {benefit}
                </Typography>
              </Box>
            ))}
          </Box>

          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate('/auth/register')}
            sx={{
              fontWeight: 700,
              py: 1.5,
              bgcolor: '#6C63FF',
              '&:hover': {
                bgcolor: '#6C63FF',
                filter: 'brightness(0.9)',
                transform: 'translateY(-1px)',
              },
              '&:active': { transform: 'translateY(0)' },
              transition: 'transform 0.15s, filter 0.15s',
            }}
          >
            Começar agora
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default ForWho;
