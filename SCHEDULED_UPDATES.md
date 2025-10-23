# Scheduled Market Data Updates (GitHub Actions)

This project includes a GitHub Actions workflow that runs the market data updater located in `scripts/update_market_data.py` on a schedule so you don't need to keep a local machine online.

Workflow file: `.github/workflows/update-market-data.yml`

## Required repository secrets

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL (same as used by frontend env)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service_role key (requires careful access control)
- `NSE_API_KEY` (optional) - If your NSE fetcher needs an API key
- `AMFI_API_KEY` (optional) - If mutual fund fetcher needs an API key

## How it runs

- The workflow is scheduled to run on weekdays during Indian trading hours. The cron converts IST to UTC; it currently runs at the 30th minute of hours 3-10 UTC which maps to 9:30-15:30 IST. Adjust the cron in the workflow if you prefer different times.
- The job performs a single non-scheduled run of the updater (no long-running scheduler) to keep the execution short and deterministic.

## Manual trigger

You can trigger the workflow manually from the Actions tab -> "Update Market Data" -> Run workflow -> select branch and run.

## Changing schedule or runtime

- If you want the Action to run multiple times per hour or run the long-lived scheduler, edit `.github/workflows/update-market-data.yml` and change the `cron` schedule or the `run` command. Running the scheduler (the `--schedule` flag) in Actions will attempt to keep a long-running runner alive and is not recommended; prefer single-run executions.

## Security note

Store `SUPABASE_SERVICE_ROLE_KEY` as a repo secret and grant access only to trusted collaborators. Consider creating a separate service role with minimum required permissions for automated updates.

## Troubleshooting

- Check the workflow logs in Actions for Python errors or missing environment variables.
- If a dependency is missing, update `scripts/requirements.txt` and commit.
