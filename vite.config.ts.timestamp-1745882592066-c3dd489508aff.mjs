// vite.config.ts
import { defineConfig } from "file:///E:/PROJECTS/families/node_modules/vite/dist/node/index.js";
import path from "node:path";
import electron from "file:///E:/PROJECTS/families/node_modules/vite-plugin-electron/dist/simple.mjs";
import react from "file:///E:/PROJECTS/families/node_modules/@vitejs/plugin-react/dist/index.mjs";
import tailwindcss from "file:///E:/PROJECTS/families/node_modules/@tailwindcss/vite/dist/index.mjs";
var __vite_injected_original_dirname = "E:\\PROJECTS\\families";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    electron({
      main: {
        entry: "electron/main.ts",
        vite: {
          base: "/",
          build: {
            rollupOptions: {
              output: {
                assetFileNames: "[name][extname]",
                entryFileNames: "[name].js",
                chunkFileNames: "[name].js"
              },
              external: [
                "firebase-admin",
                "@google-cloud/firestore",
                "grpc",
                "bytes",
                "discord-rpc"
              ]
            }
          }
        }
      },
      preload: {
        input: path.join(__vite_injected_original_dirname, "electron/preload.ts")
      },
      renderer: process.env.NODE_ENV === "test" ? void 0 : {}
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxQUk9KRUNUU1xcXFxmYW1pbGllc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcUFJPSkVDVFNcXFxcZmFtaWxpZXNcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L1BST0pFQ1RTL2ZhbWlsaWVzL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCdcbmltcG9ydCBlbGVjdHJvbiBmcm9tICd2aXRlLXBsdWdpbi1lbGVjdHJvbi9zaW1wbGUnXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXG5pbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSAnQHRhaWx3aW5kY3NzL3ZpdGUnXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICB0YWlsd2luZGNzcygpLFxuICAgIGVsZWN0cm9uKHtcbiAgICAgIG1haW46IHtcbiAgICAgICAgZW50cnk6ICdlbGVjdHJvbi9tYWluLnRzJyxcbiAgICAgICAgdml0ZToge1xuICAgICAgICAgIGJhc2U6ICcvJyxcbiAgICAgICAgICBidWlsZDoge1xuICAgICAgICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICAgICAgICBhc3NldEZpbGVOYW1lczogJ1tuYW1lXVtleHRuYW1lXScsXG4gICAgICAgICAgICAgICAgZW50cnlGaWxlTmFtZXM6ICdbbmFtZV0uanMnLFxuICAgICAgICAgICAgICAgIGNodW5rRmlsZU5hbWVzOiAnW25hbWVdLmpzJyxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgZXh0ZXJuYWw6IFtcbiAgICAgICAgICAgICAgICAnZmlyZWJhc2UtYWRtaW4nLFxuICAgICAgICAgICAgICAgICdAZ29vZ2xlLWNsb3VkL2ZpcmVzdG9yZScsXG4gICAgICAgICAgICAgICAgJ2dycGMnLFxuICAgICAgICAgICAgICAgICdieXRlcycsXG4gICAgICAgICAgICAgICAgJ2Rpc2NvcmQtcnBjJ1xuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHByZWxvYWQ6IHtcbiAgICAgICAgaW5wdXQ6IHBhdGguam9pbihfX2Rpcm5hbWUsICdlbGVjdHJvbi9wcmVsb2FkLnRzJyksXG4gICAgICB9LFxuICAgICAgcmVuZGVyZXI6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAndGVzdCdcbiAgICAgICAgPyB1bmRlZmluZWRcbiAgICAgICAgOiB7fSxcbiAgICB9KSxcbiAgXSxcbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW9QLFNBQVMsb0JBQW9CO0FBQ2pSLE9BQU8sVUFBVTtBQUNqQixPQUFPLGNBQWM7QUFDckIsT0FBTyxXQUFXO0FBQ2xCLE9BQU8saUJBQWlCO0FBSnhCLElBQU0sbUNBQW1DO0FBT3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFlBQVk7QUFBQSxJQUNaLFNBQVM7QUFBQSxNQUNQLE1BQU07QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLE1BQU07QUFBQSxVQUNKLE1BQU07QUFBQSxVQUNOLE9BQU87QUFBQSxZQUNMLGVBQWU7QUFBQSxjQUNiLFFBQVE7QUFBQSxnQkFDTixnQkFBZ0I7QUFBQSxnQkFDaEIsZ0JBQWdCO0FBQUEsZ0JBQ2hCLGdCQUFnQjtBQUFBLGNBQ2xCO0FBQUEsY0FDQSxVQUFVO0FBQUEsZ0JBQ1I7QUFBQSxnQkFDQTtBQUFBLGdCQUNBO0FBQUEsZ0JBQ0E7QUFBQSxnQkFDQTtBQUFBLGNBQ0Y7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsTUFDQSxTQUFTO0FBQUEsUUFDUCxPQUFPLEtBQUssS0FBSyxrQ0FBVyxxQkFBcUI7QUFBQSxNQUNuRDtBQUFBLE1BQ0EsVUFBVSxRQUFRLElBQUksYUFBYSxTQUMvQixTQUNBLENBQUM7QUFBQSxJQUNQLENBQUM7QUFBQSxFQUNIO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
