import React, { useRef, useState } from 'react';
import {
  Box, Button, Tab, Tabs, TextField, Typography,
  CircularProgress, IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import LinkIcon from '@mui/icons-material/Link';

interface Props {
  value: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<string>;
  error?: string;
}

const ACCEPTED = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_MB = 5;

const ThumbnailUpload: React.FC<Props> = ({ value, onChange, onUpload, error }) => {
  const [tab, setTab] = useState<0 | 1>(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [preview, setPreview] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > MAX_MB * 1024 * 1024) {
      setUploadError(`Arquivo muito grande. Máximo ${MAX_MB} MB.`);
      return;
    }
    setUploadError('');
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const url = await onUpload(file);
      onChange(url);
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : 'Erro ao fazer upload.');
      setPreview('');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    onChange('');
    setPreview('');
    setUploadError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const displayImage = preview || value;

  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab icon={<LinkIcon fontSize="small" />} iconPosition="start" label="URL" />
        <Tab icon={<UploadFileIcon fontSize="small" />} iconPosition="start" label="Arquivo" />
      </Tabs>

      {tab === 0 && (
        <TextField
          label="URL da capa (opcional)"
          fullWidth
          value={value}
          onChange={(e) => onChange(e.target.value)}
          error={!!error}
          helperText={error}
          placeholder="https://exemplo.com/imagem.jpg"
        />
      )}

      {tab === 1 && (
        <Box>
          <Box
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => !uploading && inputRef.current?.click()}
            sx={{
              border: '2px dashed',
              borderColor: uploadError ? 'error.main' : 'divider',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              cursor: uploading ? 'not-allowed' : 'pointer',
              bgcolor: 'action.hover',
              transition: 'border-color 0.2s',
              '&:hover': { borderColor: uploading ? 'divider' : 'primary.main' },
            }}
          >
            {uploading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={32} />
                <Typography variant="body2" color="text.secondary">Enviando...</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <UploadFileIcon color="action" fontSize="large" />
                <Typography variant="body2" color="text.secondary">
                  Arraste uma imagem aqui ou <strong>clique para selecionar</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  JPG, PNG, WEBP ou GIF · máx. {MAX_MB} MB
                </Typography>
              </Box>
            )}
          </Box>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          {uploadError && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
              {uploadError}
            </Typography>
          )}
        </Box>
      )}

      {displayImage && (
        <Box sx={{ mt: 2, position: 'relative', display: 'inline-block' }}>
          <Box
            component="img"
            src={displayImage}
            alt="Preview da capa"
            sx={{ height: 140, borderRadius: 2, objectFit: 'cover', display: 'block', maxWidth: '100%' }}
            onError={() => setPreview('')}
          />
          <IconButton
            size="small"
            onClick={handleClear}
            sx={{
              position: 'absolute', top: 4, right: 4,
              bgcolor: 'rgba(0,0,0,0.55)', color: 'white',
              '&:hover': { bgcolor: 'error.main' },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {!displayImage && value === '' && tab === 0 && (
        <Button
          size="small"
          startIcon={<UploadFileIcon />}
          onClick={() => setTab(1)}
          sx={{ mt: 1 }}
        >
          Ou envie um arquivo
        </Button>
      )}
    </Box>
  );
};

export default ThumbnailUpload;
