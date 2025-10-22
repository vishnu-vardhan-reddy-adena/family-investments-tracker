'use client';

import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useState } from 'react';

interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'user';
  created_at: string;
}

interface UserRoleManagerProps {
  users: User[];
  currentUserId: string;
}

export function UserRoleManager({ users, currentUserId }: UserRoleManagerProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleOpenDialog = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setError('');
    setSuccess('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setError('');
    setSuccess('');
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update role');
      }

      setSuccess('Role updated successfully!');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' ? '#FF6B6B' : '#4D79FF';
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? (
      <AdminPanelSettingsIcon sx={{ fontSize: 18 }} />
    ) : (
      <PersonIcon sx={{ fontSize: 18 }} />
    );
  };

  return (
    <>
      <Card
        sx={{
          borderRadius: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    background: 'linear-gradient(90deg, #4D79FF 0%, #1DD1A1 100%)',
                    '& th': {
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      fontFamily: 'Space Grotesk',
                      borderBottom: 'none',
                      py: 2,
                    },
                  }}
                >
                  <TableCell>Email</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user.id}
                    sx={{
                      '&:nth-of-type(odd)': {
                        bgcolor: 'action.hover',
                      },
                      '&:hover': {
                        bgcolor: 'action.selected',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{user.email}</TableCell>
                    <TableCell>{user.full_name || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getRoleIcon(user.role)}
                        label={user.role.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: `${getRoleColor(user.role)}20`,
                          color: getRoleColor(user.role),
                          fontWeight: 700,
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenDialog(user)}
                        disabled={user.id === currentUserId}
                        sx={{
                          borderRadius: '12px',
                          borderColor: '#4D79FF',
                          color: '#4D79FF',
                          textTransform: 'none',
                          '&:hover': {
                            borderColor: '#4D79FF',
                            background: '#4D79FF15',
                          },
                        }}
                      >
                        {user.id === currentUserId ? 'You' : 'Change Role'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {users.length === 0 && (
            <Box className="py-8 text-center">
              <Typography variant="h6" color="text.secondary">
                No users found
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Change Role Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #4D79FF 0%, #1DD1A1 100%)',
            color: 'white',
            fontWeight: 700,
          }}
        >
          Change User Role
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Typography variant="body1" className="mb-4">
            Change role for <strong>{selectedUser?.email}</strong>
          </Typography>

          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as 'admin' | 'user')}
              label="Role"
            >
              <MenuItem value="user">
                <Box className="flex items-center gap-2">
                  <PersonIcon sx={{ fontSize: 18 }} />
                  User (Limited Access)
                </Box>
              </MenuItem>
              <MenuItem value="admin">
                <Box className="flex items-center gap-2">
                  <AdminPanelSettingsIcon sx={{ fontSize: 18 }} />
                  Admin (Full Access)
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {newRole === 'admin' && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                background: 'linear-gradient(135deg, #FF6B6B15 0%, #FFD93D15 100%)',
                borderRadius: '12px',
                border: '2px solid #FF6B6B40',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#FF6B6B' }}>
                ⚠️ Warning: Admin Role
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Admins have full access to all data, users, and settings. Grant this role carefully.
              </Typography>
            </Box>
          )}

          {error && (
            <Typography color="error" variant="body2" className="mt-4">
              {error}
            </Typography>
          )}
          {success && (
            <Typography color="success.main" variant="body2" className="mt-4">
              {success}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleCloseDialog}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRoleChange}
            variant="contained"
            disabled={loading || newRole === selectedUser?.role}
            sx={{
              background: 'linear-gradient(135deg, #4D79FF 0%, #1DD1A1 100%)',
              color: 'white',
              borderRadius: '12px',
              textTransform: 'none',
              px: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #3D69EF 0%, #0DC191 100%)',
              },
            }}
          >
            {loading ? 'Updating...' : 'Update Role'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
