import React from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from '@mui/material';

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  danger?: boolean;
}

const ConfirmDialog: React.FC<Props> = ({
  open, title, description, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar',
  onConfirm, onCancel, loading, danger,
}) => (
  <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{description}</DialogContentText>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 3 }}>
      <Button onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
      <Button
        onClick={onConfirm}
        variant="contained"
        color={danger ? 'error' : 'primary'}
        disabled={loading}
      >
        {loading ? 'Aguarde...' : confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
