# Setup Admin User - PowerShell Script
# Description: Promote a user to admin role
# Usage: Run this script and follow the prompts

param(
    [string]$Email,
    [switch]$FirstUser,
    [switch]$ListUsers,
    [switch]$Help
)

function Show-Help {
    Write-Host ""
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "  Setup Admin User Script" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\setup-admin.ps1 -Email user@example.com    # Promote specific user"
    Write-Host "  .\setup-admin.ps1 -FirstUser                 # Promote first registered user"
    Write-Host "  .\setup-admin.ps1 -ListUsers                 # List all users"
    Write-Host "  .\setup-admin.ps1 -Help                      # Show this help"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\setup-admin.ps1 -Email john@example.com"
    Write-Host "  .\setup-admin.ps1 -FirstUser"
    Write-Host ""
    exit 0
}

function Show-Banner {
    Write-Host ""
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "  TrakInvests - Admin Setup" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""
}

function Test-SupabaseCLI {
    try {
        $null = Get-Command supabase -ErrorAction Stop
        return $true
    } catch {
        Write-Host "❌ Supabase CLI not found!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install Supabase CLI:" -ForegroundColor Yellow
        Write-Host "  npm install -g supabase" -ForegroundColor White
        Write-Host ""
        Write-Host "Or use the SQL script directly in Supabase Dashboard:" -ForegroundColor Yellow
        Write-Host "  supabase\migrations\setup_admin_user.sql" -ForegroundColor White
        Write-Host ""
        exit 1
    }
}

function Get-AllUsers {
    Write-Host "Fetching all users..." -ForegroundColor Yellow
    $query = "SELECT id, email, full_name, role, created_at FROM public.profiles ORDER BY created_at ASC;"
    supabase db query $query --format table
}

function Set-AdminByEmail {
    param([string]$UserEmail)

    Write-Host "Promoting user to admin: $UserEmail" -ForegroundColor Yellow

    $query = @"
UPDATE public.profiles
SET role = 'admin', updated_at = NOW()
WHERE email = '$UserEmail';

SELECT id, email, full_name, role, updated_at
FROM public.profiles
WHERE email = '$UserEmail';
"@

    supabase db query $query --format table

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ User successfully promoted to admin!" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Failed to promote user. Please check the email address." -ForegroundColor Red
        Write-Host ""
    }
}

function Set-FirstUserAdmin {
    Write-Host "Promoting first registered user to admin..." -ForegroundColor Yellow

    $query = @"
UPDATE public.profiles
SET role = 'admin', updated_at = NOW()
WHERE id = (
  SELECT id FROM public.profiles
  ORDER BY created_at ASC
  LIMIT 1
);

SELECT id, email, full_name, role, created_at, updated_at
FROM public.profiles
ORDER BY created_at ASC
LIMIT 1;
"@

    supabase db query $query --format table

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ First user successfully promoted to admin!" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Failed to promote user." -ForegroundColor Red
        Write-Host ""
    }
}

# Main script execution
if ($Help) {
    Show-Help
}

Show-Banner

# Test if Supabase CLI is installed
Test-SupabaseCLI

# Execute based on parameters
if ($ListUsers) {
    Get-AllUsers
    exit 0
}

if ($FirstUser) {
    Set-FirstUserAdmin
    exit 0
}

if ($Email) {
    Set-AdminByEmail -UserEmail $Email
    exit 0
}

# If no parameters provided, show interactive menu
Write-Host "Select an option:" -ForegroundColor Cyan
Write-Host "1. List all users"
Write-Host "2. Promote user by email"
Write-Host "3. Promote first registered user"
Write-Host "4. Exit"
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Get-AllUsers
    }
    "2" {
        $userEmail = Read-Host "Enter user email address"
        Set-AdminByEmail -UserEmail $userEmail
    }
    "3" {
        Set-FirstUserAdmin
    }
    "4" {
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "Invalid choice. Exiting." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
Write-Host ""
