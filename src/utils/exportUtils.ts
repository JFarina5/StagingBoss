import { ProcessedLineup, ExportSettings, TrackInfo } from '@/types';
import { exportToPdf } from './pdfExportUtils';

/**
 * Format driver data in inside/outside format for Excel
 * Enhanced with improved sorting similar to test.py
 */
const formatInsideOutsideDataForExcel = (drivers: Array<any>): Array<Record<string, string>> => {
  // Sort drivers by pill number (should already be sorted, but this ensures consistent behavior)
  const sortedDrivers = [...drivers].sort((a, b) => {
    if (a.pillNumber === Number.MAX_SAFE_INTEGER && b.pillNumber === Number.MAX_SAFE_INTEGER) {
      // If both don't have pill numbers, sort by car number
      const aNum = parseInt(a.carNumber.replace(/\D/g, ''), 10);
      const bNum = parseInt(b.carNumber.replace(/\D/g, ''), 10);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      
      return a.carNumber.localeCompare(b.carNumber);
    }
    if (a.pillNumber === Number.MAX_SAFE_INTEGER) return 1;
    if (b.pillNumber === Number.MAX_SAFE_INTEGER) return -1;
    return a.pillNumber - b.pillNumber;
  });
  
  const result: Array<Record<string, string>> = [];
  
  // Split drivers into inside and outside
  const totalDrivers = sortedDrivers.length;
  const rows = Math.ceil(totalDrivers / 2);
  
  for (let i = 0; i < rows; i++) {
    const insideIndex = i;
    const outsideIndex = i + rows;
    
    const insideDriver = insideIndex < totalDrivers ? sortedDrivers[insideIndex] : null;
    const outsideDriver = outsideIndex < totalDrivers ? sortedDrivers[outsideIndex] : null;
    
    // Format driver names with first initial + last name similar to test.py
    const formatDriverName = (driver: any): string => {
      if (!driver) return '';
      
      const nameParts = driver.driverName.split(' ');
      
      if (nameParts.length === 1) {
        return driver.driverName; // Just use the single name part
      } else {
        // Get first initial + last name (handle multiple word last names)
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');
        return `${firstName.charAt(0)}. ${lastName}`;
      }
    };
    
    const insideText = insideDriver 
      ? `${insideDriver.carNumber} (${formatDriverName(insideDriver)})`
      : '';
    
    const outsideText = outsideDriver 
      ? `${outsideDriver.carNumber} (${formatDriverName(outsideDriver)})`
      : '';
    
    result.push({
      'Inside': insideText,
      'Outside': outsideText
    });
  }
  
  return result;
};

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
  
  // This would be replaced with actual Excel generation and download logic
  const exportData = lineups.map(lineup => ({
    className: lineup.className,
    drivers: formatInsideOutsideDataForExcel(lineup.drivers)
  }));
  
  console.log('Excel export data:', exportData);
  
  // In a real implementation, we would:
  // 1. Create an Excel workbook
  // 2. Add worksheets for each class
  // 3. Format headers and data in inside/outside format
  // 4. Apply styling (alternate row colors, etc.)
  // 5. Include the track logo if specified
  // 6. Add "Produced by StagingBoss" footer
  // 7. Trigger file download
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
 * Format data for export (used for non-inside/outside format if needed)
 */
export const formatLineupForExport = (
  lineup: ProcessedLineup
): Record<string, any>[] => {
  return lineup.drivers.map((driver, index) => ({
    Position: index + 1,
    'Car #': driver.carNumber,
    Driver: driver.driverName,
    'Pill #': driver.pillNumber === Number.MAX_SAFE_INTEGER ? '-' : Math.floor(driver.pillNumber),
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
