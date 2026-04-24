import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  AppBar, Box, CssBaseline, Divider, Drawer, IconButton, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Avatar,
  Menu, MenuItem, Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard, School, ViewModule, PlaylistPlay,
  VideoLibrary, Quiz, People, BarChart, Logout, AccountCircle, ChevronLeft,
} from '@mui/icons-material';
import { useAuth } from '../../features/auth/AuthContext';
import { signOut } from '../../services/supabase/auth';

const DRAWER_WIDTH = 260;

const navItems = [
  { label: 'Dashboard', icon: <Dashboard />, to: '/admin' },
  { label: 'Cursos', icon: <School />, to: '/admin/courses' },
  { label: 'Módulos', icon: <ViewModule />, to: '/admin/modules' },
  { label: 'Playlists', icon: <PlaylistPlay />, to: '/admin/playlists' },
  { label: 'Vídeos', icon: <VideoLibrary />, to: '/admin/videos' },
  { label: 'Quizzes', icon: <Quiz />, to: '/admin/quizzes' },
  { label: 'Usuários', icon: <People />, to: '/admin/users' },
  { label: 'Relatórios', icon: <BarChart />, to: '/admin/reports' },
];

const AdminShell: React.FC = () => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: open ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
          ml: open ? `${DRAWER_WIDTH}px` : 0,
          transition: 'width 0.2s, margin 0.2s',
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
        }}
      >
        <Toolbar>
          <IconButton edge="start" onClick={() => setOpen(!open)} sx={{ mr: 2 }}>
            {open ? <ChevronLeft /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
            {navItems.find((n) => location.pathname.startsWith(n.to) && n.to !== '/admin')?.label ??
              (location.pathname === '/admin' ? 'Dashboard' : 'Admin')}
          </Typography>
          <Tooltip title="Minha conta">
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                {profile?.full_name?.[0] ?? 'A'}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/admin/profile'); }}>
              <AccountCircle fontSize="small" sx={{ mr: 1 }} /> Perfil
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout fontSize="small" sx={{ mr: 1 }} /> Sair
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="persistent"
        open={open}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <Toolbar sx={{ px: 2, gap: 1 }}>
          <Box sx={{ bgcolor: 'primary.main', borderRadius: 2, p: 0.75 }}>
            <School sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }} color="primary">
            LMS Admin
          </Typography>
        </Toolbar>
        <Divider />
        <List sx={{ px: 1, py: 1 }}>
          {navItems.map((item) => {
            const active =
              item.to === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.to);
            return (
              <ListItem key={item.to} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={RouterLink}
                  to={item.to}
                  selected={active}
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
                  <ListItemText primary={item.label} slotProps={{ primary: { style: { fontSize: 14, fontWeight: active ? 600 : 400 } } }} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          minHeight: '100vh',
          bgcolor: 'background.default',
          transition: 'margin 0.2s',
          ml: open ? 0 : `-${DRAWER_WIDTH}px`,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminShell;
