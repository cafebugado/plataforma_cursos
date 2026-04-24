import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Button, Container, Divider, Link, Paper, TextField, Typography, Alert,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from '../../services/supabase/auth';
import { School } from '@mui/icons-material';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

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
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', bgcolor: 'background.default' }}>
      <Container maxWidth="xs">
        <Paper elevation={0} sx={{ p: 6, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Box sx={{ bgcolor: 'primary.main', borderRadius: 3, p: 1.5, mb: 2 }}>
              <School sx={{ color: 'white', fontSize: 32 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Entrar na plataforma</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Bem-vindo de volta!
            </Typography>
          </Box>

          {serverError && <Alert severity="error" sx={{ mb: 3 }}>{serverError}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="E-mail"
              type="email"
              fullWidth
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              label="Senha"
              type="password"
              fullWidth
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link component={RouterLink} to="/auth/forgot-password" variant="body2">
                Esqueci minha senha
              </Link>
            </Box>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" align="center">
            Não tem conta?{' '}
            <Link component={RouterLink} to="/auth/register" sx={{ fontWeight: 600 }}>
              Criar conta
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
