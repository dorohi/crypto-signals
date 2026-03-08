module.exports = {
  apps: [
    {
      name: "cs-api",
      cwd: "/opt/crypto-signals/apps/api",
      script: "/usr/bin/bash",
      args: "-c 'pnpm start'",
      interpreter: "none",
    },
    {
      name: "cs-monitor",
      cwd: "/opt/crypto-signals/apps/monitor",
      script: "/usr/bin/bash",
      args: "-c 'pnpm start'",
      interpreter: "none",
    },
  ],
};