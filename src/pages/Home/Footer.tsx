import React from 'react';
import { Box, Container, Divider, Link, Typography } from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <Box component="footer" sx={{ bgcolor: '#1A1D2E', color: 'white', pt: { xs: 10, md: 14 }, pb: 6 }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 8, md: 4 },
            mb: 8,
          }}
        >
          {/* Brand */}
          <Box sx={{ flex: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SchoolIcon sx={{ color: 'white', fontSize: 18 }} />
              </Box>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                DevFlix Café
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, maxWidth: 280 }}
            >
              Aprendizado online com propósito. Cursos estruturados, progresso rastreável e
              certificados que importam.
            </Typography>
          </Box>

          {/* Links */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 6, sm: 10 },
              flex: 2,
            }}
          >
            <Box>
              <Typography
                variant="overline"
                sx={{
                  color: 'rgba(255,255,255,0.35)',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  display: 'block',
                  mb: 2,
                }}
              >
                Plataforma
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  { label: 'Como funciona', href: '#como-funciona' },
                  { label: 'Para quem é', href: '#para-quem' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    underline="none"
                    sx={{
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '0.875rem',
                      transition: 'color 0.15s',
                      '&:hover': { color: 'white' },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Box>
            </Box>

            <Box>
              <Typography
                variant="overline"
                sx={{
                  color: 'rgba(255,255,255,0.35)',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  display: 'block',
                  mb: 2,
                }}
              >
                Conta
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  { label: 'Entrar', to: '/auth/login' },
                  { label: 'Cadastrar', to: '/auth/register' },
                  { label: 'Recuperar senha', to: '/auth/forgot-password' },
                ].map((link) => (
                  <Link
                    key={link.to}
                    component={RouterLink}
                    to={link.to}
                    underline="none"
                    sx={{
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '0.875rem',
                      transition: 'color 0.15s',
                      '&:hover': { color: 'white' },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 4 }} />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)' }}>
            © {year} DevFlix Café. Todos os direitos reservados.
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.25)' }}>
            Feito com dedicação para quem aprende
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
