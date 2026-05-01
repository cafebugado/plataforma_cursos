import React, { useState } from 'react';
import { Box, Button, Chip, Collapse, Divider, Paper, Typography } from '@mui/material';
import { AutoAwesome, ExpandMore, ExpandLess } from '@mui/icons-material';
import type { VideoSummary } from '../../types';

interface Props {
  summary: VideoSummary;
}

function parseSummaryText(raw: string): { text: string; bullets: string[] } {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        text: parsed.summary_text ?? raw,
        bullets: Array.isArray(parsed.bullets) ? parsed.bullets : [],
      };
    }
  } catch {
    // not JSON, use as-is
  }
  return { text: raw, bullets: [] };
}

const SummaryPanel: React.FC<Props> = ({ summary }) => {
  const [expanded, setExpanded] = useState(false);

  const isRawJson = summary.summary_text?.trimStart().startsWith('{');
  const { text, bullets: parsedBullets } = isRawJson
    ? parseSummaryText(summary.summary_text)
    : { text: summary.summary_text, bullets: [] };

  const bullets = Array.isArray(summary.bullets) && summary.bullets.length > 0
    ? summary.bullets as string[]
    : parsedBullets;

  return (
    <Paper
      elevation={0}
      sx={{ p: 3, border: '1px solid', borderColor: 'primary.light', bgcolor: 'primary.50', borderRadius: 3, mb: 3 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <AutoAwesome color="primary" fontSize="small" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }} color="primary">
          Resumo gerado por IA
        </Typography>
        <Chip label={summary.model_name} size="small" variant="outlined" color="primary" sx={{ ml: 'auto' }} />
      </Box>

      <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
        {text}
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
