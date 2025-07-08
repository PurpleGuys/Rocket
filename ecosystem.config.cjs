module.exports = {
  apps: [{
    name: 'bennespro',
    script: 'npx',
    args: 'tsx server/index.ts',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    time: true,
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};