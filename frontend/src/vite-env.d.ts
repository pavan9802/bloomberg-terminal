/// <reference types="vite/client" />

// Type definitions for Vite environment variables
// This file tells TypeScript about import.meta.env

interface ImportMetaEnv {
  // The backend API URL (set in Railway for production)
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
