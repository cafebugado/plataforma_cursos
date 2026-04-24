import React, { useState } from 'react';
import { Box, Button, Chip, Collapse, Divider, Paper, Typography } from '@mui/material';
import { AutoAwesome, ExpandMore, ExpandLess } from '@mui/icons-material';
import type { VideoSummary } from '../../types';

interface Props {
  summary: VideoSummary;
}

const SummaryPanel: React.FC<Props> = ({ summary }) => {
  const [expanded, setExpanded] = useState(false);
  const bullets = Array.isArray(summary.bullets) ? summary.bullets as string[] : [];

  return (
    <Paper
      elevation={0}
      sx={{ p: 3, border: '1px solid', borderColor: 'primary.light', bgcolor: 'primary.50', borderRadius: 3, mb: 3 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <AutoAwesome color="primary" fontSize="small" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }} color="primary">Resumo gerado por IA</Typography>
        <Chip label={summary.model_name} size="small" variant="outlined" color="primary" sx={{ ml: 'auto' }} />
      </Box>

      <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.8 }}>
        {summary.summary_text}
      </Typography>

      {bullets.length > 0 && (
        <>
          <Button
            size="small"
            endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
            onClick={() => setExpanded(!expanded)}
            sx={{ mt: 1.5 }}
          >
            {expanded ? 'Ocultar tópicos' : `Ver ${bullets.length} tópicos principais`}
          </Button>
          <Collapse in={expanded}>
            <Divider sx={{ my: 1.5 }} />
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {bullets.map((bullet, i) => (
                <Box component="li" key={i} sx={{ mb: 0.5 }}>
                  <Typography variant="body2">{bullet}</Typography>
                </Box>
              ))}
            </Box>
          </Collapse>
        </>
      )}
    </Paper>
  );
};

export default SummaryPanel;
