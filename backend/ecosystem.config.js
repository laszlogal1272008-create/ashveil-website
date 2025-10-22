module.exports = {
  apps: [{
    name: 'ashveil-backend',
    script: 'server.js',
    cwd: 'C:\\Users\\laszl\\my-website\\backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      API_PORT: 5000,
      DEV_MODE: 'false'
    },
    env_development: {
      NODE_ENV: 'development',
      DEV_MODE: 'true'
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    // Restart settings
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    // Advanced settings
    kill_timeout: 5000,
    listen_timeout: 8000,
    // Monitoring
    pmx: true,
    merge_logs: true
  }]
};