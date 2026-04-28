import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from '../../features/auth/AuthContext';
import Navbar from './Navbar';
import Hero from './Hero';
import HowItWorks from './HowItWorks';
import ForWho from './ForWho';
import Footer from './Footer';

const HomePage: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;

  if (user) {
    const dest = profile?.role === 'admin' ? '/admin' : '/app';
    return <Navigate to={dest} replace />;
  }

  const goToRegister = () => navigate('/auth/register');
  const goToLogin = () => navigate('/auth/login');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar
        onEnter={goToLogin}
        onRegister={goToRegister}
      />

      <main>
        <Hero
          onLearn={goToRegister}
          onTeach={goToLogin}
        />
        <HowItWorks />
        <ForWho />
      </main>

      <Footer />
    </Box>
  );
};

export default HomePage;
