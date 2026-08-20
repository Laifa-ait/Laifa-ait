/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID: string;
  readonly VITE_ADMIN_EMAIL: string;
  readonly VITE_MAPS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}


declare module 'cors' {
  import { RequestHandler } from 'express';
  namespace cors {
    interface CorsOptions {
      origin?: unknown;
      credentials?: boolean;
      methods?: string | string[];
      allowedHeaders?: string | string[];
    }
  }
  function cors(options?: cors.CorsOptions): RequestHandler;
  export = cors;
}
