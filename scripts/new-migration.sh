#!/bin/bash
# Quick script to create a new Supabase migration

set -e

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found."
    echo ""
    echo "Please install Supabase CLI:"
    echo "  macOS/Linux: brew install supabase/tap/supabase"
    echo "  Or download from: https://github.com/supabase/cli/releases"
    echo ""
    exit 1
fi

# Get migration name from argument
MIGRATION_NAME=$1

if [ -z "$MIGRATION_NAME" ]; then
    echo "Usage: ./scripts/new-migration.sh <migration_name>"
    echo "Example: ./scripts/new-migration.sh add_notifications_table"
    exit 1
fi

# Create migration
echo "📝 Creating migration: $MIGRATION_NAME"
supabase migration new "$MIGRATION_NAME"

# Find the created file
MIGRATION_FILE=$(ls -t supabase/migrations/*_"$MIGRATION_NAME".sql | head -1)

# Open in default editor
if [ -n "$MIGRATION_FILE" ]; then
    echo "✅ Migration created: $MIGRATION_FILE"
    echo ""
    echo "Next steps:"
    echo "1. Edit the migration file"
    echo "2. Test: supabase db reset && supabase db push"
    echo "3. Commit: git add supabase/migrations && git commit -m 'migration: $MIGRATION_NAME'"
    echo "4. Push: git push"

    # Open in VS Code if available
    if command -v code &> /dev/null; then
        code "$MIGRATION_FILE"
    fi
else
    echo "❌ Migration file not found"
    exit 1
fi
