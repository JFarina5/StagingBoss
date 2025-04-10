import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Only include the componentTagger in development mode
  const plugins = [react()];
  
  if (mode === 'development') {
    plugins.push(componentTagger());
  }
  
  return {
    base: '/StagingBoss/',
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
