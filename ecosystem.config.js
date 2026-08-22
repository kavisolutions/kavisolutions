/**
 * Kavi Solutions - PM2 process definition.
 *
 * Runs the Next.js production server on port 3111 (820f) - chosen to avoid
 * clashing with other apps already on this VPS (e.g. Agrinp on 3000).
 *
 * NOTE: PM2 does NOT expand shell-style "${VAR}" inside config files, so the
 * port is specified literally here. If you change it, update BOTH:
 *   1. this file (PORT + args), and
 *   2. the matching proxy_pass in deploy/nginx.conf
 */
module.exports = {
  apps: [
    {
      name: "kavi-solutions",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3111",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production",
        PORT: "3111",
      },
    },
  ],
};