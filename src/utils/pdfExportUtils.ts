import { ProcessedLineup, ExportSettings, TrackInfo } from '@/types';

/**
 * Export lineups to PDF with improved formatting and dynamic sizing
 * Modified to use portrait mode and vertical layout without wasted space
 */
export const exportToPdf = (
  lineups: ProcessedLineup[],
  settings: ExportSettings,
  trackInfo: TrackInfo
): void => {
  // Create a temporary hidden div for printing
  const printDiv = document.createElement('div');
  printDiv.style.display = 'none';
  document.body.appendChild(printDiv);
  
  // Generate filename based on track name and date
  const date = new Date();
  const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const filename = `${trackInfo.name.replace(/[^a-z0-9]/gi, '_')}_${formattedDate}.pdf`;
  
  // Create print-friendly content with optimized vertical layout for portrait mode
  printDiv.innerHTML = `
    <div style="padding: 5px; font-family: Arial, sans-serif;">
      ${settings.includeTrackLogo && trackInfo.logoUrl ? `
        <div style="text-align: center; margin-bottom: 5px;">
          <img src="${trackInfo.logoUrl}" alt="${trackInfo.name} Logo" style="max-height: 50px; max-width: 100px;">
        </div>
      ` : ''}
      ${generateLineupTables(lineups, settings)}
      <div class="footer">
        Lineups produced by StagingBoss
      </div>
    </div>
  `;
  
  // Apply print styles, including styles for portrait orientation
  const style = document.createElement('style');
  style.innerHTML = `
    @media print {
      @page { 
        size: portrait;
        margin: 0mm; /* Remove default margins to hide headers/footers */
      }
      html, body { 
        margin: 0; 
        padding: 0;
        height: 100%;
      }
      
      /* Content container with minimal padding */
      .print-container {
        padding: 5mm; /* Slightly more padding for better readability */
        box-sizing: border-box;
        position: relative;
        min-height: 100%;
        padding-bottom: 7mm; /* Space for footer */
      }
      
      /* Logo container */
      .logo-container {
        text-align: center;
        margin-bottom: 5px;
      }
      
      /* Logo image styling */
      .track-logo {
        max-width: 100px;
        max-height: 50px;
        object-fit: contain;
      }
      
      /* Fixed footer - positioned at bottom of page */
      .footer {
        position: fixed;
        bottom: 2mm;
        left: 0;
        right: 0;
        text-align: center;
        font-size: 7px;
        color: #999;
      }
      
      /* Avoid page breaks inside class containers */
      .class-header { break-after: avoid; }
      .lineup-table { break-inside: avoid; }
      
      /* Vertical layout for classes - each class appears in sequential order */
      .classes-container {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        gap: 5px;
      }
      
      .class-container {
        width: calc(50% - 5px);
        break-inside: avoid;
        margin-bottom: 5px;
      }
      
      /* Table headers */
      th {
        font-size: 9px !important;
        padding: 2px !important;
      }
      
      /* Dynamic text sizing classes */
      .font-size-1 { font-size: 12px; }
      .font-size-2 { font-size: 11px; }
      .font-size-3 { font-size: 10px; }
      .font-size-4 { font-size: 9px; }
      .font-size-5 { font-size: 8px; }
      .font-size-6 { font-size: 7px; }
      .font-size-7 { font-size: 6px; }
      
      /* Table cell padding options */
      .padding-normal td, .padding-normal th { padding: 3px !important; }
      .padding-compact td, .padding-compact th { padding: 2px !important; }
      .padding-very-compact td, .padding-very-compact th { padding: 1px !important; }
      .padding-ultra-compact td, .padding-ultra-compact th { padding: 0.5px !important; }

      /* Dynamic title sizing classes */
      .title-size-1 { font-size: 14px; }
      .title-size-2 { font-size: 13px; }
      .title-size-3 { font-size: 12px; }
      .title-size-4 { font-size: 11px; }
      
      /* Class headers */
      .class-header-container {
        background-color: #4285F4;
        color: white;
        padding: 2px 4px !important;
        margin-bottom: 3px;
      }
      
      /* Class name heading */
      .class-name-heading {
        margin: 0;
        font-size: 12px;
        font-weight: bold;
      }
    }
  `;
  printDiv.appendChild(style);
  
  // Create an iframe for printing (avoids affecting the main window)
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  
  iframe.onload = () => {
    // Get the iframe document
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;
    
    // Copy our print content to the iframe
    iframeDoc.body.innerHTML = `<div class="print-container">${printDiv.innerHTML}</div>`;
    
    // Apply adaptive sizing logic with an increased focus on portrait mode
    setTimeout(() => {
      fitContentToPage(iframeDoc);
      
      // Print the iframe content
      setTimeout(() => {
        // Display instructions for user
        console.info('For best results with no headers/footers:');
        console.info('- In the print dialog, disable "Headers and Footers"');
        console.info('- Set margins to "None" or "Minimum"');
        console.info('- Ensure "Portrait" orientation is selected');
        
        iframe.contentWindow?.print();
        
        // Clean up after printing
        setTimeout(() => {
          document.body.removeChild(printDiv);
          document.body.removeChild(iframe);
        }, 1000);
      }, 200);
    }, 100);
  };
  
  // Set iframe source to trigger load event
  iframe.src = 'about:blank';
};

