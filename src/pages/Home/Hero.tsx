import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { PlayArrow as PlayArrowIcon, Edit as EditIcon } from '@mui/icons-material';

interface HeroProps {
  onLearn: () => void;
  onTeach: () => void;
}

const Hero: React.FC<HeroProps> = ({ onLearn, onTeach }) => {
  return (
    <Box
      component="section"
      sx={{
        pt: { xs: 20, md: 28 },
        pb: { xs: 14, md: 20 },
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      {/* Background accent shapes */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: -120,
          right: -120,
          width: { xs: 320, md: 520 },
          height: { xs: 320, md: 520 },
          borderRadius: '50%',
          bgcolor: 'primary.main',
          opacity: 0.06,
          pointerEvents: 'none',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          bottom: -80,
          left: -80,
          width: { xs: 240, md: 380 },
          height: { xs: 240, md: 380 },
          borderRadius: '50%',
          bgcolor: 'secondary.main',
          opacity: 0.05,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            gap: { xs: 8, md: 10 },
          }}
        >
          {/* Text content */}
          <Box sx={{ flex: 1, maxWidth: { md: 560 } }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: 'primary.main',
                color: 'white',
                px: 2,
                py: 0.75,
                borderRadius: 6,
                mb: 4,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: '#5DDEAA',
                }}
              />
              <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: '0.04em' }}>
                100% gratuito · Powered by YouTube
              </Typography>
            </Box>

            <Typography
              variant="h1"
              sx={{
                color: 'text.primary',
                mb: 3,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
              }}
            >
              Cursos{' '}
              <Box
                component="span"
                sx={{
                  color: 'primary.main',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 2,
                    left: 0,
                    width: '100%',
                    height: 3,
                    borderRadius: 2,
                    bgcolor: 'primary.light',
                    opacity: 0.4,
                  },
                }}
              >
                gratuitos
              </Box>
              {' '}com o melhor do YouTube
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                mb: 6,
                fontSize: { xs: '1rem', md: '1.125rem' },
                lineHeight: 1.7,
                maxWidth: 480,
              }}
            >
              Reunimos os melhores vídeos gratuitos do YouTube em trilhas organizadas por tema e nível. Aprenda no seu ritmo, acompanhe seu progresso e evolua na carreira sem pagar nada.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<PlayArrowIcon />}
                onClick={onLearn}
                sx={{
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  transition: 'transform 0.15s',
                  '&:hover': { transform: 'translateY(-1px)' },
                  '&:active': { transform: 'translateY(0)' },
                }}
              >
                Explorar cursos
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                startIcon={<EditIcon />}
                onClick={onTeach}
                sx={{
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  transition: 'transform 0.15s',
                  '&:hover': { transform: 'translateY(-1px)', bgcolor: 'transparent' },
                  '&:active': { transform: 'translateY(0)' },
                }}
              >
                Sugerir conteúdo
              </Button>
            </Box>

            {/* Social proof */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 6, flexWrap: 'wrap' }}>
              {[
                { value: '500+', label: 'Vídeos curados' },
                { value: '2k+', label: 'Alunos ativos' },
                { value: '100%', label: 'Gratuito' },
              ].map((stat) => (
                <Box key={stat.label}>
                  <Typography
                    variant="h5"
                    sx={{ color: 'primary.main', fontWeight: 700, lineHeight: 1 }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Visual element */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              maxWidth: { xs: 340, md: 480 },
              width: '100%',
            }}
          >
            <HeroIllustration />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

const HeroIllustration: React.FC = () => (
  <Box
    sx={{
      position: 'relative',
      width: '100%',
      aspectRatio: '1 / 1',
      maxWidth: 420,
    }}
  >
    {/* Main card */}
    <Box
      sx={{
        position: 'absolute',
        inset: '10% 5% 10% 5%',
        bgcolor: 'background.paper',
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 8px 40px rgba(108,99,255,0.12)',
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      {/* Video preview bar */}
      <Box sx={{ borderRadius: 2, bgcolor: '#1A1D2E', height: 130, position: 'relative', overflow: 'hidden' }}>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #6C63FF22 0%, #FF658422 100%)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              component="span"
              sx={{
                width: 0,
                height: 0,
                borderStyle: 'solid',
                borderWidth: '7px 0 7px 13px',
                borderColor: 'transparent transparent transparent white',
                ml: 0.5,
              }}
            />
          </Box>
        </Box>
        {/* Progress bar */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            bgcolor: 'rgba(255,255,255,0.1)',
          }}
        >
          <Box sx={{ width: '42%', height: '100%', bgcolor: 'primary.main' }} />
        </Box>
      </Box>

      {/* Course title */}
      <Box>
        <Box sx={{ height: 10, borderRadius: 1, bgcolor: 'divider', width: '75%', mb: 1.5 }} />
        <Box sx={{ height: 8, borderRadius: 1, bgcolor: 'divider', width: '55%' }} />
      </Box>

      {/* Progress section */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ height: 7, borderRadius: 1, bgcolor: 'divider', width: '40%' }} />
          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>42%</Typography>
        </Box>
        <Box sx={{ height: 6, borderRadius: 3, bgcolor: '#E8EAEF', overflow: 'hidden' }}>
          <Box
            sx={{
              width: '42%',
              height: '100%',
              borderRadius: 3,
              bgcolor: 'primary.main',
            }}
          />
        </Box>
      </Box>

      {/* Module list */}
      {[1, 2, 3].map((i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              bgcolor: i === 1 ? 'primary.main' : i === 2 ? 'success.main' : 'divider',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {i < 3 && (
              <Box
                component="span"
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'white',
                  opacity: 0.9,
                }}
              />
            )}
          </Box>
          <Box sx={{ flex: 1, height: 7, borderRadius: 1, bgcolor: 'divider', width: `${85 - i * 12}%` }} />
        </Box>
      ))}
    </Box>

    {/* Floating badge — top right */}
    <Box
      sx={{
        position: 'absolute',
        top: '4%',
        right: '0%',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        px: 2,
        py: 1,
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap' }}>
        Via YouTube
      </Typography>
    </Box>

    {/* Floating badge — bottom left */}
    <Box
      sx={{
        position: 'absolute',
        bottom: '5%',
        left: '0%',
        bgcolor: 'primary.main',
        borderRadius: 3,
        px: 2,
        py: 1,
        boxShadow: '0 4px 20px rgba(108,99,255,0.35)',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'white', whiteSpace: 'nowrap' }}>
        ✅ Totalmente gratuito
      </Typography>
    </Box>
  </Box>
);

export default Hero;
