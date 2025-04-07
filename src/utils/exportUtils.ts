
import { ProcessedLineup, ExportSettings, TrackInfo } from '@/types';
import { exportToPdf } from './pdfExportUtils';

/**
 * Simulate exporting data to Excel
 * In a real implementation, this would use a library to generate and download an Excel file
 */
export const exportToExcel = (
  lineups: ProcessedLineup[],
  settings: ExportSettings,
  trackInfo: TrackInfo
): void => {
  console.log('Exporting lineups with settings:', settings);
  console.log('Track info:', trackInfo);
  console.log('Lineups:', lineups);
  
  // This would be replaced with actual Excel generation and download logic
  
  // In a real implementation, we would:
  // 1. Create an Excel workbook
  // 2. Add worksheets for each class
  // 3. Format headers and data
  // 4. Apply styling (alternate row colors, etc.)
  // 5. Include the track logo if specified
  // 6. Trigger file download
};

/**
 * Export lineups based on selected format
 */
export const exportLineups = (
  lineups: ProcessedLineup[],
  settings: ExportSettings,
  trackInfo: TrackInfo
): void => {
  if (settings.exportFormat === 'pdf') {
    exportToPdf(lineups, settings, trackInfo);
  } else {
    exportToExcel(lineups, settings, trackInfo);
  }
};

/**
 * Format data for export
 */
export const formatLineupForExport = (
  lineup: ProcessedLineup
): Record<string, any>[] => {
  return lineup.drivers.map((driver, index) => ({
    Position: index + 1,
    'Car #': driver.carNumber,
    Driver: driver.driverName,
    'Pill #': driver.pillNumber,
  }));
};

/**
 * Generate a default filename based on track and date
 */
export const generateDefaultFilename = (trackName: string): string => {
  const date = new Date();
  const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const trackSlug = trackName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  
  return `${trackSlug}_lineups_${formattedDate}`;
};
