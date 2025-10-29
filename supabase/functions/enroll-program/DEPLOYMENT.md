# Deployment Guide: Enroll Program Edge Function

## Prerequisites
- Supabase CLI installed
- Logged in to Supabase project

## Deploy Edge Function

```powershell
# Navigate to project root
cd "D:\Dhimas's Files\Documents\GitHub\mind-mhirc-draft-112"

# Deploy the edge function
supabase functions deploy enroll-program
```

## Verify Deployment

```powershell
# List all functions
supabase functions list

# Test the function (replace with actual auth token)
supabase functions invoke enroll-program --headers "Authorization: Bearer YOUR_USER_TOKEN" --body '{"program":"hibrida-cbt"}'
```

## Database Migration

```powershell
# Apply the migration to disable auto-enrollment
supabase db push

# Or if using remote database
supabase migration up --db-url YOUR_DATABASE_URL
```

## Environment Variables Required

The edge function uses these environment variables (automatically available in Supabase):
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Public anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for admin operations)

## Post-Deployment Verification

1. Create a new test account
2. Visit `/hibrida-cbt` or `/spiritual-budaya`
3. Click "Daftar Sekarang"
4. Check browser console for any errors
5. Verify enrollment appears in admin dashboard with "pending" status

## Troubleshooting

### Function not found
```powershell
# Redeploy
supabase functions deploy enroll-program --no-verify-jwt
```

### CORS errors
- Edge function already includes proper CORS headers
- Check browser console for specific error

### Database permission errors
- Verify RLS policies on `cbt_hibrida_enrollments` and `sb_enrollments` tables
- Ensure service role key is set correctly

## Rollback

If issues occur, rollback the migration:

```sql
-- Re-enable auto-enrollment triggers
CREATE TRIGGER on_auth_user_created_hibrida
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_hibrida_reguler();

CREATE TRIGGER on_auth_user_created_assign_SB_reguler
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_SB_reguler();
```
