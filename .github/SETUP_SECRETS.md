# GitHub Secrets Setup

To run Playwright tests in CI/CD, you need to add the following secrets to your GitHub repository.

## How to Add Secrets

1. Go to your GitHub repository
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret below

## Required Secrets

### Supabase Configuration

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project.supabase.co
```

```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: your-anon-key
```

```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: your-service-role-key
```

### AI Provider Configuration

**Choose ONE provider:**

```
Name: AI_DEFAULT_PROVIDER
Value: openai  (or "gemini")
```

```
Name: OPENAI_API_KEY
Value: sk-...
```

OR

```
Name: GEMINI_API_KEY
Value: ...
```

### Optional Secrets

```
Name: REDIS_URL
Value: redis://...
```

```
Name: BLOB_READ_WRITE_TOKEN
Value: ...
```

## Verification

After adding all secrets, you can verify them:
1. Go to **Actions** tab in your repository
2. Run the Playwright Tests workflow manually
3. Check if the workflow runs successfully

## Notes

- Secret values are hidden and cannot be viewed after saving
- Make sure to use production Supabase credentials for CI/CD
- For local testing, use `.env.local` file (never commit this file!)
