/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const { defineConfig } = require("vite");
// const mkcert = require("vite-plugin-mkcert").default;
const reactRefresh = require("@vitejs/plugin-react-refresh");
const reactSvgPlugin = require("vite-plugin-react-svg");

module.exports = defineConfig({
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
  build: {
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "index.html"),
        sidebar: path.resolve(__dirname, "sidebar.html"),
      },
    },
  },
  server: {
    // https: true,
  },
  plugins: [
    process.env.NODE_ENV === "development" && reactRefresh(),
    // mkcert(),
    reactSvgPlugin(),
  ].filter(Boolean),
});
