const path = require("path");
const { defineConfig } = require("vite");
const mkcert = require("vite-plugin-mkcert").default;

module.exports = defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "index.html"),
        sidebar: path.resolve(__dirname, "sidebar.html"),
      },
    },
  },
  server: {
    https: true,
  },
  plugins: [mkcert()],
});
