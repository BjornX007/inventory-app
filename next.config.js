// next.config.js
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // no SW in dev mode
});

module.exports = withPWA({
  reactStrictMode: true,
});
