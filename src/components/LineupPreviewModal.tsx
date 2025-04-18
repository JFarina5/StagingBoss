import React, { useState, useRef, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ProcessedLineup } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Slider } from '@/components/ui/slider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ZoomIn, ZoomOut, Printer, FileText, RotateCcw } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

// Define the allowed page layout types
type PageLayout = 'separate' | 'combined';

// Earlier constants remain unchanged
const DEFAULT_FONT_SIZE = 16;
const STORAGE_KEY_FONT_SIZE = 'stagingboss_preferred_font_size';
const STORAGE_KEY_PAGE_LAYOUT = 'stagingboss_preferred_page_layout';
const DEFAULT_PAGE_LAYOUT: PageLayout = 'separate';

interface LineupPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lineup: ProcessedLineup | null;
  onExport: () => void;
  showAllLineups?: boolean;
}

const LineupPreviewModal: React.FC<LineupPreviewModalProps> = ({
  open,
  onOpenChange,
  lineup,
  onExport,
  showAllLineups = false
}) => {
  const { exportLineups, lineups } = useAppContext();
  const [fontSize, setFontSize] = useState(() => {
    const savedFontSize = localStorage.getItem(STORAGE_KEY_FONT_SIZE);
    return savedFontSize ? parseInt(savedFontSize, 10) : DEFAULT_FONT_SIZE;
  });
  const [pageLayout, setPageLayout] = useState<PageLayout>(() => {
    const savedLayout = localStorage.getItem(STORAGE_KEY_PAGE_LAYOUT);
    // Validate that the saved layout is one of the allowed values
    return (savedLayout === 'separate' || savedLayout === 'combined') 
      ? savedLayout 
      : DEFAULT_PAGE_LAYOUT;
  });
  const [showPaginationWarning, setShowPaginationWarning] = useState(false);
  const [requestedFontSize, setRequestedFontSize] = useState(fontSize);
  const previewRef = useRef<HTMLDivElement>(null);
  
  const formatPillNumber = (pill: number) => {
    return pill === Number.MAX_SAFE_INTEGER ? '-' : Math.floor(pill).toString();
  };

  // Save user preferences when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FONT_SIZE, fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PAGE_LAYOUT, pageLayout);
  }, [pageLayout]);

  useEffect(() => {
    const checkPagination = () => {
      if (!previewRef.current) return;
      // Skip pagination warning check if user has selected 'separate pages' layout
      if (pageLayout === 'separate') return false;
      
      const pageHeight = 11 * 96;
      const contentHeight = previewRef.current.scrollHeight;
      return contentHeight > pageHeight;
    };

    const timer = setTimeout(() => {
      const wouldOverflow = checkPagination();
      if (!wouldOverflow || wouldOverflow && fontSize > requestedFontSize) {
        return;
      }
      if (wouldOverflow && fontSize === requestedFontSize) {
        setShowPaginationWarning(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [fontSize, requestedFontSize, pageLayout]);

  const handleFontSizeChange = (newSize: number[]) => {
    setRequestedFontSize(newSize[0]);
    if (previewRef.current) {
      const tempFontSize = newSize[0];
      previewRef.current.style.fontSize = `${tempFontSize}px`;
      const pageHeight = 11 * 96;
      const contentHeight = previewRef.current.scrollHeight;
      if (contentHeight > pageHeight && tempFontSize > fontSize) {
        setShowPaginationWarning(true);
        previewRef.current.style.fontSize = `${fontSize}px`;
      } else {
        setFontSize(tempFontSize);
      }
    }
  };

  const resetToDefaultFontSize = () => {
    setFontSize(DEFAULT_FONT_SIZE);
    setRequestedFontSize(DEFAULT_FONT_SIZE);
    if (previewRef.current) {
      previewRef.current.style.fontSize = `${DEFAULT_FONT_SIZE}px`;
    }
  };

  const confirmFontSizeChange = () => {
    setFontSize(requestedFontSize);
    setShowPaginationWarning(false);
  };

  const cancelFontSizeChange = () => {
    setRequestedFontSize(fontSize);
    setShowPaginationWarning(false);
  };

  const handlePrint = () => {
    localStorage.setItem('stagingboss_print_font_size', fontSize.toString());
    window.print();
  };

  const handleExport = () => {
    exportLineups({
      exportFormat: 'pdf',
      includeTrackLogo: true,
      alternateRowColors: true,
      includeHeaders: true,
      fileName: showAllLineups ? 'All_Lineups' : (lineup ? `${lineup.className}_Lineup` : 'Lineup'),
      customFontSize: fontSize,
      pageLayout: pageLayout
    });
    onOpenChange(false);
  };

  // Handler to convert string value from RadioGroup to PageLayout type
  const handlePageLayoutChange = (value: string) => {
    // Ensure we only set valid values
    if (value === 'separate' || value === 'combined') {
      setPageLayout(value as PageLayout);
    }
  };

  // Don't render anything if modal isn't open
  if (!open) return null;
  
  // Make sure we have some data to show - avoiding errors when accessing props
  if (showAllLineups) {
    // For "all lineups" mode, we need the lineups array to be populated
    if (!lineups || lineups.length === 0) return null;
  } else {
    // For single lineup mode, we need a valid lineup object
    if (!lineup) return null;
  }
  
  // Calculate the total number of drivers for display
  const totalDrivers = showAllLineups 
    ? lineups.reduce((total, l) => total + l.drivers.length, 0)
    : lineup.drivers.length;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {showAllLineups ? 'All Lineups' : lineup?.className} - Preview & Export
            </DialogTitle>
            <DialogDescription>
              Adjust font size and page layout before printing or exporting
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Font size controls */}
            <div>
              <h3 className="text-sm font-medium mb-2">Font Size</h3>
              <div className="flex items-center space-x-2">
                <ZoomOut className="h-4 w-4 text-muted-foreground" />
                <Slider
                  className="w-full"
                  value={[fontSize]}
                  min={10}
                  max={24}
                  step={1}
                  onValueChange={handleFontSizeChange}
                />
                <ZoomIn className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {fontSize}px
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetToDefaultFontSize}
                  title="Reset to default font size"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Page layout controls */}
            <div>
              <h3 className="text-sm font-medium mb-2">Page Layout</h3>
              <RadioGroup 
                className="flex space-x-4" 
                value={pageLayout} 
                onValueChange={handlePageLayoutChange}
                defaultValue="separate"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="separate" id="separate" />
                  <Label htmlFor="separate">Separate Pages</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="combined" id="combined" />
                  <Label htmlFor="combined">All on One Page</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <Separator className="my-2" />

          <div 
            className="border rounded-md preview-container overflow-auto print:border-none" 
            ref={previewRef}
            style={{ 
              fontSize: `${fontSize}px`,
              lineHeight: 1.5,
              transition: "font-size 0.2s ease"
            }}
          >
            <style>
              {`
                .preview-container * {
                  font-size: ${fontSize}px !important;
                }
                .preview-container .table-header {
                  font-size: ${fontSize}px !important;
                  font-weight: bold !important;
                }
                /* For separate pages layout */
                @media print {
                  .page-break-after {
                    page-break-after: always;
                  }
                }
                /* Grid layout for combined view (two classes per row) */
                .combined-layout {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  gap: 1rem;
                }
                /* Full width for separate pages view */
                .separate-layout {
                  display: flex;
                  flex-direction: column;
                  width: 100%;
                }
                /* Make single lineup centered in separate view */
                .separate-layout .class-item {
                  max-width: 700px;
                  margin: 0 auto;
                  width: 100%;
                }
              `}
            </style>

            {showAllLineups && lineups.length > 0 ? (
              <div className={pageLayout === 'combined' ? 'combined-layout' : 'separate-layout'}>
                {lineups.map((lineupItem, index) => (
                  <div 
                    key={lineupItem.classId} 
                    className={`class-item ${pageLayout === 'separate' && index < lineups.length - 1 ? 'page-break-after' : 'mb-6'}`}
                  >
                    <div className="p-2 bg-muted font-medium print:bg-transparent print:text-black print:text-center table-header">
                      {lineupItem.className} Lineup
                    </div>

                    <Table className="print:w-full">
                      <TableHeader>
                        <TableRow className="print:bg-gray-200">
                          <TableHead style={{fontSize: `${fontSize}px`}} className="w-[80px]">Position</TableHead>
                          <TableHead style={{fontSize: `${fontSize}px`}} className="w-[100px]">Car #</TableHead>
                          <TableHead style={{fontSize: `${fontSize}px`}}>Driver</TableHead>
                          <TableHead style={{fontSize: `${fontSize}px`}} className="w-[100px]">Pill #</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lineupItem.drivers.map((driver, driverIndex) => (
                          <TableRow 
                            key={`${lineupItem.classId}-${driver.carNumber}-${driver.driverName}`}
                            className={driverIndex % 2 === 1 ? 'bg-muted/50 print:bg-gray-100' : ''}
                          >
                            <TableCell style={{fontSize: `${fontSize}px`}} className="font-medium">{driverIndex + 1}</TableCell>
                            <TableCell style={{fontSize: `${fontSize}px`}}>{driver.carNumber}</TableCell>
                            <TableCell style={{fontSize: `${fontSize}px`}}>{driver.driverName}</TableCell>
                            <TableCell style={{fontSize: `${fontSize}px`}}>{formatPillNumber(driver.pillNumber)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            ) : lineup ? (
              <>
                <div className="p-2 bg-muted font-medium print:bg-transparent print:text-black print:text-center table-header">
                  {lineup.className} Lineup
                </div>

                <Table id="preview-table" className="print:w-full">
                  <TableHeader>
                    <TableRow className="print:bg-gray-200">
                      <TableHead style={{fontSize: `${fontSize}px`}} className="w-[80px]">Position</TableHead>
                      <TableHead style={{fontSize: `${fontSize}px`}} className="w-[100px]">Car #</TableHead>
                      <TableHead style={{fontSize: `${fontSize}px`}}>Driver</TableHead>
                      <TableHead style={{fontSize: `${fontSize}px`}} className="w-[100px]">Pill #</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineup.drivers.map((driver, index) => (
                      <TableRow 
                        key={`${driver.carNumber}-${driver.driverName}`}
                        className={index % 2 === 1 ? 'bg-muted/50 print:bg-gray-100' : ''}
                      >
                        <TableCell style={{fontSize: `${fontSize}px`}} className="font-medium">{index + 1}</TableCell>
                        <TableCell style={{fontSize: `${fontSize}px`}}>{driver.carNumber}</TableCell>
                        <TableCell style={{fontSize: `${fontSize}px`}}>{driver.driverName}</TableCell>
                        <TableCell style={{fontSize: `${fontSize}px`}}>{formatPillNumber(driver.pillNumber)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            ) : (
              <div className="p-4 text-center">No lineup data available</div>
            )}
          </div>

          <DialogFooter className="mt-4 space-x-2">
            <div className="flex items-center space-x-2 mr-auto">
              <span className="text-sm text-muted-foreground">
                {showAllLineups 
                  ? `${lineups.length} classes with ${totalDrivers} drivers` 
                  : `${totalDrivers} drivers`}
              </span>
            </div>
            <Button variant="secondary" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button onClick={handleExport}>
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showPaginationWarning} onOpenChange={setShowPaginationWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Multiple Pages Detected</AlertDialogTitle>
            <AlertDialogDescription>
              Increasing the font size will cause the content to span multiple pages.
              Do you want to continue with this font size?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelFontSizeChange}>No, Keep Current Size</AlertDialogCancel>
            <AlertDialogAction onClick={confirmFontSizeChange}>Yes, Allow Multiple Pages</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LineupPreviewModal;