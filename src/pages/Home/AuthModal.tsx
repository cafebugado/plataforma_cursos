import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import {
  Close as CloseIcon,
  SchoolRounded as StudentIcon,
  AdminPanelSettingsRounded as AdminIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

type ModalMode = 'login' | 'register' | null;

interface AuthModalProps {
  mode: ModalMode;
  onClose: () => void;
}

interface ProfileOption {
  icon: React.ElementType;
  label: string;
  description: string;
  loginRoute: string;
  registerRoute: string;
  accent: string;
  bg: string;
}

const PROFILES: ProfileOption[] = [
  {
    icon: StudentIcon,
    label: 'Aluno',
    description: 'Quero aprender e evoluir',
    loginRoute: '/auth/login',
    registerRoute: '/auth/register',
    accent: '#6C63FF',
    bg: 'rgba(108,99,255,0.06)',
  },
  {
    icon: AdminIcon,
    label: 'Instrutor',
    description: 'Quero criar e gerenciar cursos',
    loginRoute: '/auth/login',
    registerRoute: '/auth/login',
    accent: '#FF6584',
    bg: 'rgba(255,101,132,0.06)',
  },
];

const AuthModal: React.FC<AuthModalProps> = ({ mode, onClose }) => {
  const navigate = useNavigate();

  const handleSelect = (profile: ProfileOption) => {
    onClose();
    const route = mode === 'login' ? profile.loginRoute : profile.registerRoute;
    navigate(route);
  };

  const title = mode === 'login' ? 'Como você quer entrar?' : 'Como você quer se cadastrar?';

  return (
    <Dialog
      open={mode !== null}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: { xs: 1, sm: 2 },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Escolha seu perfil para continuar
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2.5 }}>
          {PROFILES.map((profile) => {
            const Icon = profile.icon;
            return (
              <Box
                key={profile.label}
                onClick={() => handleSelect(profile)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSelect(profile)}
                sx={{
                  flex: 1,
                  p: 3.5,
                  borderRadius: 3,
                  border: '1.5px solid',
                  borderColor: 'divider',
                  bgcolor: profile.bg,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
                  outline: 'none',
                  '&:hover': {
                    borderColor: profile.accent,
                    boxShadow: `0 4px 20px ${profile.accent}20`,
                    transform: 'translateY(-2px)',
                  },
                  '&:active': { transform: 'translateY(0)' },
                  '&:focus-visible': {
                    borderColor: profile.accent,
                    boxShadow: `0 0 0 3px ${profile.accent}30`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 3,
                    bgcolor: profile.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2.5,
                  }}
                >
                  <Icon sx={{ color: 'white', fontSize: 32 }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ color: 'text.primary', fontWeight: 700, mb: 0.75 }}
                >
                  {profile.label}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {profile.description}
                </Typography>
              </Box>
            );
          })}
        </Box>

        <Button
          fullWidth
          onClick={onClose}
          sx={{
            mt: 3,
            color: 'text.secondary',
            fontWeight: 500,
            '&:hover': { bgcolor: 'transparent', color: 'text.primary' },
          }}
        >
          Cancelar
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export type { ModalMode };
export default AuthModal;
