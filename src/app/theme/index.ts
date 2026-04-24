import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6C63FF',
      light: '#9D97FF',
      dark: '#4B44CC',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF6584',
      light: '#FF96AB',
      dark: '#CC3D5F',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#2ECC71',
      light: '#5DDEAA',
      dark: '#1A9E52',
    },
    warning: {
      main: '#F39C12',
      light: '#F7BC54',
      dark: '#C47D0E',
    },
    error: {
      main: '#E74C3C',
      light: '#EE7568',
      dark: '#C0392B',
    },
    info: {
      main: '#3498DB',
      light: '#63B1E5',
      dark: '#2172B0',
    },
    background: {
      default: '#F8F9FC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1D2E',
      secondary: '#6B7080',
    },
    divider: '#E8EAEF',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.3 },
    h3: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.3 },
    h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
    h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 },
    subtitle1: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.5 },
    subtitle2: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.5 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
    button: { fontSize: '0.875rem', fontWeight: 600, textTransform: 'none' },
    caption: { fontSize: '0.75rem', lineHeight: 1.5 },
  },
  spacing: 4,
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        contained: {
          '&:hover': { boxShadow: '0 4px 12px rgba(108,99,255,0.3)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          border: '1px solid #E8EAEF',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6 },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
  },
});

export default theme;
