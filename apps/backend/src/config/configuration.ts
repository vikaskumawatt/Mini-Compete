export default () => ({
  port: parseInt(process.env.BACKEND_PORT, 10) || 3001,
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRATION || '7d',
  },
  worker: {
    concurrency: parseInt(process.env.WORKER_CONCURRENCY, 10) || 5,
  },
  cron: {
    reminderSchedule: process.env.CRON_REMINDER_SCHEDULE || '0 0 * * *',
    cleanupSchedule: process.env.CRON_CLEANUP_SCHEDULE || '0 2 * * *',
  },
});