module.exports = {
  apps: [
    {
      name: 'mysoov-api',
      script: './server/index.js',
      cwd: '/home/ubuntu/mysoov', // IMPORTANT: Update this to your actual VPS path
      instances: 2, // Use 2 instances for load balancing (adjust based on CPU cores)
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5100,
      },
      // Graceful shutdown
      kill_timeout: 15000,
      wait_ready: true,
      listen_timeout: 10000,

      // Logging
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',

      // Auto restart on crash
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M',

      // Watch specific files (optional)
      watch: false,
      ignore_watch: ['node_modules', 'tmp', 'logs', 'dist'],

      // Advanced PM2 features
      env_production: {
        NODE_ENV: 'production',
        PORT: 5100,
      },
    },

    // Optional: Frontend as well if you want to serve it from the same VPS
    // {
    //   name: 'mysoov-frontend',
    //   script: 'npm',
    //   args: 'run preview',
    //   cwd: '/root/mysoov/client',
    //   env: {
    //     NODE_ENV: 'production',
    //     PORT: 3000,
    //   },
    // }
  ],

  deploy: {
    production: {
      user: 'root',
      host: 'your.vps.ip.address',
      ref: 'origin/main',
      repo: 'git@github.com:your/repo.git',
      path: '/root/mysoov',
      'post-deploy':
        'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-deploy-local': 'echo "Deploying to production"',
    },
  },
};
