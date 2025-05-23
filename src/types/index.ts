export interface RaceClass {
  id: string;
  name: string;
  description?: string;
}

export interface Driver {
  carNumber: string;
  driverName: string;
  pillNumber: number;
  className: string;
  classId: string;
}

export interface ProcessedLineup {
  classId: string;
  className: string;
  drivers: Driver[];
}

export interface TrackInfo {
  name: string;
  logoUrl?: string;
  location?: string;
}

export interface AppSettings {
  darkMode: boolean;
  trackInfo: TrackInfo;
  defaultExportSettings: ExportSettings;
}

export interface ExportSettings {
  includeTrackLogo: boolean;
  alternateRowColors: boolean;
  includeHeaders: boolean;
  fileName: string;
  exportFormat: 'excel' | 'pdf';
  customFontSize?: number; // Optional font size setting from preview
  pageLayout?: 'separate' | 'combined'; // Whether to put each class on a separate page
  // Note: PDF exports now use portrait mode by default
}

// Local storage keys for data persistence
export const STORAGE_KEYS = {
  TRACK_INFO: 'stagingboss_track_info',
  CLASSES: 'stagingboss_classes',
  DARK_MODE: 'stagingboss_dark_mode',
  EXPORT_SETTINGS: 'stagingboss_export_settings',
  TRACK_LOGO: 'stagingboss_track_logo'
};
