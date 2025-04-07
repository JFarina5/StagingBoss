
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
    
    // Format the data for the table
    const tableData = lineup.drivers.map((driver, idx) => [
      (idx + 1).toString(),               // Position
      driver.carNumber,                   // Car #
      driver.driverName,                  // Driver name
      driver.pillNumber === Number.MAX_SAFE_INTEGER ? '-' : Math.floor(driver.pillNumber).toString()  // Pill #
    ]);
    
    // Define table columns
    const columns = ['Pos', 'Car #', 'Driver', 'Pill #'];
    
    // Add the table
    autoTable(doc, {
      head: settings.includeHeaders ? [columns] : undefined,
      body: tableData,
      startY: yPos,
      margin: { left: 0.5, right: 0.5 },
      styles: {
        fontSize: 10,
        cellPadding: 0.1,
      },
      headStyles: {
        fillColor: [80, 80, 80],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: settings.alternateRowColors ? {
        fillColor: [240, 240, 240]
      } : {},
      columnStyles: {
        0: { cellWidth: 0.5 },   // Position
        1: { cellWidth: 0.8 },   // Car #
        2: { cellWidth: 5.7 },   // Driver name
        3: { cellWidth: 0.7 },   // Pill #
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
  
  // Save the PDF
  doc.save(`${settings.fileName || 'race_lineups'}.pdf`);
};
