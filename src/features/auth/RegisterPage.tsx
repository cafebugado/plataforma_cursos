import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, Button, Link, TextField, Typography, Alert,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signUp } from '../../services/supabase/auth';
import {
  School, CheckCircle, Lock, Lightbulb, RocketLaunch,
} from '@mui/icons-material';

const schema = z.object({
  full_name: z.string().min(2, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: 'As senhas não conferem',
  path: ['confirm_password'],
});

type FormData = z.infer<typeof schema>;

const benefits = [
  { icon: <RocketLaunch sx={{ fontSize: 22 }} />, text: 'Acesso imediato a todos os cursos' },
  { icon: <Lightbulb sx={{ fontSize: 22 }} />, text: 'Conteúdo prático e atualizado' },
  { icon: <Lock sx={{ fontSize: 22 }} />, text: 'Certificados reconhecidos' },
  { icon: <CheckCircle sx={{ fontSize: 22 }} />, text: '100% gratuito para começar' },
];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      await signUp(data.email, data.password, data.full_name);
      setSuccess(true);
      setTimeout(() => navigate('/auth/login'), 3000);
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Erro ao criar conta');
    }
  };

  if (success) {
    return (
      <Box sx={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', bgcolor: 'background.default',
      }}>
        <Box sx={{
          textAlign: 'center', p: 6, maxWidth: 420,
          animation: 'fadeIn 0.5s ease',
          '@keyframes fadeIn': { from: { opacity: 0, transform: 'scale(0.95)' }, to: { opacity: 1, transform: 'scale(1)' } },
        }}>
          <Box sx={{
            width: 72, height: 72, borderRadius: '50%',
            bgcolor: 'success.main', display: 'flex',
            alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3,
          }}>
            <CheckCircle sx={{ color: 'white', fontSize: 40 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Conta criada!</Typography>
          <Typography variant="body1" color="text.secondary">
            Verifique seu e-mail para confirmar o cadastro. Redirecionando para o login...
          </Typography>
        </Box>
      </Box>
    );
  }

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
          <Box sx={{ mb: 5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 1 }}>
              Crie sua conta
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Comece sua jornada de aprendizado hoje, de graça
            </Typography>
          </Box>

          {serverError && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{serverError}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Nome completo"
              fullWidth
              {...register('full_name')}
              error={!!errors.full_name}
              helperText={errors.full_name?.message}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
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
            <TextField
              label="Confirmar senha"
              type="password"
              fullWidth
              {...register('confirm_password')}
              error={!!errors.confirm_password}
              helperText={errors.confirm_password?.message}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isSubmitting}
              sx={{ borderRadius: 2, py: 1.5, fontWeight: 700, fontSize: '1rem', mt: 0.5 }}
            >
              {isSubmitting ? 'Criando conta...' : 'Criar conta grátis'}
            </Button>
          </Box>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Já tem conta?{' '}
              <Link
                component={RouterLink}
                to="/auth/login"
                sx={{ fontWeight: 700, color: 'primary.main' }}
              >
                Entrar
              </Link>
            </Typography>
          </Box>
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
          Junte-se a milhares{' '}
          <Box component="span" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            de desenvolvedores
          </Box>
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', mb: 6, lineHeight: 1.8, maxWidth: 380 }}>
          Crie sua conta gratuita e tenha acesso imediato a todo o conteúdo da plataforma.
        </Typography>

        {/* Benefícios */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: 400 }}>
          {benefits.map((b) => (
            <Box
              key={b.text}
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
              <Box sx={{ color: 'rgba(255,255,255,0.9)', flexShrink: 0 }}>{b.icon}</Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                {b.text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterPage;
