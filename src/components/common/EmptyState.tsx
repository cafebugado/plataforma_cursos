import React from 'react';
import { Box, Button, Typography } from '@mui/material';

interface Props {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<Props> = ({ icon, title, description, actionLabel, onAction }) => (
  <Box sx={{ textAlign: 'center', py: 8, px: 4 }}>
    {icon && (
      <Box sx={{ color: 'text.disabled', mb: 2, '& svg': { fontSize: 64 } }}>{icon}</Box>
    )}
    <Typography variant="h6" sx={{ fontWeight: 600 }} color="text.primary">{title}</Typography>
    {description && (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 400, mx: 'auto' }}>
        {description}
      </Typography>
    )}
    {actionLabel && onAction && (
      <Button variant="contained" sx={{ mt: 3 }} onClick={onAction}>{actionLabel}</Button>
    )}
  </Box>
);

export default EmptyState;
