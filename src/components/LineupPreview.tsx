
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Driver } from '@/types';
import { Download, Trash } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const LineupPreview: React.FC = () => {
  const { lineups, clearLineups, exportLineups } = useAppContext();
  const [selectedClassId, setSelectedClassId] = useState<string>(lineups[0]?.classId || '');

  const selectedLineup = lineups.find(lineup => lineup.classId === selectedClassId);

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
            <div className="flex items-center space-x-4">
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
                
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => exportLineups()}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
            
            {selectedLineup ? (
              <div className="border rounded-md overflow-hidden">
                <div className="p-2 bg-muted font-medium">
                  {selectedLineup.className} Lineup
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Position</TableHead>
                      <TableHead className="w-[100px]">Car #</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead className="w-[100px]">Pill #</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedLineup.drivers.map((driver, index) => (
                      <TableRow key={`${driver.carNumber}-${driver.driverName}`}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{driver.carNumber}</TableCell>
                        <TableCell>{driver.driverName}</TableCell>
                        <TableCell>{driver.pillNumber}</TableCell>
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
    </Card>
  );
};

export default LineupPreview;
