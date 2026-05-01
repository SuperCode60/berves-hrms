# Deployment Instructions for Berves HRMS

## Backend Deployment (Railway)

The backend is configured for Railway deployment with:

1. **railway.json** - Already configured with:
   - Builder: Nixpacks
   - Build command: `composer install --no-dev --optimize-autoloader --no-interaction --no-scripts`
   - Start command: `php artisan serve --host=0.0.0.0 --port=${PORT}`
   - Health check: `/up`
   - Restart policy: ON_FAILURE

2. **Environment Variables** (Set in Railway dashboard):
   - APP_NAME="Berves HRMS"
   - APP_ENV=production
   - APP_KEY=[generate with `php artisan key:generate --show`]
   - APP_DEBUG=false
   - APP_URL=[your-railway-url]
   - LOG_CHANNEL=stack
   - DB_CONNECTION=mysql
   - DB_HOST=[railway-mysql-host]
   - DB_PORT=[railway-mysql-port]
   - DB_DATABASE=railway
   - DB_USERNAME=[railway-username]
   - DB_PASSWORD=[railway-password]
   - REDIS_HOST=[railway-redis-host]
   - REDIS_PORT=[railway-redis-port]
   - REDIS_PASSWORD=[railway-redis-password]
   - CACHE_DRIVER=redis
   - SESSION_DRIVER=redis
   - QUEUE_CONNECTION=redis
   - MAIL_MAILER=smtp
   - MAIL_HOST=[smtp-host]
   - MAIL_PORT=[smtp-port]
   - MAIL_USERNAME=[smtp-username]
   - MAIL_PASSWORD=[smtp-password]
   - MAIL_FROM_ADDRESS="noreply@berves.com"
   - MAIL_FROM_NAME="${APP_NAME}"

3. **Database Setup**:
   - MySQL and Redis services need to be added in Railway
   - Run migrations after deployment: `php artisan migrate --seed`

## Frontend Deployment (Vercel)

The frontend is configured for Vercel deployment with:

1. **vercel.json** - Configuration includes:
   - Uses @vercel/static-build
   - Builds to dist directory via `vite build`
   - Routes API calls to backend
   - Sets VITE_API_URL environment variable

2. **Build Command**: `npm run build` (which runs `vite build`)

3. **Environment Variables** (Set in Vercel dashboard):
   - VITE_API_URL=[your-railway-backend-url]/api/v1

## Deployment Steps:

### Backend (Railway):
1. Push code to GitHub repository
2. Connect repository to Railway
3. Add MySQL and Redis services
4. Configure environment variables
5. Trigger deployment
6. Run migrations: `php artisan migrate --seed`

### Frontend (Vercel):
1. Push code to GitHub repository
2. Import project to Vercel
3. Configure environment variables
4. Trigger deployment

## Important Notes:
- Update .env files with actual values before deployment
- Ensure CORS is configured in Laravel to allow frontend domain
- Consider using a custom domain for production
- Set up proper HTTPS certificates
- Monitor logs and performance after deployment

## Current Status:
- Backend: Ready for Railway deployment (railway.json configured)
- Frontend: Ready for Vercel deployment (vercel.json created)
- Both have Dockerfiles for containerized deployment alternatives
- Database seeded with default users