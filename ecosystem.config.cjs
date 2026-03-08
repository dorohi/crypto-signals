module.exports = {
  apps: [
    {
      name: "cs-api",
      cwd: "/opt/crypto-signals/apps/api",
      script: "node",
      args: "dist/index.js",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "cs-monitor",
      cwd: "/opt/crypto-signals/apps/monitor",
      script: "npx",
      args: "tsx src/index.ts",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
