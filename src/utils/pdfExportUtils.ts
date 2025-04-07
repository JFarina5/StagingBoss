
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProcessedLineup, ExportSettings, TrackInfo } from '@/types';

/**
 * Export lineups to a PDF file
 */
export const exportToPdf = (
  lineups: ProcessedLineup[],
  settings: ExportSettings,
  trackInfo: TrackInfo
): void => {
  // Create new PDF document in portrait orientation
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: 'letter' // 8.5" x 11"
  });
  
  // Set font
  doc.setFont('helvetica');
  
  // Add track info at the top
  doc.setFontSize(18);
  doc.text(trackInfo.name, 4.25, 0.6, { align: 'center' });
  
  doc.setFontSize(12);
  const currentDate = new Date().toLocaleDateString();
  doc.text(`Race Date: ${currentDate}`, 4.25, 0.9, { align: 'center' });
  
  // Include track logo if specified
  if (settings.includeTrackLogo && trackInfo.logoUrl) {
    try {
      // In a real implementation, would need proper image handling
      // This is a placeholder for the concept
      // doc.addImage(trackInfo.logoUrl, 'JPEG', 0.5, 0.5, 1, 1);
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
    }
  }
  
  // Set starting y position
  let yPos = 1.3;
  
  // Loop through each class lineup and add to PDF
  lineups.forEach((lineup, index) => {
    // Add some spacing between tables
    if (index > 0) {
      yPos += 0.4;
    }
    
    // Add class name as header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(lineup.className, 0.5, yPos);
    yPos += 0.3;
    
    // Format the data for the inside/outside table
    const formattedData = formatInsideOutsideData(lineup.drivers);
    
    // Define table headers
    const headers = [['Inside', 'Outside']];
    
    // Add the table
    autoTable(doc, {
      head: settings.includeHeaders ? headers : undefined,
      body: formattedData,
      startY: yPos,
      margin: { left: 0.5, right: 0.5 },
      styles: {
        fontSize: 10,
        cellPadding: 0.1,
      },
      headStyles: {
        fillColor: [100, 149, 237], // Cornflower blue color similar to image
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      alternateRowStyles: settings.alternateRowColors ? {
        fillColor: [240, 240, 240]
      } : {},
      columnStyles: {
        0: { cellWidth: 3.7, halign: 'center' },   // Inside
        1: { cellWidth: 3.7, halign: 'center' },   // Outside
      },
    });
    
    // Update yPos to after the table
    yPos = (doc as any).lastAutoTable.finalY + 0.2;
    
    // Add page break if needed and not the last lineup
    if (yPos > 9.5 && index < lineups.length - 1) {
      doc.addPage();
      yPos = 0.5;
    }
  });
  
  // Add "produced by StagingBoss" footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150); // Light gray color
  doc.text("Lineups produced by StagingBoss", 4.25, 10.5, { align: 'center' });
  
  // Save the PDF
  doc.save(`${settings.fileName || 'race_lineups'}.pdf`);
};

/**
 * Format driver data in inside/outside format
 */
const formatInsideOutsideData = (drivers: Array<any>): Array<Array<string>> => {
  // Sort drivers by pill number (should already be sorted, but just to be sure)
  const sortedDrivers = [...drivers].sort((a, b) => {
    if (a.pillNumber === Number.MAX_SAFE_INTEGER && b.pillNumber === Number.MAX_SAFE_INTEGER) {
      return 0; // Keep original order for both without pill numbers
    }
    if (a.pillNumber === Number.MAX_SAFE_INTEGER) return 1;
    if (b.pillNumber === Number.MAX_SAFE_INTEGER) return -1;
    return a.pillNumber - b.pillNumber;
  });
  
  const result: Array<Array<string>> = [];
  
  // Split drivers into inside and outside
  const totalDrivers = sortedDrivers.length;
  const rows = Math.ceil(totalDrivers / 2);
  
  for (let i = 0; i < rows; i++) {
    const insideIndex = i;
    const outsideIndex = i + rows;
    
    const insideDriver = insideIndex < totalDrivers ? sortedDrivers[insideIndex] : null;
    const outsideDriver = outsideIndex < totalDrivers ? sortedDrivers[outsideIndex] : null;
    
    const insideText = insideDriver 
      ? `${insideDriver.carNumber} (${insideDriver.driverName.charAt(0)}. ${insideDriver.driverName.split(' ')[1]})`
      : '';
    
    const outsideText = outsideDriver 
      ? `${outsideDriver.carNumber} (${outsideDriver.driverName.charAt(0)}. ${outsideDriver.driverName.split(' ')[1]})`
      : '';
    
    result.push([insideText, outsideText]);
  }
  
  return result;
};