/**
 * Dynamically adjust content to fit on a single page in portrait mode
 * More aggressive adaptation for portrait layout
 */
function fitContentToPage(doc: Document): void {
  const container = doc.querySelector('.print-container');
  const tables = doc.querySelectorAll('.lineup-table');
  const classNames = doc.querySelectorAll('.class-name-heading');
  
  if (!container || tables.length === 0) return;
  
  // We're now using a portrait page which is approximately 8.5" x 11" (612pt x 792pt)
  const pageHeight = 792; // 11 inches in points
  const availableHeight = pageHeight - 40; // Account for minimal margins
  
  const fontSizes = ['font-size-1', 'font-size-2', 'font-size-3', 'font-size-4', 'font-size-5', 'font-size-6', 'font-size-7'];
  const paddingSizes = ['padding-normal', 'padding-compact', 'padding-very-compact', 'padding-ultra-compact'];
  const titleSizes = ['title-size-1', 'title-size-2', 'title-size-3', 'title-size-4'];
  
  let currentFontSizeIndex = 0;
  let currentPaddingSizeIndex = 0;
  let currentTitleSizeIndex = 0;
  
  // Start with larger sizes and adjust downward until content fits
  applyStyles(tables, fontSizes[currentFontSizeIndex], paddingSizes[currentPaddingSizeIndex]);
  applyTitleStyle(classNames, titleSizes[currentTitleSizeIndex]);
  
  let contentFits = container.scrollHeight <= availableHeight;
  let iterations = 0;
  const maxIterations = 20; // Set a maximum to prevent infinite loops
  
  // Keep reducing sizes until content fits or we reach our limits
  while (!contentFits && iterations < maxIterations) {
    iterations++;
    
    // Adjust font size first (most impactful)
    if (currentFontSizeIndex < fontSizes.length - 1) {
      currentFontSizeIndex++;
      applyStyles(tables, fontSizes[currentFontSizeIndex], paddingSizes[currentPaddingSizeIndex]);
    }
    // Then adjust padding
    else if (currentPaddingSizeIndex < paddingSizes.length - 1) {
      currentPaddingSizeIndex++;
      applyStyles(tables, fontSizes[currentFontSizeIndex], paddingSizes[currentPaddingSizeIndex]);
    }
    // Finally adjust title size
    else if (currentTitleSizeIndex < titleSizes.length - 1) {
      currentTitleSizeIndex++;
      applyTitleStyle(classNames, titleSizes[currentTitleSizeIndex]);
    }
    else {
      // We've reached the smallest possible sizes and still don't fit
      // We could potentially add more extreme size options, or alert the user
      console.warn("Content may not fit on a single page even at smallest font sizes");
      break;
    }
    
    contentFits = container.scrollHeight <= availableHeight;
  }
  
  console.log(`Content fitted after ${iterations} iterations. Font size index: ${currentFontSizeIndex}, Padding index: ${currentPaddingSizeIndex}, Title index: ${currentTitleSizeIndex}`);
}

