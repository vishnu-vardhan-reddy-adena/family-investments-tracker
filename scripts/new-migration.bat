@echo off
REM Quick script to create a new Supabase migration (Windows)

setlocal enabledelayedexpansion

REM Check if Supabase CLI is installed
where supabase >nul 2>nul
if %errorlevel% neq 0 (
    echo Supabase CLI not found.
    echo.
    echo Please install Supabase CLI:
    echo   Windows: scoop install supabase
    echo   Or download from: https://github.com/supabase/cli/releases
    echo.
    exit /b 1
)

REM Get migration name from argument
set MIGRATION_NAME=%1

if "%MIGRATION_NAME%"=="" (
    echo Usage: scripts\new-migration.bat migration_name
    echo Example: scripts\new-migration.bat add_notifications_table
    exit /b 1
)

REM Create migration
echo Creating migration: %MIGRATION_NAME%
call supabase migration new %MIGRATION_NAME%

REM Find the created file (get latest)
for /f "delims=" %%i in ('dir /b /o-d supabase\migrations\*_%MIGRATION_NAME%.sql 2^>nul') do (
    set MIGRATION_FILE=supabase\migrations\%%i
    goto :found
)

:found
if defined MIGRATION_FILE (
    echo.
    echo Migration created: %MIGRATION_FILE%
    echo.
    echo Next steps:
    echo 1. Edit the migration file
    echo 2. Test: supabase db reset ^&^& supabase db push
    echo 3. Commit: git add supabase/migrations ^&^& git commit -m "migration: %MIGRATION_NAME%"
    echo 4. Push: git push
    echo.

    REM Open in VS Code if available
    where code >nul 2>nul
    if %errorlevel% equ 0 (
        code %MIGRATION_FILE%
    )
) else (
    echo Migration file not found
    exit /b 1
)
