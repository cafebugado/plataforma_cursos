import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box } from '@mui/material';

const AuthTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [key, setKey] = useState(location.pathname);

  const isLogin = location.pathname === '/auth/login';

  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => {
      setKey(location.pathname);
      setVisible(true);
    }, 60);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <Box
      key={key}
      sx={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? 'translateX(0)'
          : isLogin
            ? 'translateX(-32px)'
            : 'translateX(32px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
        minHeight: '100vh',
      }}
    >
      {children}
    </Box>
  );
};

export default AuthTransition;
