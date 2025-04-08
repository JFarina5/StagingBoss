
import { ProcessedLineup, ExportSettings, TrackInfo } from '@/types';

/**
 * Export lineups to PDF with improved formatting and dynamic sizing
 * With enhanced single-page focus to ensure all content fits
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
  
  // Create print-friendly content with compact layout
  printDiv.innerHTML = `
    <div style="padding: 10px; font-family: Arial, sans-serif;">
      ${settings.includeTrackLogo && trackInfo.logoUrl ? `
        <div style="text-align: center; margin-bottom: 5px;">
          <img src="${trackInfo.logoUrl}" alt="${trackInfo.name} Logo" style="max-height: 60px; max-width: 120px;">
        </div>
      ` : ''}
      ${generateLineupTables(lineups, settings)}
      <div class="footer">
        Lineups produced by StagingBoss
      </div>
    </div>
  `;
  
  // Apply print styles, including styles to hide browser headers and footers
  const style = document.createElement('style');
  style.innerHTML = `
    @media print {
      @page { 
        size: landscape;
        margin: 0mm; /* Remove default margins to hide headers/footers */
      }
      html, body { 
        margin: 0; 
        padding: 0;
        height: 100%;
      }
      
      /* Content container with padding */
      .print-container {
        padding: 5mm; /* Reduced padding to maximize content space */
        box-sizing: border-box;
        position: relative;
        min-height: 100%;
        padding-bottom: 10mm; /* Reduced space for footer */
      }
      
      /* Logo container */
      .logo-container {
        text-align: center;
        margin-bottom: 5px; /* Reduced margin */
      }
      
      /* Logo image styling */
      .track-logo {
        max-width: 120px; /* Reduced size */
        max-height: 60px; /* Reduced size */
        object-fit: contain;
      }
      
      /* Fixed footer - positioned at bottom of page */
      .footer {
        position: fixed;
        bottom: 2mm; /* Reduced margin */
        left: 0;
        right: 0;
        text-align: center;
        font-size: 6px; /* Smaller font size */
        color: #999;
      }
      
      /* Avoid page breaks inside class containers */
      .class-header { break-after: avoid; }
      .lineup-table { break-inside: avoid; }
      .page-break { page-break-after: always; }
      
      /* Grid layout for classes - 2 per row like in test.py */
      .classes-grid {
        display: grid;
        grid-template-columns: 1fr 1fr; /* Two columns */
        grid-gap: 5px; /* Reduced gap */
        width: 100%;
        margin-bottom: 10px; /* Reduced margin */
      }
      
      .class-container {
        break-inside: avoid;
      }
      
      /* Smaller table headers */
      th {
        font-size: 8px !important; /* Further reduced */
        padding: 2px !important;
      }
      
      /* Dynamic text sizing classes - gradually reduce */
      .font-size-1 { font-size: 12px; }
      .font-size-2 { font-size: 10px; }
      .font-size-3 { font-size: 9px; }
      .font-size-4 { font-size: 8px; }
      .font-size-5 { font-size: 7px; }
      .font-size-6 { font-size: 6px; }
      .font-size-7 { font-size: 5px; }
      
      /* Compact table cells when space is limited */
      .padding-normal td, .padding-normal th { padding: 3px !important; }
      .padding-compact td, .padding-compact th { padding: 2px !important; }
      .padding-very-compact td, .padding-very-compact th { padding: 1px !important; }
      .padding-ultra-compact td, .padding-ultra-compact th { padding: 0px !important; }

      /* Dynamic title sizing classes */
      .title-size-1 { font-size: 18px; } /* Reduced sizes */
      .title-size-2 { font-size: 16px; }
      .title-size-3 { font-size: 14px; }
      .title-size-4 { font-size: 12px; }
      
      /* Compact class headers */
      .class-header-container {
        background-color: #4285F4;
        color: white;
        padding: 3px 8px !important; /* Reduced padding */
        margin-bottom: 5px; /* Reduced margin */
      }
      
      /* Class name heading */
      .class-name-heading {
        margin: 0;
        font-size: 14px; /* Smaller font size */
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
    
    // Apply adaptive sizing logic
    setTimeout(() => {
      fitContentToPage(iframeDoc);
      
      // Print the iframe content
      setTimeout(() => {
        // Display instructions for user
        console.info('For best results with no headers/footers:');
        console.info('- In the print dialog, disable "Headers and Footers"');
        console.info('- Set margins to "None" or "Minimum"');
        
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
 * Dynamically adjust content to fit on a single page
 * More aggressive adaptation than previous version
 */
function fitContentToPage(doc: Document): void {
  const container = doc.querySelector('.print-container');
  const tables = doc.querySelectorAll('.lineup-table');
  const title = doc.querySelector('h1');

  if (!container || tables.length === 0 || !title) return;

  const pageHeight = 792; // 11 inches in points (8.5" x 11" at 72 DPI)
  const availableHeight = pageHeight - 50; // Account for margins

  const fontSizes = ['font-size-1', 'font-size-2', 'font-size-3', 'font-size-4', 'font-size-5', 'font-size-6', 'font-size-7'];
  const paddingSizes = ['padding-normal', 'padding-compact', 'padding-very-compact', 'padding-ultra-compact'];
  const titleSizes = ['title-size-1', 'title-size-2', 'title-size-3', 'title-size-4'];

  let currentFontSizeIndex = 0;
  let currentPaddingSizeIndex = 0;
  let currentTitleSizeIndex = 0;

  applyStyles(tables, fontSizes[currentFontSizeIndex], paddingSizes[currentPaddingSizeIndex]);
  applyTitleStyle(title, titleSizes[currentTitleSizeIndex]);

  let contentFits = container.scrollHeight <= availableHeight;

  while (!contentFits && (currentFontSizeIndex < fontSizes.length - 1 || currentPaddingSizeIndex < paddingSizes.length - 1 || currentTitleSizeIndex < titleSizes.length - 1)) {
    if (currentFontSizeIndex < fontSizes.length - 1) {
      currentFontSizeIndex++;
    } else if (currentPaddingSizeIndex < paddingSizes.length - 1) {
      currentPaddingSizeIndex++;
    } else if (currentTitleSizeIndex < titleSizes.length - 1) {
      currentTitleSizeIndex++;
    }

    applyStyles(tables, fontSizes[currentFontSizeIndex], paddingSizes[currentPaddingSizeIndex]);
    applyTitleStyle(title, titleSizes[currentTitleSizeIndex]);

    contentFits = container.scrollHeight <= availableHeight;
  }

  function applyStyles(tableElements: NodeListOf<Element>, fontSizeClass: string, paddingSizeClass: string) {
    tableElements.forEach(table => {
      fontSizes.forEach(size => table.classList.remove(size));
      paddingSizes.forEach(padding => table.classList.remove(padding));
      table.classList.add(fontSizeClass);
      table.classList.add(paddingSizeClass);
    });
  }

  function applyTitleStyle(titleElement: Element, titleSizeClass: string) {
    titleSizes.forEach(size => titleElement.classList.remove(size));
    titleElement.classList.add(titleSizeClass);
  }
}

/**
 * Generate HTML tables for each class lineup with two classes per row
 * Similar to the layout in test.py
 */
const generateLineupTables = (
  lineups: ProcessedLineup[],
  settings: ExportSettings
): string => {
  let html = '';
  
  // Group classes into rows of 2, similar to test.py
  for (let i = 0; i < lineups.length; i += 2) {
    // Start a new grid container for each row of classes
    html += '<div class="classes-grid">';
    
    // Add the first class in this row
    html += generateClassTable(lineups[i], settings);
    
    // Add the second class if it exists
    if (i + 1 < lineups.length) {
      html += generateClassTable(lineups[i + 1], settings);
    }
    
    // Close the grid container
    html += '</div>';
    
    // Add a page break after every 2 rows (4 classes) except for the last row
    if (i + 2 < lineups.length && (i + 2) % 4 === 0) {
      html += '<div class="page-break"></div>';
    }
  }
  
  return html;
};

/**
 * Generate HTML table for a single class
 */
const generateClassTable = (
  lineup: ProcessedLineup,
  settings: ExportSettings
): string => {
  const tableData = formatInsideOutsideData(lineup.drivers);
  
  return `
    <div class="class-container">
      <div class="class-header">
        <div style="background-color: #4285F4; color: white; padding: 8px 15px; margin-bottom: 10px;">
          <h2 style="margin: 0;">${lineup.className}</h2>
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
 * Format driver data in inside/outside format with enhanced driver name formatting
 * Similar to approach used in test.py
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
    
    // Enhanced driver name formatting similar to test.py
    const formatDriverName = (driver: any): string => {
      if (!driver) return '';
      
      const nameParts = driver.driverName.split(' ');
      
      if (nameParts.length === 1) {
        return driver.driverName; // Just use the single name part
      } else {
        // Get last name only
        const lastName = nameParts.slice(1).join(' ');
        return `${lastName}`;
      }
    };
    
    const insideText = insideDriver 
      ? `${insideDriver.carNumber} (${formatDriverName(insideDriver)})`
      : '';
    
    const outsideText = outsideDriver 
      ? `${outsideDriver.carNumber} (${formatDriverName(outsideDriver)})`
      : '';
    
    result.push([insideText, outsideText]);
  }
  
  return result;
};

/**
 * Generate HTML for the logo with proper scaling
 */
const generateLogoHtml = (logoUrl: string): string => {
  // Calculate responsive dimensions similar to test.py logo handling
  return `
    <div class="logo-container">
      <img 
        src="${logoUrl}" 
        alt="Track Logo" 
        class="track-logo"
        onload="this.style.maxHeight = Math.min(80, this.naturalHeight) + 'px';"
      >
    </div>
  `;
};
