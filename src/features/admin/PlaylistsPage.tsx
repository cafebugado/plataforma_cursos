import React from 'react';
import { Box } from '@mui/material';
import { PlaylistPlay } from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';

const PlaylistsPage: React.FC = () => (
  <Box>
    <PageHeader
      title="Playlists"
      subtitle="Agrupe vídeos em playlists por módulo"
      breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Playlists' }]}
    />
    <EmptyState
      icon={<PlaylistPlay />}
      title="Em breve"
      description="O gerenciamento de playlists estará disponível em breve."
    />
  </Box>
);

export default PlaylistsPage;