/**
 * Apply font and padding styles to tables
 */
function applyStyles(tableElements: NodeListOf<Element>, fontSizeClass: string, paddingSizeClass: string) {
  tableElements.forEach(table => {
    // Remove all font size classes
    ['font-size-1', 'font-size-2', 'font-size-3', 'font-size-4', 'font-size-5', 'font-size-6', 'font-size-7'].forEach(size => {
      table.classList.remove(size);
    });
    
    // Remove all padding classes
    ['padding-normal', 'padding-compact', 'padding-very-compact', 'padding-ultra-compact'].forEach(padding => {
      table.classList.remove(padding);
    });
    
    // Apply the new classes
    table.classList.add(fontSizeClass);
    table.classList.add(paddingSizeClass);
  });
}

/**
 * Apply title style to class headings
 */
function applyTitleStyle(titleElements: NodeListOf<Element>, titleSizeClass: string) {
  titleElements.forEach(title => {
    // Remove all title size classes
    ['title-size-1', 'title-size-2', 'title-size-3', 'title-size-4'].forEach(size => {
      title.classList.remove(size);
    });
    
    // Apply the new class
    title.classList.add(titleSizeClass);
  });
}

/**
 * Generate HTML tables for each class lineup with vertical layout
 */
const generateLineupTables = (
  lineups: ProcessedLineup[],
  settings: ExportSettings
): string => {
  let html = '<div class="classes-container">';
  
  // Each class is its own container, with two classes per row
  lineups.forEach((lineup) => {
    html += generateClassTable(lineup, settings);
  });
  
  html += '</div>';
  return html;
};

/**
 * Generate HTML table for a single class with readable format
 */
const generateClassTable = (
  lineup: ProcessedLineup,
  settings: ExportSettings
): string => {
  const tableData = formatInsideOutsideData(lineup.drivers);
  
  return `
    <div class="class-container">
      <div class="class-header">
        <div style="background-color: #4285F4; color: white; padding: 2px 4px; margin-bottom: 3px;">
          <h2 class="class-name-heading">${lineup.className}</h2>
        </div>
        <table class="lineup-table" style="width: 100%; border-collapse: collapse;">
          ${settings.includeHeaders ? `
            <thead>
              <tr>
                <th style="width: 50%; border: 1px solid #ddd; text-align: center; background-color: #f2f2f2;">Inside</th>
                <th style="width: 50%; border: 1px solid #ddd; text-align: center; background-color: #f2f2f2;">Outside</th>
              </tr>
            </thead>
          ` : ''}
          <tbody>
            ${tableData.map((row, rowIndex) => `
              <tr style="background-color: ${settings.alternateRowColors && rowIndex % 2 === 1 ? '#f9f9f9' : 'white'}">
                <td style="border: 1px solid #ddd; text-align: center;">${row[0]}</td>
                <td style="border: 1px solid #ddd; text-align: center;">${row[1]}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
};

/**
 * Format driver data in inside/outside format
 * Modified for better readability with two classes per row
 */
const formatInsideOutsideData = (drivers: Array<any>): Array<Array<string>> => {
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
  
  const result: Array<Array<string>> = [];
  
  // Split drivers into inside and outside
  const totalDrivers = sortedDrivers.length;
  const rows = Math.ceil(totalDrivers / 2);
  
  for (let i = 0; i < rows; i++) {
    const insideIndex = i;
    const outsideIndex = i + rows;
    
    const insideDriver = insideIndex < totalDrivers ? sortedDrivers[insideIndex] : null;
    const outsideDriver = outsideIndex < totalDrivers ? sortedDrivers[outsideIndex] : null;
    
    // Format driver info more legibly for two-column layout
    const formatDriverInfo = (driver: any): string => {
      if (!driver) return '';
      
      // For better readability with two columns, show car number and last name
      const nameParts = driver.driverName.split(' ');
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : driver.driverName;
      
      return `${driver.carNumber} (${lastName})`;
    };
    
    const insideText = insideDriver ? formatDriverInfo(insideDriver) : '';
    const outsideText = outsideDriver ? formatDriverInfo(outsideDriver) : '';
    
    result.push([insideText, outsideText]);
  }
  
  return result;
};
