import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash, Eye, FileText, Printer } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import LineupPreviewModal from './LineupPreviewModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

const LineupPreview: React.FC = () => {
  const { lineups, clearLineups, exportLineups } = useAppContext();
  const [selectedClassId, setSelectedClassId] = useState<string>(lineups[0]?.classId || '');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isAllPreviewModalOpen, setIsAllPreviewModalOpen] = useState(false);

  const selectedLineup = lineups.find(lineup => lineup.classId === selectedClassId);

  // Format pill number for display
  const formatPillNumber = (pill: number) => {
    return pill === Number.MAX_SAFE_INTEGER ? '-' : Math.floor(pill).toString();
  };
  
  const handleExport = () => {
    exportLineups();
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>Race Lineup Preview</CardTitle>
        <CardDescription>
          View and export your processed race lineups
        </CardDescription>
      </CardHeader>
      <CardContent>
        {lineups.length === 0 ? (
          <div className="text-center p-8 border border-dashed rounded-md text-muted-foreground">
            No lineups have been processed yet. Go to the Input tab to create lineups.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-full max-w-xs">
                <Select 
                  value={selectedClassId} 
                  onValueChange={setSelectedClassId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {lineups.map(lineup => (
                      <SelectItem key={lineup.classId} value={lineup.classId}>
                        {lineup.className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-x-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear All Lineups</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to clear all lineup data? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={clearLineups}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Clear All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="default" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview & Print
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsPreviewModalOpen(true)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Current Class
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsAllPreviewModalOpen(true)}>
                      <Printer className="h-4 w-4 mr-2" />
                      All Classes
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {selectedLineup ? (
              <div className="border rounded-md overflow-hidden print:border-none">
                <div className="p-2 bg-muted font-medium print:bg-transparent print:text-black print:text-xl print:text-center">
                  {selectedLineup.className} Lineup
                </div>
                <Table className="print:w-full">
                  <TableHeader>
                    <TableRow className="print:bg-gray-200">
                      <TableHead className="w-[80px]">Position</TableHead>
                      <TableHead className="w-[100px]">Car #</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead className="w-[100px]">Pill #</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedLineup.drivers.map((driver, index) => (
                      <TableRow 
                        key={`${driver.carNumber}-${driver.driverName}`}
                        className={index % 2 === 1 ? 'bg-muted/50 print:bg-gray-100' : ''}
                      >
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{driver.carNumber}</TableCell>
                        <TableCell>{driver.driverName}</TableCell>
                        <TableCell>{formatPillNumber(driver.pillNumber)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center p-4 text-muted-foreground">
                Select a class to view its lineup
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {lineups.length > 0 ? 
            `${lineups.length} classes with ${lineups.reduce((count, lineup) => count + lineup.drivers.length, 0)} total drivers` : 
            'No lineup data available'
          }
        </div>
      </CardFooter>
      
      {/* Modal for previewing current class */}
      {selectedLineup && (
        <LineupPreviewModal 
          open={isPreviewModalOpen}
          onOpenChange={setIsPreviewModalOpen}
          lineup={selectedLineup}
          onExport={handleExport}
        />
      )}
      
      {/* Modal for previewing all lineups */}
      {lineups.length > 0 && (
        <LineupPreviewModal 
          open={isAllPreviewModalOpen}
          onOpenChange={setIsAllPreviewModalOpen}
          lineup={lineups[0]} // Ensure we always pass a valid lineup, even for "all" mode
          showAllLineups={true}
          onExport={handleExport}
        />
      )}
    </Card>
  );
};

export default LineupPreview;
