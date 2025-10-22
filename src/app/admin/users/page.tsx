import { Navbar } from '@/components/Navbar';
import { UserRoleManager } from '@/components/admin/UserRoleManager';
import { requireAdmin } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';
import PeopleIcon from '@mui/icons-material/People';
import { Box, Typography } from '@mui/material';
import { redirect } from 'next/navigation';

export default async function AdminUsersPage() {
  // Require admin role
  try {
    await requireAdmin();
  } catch (error) {
    redirect('/dashboard');
  }

  const supabase = await createClient();

  // Fetch all users
  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at, updated_at')
    .order('created_at', { ascending: false });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id).single();

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0F1419]">
      <Navbar
        user={{
          email: user?.email,
          full_name: profile?.full_name,
          avatar_url: profile?.avatar_url,
          role: profile?.role,
        }}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <Box className="mb-8">
          <Box className="mb-4 flex items-center gap-3">
            <PeopleIcon sx={{ fontSize: 40, color: '#4D79FF' }} />
            <Typography
              variant="h3"
              className="font-['Space_Grotesk'] font-bold"
              sx={{
                background: 'linear-gradient(90deg, #4D79FF 0%, #1DD1A1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              User Management
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Manage user roles and permissions
          </Typography>
        </Box>

        {/* User Role Manager */}
        <UserRoleManager users={users || []} currentUserId={user?.id || ''} />
      </main>
    </div>
  );
}
