import { Navbar } from '@/components/Navbar';
import { requireAdmin } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
  // Require admin role
  try {
    await requireAdmin();
  } catch (error) {
    redirect('/dashboard');
  }

  const supabase = await createClient();

  // Fetch admin dashboard stats
  const { data: stats } = await supabase.from('admin_dashboard_stats').select('*').single();

  // Fetch recent users
  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  // Fetch recent audit logs
  const { data: recentAudits } = await supabase
    .from('audit_logs')
    .select('*, profiles(email, full_name)')
    .order('created_at', { ascending: false })
    .limit(20);

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
            <AdminPanelSettingsIcon sx={{ fontSize: 40, color: '#FF6B6B' }} />
            <Typography
              variant="h3"
              className="font-['Space_Grotesk'] font-bold"
              sx={{
                background: 'linear-gradient(90deg, #FF6B6B 0%, #FFD93D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Admin Dashboard
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            System overview and management
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} className="mb-8">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #4D79FF15 0%, #1DD1A115 100%)',
                border: '2px solid #4D79FF40',
                borderRadius: '20px',
              }}
            >
              <CardContent>
                <Box className="flex items-center justify-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary" className="mb-1">
                      Total Users
                    </Typography>
                    <Typography
                      variant="h4"
                      className="font-['Space_Grotesk'] font-bold"
                      sx={{ color: '#4D79FF' }}
                    >
                      {stats?.total_users || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      +{stats?.new_users_30d || 0} this month
                    </Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: 48, color: '#4D79FF', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #1DD1A115 0%, #34D39915 100%)',
                border: '2px solid #1DD1A140',
                borderRadius: '20px',
              }}
            >
              <CardContent>
                <Box className="flex items-center justify-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary" className="mb-1">
                      Total Portfolios
                    </Typography>
                    <Typography
                      variant="h4"
                      className="font-['Space_Grotesk'] font-bold"
                      sx={{ color: '#1DD1A1' }}
                    >
                      {stats?.total_portfolios || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Active portfolios
                    </Typography>
                  </Box>
                  <AssessmentIcon sx={{ fontSize: 48, color: '#1DD1A1', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #FF6B6B15 0%, #FFD93D15 100%)',
                border: '2px solid #FF6B6B40',
                borderRadius: '20px',
              }}
            >
              <CardContent>
                <Box className="flex items-center justify-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary" className="mb-1">
                      Total Investments
                    </Typography>
                    <Typography
                      variant="h4"
                      className="font-['Space_Grotesk'] font-bold"
                      sx={{ color: '#FF6B6B' }}
                    >
                      {stats?.total_investments || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Across all users
                    </Typography>
                  </Box>
                  <ShowChartIcon sx={{ fontSize: 48, color: '#FF6B6B', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #FFD93D15 0%, #4D79FF15 100%)',
                border: '2px solid #FFD93D40',
                borderRadius: '20px',
              }}
            >
              <CardContent>
                <Box className="flex items-center justify-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary" className="mb-1">
                      Total Value
                    </Typography>
                    <Typography
                      variant="h4"
                      className="font-['Space_Grotesk'] font-bold"
                      sx={{ color: '#FFD93D' }}
                    >
                      ₹{((stats?.total_portfolio_value || 0) / 10000).toFixed(1)}L
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Platform AUM
                    </Typography>
                  </Box>
                  <AdminPanelSettingsIcon sx={{ fontSize: 48, color: '#FFD93D', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Users */}
        <Box className="mb-8">
          <Typography variant="h5" className="mb-4 font-['Space_Grotesk'] font-bold">
            Recent Users
          </Typography>
          <Card
            sx={{
              borderRadius: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            }}
          >
            <CardContent>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #4D79FF40' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers?.map((user) => (
                      <tr
                        key={user.id}
                        style={{
                          borderBottom: '1px solid rgba(0,0,0,0.05)',
                        }}
                      >
                        <td style={{ padding: '12px' }}>{user.email}</td>
                        <td style={{ padding: '12px' }}>{user.full_name || '-'}</td>
                        <td style={{ padding: '12px' }}>
                          <span
                            style={{
                              padding: '4px 12px',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              backgroundColor: user.role === 'admin' ? '#FF6B6B20' : '#4D79FF20',
                              color: user.role === 'admin' ? '#FF6B6B' : '#4D79FF',
                            }}
                          >
                            {user.role?.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: '#666', fontSize: '0.875rem' }}>
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Recent Activity */}
        <Box>
          <Typography variant="h5" className="mb-4 font-['Space_Grotesk'] font-bold">
            Recent Activity
          </Typography>
          <Card
            sx={{
              borderRadius: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            }}
          >
            <CardContent>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #1DD1A140' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>User</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Action</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Resource</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAudits?.map((audit: any) => (
                      <tr
                        key={audit.id}
                        style={{
                          borderBottom: '1px solid rgba(0,0,0,0.05)',
                        }}
                      >
                        <td style={{ padding: '12px' }}>{audit.profiles?.email || 'Unknown'}</td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{audit.action}</td>
                        <td style={{ padding: '12px', color: '#666' }}>
                          {audit.resource_type || '-'}
                        </td>
                        <td style={{ padding: '12px', color: '#666', fontSize: '0.875rem' }}>
                          {new Date(audit.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </main>
    </div>
  );
}
