import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Avatar, Box, Card, Chip, CircularProgress, MenuItem,
  Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import { People } from '@mui/icons-material';
import { supabase } from '../../services/supabase/client';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

type UserRow = { id: string; full_name: string; avatar_url: string | null; role: string; created_at: string };

const UsersPage: React.FC = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await db
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as UserRow[];
    },
  });

  const toggleRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const { error } = await db
        .from('profiles')
        .update({ role })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const filtered = (users ?? []).filter((u) =>
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <PageHeader
        title="Usuários"
        subtitle="Gerencie os usuários da plataforma"
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Usuários' }]}
      />

      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ width: 320 }}
        />
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : !filtered.length ? (
        <EmptyState icon={<People />} title="Nenhum usuário encontrado" description="Tente outro termo de busca." />
      ) : (
        <Card elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Usuário</TableCell>
                <TableCell>Perfil</TableCell>
                <TableCell>Cadastro</TableCell>
                <TableCell align="right">Ação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={u.avatar_url ?? undefined} sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}>
                        {u.full_name?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{u.full_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{u.id.slice(0, 8)}...</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={u.role === 'admin' ? 'Admin' : 'Aluno'}
                      size="small"
                      color={u.role === 'admin' ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={u.role === 'admin' ? 'Rebaixar para aluno' : 'Promover para admin'}>
                      <TextField
                        select
                        size="small"
                        value={u.role}
                        onChange={(e) => toggleRoleMutation.mutate({ id: u.id, role: e.target.value })}
                        sx={{ width: 130 }}
                      >
                        <MenuItem value="student">Aluno</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                      </TextField>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </Box>
  );
};

export default UsersPage;
