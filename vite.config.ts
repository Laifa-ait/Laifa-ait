import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');

  return {
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Olma Marketplace',
          short_name: 'Olma',
          theme_color: '#f9f4e8',
          start_url: '/',
          display: 'standalone',
          background_color: '#ffffff',
          icons: [
            {
              src: '/logo.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable'
            },
            {
              src: '/logo.svg',
              sizes: '512x512',
              type: 'image/svg+xml'
            }
          ]
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,svg,woff2}'],
          globIgnores: [
            '**/vendor-pdf-*.js',
            '**/vendor-charts-*.js',
            '**/vendor-quill-*.js',
            '**/vendor-html2canvas-*.js',
            '**/vendor-sentry-*.js',
            '**/*Admin*.js',
            '**/*Dashboard*.js'
          ],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com)\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /\.(?:png|gif|jpg|jpeg|webp|svg|avif)$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'assets-images-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Days
                }
              }
            },
            {
              urlPattern: /\/api\/v1\/public\//i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-public-cache',
                networkTimeoutSeconds: 5,
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 5 // 5 minutes
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /\/locales\/.*\.json/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'locales-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 // 24 hours
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
    ],
    base: '/',
    build: {
      target: 'es2022',
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        external: ['firebase-admin', 'firebase-admin/firestore'],
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // 1. Monitoring & Crash Reporting
              if (id.includes('@sentry') || id.includes('sentry')) {
                return 'vendor-sentry';
              }
              // 2. Heavy Rich UI Widgets & Players (Specific widgets first)
              if (id.includes('react-quill') || id.includes('quill')) {
                return 'vendor-quill';
              }
              if (id.includes('react-player')) {
                return 'vendor-player';
              }
              if (id.includes('react-joyride')) {
                return 'vendor-joyride';
              }
              // 3. Heavy Office Documents & PDF Utilities (Grouped jspdf & fflate/canvg/dompurify to prevent circular chunks)
              if (id.includes('jspdf') || id.includes('fflate') || id.includes('canvg') || id.includes('dompurify')) {
                return 'vendor-pdf';
              }
              if (id.includes('html2canvas')) {
                return 'vendor-html2canvas';
              }
              // 4. Data Visualisation
              if (id.includes('recharts') || id.includes('d3')) {
                return 'vendor-charts';
              }
              // 5. Core Platforms
              // 5. Core Platforms - Highly optimized sub-chunking for Firebase suite
              if (id.includes('@firebase/auth') || id.includes('firebase/auth')) {
                return 'vendor-firebase-auth';
              }
              if (id.includes('@firebase/firestore') || id.includes('firebase/firestore')) {
                return 'vendor-firebase-firestore';
              }
              if (id.includes('@firebase/storage') || id.includes('firebase/storage')) {
                return 'vendor-firebase-storage';
              }
              if (id.includes('@firebase/app') || id.includes('firebase/app')) {
                return 'vendor-firebase-app';
              }
              if (id.includes('firebase')) {
                return 'vendor-firebase-core';
              }
              // 6. State Management & Cache Managers
              if (id.includes('@tanstack/react-query') || id.includes('query-core')) {
                return 'vendor-query';
              }
              if (id.includes('@tanstack/react-table')) {
                return 'vendor-table';
              }
              if (id.includes('zustand')) {
                return 'vendor-zustand';
              }
              // 7. Core React Engine (Highly precise paths to prevent matching things like lucide-react)
              const isCoreReact = 
                id.includes('node_modules/react/') || 
                id.includes('node_modules/react-dom/') || 
                id.includes('node_modules/react-router/') || 
                id.includes('node_modules/react-router-dom/') || 
                id.includes('node_modules/scheduler/') ||
                id.includes('node_modules/react-is/');
              if (isCoreReact) {
                return 'vendor-react';
              }
              // 8. Animations & Design System Icons
              if (id.includes('framer-motion') || id.includes('motion')) {
                return 'vendor-animations';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              // 9. Standard Lightweight Utilities
              if (id.includes('i18next') || id.includes('react-i18next')) {
                return 'vendor-i18n';
              }
              if (id.includes('date-fns')) {
                return 'vendor-date-fns';
              }
              if (id.includes('zod')) {
                return 'vendor-zod';
              }
            }
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'firebase/storage',
        'lucide-react',
        'motion/react',
        '@tanstack/react-query',
        'zustand',
        'date-fns',
        'recharts'
      ]
    },
    server: {
      hmr: {
        protocol: 'wss',
        clientPort: 443,
        path: '/vite-hmr'
      }
    },
  };
});
