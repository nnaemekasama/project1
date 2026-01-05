# Deploying to Fly.io

This guide will help you deploy your subscription tracker backend to Fly.io.

## Prerequisites

1. Install the Fly.io CLI: https://fly.io/docs/getting-started/installing-flyctl/
2. Sign up for a Fly.io account: https://fly.io/app/sign-up
3. Log in: `fly auth login`

## Deployment Steps

### 1. Initialize Fly.io App

From the `backend` directory:

```bash
cd backend
fly launch
```

When prompted:

- **App name**: Choose a unique name (or press Enter for auto-generated)
- **Region**: Choose the closest region (e.g., `iad` for US East)
- **Postgres/Redis**: Say "no" (you're using MongoDB)
- **Deploy now**: Say "no" (we'll set up secrets first)

### 2. Update fly.toml

Edit `fly.toml` and update the `app` name to match your app name:

```toml
app = "your-actual-app-name"
```

### 3. Set Environment Variables (Secrets)

Set all your required environment variables as Fly.io secrets:

```bash
# Database
fly secrets set DB_URI="your-mongodb-connection-string"

# JWT
fly secrets set JWT_SECRET="your-super-secret-jwt-key-here"
fly secrets set JWT_EXPIRES_IN="7d"

# Arcjet
fly secrets set ARCJET_ENV="production"
fly secrets set ARCJET_KEY="your-arcjet-key"

# QStash
fly secrets set QSTASH_URL="https://qstash.upstash.io/v2"
fly secrets set QSTASH_TOKEN="your-qstash-token"

# Email
fly secrets set EMAIL_PASSWORD="your-gmail-app-password"

# Server URL (IMPORTANT: This will be your Fly.io app URL)
# Get your app URL after first deployment, then set:
fly secrets set SERVER_URL="https://your-app-name.fly.dev"
```

### 4. Deploy

```bash
fly deploy
```

### 5. Get Your App URL

After deployment, get your app URL:

```bash
fly status
```

Or check in the Fly.io dashboard. Your URL will be: `https://your-app-name.fly.dev`

### 6. Update SERVER_URL Secret

Once you know your app URL, update the SERVER_URL secret:

```bash
fly secrets set SERVER_URL="https://your-app-name.fly.dev"
```

Then redeploy:

```bash
fly deploy
```

## Important Notes

1. **MongoDB**: Make sure your MongoDB database is accessible from the internet (not just localhost). If using MongoDB Atlas, whitelist Fly.io IPs or allow all IPs (0.0.0.0/0) for development.

2. **SERVER_URL**: This must be your public Fly.io URL so QStash can call back to your workflow endpoints.

3. **Environment Variables**: All secrets are encrypted and only available at runtime. Never commit secrets to git.

4. **Scaling**: The `fly.toml` is configured with auto-scaling (machines start/stop based on traffic). You can adjust this in `fly.toml`.

## Viewing Logs

```bash
fly logs
```

## Updating Secrets

To update a secret:

```bash
fly secrets set KEY="new-value"
fly deploy
```

## Troubleshooting

- **Connection issues**: Check that your MongoDB allows connections from Fly.io IPs
- **Workflow errors**: Verify SERVER_URL is set to your public Fly.io URL
- **Port issues**: Fly.io automatically sets the PORT env var, your app should use it

## Useful Commands

```bash
# View app status
fly status

# View logs
fly logs

# SSH into the app
fly ssh console

# View secrets (names only, not values)
fly secrets list

# Scale the app
fly scale count 1

# Open the app in browser
fly open
```
