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
            chunkSizeWarningLimit: 1e3,
            rollupOptions: {
              output: {
                assetFileNames: "[name][extname]",
                entryFileNames: "[name].js",
                chunkFileNames: "[name].js",
                manualChunks(id) {
                  if (id.includes("node_modules")) {
                    if (id.includes("react")) return "vendor-react";
                    if (id.includes("firebase")) return "vendor-firebase";
                    if (id.includes("discord-rpc")) return "vendor-discord";
                    return "vendor";
                  }
                }
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxQUk9KRUNUU1xcXFxmYW1pbGllc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcUFJPSkVDVFNcXFxcZmFtaWxpZXNcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L1BST0pFQ1RTL2ZhbWlsaWVzL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCdcbmltcG9ydCBlbGVjdHJvbiBmcm9tICd2aXRlLXBsdWdpbi1lbGVjdHJvbi9zaW1wbGUnXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXG5pbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSAnQHRhaWx3aW5kY3NzL3ZpdGUnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIHRhaWx3aW5kY3NzKCksXG4gICAgZWxlY3Ryb24oe1xuICAgICAgbWFpbjoge1xuICAgICAgICBlbnRyeTogJ2VsZWN0cm9uL21haW4udHMnLFxuICAgICAgICB2aXRlOiB7XG4gICAgICAgICAgYmFzZTogJy8nLFxuICAgICAgICAgIGJ1aWxkOiB7XG4gICAgICAgICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXG4gICAgICAgICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgICAgICAgIG91dHB1dDoge1xuICAgICAgICAgICAgICAgIGFzc2V0RmlsZU5hbWVzOiAnW25hbWVdW2V4dG5hbWVdJyxcbiAgICAgICAgICAgICAgICBlbnRyeUZpbGVOYW1lczogJ1tuYW1lXS5qcycsXG4gICAgICAgICAgICAgICAgY2h1bmtGaWxlTmFtZXM6ICdbbmFtZV0uanMnLFxuICAgICAgICAgICAgICAgIG1hbnVhbENodW5rcyhpZCkge1xuICAgICAgICAgICAgICAgICAgLy8gU3BsaXQgbm9kZV9tb2R1bGVzIGludG8gc2VwYXJhdGUgY2h1bmtzXG4gICAgICAgICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcycpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygncmVhY3QnKSkgcmV0dXJuICd2ZW5kb3ItcmVhY3QnXG4gICAgICAgICAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnZmlyZWJhc2UnKSkgcmV0dXJuICd2ZW5kb3ItZmlyZWJhc2UnXG4gICAgICAgICAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnZGlzY29yZC1ycGMnKSkgcmV0dXJuICd2ZW5kb3ItZGlzY29yZCdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3InXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgZXh0ZXJuYWw6IFtcbiAgICAgICAgICAgICAgICAnZmlyZWJhc2UtYWRtaW4nLFxuICAgICAgICAgICAgICAgICdAZ29vZ2xlLWNsb3VkL2ZpcmVzdG9yZScsXG4gICAgICAgICAgICAgICAgJ2dycGMnLFxuICAgICAgICAgICAgICAgICdieXRlcycsXG4gICAgICAgICAgICAgICAgJ2Rpc2NvcmQtcnBjJyxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBwcmVsb2FkOiB7XG4gICAgICAgIGlucHV0OiBwYXRoLmpvaW4oX19kaXJuYW1lLCAnZWxlY3Ryb24vcHJlbG9hZC50cycpLFxuICAgICAgfSxcbiAgICAgIHJlbmRlcmVyOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Rlc3QnID8gdW5kZWZpbmVkIDoge30sXG4gICAgfSksXG4gIF0sXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvUCxTQUFTLG9CQUFvQjtBQUNqUixPQUFPLFVBQVU7QUFDakIsT0FBTyxjQUFjO0FBQ3JCLE9BQU8sV0FBVztBQUNsQixPQUFPLGlCQUFpQjtBQUp4QixJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixTQUFTO0FBQUEsTUFDUCxNQUFNO0FBQUEsUUFDSixPQUFPO0FBQUEsUUFDUCxNQUFNO0FBQUEsVUFDSixNQUFNO0FBQUEsVUFDTixPQUFPO0FBQUEsWUFDTCx1QkFBdUI7QUFBQSxZQUN2QixlQUFlO0FBQUEsY0FDYixRQUFRO0FBQUEsZ0JBQ04sZ0JBQWdCO0FBQUEsZ0JBQ2hCLGdCQUFnQjtBQUFBLGdCQUNoQixnQkFBZ0I7QUFBQSxnQkFDaEIsYUFBYSxJQUFJO0FBRWYsc0JBQUksR0FBRyxTQUFTLGNBQWMsR0FBRztBQUMvQix3QkFBSSxHQUFHLFNBQVMsT0FBTyxFQUFHLFFBQU87QUFDakMsd0JBQUksR0FBRyxTQUFTLFVBQVUsRUFBRyxRQUFPO0FBQ3BDLHdCQUFJLEdBQUcsU0FBUyxhQUFhLEVBQUcsUUFBTztBQUN2QywyQkFBTztBQUFBLGtCQUNUO0FBQUEsZ0JBQ0Y7QUFBQSxjQUNGO0FBQUEsY0FDQSxVQUFVO0FBQUEsZ0JBQ1I7QUFBQSxnQkFDQTtBQUFBLGdCQUNBO0FBQUEsZ0JBQ0E7QUFBQSxnQkFDQTtBQUFBLGNBQ0Y7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsTUFDQSxTQUFTO0FBQUEsUUFDUCxPQUFPLEtBQUssS0FBSyxrQ0FBVyxxQkFBcUI7QUFBQSxNQUNuRDtBQUFBLE1BQ0EsVUFBVSxRQUFRLElBQUksYUFBYSxTQUFTLFNBQVksQ0FBQztBQUFBLElBQzNELENBQUM7QUFBQSxFQUNIO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
