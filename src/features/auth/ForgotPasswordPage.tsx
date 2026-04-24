import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Link, Paper, TextField, Typography, Alert } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { resetPassword } from '../../services/supabase/auth';
import { ArrowBack, School } from '@mui/icons-material';

const schema = z.object({ email: z.string().email('E-mail inválido') });
type FormData = z.infer<typeof schema>;

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
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', bgcolor: 'background.default' }}>
      <Container maxWidth="xs">
        <Paper elevation={0} sx={{ p: 6, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Box sx={{ bgcolor: 'primary.main', borderRadius: 3, p: 1.5, mb: 2 }}>
              <School sx={{ color: 'white', fontSize: 32 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Recuperar senha</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }} align="center">
              Enviaremos um link para redefinir sua senha
            </Typography>
          </Box>

          {sent ? (
            <Alert severity="success">
              E-mail enviado! Verifique sua caixa de entrada.
            </Alert>
          ) : (
            <>
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
                <Button type="submit" variant="contained" fullWidth size="large" disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Enviar link'}
                </Button>
              </Box>
            </>
          )}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Link component={RouterLink} to="/auth/login" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} variant="body2">
              <ArrowBack fontSize="small" /> Voltar ao login
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPasswordPage;
