/**
 * social-agent sidecar - PM2 process definition.
 *
 * Runs the Fastify service on 127.0.0.1:3300. The NestJS API proxies admin
 * requests to it, and nginx exposes only /media/ publicly (Instagram needs a
 * publicly reachable image URL).
 *
 * Configuration lives in social-agent/.env; PM2 only sets the listen address.
 */
module.exports = {
  apps: [
    {
      name: "kavi-social-agent",
      script: "dist/index.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "400M",
      env: {
        NODE_ENV: "production",
        PORT: "3300",
        HOST: "127.0.0.1",
      },
    },
  ],
};
