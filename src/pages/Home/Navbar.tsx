import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import { Menu as MenuIcon, Close as CloseIcon, School as SchoolIcon } from '@mui/icons-material';

interface NavbarProps {
  onEnter: () => void;
  onRegister: () => void;
}

const NAV_LINKS = [
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Para quem é', href: '#para-quem' },
];

const Navbar: React.FC<NavbarProps> = ({ onEnter, onRegister }) => {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleNavClick = (href: string) => {
    setDrawerOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: scrolled ? '1px solid' : '1px solid transparent',
          borderColor: scrolled ? 'divider' : 'transparent',
          boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,0.06)' : 'none',
          transition: 'box-shadow 0.2s, border-color 0.2s',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ py: 1, gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
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
              <Typography variant="h6" sx={{ color: 'text.primary', letterSpacing: '-0.02em' }}>
                Edu<Box component="span" sx={{ color: 'primary.main' }}>Platform</Box>
              </Typography>
            </Box>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, alignItems: 'center' }}>
              {NAV_LINKS.map((link) => (
                <Button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 500,
                    px: 2,
                    '&:hover': { color: 'primary.main', bgcolor: 'transparent' },
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Box>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1.5 }}>
              <Button variant="outlined" color="primary" onClick={onEnter} sx={{ fontWeight: 600 }}>
                Entrar
              </Button>
              <Button variant="contained" color="primary" onClick={onRegister} sx={{ fontWeight: 600 }}>
                Cadastrar
              </Button>
            </Box>

            <IconButton
              sx={{ display: { xs: 'flex', md: 'none' }, color: 'text.primary' }}
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{ paper: { sx: { width: 280, p: 3 } } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1.5,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SchoolIcon sx={{ color: 'white', fontSize: 16 }} />
            </Box>
            <Typography variant="h6" sx={{ color: 'text.primary' }}>
              EduPlatform
            </Typography>
          </Box>
          <IconButton onClick={() => setDrawerOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <List disablePadding sx={{ mb: 3 }}>
          {NAV_LINKS.map((link) => (
            <ListItemButton
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemText
                primary={link.label}
                slotProps={{ primary: { sx: { fontWeight: 500, color: 'text.secondary' } } }}
              />
            </ListItemButton>
          ))}
        </List>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={() => { setDrawerOpen(false); onEnter(); }}
            sx={{ fontWeight: 600 }}
          >
            Entrar
          </Button>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => { setDrawerOpen(false); onRegister(); }}
            sx={{ fontWeight: 600 }}
          >
            Cadastrar
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
