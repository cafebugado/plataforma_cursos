import React from 'react';
import { Box, Card, CardActionArea, CardContent, CardMedia, Chip, Typography } from '@mui/material';
import { CheckCircle, PlayCircle, Lock } from '@mui/icons-material';
import type { Video } from '../../types';

interface Props {
  video: Video;
  isCompleted?: boolean;
  isLocked?: boolean;
  isCurrent?: boolean;
  onClick?: () => void;
}

const VideoCard: React.FC<Props> = ({ video, isCompleted, isLocked, isCurrent, onClick }) => {
  const thumbnail = video.thumbnail_url ?? `https://img.youtube.com/vi/${video.youtube_video_id}/mqdefault.jpg`;

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: isCurrent ? 'primary.main' : 'divider',
        opacity: isLocked ? 0.6 : 1,
        transition: 'border-color 0.2s',
      }}
    >
      <CardActionArea onClick={isLocked ? undefined : onClick} disabled={isLocked}>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5, gap: 2 }}>
          <Box sx={{ position: 'relative', flexShrink: 0, width: 120, height: 68, borderRadius: 1, overflow: 'hidden' }}>
            <CardMedia
              component="img"
              image={thumbnail}
              alt={video.title}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <Box sx={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: 'rgba(0,0,0,0.3)',
            }}>
              {isLocked ? (
                <Lock sx={{ color: 'white', fontSize: 20 }} />
              ) : isCompleted ? (
                <CheckCircle sx={{ color: 'success.light', fontSize: 20 }} />
              ) : (
                <PlayCircle sx={{ color: 'white', fontSize: 20 }} />
              )}
            </Box>
          </Box>
          <CardContent sx={{ p: '0 !important', flexGrow: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: isCurrent ? 600 : 400 }} noWrap>
              {video.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
              {isCurrent && <Chip label="Assistindo" size="small" color="primary" />}
              {isCompleted && <Chip label="Concluída" size="small" color="success" />}
              {video.is_preview && <Chip label="Preview" size="small" variant="outlined" />}
            </Box>
          </CardContent>
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default VideoCard;
