import React, { useState } from 'react';
import { Outlet, useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar, Avatar, Box, Button, Container, CssBaseline, Divider, Drawer,
  IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Menu, MenuItem, Toolbar, Typography,
} from '@mui/material';
import {
  School, Dashboard, MenuBook, TrendingUp, AccountCircle, Logout,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useAuth } from '../../features/auth/AuthContext';
import { signOut } from '../../services/supabase/auth';

const navItems = [
  { label: 'Dashboard', icon: <Dashboard />, to: '/app' },
  { label: 'Cursos', icon: <MenuBook />, to: '/app/courses' },
  { label: 'Meu Progresso', icon: <TrendingUp />, to: '/app/progress' },
];

const StudentShell: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth/login');
  };

  const drawer = (
    <Box>
      <Toolbar sx={{ px: 2, gap: 1 }}>
        <Box sx={{ bgcolor: 'primary.main', borderRadius: 2, p: 0.75 }}>
          <School sx={{ color: 'white', fontSize: 20 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }} color="primary">EduPlatform</Typography>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1, py: 1 }}>
        {navItems.map((item) => {
          const active = item.to === '/app'
            ? location.pathname === '/app'
            : location.pathname.startsWith(item.to);
          return (
            <ListItem key={item.to} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={RouterLink}
                to={item.to}
                selected={active}
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '& .MuiListItemIcon-root': { color: 'white' },
                    '&:hover': { bgcolor: 'primary.dark' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} slotProps={{ primary: { style: { fontSize: 14 } } }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton edge="start" sx={{ mr: 2, display: { sm: 'none' } }} onClick={() => setMobileOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1, mr: 4 }}>
            <Box sx={{ bgcolor: 'primary.main', borderRadius: 2, p: 0.75 }}>
              <School sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }} color="primary">EduPlatform</Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, flexGrow: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.to}
                component={RouterLink}
                to={item.to}
                color="inherit"
                size="small"
                sx={{ fontWeight: location.pathname.startsWith(item.to) ? 700 : 400 }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
          <Box sx={{ flexGrow: { xs: 1, sm: 0 } }} />
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
              {profile?.full_name?.[0] ?? 'U'}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/app/profile'); }}>
              <AccountCircle fontSize="small" sx={{ mr: 1 }} /> Perfil
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout fontSize="small" sx={{ mr: 1 }} /> Sair
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ display: { xs: 'block', sm: 'none' } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{ '& .MuiDrawer-paper': { width: 260 } }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default StudentShell;
