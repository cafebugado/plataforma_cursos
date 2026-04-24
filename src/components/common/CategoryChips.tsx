import React from 'react';
import { Box, Chip } from '@mui/material';

interface Props {
  category: string;
  size?: 'small' | 'medium';
}

export const parseCategories = (category: string): string[] =>
  category.split(',').map((c) => c.trim()).filter(Boolean);

const CategoryChips: React.FC<Props> = ({ category, size = 'small' }) => (
  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
    {parseCategories(category).map((cat) => (
      <Chip key={cat} label={cat} size={size} variant="outlined" />
    ))}
  </Box>
);

export default CategoryChips;
