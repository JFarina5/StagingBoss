export const config = {
  appName: 'StagingBoss',
  appVersion: process.env.npm_package_version || '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  maxFileSize: 5 * 1024 * 1024, // 5MB in bytes
  toastDuration: 5000, // 5 seconds
  defaultExportFormat: 'pdf',
  apiUrl: process.env.VITE_API_URL || 'http://localhost:8080',
  features: {
    enableDarkMode: true,
    enableFileUpload: true,
    enableExport: true,
  },
  storage: {
    prefix: 'stagingboss_',
    version: '1.0',
  },
} as const;

export type Config = typeof config; 