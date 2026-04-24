import React, { useRef, useState } from 'react';
import {
  Alert, Avatar, Badge, Box, Button, Card, CardContent, Chip, CircularProgress,
  Divider, Grid, IconButton, InputAdornment, Tab, Tabs, TextField, Tooltip, Typography,
} from '@mui/material';
import {
  CameraAlt, GitHub, Language, LinkedIn, Lock, Person, Phone, Place, School,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../auth/AuthContext';
import { updateProfile, uploadAvatar } from '../../services/supabase/profiles';
import PageHeader from '../../components/common/PageHeader';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Nome obrigatório'),
  phone: z.string().optional().or(z.literal('')),
  bio: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  birth_date: z.string().optional().or(z.literal('')),
  linkedin_url: z.string().url('URL inválida').optional().or(z.literal('')),
  github_url: z.string().url('URL inválida').optional().or(z.literal('')),
  website_url: z.string().url('URL inválida').optional().or(z.literal('')),
});

type FormData = z.infer<typeof profileSchema>;

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
    {value === index && children}
  </Box>
);

const ProfilePage: React.FC = () => {
  const { profile, user, refreshProfile } = useAuth();
  const [tab, setTab] = useState(0);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
      bio: profile?.bio ?? '',
      location: profile?.location ?? '',
      birth_date: profile?.birth_date ?? '',
      linkedin_url: profile?.linkedin_url ?? '',
      github_url: profile?.github_url ?? '',
      website_url: profile?.website_url ?? '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    setSuccess('');
    try {
      await updateProfile(user!.id, {
        full_name: data.full_name,
        phone: data.phone || null,
        bio: data.bio || null,
        location: data.location || null,
        birth_date: data.birth_date || null,
        linkedin_url: data.linkedin_url || null,
        github_url: data.github_url || null,
        website_url: data.website_url || null,
      });
      await refreshProfile();
      setSuccess('Perfil atualizado com sucesso!');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar perfil');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Formato inválido. Use JPG, PNG ou WEBP.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 2MB.');
      return;
    }
    setAvatarLoading(true);
    setError('');
    setSuccess('');
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    try {
      const url = await uploadAvatar(user!.id, file);
      await updateProfile(user!.id, { avatar_url: url });
      await refreshProfile();
      setSuccess('Foto de perfil atualizada!');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar foto');
      setAvatarPreview(null);
    } finally {
      setAvatarLoading(false);
    }
  };

  const currentAvatar = avatarPreview ?? profile?.avatar_url ?? undefined;

  return (
    <Box>
      <PageHeader title="Meu Perfil" subtitle="Gerencie suas informações pessoais" />

      <Grid container spacing={3}>
        {/* Coluna esquerda — card de identidade */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ textAlign: 'center', p: 3 }}>
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Tooltip title="Alterar foto">
                    <IconButton
                      size="small"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarLoading}
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        width: 32,
                        height: 32,
                        '&:hover': { bgcolor: 'primary.dark' },
                      }}
                    >
                      {avatarLoading
                        ? <CircularProgress size={14} color="inherit" />
                        : <CameraAlt sx={{ fontSize: 16 }} />}
                    </IconButton>
                  </Tooltip>
                }
              >
                <Avatar
                  src={currentAvatar}
                  sx={{ width: 100, height: 100, bgcolor: 'primary.main', fontSize: 36, cursor: 'pointer' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {profile?.full_name?.[0]?.toUpperCase()}
                </Avatar>
              </Badge>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={handleAvatarChange}
              />
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 700 }}>{profile?.full_name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{user?.email}</Typography>
            <Chip label="Aluno" color="secondary" size="small" icon={<School sx={{ fontSize: 14 }} />} />

            {profile?.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 1.5 }}>
                <Place fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">{profile.location}</Typography>
              </Box>
            )}

            {profile?.bio && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>
                  {profile.bio}
                </Typography>
              </>
            )}

            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
              {profile?.linkedin_url && (
                <Tooltip title="LinkedIn">
                  <IconButton size="small" component="a" href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                    <LinkedIn fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {profile?.github_url && (
                <Tooltip title="GitHub">
                  <IconButton size="small" component="a" href={profile.github_url} target="_blank" rel="noopener noreferrer">
                    <GitHub fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {profile?.website_url && (
                <Tooltip title="Website">
                  <IconButton size="small" component="a" href={profile.website_url} target="_blank" rel="noopener noreferrer">
                    <Language fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.disabled">
              Membro desde {new Date(profile?.created_at ?? '').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </Typography>
          </Card>
        </Grid>

        {/* Coluna direita — formulário em abas */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card elevation={0}>
            <CardContent sx={{ p: 0 }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Tab label="Informações Pessoais" />
                <Tab label="Redes & Links" />
                <Tab label="Segurança" />
              </Tabs>

              <Box sx={{ px: 3, pb: 3 }}>
                {(success || error) && (
                  <Box sx={{ pt: 2 }}>
                    {success && <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>}
                    {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
                  </Box>
                )}

                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                  {/* Aba 0 — Informações Pessoais */}
                  <TabPanel value={tab} index={0}>
                    <Grid container spacing={2.5}>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label="Nome completo"
                          fullWidth
                          required
                          {...register('full_name')}
                          error={!!errors.full_name}
                          helperText={errors.full_name?.message}
                          slotProps={{
                            input: { startAdornment: <InputAdornment position="start"><Person fontSize="small" /></InputAdornment> },
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label="E-mail"
                          fullWidth
                          value={user?.email ?? ''}
                          disabled
                          slotProps={{
                            input: { startAdornment: <InputAdornment position="start"><Lock fontSize="small" /></InputAdornment> },
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Telefone"
                          fullWidth
                          placeholder="+55 (11) 91234-5678"
                          {...register('phone')}
                          error={!!errors.phone}
                          helperText={errors.phone?.message}
                          slotProps={{
                            input: { startAdornment: <InputAdornment position="start"><Phone fontSize="small" /></InputAdornment> },
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Data de nascimento"
                          fullWidth
                          type="date"
                          {...register('birth_date')}
                          error={!!errors.birth_date}
                          helperText={errors.birth_date?.message}
                          slotProps={{ inputLabel: { shrink: true } }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label="Localização"
                          fullWidth
                          placeholder="Ex: São Paulo, SP"
                          {...register('location')}
                          error={!!errors.location}
                          helperText={errors.location?.message}
                          slotProps={{
                            input: { startAdornment: <InputAdornment position="start"><Place fontSize="small" /></InputAdornment> },
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label="Sobre mim"
                          fullWidth
                          multiline
                          rows={4}
                          placeholder="Conte um pouco sobre você, seus interesses e objetivos de aprendizado..."
                          {...register('bio')}
                          error={!!errors.bio}
                          helperText={errors.bio?.message ?? `${0}/500`}
                        />
                      </Grid>
                    </Grid>
                  </TabPanel>

                  {/* Aba 1 — Redes & Links */}
                  <TabPanel value={tab} index={1}>
                    <Grid container spacing={2.5}>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label="LinkedIn"
                          fullWidth
                          placeholder="https://linkedin.com/in/seu-perfil"
                          {...register('linkedin_url')}
                          error={!!errors.linkedin_url}
                          helperText={errors.linkedin_url?.message}
                          slotProps={{
                            input: { startAdornment: <InputAdornment position="start"><LinkedIn fontSize="small" /></InputAdornment> },
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label="GitHub"
                          fullWidth
                          placeholder="https://github.com/seu-usuario"
                          {...register('github_url')}
                          error={!!errors.github_url}
                          helperText={errors.github_url?.message}
                          slotProps={{
                            input: { startAdornment: <InputAdornment position="start"><GitHub fontSize="small" /></InputAdornment> },
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label="Website / Portfólio"
                          fullWidth
                          placeholder="https://seu-site.com"
                          {...register('website_url')}
                          error={!!errors.website_url}
                          helperText={errors.website_url?.message}
                          slotProps={{
                            input: { startAdornment: <InputAdornment position="start"><Language fontSize="small" /></InputAdornment> },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </TabPanel>

                  {/* Aba 2 — Segurança */}
                  <TabPanel value={tab} index={2}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Alert severity="info">
                        A alteração de senha é feita pelo e-mail de redefinição enviado pelo sistema.
                      </Alert>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }} gutterBottom>E-mail da conta</Typography>
                        <TextField fullWidth value={user?.email ?? ''} disabled size="small" />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }} gutterBottom>Perfil de acesso</Typography>
                        <TextField fullWidth value="Aluno" disabled size="small" />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }} gutterBottom>Último acesso</Typography>
                        <TextField
                          fullWidth
                          value={user?.last_sign_in_at
                            ? new Date(user.last_sign_in_at).toLocaleString('pt-BR')
                            : '—'}
                          disabled
                          size="small"
                        />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }} gutterBottom>ID do usuário</Typography>
                        <TextField fullWidth value={user?.id ?? ''} disabled size="small" />
                      </Box>
                    </Box>
                  </TabPanel>

                  {tab < 2 && (
                    <Box sx={{ mt: 3 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
                      >
                        {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
