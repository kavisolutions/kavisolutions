module.exports = {
  apps: [
    {
      name: "kavi-solutions-be",
      script: "dist/main.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "400M",
      env: {
        NODE_ENV: "production",
        PORT: "3200",
      },
    },
    /* Same codebase, separate process, shared database. The survey frontend
       uses this API so a main-API restart cannot take /survey down.
       Background singletons stay on the main API only. */
    {
      name: "kavi-solutions-survey-be",
      script: "dist/main.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "400M",
      env: {
        NODE_ENV: "production",
        PORT: "3201",
        FELLOWSHIP_AUTOMATION_ENABLED: "false",
        WHATSAPP_AUTOCONNECT: "false",
        CORS_ALLOWED_ORIGINS:
          "https://kavisolutions.in,https://www.kavisolutions.in",
      },
    },
  ],
};
