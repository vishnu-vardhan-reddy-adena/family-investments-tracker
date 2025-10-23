-- Migration: Add User Roles System
-- Description: Adds role-based access control with admin and user roles
-- Date: 2025-01-23

-- Create user_role enum
CREATE TYPE user_role AS ENUM ('admin', 'user');

-- Add role column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user' NOT NULL;

-- Create index on role for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Create admin_settings table for system-wide settings (admin only)
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB,
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_logs table (admin only access)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on audit_logs for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
BEGIN
  RETURN (
    SELECT role FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_details
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Admin can do everything with settings
CREATE POLICY "Admins can manage all settings"
  ON public.admin_settings
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Regular users can only read certain settings
CREATE POLICY "Users can read public settings"
  ON public.admin_settings
  FOR SELECT
  USING (setting_key LIKE 'public_%');

-- RLS Policies for audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admins can read all audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Users can only read their own audit logs
CREATE POLICY "Users can read own audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Everyone can insert audit logs (via function)
CREATE POLICY "Allow insert audit logs"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Update existing RLS policies to respect admin role
-- Admins can see all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Admins can see all portfolios
CREATE POLICY "Admins can view all portfolios"
  ON public.portfolios
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Admins can manage all portfolios
CREATE POLICY "Admins can manage all portfolios"
  ON public.portfolios
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Admins can see all investments
CREATE POLICY "Admins can view all investments"
  ON public.investments
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Admins can manage all investments
CREATE POLICY "Admins can manage all investments"
  ON public.investments
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Admins can see all transactions
CREATE POLICY "Admins can view all transactions"
  ON public.transactions
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Admins can manage all transactions
CREATE POLICY "Admins can manage all transactions"
  ON public.transactions
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Create a view for admin dashboard stats
CREATE OR REPLACE VIEW public.admin_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM public.profiles) as total_users,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'admin') as total_admins,
  (SELECT COUNT(*) FROM public.portfolios) as total_portfolios,
  (SELECT COUNT(*) FROM public.investments) as total_investments,
  (SELECT COUNT(*) FROM public.transactions) as total_transactions,
  (SELECT SUM(COALESCE(quantity * current_price, quantity * purchase_price, 0)) FROM public.investments) as total_portfolio_value,
  (SELECT COUNT(*) FROM public.profiles WHERE created_at > NOW() - INTERVAL '30 days') as new_users_30d,
  (SELECT COUNT(*) FROM public.transactions WHERE created_at > NOW() - INTERVAL '30 days') as new_transactions_30d;

-- Grant access to admin view (access control is handled by the application layer)
GRANT SELECT ON public.admin_dashboard_stats TO authenticated;

-- Add comment to role column
COMMENT ON COLUMN public.profiles.role IS 'User role: admin has full access, user has limited access';

-- Insert default admin settings
INSERT INTO public.admin_settings (setting_key, setting_value, description) VALUES
  ('public_app_name', '"TrakInvests"', 'Application name visible to all users'),
  ('public_app_version', '"1.0.0"', 'Current application version'),
  ('public_support_email', '"support@trakinvests.com"', 'Support email address'),
  ('max_portfolios_per_user', '10', 'Maximum number of portfolios a user can create'),
  ('max_investments_per_portfolio', '1000', 'Maximum investments per portfolio'),
  ('enable_market_data_sync', 'true', 'Enable automatic market data synchronization'),
  ('market_data_sync_interval', '300', 'Market data sync interval in seconds')
ON CONFLICT (setting_key) DO NOTHING;
