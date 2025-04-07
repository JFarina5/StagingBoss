
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
}
