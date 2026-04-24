import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from '../../features/auth/AuthContext';
import Navbar from './Navbar';
import Hero from './Hero';
import HowItWorks from './HowItWorks';
import ForWho from './ForWho';
import Footer from './Footer';
import AuthModal, { type ModalMode } from './AuthModal';

const HomePage: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [modalMode, setModalMode] = useState<ModalMode>(null);

  if (loading) return null;

  if (user) {
    const dest = profile?.role === 'admin' ? '/admin' : '/app';
    return <Navigate to={dest} replace />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar
        onEnter={() => setModalMode('login')}
        onRegister={() => setModalMode('register')}
      />

      <main>
        <Hero
          onLearn={() => setModalMode('register')}
          onTeach={() => setModalMode('login')}
        />
        <HowItWorks />
        <ForWho />
      </main>

      <Footer />

      <AuthModal mode={modalMode} onClose={() => setModalMode(null)} />
    </Box>
  );
};

export default HomePage;
