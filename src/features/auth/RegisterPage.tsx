import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, Button, Container, Divider, Link, Paper, TextField, Typography, Alert,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signUp } from '../../services/supabase/auth';
import { School } from '@mui/icons-material';

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
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', bgcolor: 'background.default' }}>
        <Container maxWidth="xs">
          <Alert severity="success" sx={{ borderRadius: 3 }}>
            Conta criada! Verifique seu e-mail para confirmar o cadastro.
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', bgcolor: 'background.default' }}>
      <Container maxWidth="xs">
        <Paper elevation={0} sx={{ p: 6, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Box sx={{ bgcolor: 'primary.main', borderRadius: 3, p: 1.5, mb: 2 }}>
              <School sx={{ color: 'white', fontSize: 32 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Criar conta</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Comece a aprender hoje
            </Typography>
          </Box>

          {serverError && <Alert severity="error" sx={{ mb: 3 }}>{serverError}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Nome completo"
              fullWidth
              {...register('full_name')}
              error={!!errors.full_name}
              helperText={errors.full_name?.message}
            />
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
            <TextField
              label="Confirmar senha"
              type="password"
              fullWidth
              {...register('confirm_password')}
              error={!!errors.confirm_password}
              helperText={errors.confirm_password?.message}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" align="center">
            Já tem conta?{' '}
            <Link component={RouterLink} to="/auth/login" sx={{ fontWeight: 600 }}>
              Entrar
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;
