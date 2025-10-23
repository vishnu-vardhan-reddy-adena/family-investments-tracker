#!/bin/bash

# Setup Admin User - Bash Script
# Description: Promote a user to admin role
# Usage: Run this script and follow the prompts

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

function show_banner() {
    echo ""
    echo -e "${CYAN}================================${NC}"
    echo -e "${CYAN}  TrakInvests - Admin Setup${NC}"
    echo -e "${CYAN}================================${NC}"
    echo ""
}

function show_help() {
    echo ""
    echo -e "${CYAN}================================${NC}"
    echo -e "${CYAN}  Setup Admin User Script${NC}"
    echo -e "${CYAN}================================${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo "  ./setup-admin.sh -e user@example.com    # Promote specific user"
    echo "  ./setup-admin.sh -f                     # Promote first registered user"
    echo "  ./setup-admin.sh -l                     # List all users"
    echo "  ./setup-admin.sh -h                     # Show this help"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  ./setup-admin.sh -e john@example.com"
    echo "  ./setup-admin.sh -f"
    echo ""
    exit 0
}

function test_supabase_cli() {
    if ! command -v supabase &> /dev/null; then
        echo -e "${RED}❌ Supabase CLI not found!${NC}"
        echo ""
        echo -e "${YELLOW}Please install Supabase CLI:${NC}"
        echo "  npm install -g supabase"
        echo ""
        echo -e "${YELLOW}Or use the SQL script directly in Supabase Dashboard:${NC}"
        echo "  supabase/migrations/setup_admin_user.sql"
        echo ""
        exit 1
    fi
}

function get_all_users() {
    echo -e "${YELLOW}Fetching all users...${NC}"
    supabase db query "SELECT id, email, full_name, role, created_at FROM public.profiles ORDER BY created_at ASC;" --format table
}

function set_admin_by_email() {
    local email=$1
    echo -e "${YELLOW}Promoting user to admin: $email${NC}"

    supabase db query "
UPDATE public.profiles
SET role = 'admin', updated_at = NOW()
WHERE email = '$email';

SELECT id, email, full_name, role, updated_at
FROM public.profiles
WHERE email = '$email';
" --format table

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ User successfully promoted to admin!${NC}"
        echo ""
    else
        echo ""
        echo -e "${RED}❌ Failed to promote user. Please check the email address.${NC}"
        echo ""
        exit 1
    fi
}

function set_first_user_admin() {
    echo -e "${YELLOW}Promoting first registered user to admin...${NC}"

    supabase db query "
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
" --format table

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ First user successfully promoted to admin!${NC}"
        echo ""
    else
        echo ""
        echo -e "${RED}❌ Failed to promote user.${NC}"
        echo ""
        exit 1
    fi
}

function interactive_menu() {
    echo -e "${CYAN}Select an option:${NC}"
    echo "1. List all users"
    echo "2. Promote user by email"
    echo "3. Promote first registered user"
    echo "4. Exit"
    echo ""

    read -p "Enter your choice (1-4): " choice

    case $choice in
        1)
            get_all_users
            ;;
        2)
            read -p "Enter user email address: " user_email
            set_admin_by_email "$user_email"
            ;;
        3)
            set_first_user_admin
            ;;
        4)
            echo -e "${YELLOW}Exiting...${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice. Exiting.${NC}"
            exit 1
            ;;
    esac
}

# Main script execution
show_banner

# Parse command line arguments
while getopts "e:flh" opt; do
    case $opt in
        e)
            EMAIL=$OPTARG
            ;;
        f)
            FIRST_USER=true
            ;;
        l)
            LIST_USERS=true
            ;;
        h)
            show_help
            ;;
        \?)
            echo -e "${RED}Invalid option: -$OPTARG${NC}" >&2
            show_help
            ;;
    esac
done

# Test if Supabase CLI is installed
test_supabase_cli

# Execute based on parameters
if [ "$LIST_USERS" = true ]; then
    get_all_users
    exit 0
fi

if [ "$FIRST_USER" = true ]; then
    set_first_user_admin
    exit 0
fi

if [ -n "$EMAIL" ]; then
    set_admin_by_email "$EMAIL"
    exit 0
fi

# If no parameters provided, show interactive menu
interactive_menu

echo ""
echo -e "${GREEN}Done!${NC}"
echo ""
