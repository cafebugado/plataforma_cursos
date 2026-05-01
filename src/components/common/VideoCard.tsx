import React from 'react';
import { Box, Card, CardActionArea, CardContent, CardMedia, Chip, Tooltip, Typography } from '@mui/material';
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

  const card = (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: isCurrent ? 'primary.main' : isLocked ? 'divider' : 'divider',
        transition: 'border-color 0.2s',
        bgcolor: isLocked ? 'action.hover' : 'background.paper',
      }}
    >
      <CardActionArea onClick={isLocked ? undefined : onClick} disabled={isLocked} sx={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5, gap: 2, minWidth: 0, overflow: 'hidden' }}>
          <Box sx={{ position: 'relative', flexShrink: 0, width: 120, height: 68, borderRadius: 1, overflow: 'hidden' }}>
            <CardMedia
              component="img"
              image={thumbnail}
              alt={video.title}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', filter: isLocked ? 'grayscale(60%) brightness(0.7)' : 'none' }}
            />
            <Box sx={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: isLocked ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.3)',
            }}>
              {isLocked ? (
                <Lock sx={{ color: 'white', fontSize: 22 }} />
              ) : isCompleted ? (
                <CheckCircle sx={{ color: 'success.light', fontSize: 22 }} />
              ) : (
                <PlayCircle sx={{ color: 'white', fontSize: 22 }} />
              )}
            </Box>
          </Box>
          <CardContent sx={{ p: '0 !important', flexGrow: 1, minWidth: 0, overflow: 'hidden' }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: isCurrent ? 600 : 400,
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                color: isLocked ? 'text.disabled' : 'text.primary',
              }}
            >
              {video.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
              {isCurrent && <Chip label="Assistindo" size="small" color="primary" />}
              {isCompleted && !isCurrent && <Chip label="Concluída" size="small" color="success" />}
              {isLocked && (
                <Chip
                  icon={<Lock sx={{ fontSize: '12px !important' }} />}
                  label="Assista a aula anterior"
                  size="small"
                  variant="outlined"
                  sx={{ color: 'text.disabled', borderColor: 'divider', fontSize: '0.7rem' }}
                />
              )}
              {!isLocked && video.is_preview && <Chip label="Preview" size="small" variant="outlined" />}
            </Box>
          </CardContent>
        </Box>
      </CardActionArea>
    </Card>
  );

  if (isLocked) {
    return (
      <Tooltip title="Complete a aula anterior para desbloquear" placement="left" arrow>
        <span>{card}</span>
      </Tooltip>
    );
  }

  return card;
};

export default VideoCard;
