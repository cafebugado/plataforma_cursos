import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Link, TextField, Typography, Alert } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { resetPassword } from '../../services/supabase/auth';
import { ArrowBack, School, MarkEmailRead, Shield, Speed, SupportAgent } from '@mui/icons-material';

const schema = z.object({ email: z.string().email('E-mail inválido') });
type FormData = z.infer<typeof schema>;

const tips = [
  { icon: <Shield sx={{ fontSize: 22 }} />, text: 'Link seguro e criptografado' },
  { icon: <Speed sx={{ fontSize: 22 }} />, text: 'Receba o e-mail em segundos' },
  { icon: <MarkEmailRead sx={{ fontSize: 22 }} />, text: 'Verifique também o spam' },
  { icon: <SupportAgent sx={{ fontSize: 22 }} />, text: 'Suporte disponível se precisar' },
];

const ForgotPasswordPage: React.FC = () => {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      await resetPassword(data.email);
      setSent(true);
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Erro ao enviar e-mail');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', overflow: 'hidden' }}>
      {/* Painel esquerdo — formulário */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.default',
          p: { xs: 3, sm: 6 },
        }}
      >
        {/* Logo mobile */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 5 }}>
          <Box sx={{ bgcolor: 'primary.main', borderRadius: 2, p: 0.75 }}>
            <School sx={{ color: 'white', fontSize: 22 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }} color="primary">
            DevFlix Café
          </Typography>
        </Box>

        <Box sx={{ width: '100%', maxWidth: 400 }}>
          {sent ? (
            <Box sx={{
              textAlign: 'center',
              animation: 'fadeIn 0.5s ease',
              '@keyframes fadeIn': { from: { opacity: 0, transform: 'scale(0.95)' }, to: { opacity: 1, transform: 'scale(1)' } },
            }}>
              <Box sx={{
                width: 72, height: 72, borderRadius: '50%',
                bgcolor: 'success.main', display: 'flex',
                alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3,
              }}>
                <MarkEmailRead sx={{ color: 'white', fontSize: 40 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>E-mail enviado!</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Verifique sua caixa de entrada e siga o link para redefinir sua senha.
              </Typography>
              <Link
                component={RouterLink}
                to="/auth/login"
                sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 700, color: 'primary.main' }}
              >
                <ArrowBack fontSize="small" /> Voltar ao login
              </Link>
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 5 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 1 }}>
                  Recuperar senha
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Informe seu e-mail e enviaremos um link para redefinir sua senha
                </Typography>
              </Box>

              {serverError && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{serverError}</Alert>}

              <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="E-mail"
                  type="email"
                  fullWidth
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={isSubmitting}
                  sx={{ borderRadius: 2, py: 1.5, fontWeight: 700, fontSize: '1rem' }}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar link'}
                </Button>
              </Box>

              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Link
                  component={RouterLink}
                  to="/auth/login"
                  sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 600, color: 'primary.main' }}
                  variant="body2"
                >
                  <ArrowBack fontSize="small" /> Voltar ao login
                </Link>
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* Painel direito — branding */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          width: '50%',
          bgcolor: 'primary.main',
          p: { md: 6, lg: 10 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Círculos decorativos */}
        <Box sx={{
          position: 'absolute', top: -80, left: -80,
          width: 320, height: 320, borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.08)',
        }} />
        <Box sx={{
          position: 'absolute', bottom: -60, right: -60,
          width: 240, height: 240, borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.06)',
        }} />
        <Box sx={{
          position: 'absolute', top: 120, right: 40,
          width: 120, height: 120, borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.06)',
        }} />

        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 6 }}>
          <Box sx={{
            bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2, p: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <School sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 800, letterSpacing: '-0.02em' }}>
            DevFlix Café
          </Typography>
        </Box>

        <Typography variant="h3" sx={{ color: 'white', fontWeight: 800, lineHeight: 1.15, mb: 2, letterSpacing: '-0.03em' }}>
          Sua conta está{' '}
          <Box component="span" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            segura com a gente
          </Box>
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', mb: 6, lineHeight: 1.8, maxWidth: 380 }}>
          Recupere o acesso à sua conta em poucos passos e continue de onde parou.
        </Typography>

        {/* Dicas */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: 400 }}>
          {tips.map((t) => (
            <Box
              key={t.text}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                bgcolor: 'rgba(255,255,255,0.12)',
                borderRadius: 3,
                p: 2,
                border: '1px solid rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Box sx={{ color: 'rgba(255,255,255,0.9)', flexShrink: 0 }}>{t.icon}</Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                {t.text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default ForgotPasswordPage;
