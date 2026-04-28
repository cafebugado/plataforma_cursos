import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Button, Link, TextField, Typography, Alert,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from '../../services/supabase/auth';
import {
  School, PlayCircle, Star, People, TrendingUp,
} from '@mui/icons-material';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

const stats = [
  { icon: <People sx={{ fontSize: 20 }} />, value: '+5.000', label: 'Alunos ativos' },
  { icon: <PlayCircle sx={{ fontSize: 20 }} />, value: '+200', label: 'Horas de conteúdo' },
  { icon: <Star sx={{ fontSize: 20 }} />, value: '4.9', label: 'Avaliação média' },
  { icon: <TrendingUp sx={{ fontSize: 20 }} />, value: '94%', label: 'Taxa de conclusão' },
];

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/app';
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      await signIn(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Erro ao fazer login');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', overflow: 'hidden' }}>
      {/* Painel esquerdo — branding */}
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
          position: 'absolute', top: -80, right: -80,
          width: 320, height: 320, borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.08)',
        }} />
        <Box sx={{
          position: 'absolute', bottom: -60, left: -60,
          width: 240, height: 240, borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.06)',
        }} />
        <Box sx={{
          position: 'absolute', bottom: 120, right: 40,
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

        {/* Headline */}
        <Typography variant="h3" sx={{ color: 'white', fontWeight: 800, lineHeight: 1.15, mb: 2, letterSpacing: '-0.03em' }}>
          Aprenda no seu ritmo,{' '}
          <Box component="span" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            evolua de verdade
          </Box>
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', mb: 6, lineHeight: 1.8, maxWidth: 380 }}>
          Cursos estruturados, vídeos de qualidade e progresso rastreável, tudo para você dominar o que precisa.
        </Typography>

        {/* Stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, width: '100%', maxWidth: 400 }}>
          {stats.map((s) => (
            <Box
              key={s.label}
              sx={{
                bgcolor: 'rgba(255,255,255,0.12)',
                borderRadius: 3,
                p: 2.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <Box sx={{ color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: 0.75 }}>
                {s.icon}
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 800, lineHeight: 1 }}>
                  {s.value}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                {s.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Painel direito — formulário */}
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
          <Box sx={{ mb: 5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 1 }}>
              Bem-vindo de volta
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Entre na sua conta para continuar aprendendo
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
            <TextField
              label="Senha"
              type="password"
              fullWidth
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -1 }}>
              <Link component={RouterLink} to="/auth/forgot-password" variant="body2" sx={{ fontWeight: 500 }}>
                Esqueci minha senha
              </Link>
            </Box>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isSubmitting}
              sx={{ borderRadius: 2, py: 1.5, fontWeight: 700, fontSize: '1rem', mt: 0.5 }}
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </Box>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Não tem conta?{' '}
              <Link
                component={RouterLink}
                to="/auth/register"
                sx={{ fontWeight: 700, color: 'primary.main' }}
              >
                Criar conta grátis
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
