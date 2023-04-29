import { defineConfig } from 'vite';
import replace from '@rollup/plugin-replace';


export default defineConfig({
  server: { 
    https: false,
    port: 3000,
    cors: true,
    base: "./"
  },
  
  root: "./",

  build: {
    manifest: true,
    outDir: "public",
    assetsDir: "assets",

    commonjsOptions: {
      requireReturnsDefault: true,
    },

    rollupOptions: {
      plugins: [
        replace({
          //  Toggle the booleans here to enable / disable Phaser 3 features:
          'typeof CANVAS_RENDERER': "'true'",
          'typeof WEBGL_RENDERER': "'true'",
          'typeof EXPERIMENTAL': "'true'",
          'typeof PLUGIN_CAMERA3D': "'false'",
          'typeof PLUGIN_FBINSTANT': "'false'",
          'typeof FEATURE_SOUND': "'true'",
          preventAssignment: true,
        })
      ],
      output: {
        strict: true,
        compact: true,
        interop: true,
        minifyInternalExports: true,
      },
    },
  },
});