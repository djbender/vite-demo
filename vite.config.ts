import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    reactRouter(),
    {
      name: "mock-service-worker",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.includes("mockServiceWorker.js")) {
            res.writeHead(200, { "Content-Type": "application/javascript" });
            res.end("");
            return;
          }
          next();
        });
      },
    },
  ],
});
