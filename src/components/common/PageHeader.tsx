import React from 'react';
import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { NavigateNext } from '@mui/icons-material';

interface Breadcrumb {
  label: string;
  to?: string;
}

interface Props {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  action?: React.ReactNode;
}

const PageHeader: React.FC<Props> = ({ title, subtitle, breadcrumbs, action }) => (
  <Box sx={{ mb: 4 }}>
    {breadcrumbs && breadcrumbs.length > 0 && (
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 1 }}>
        {breadcrumbs.map((crumb, i) =>
          crumb.to ? (
            <Link key={i} component={RouterLink} to={crumb.to} color="text.secondary" underline="hover" variant="body2">
              {crumb.label}
            </Link>
          ) : (
            <Typography key={i} variant="body2" color="text.primary">{crumb.label}</Typography>
          )
        )}
      </Breadcrumbs>
    )}
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>{title}</Typography>
        {subtitle && (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>
        )}
      </Box>
      {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </Box>
  </Box>
);

export default PageHeader;
