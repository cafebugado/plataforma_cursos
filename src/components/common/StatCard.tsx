import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
}

const StatCard: React.FC<Props> = ({ title, value, subtitle, icon, color = 'primary.main' }) => (
  <Card elevation={0}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>{title}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>{value}</Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>
          )}
        </Box>
        <Box sx={{ bgcolor: color, borderRadius: 3, p: 1.5, opacity: 0.9 }}>
          <Box sx={{ color: 'white', display: 'flex' }}>{icon}</Box>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default StatCard;
