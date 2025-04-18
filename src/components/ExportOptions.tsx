import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useAppContext } from '@/contexts/AppContext';
import { Download, FileText, Eye } from 'lucide-react';
import { ExportSettings, ProcessedLineup } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LineupPreviewModal from './LineupPreviewModal';

interface ExportOptionsProps {
  triggerButton?: React.ReactNode;
  selectedLineup?: ProcessedLineup | null;
  showPreviewFirst?: boolean;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ 
  triggerButton = (
    <Button variant="default">
      <Download className="mr-2 h-4 w-4" />
      Export Lineups
    </Button>
  ),
  selectedLineup = null,
  showPreviewFirst = false
}) => {
  const { exportLineups, settings, lineups } = useAppContext();
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    includeTrackLogo: settings.defaultExportSettings.includeTrackLogo,
    alternateRowColors: settings.defaultExportSettings.alternateRowColors,
    includeHeaders: settings.defaultExportSettings.includeHeaders,
    fileName: settings.defaultExportSettings.fileName,
    exportFormat: settings.defaultExportSettings.exportFormat || 'pdf',
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [lineupToPreview, setLineupToPreview] = useState<ProcessedLineup | null>(null);
  
  const handleExport = () => {
    exportLineups(exportSettings);
    setIsOpen(false);
  };
  
  const handleOpenDialog = () => {
    if (showPreviewFirst && selectedLineup) {
      // Skip the export dialog and go straight to preview
      setLineupToPreview(selectedLineup);
      setIsPreviewOpen(true);
    } else {
      // Show regular export dialog
      setIsOpen(true);
    }
  };

  const handlePreviewAndExport = () => {
    setIsPreviewOpen(true);
    
    // If a specific lineup is selected, use it; otherwise use the first one
    if (selectedLineup) {
      setLineupToPreview(selectedLineup);
    } else if (lineups.length > 0) {
      setLineupToPreview(lineups[0]);
    }
    
    setIsOpen(false);
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild onClick={handleOpenDialog}>
          {triggerButton}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Race Lineups</DialogTitle>
            <DialogDescription>
              Configure how your race lineups will be exported
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Tabs defaultValue={exportSettings.exportFormat} onValueChange={(value) => setExportSettings({...exportSettings, exportFormat: value as 'excel' | 'pdf'})}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pdf">PDF Format</TabsTrigger>
                <TabsTrigger value="excel">Excel Format</TabsTrigger>
              </TabsList>
              <TabsContent value="pdf">
                <p className="text-xs text-muted-foreground mt-2 mb-4">
                  Export a standard 8.5" x 11" document with one lineup per page
                </p>
              </TabsContent>
              <TabsContent value="excel">
                <p className="text-xs text-muted-foreground mt-2 mb-4">
                  Export to spreadsheet format for further editing
                </p>
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label htmlFor="fileName">File Name</Label>
              <Input
                id="fileName"
                value={exportSettings.fileName}
                onChange={(e) => setExportSettings({...exportSettings, fileName: e.target.value})}
                placeholder="race_lineups"
              />
              <p className="text-xs text-muted-foreground">
                The file will be saved as {exportSettings.fileName || 'race_lineups'}.{exportSettings.exportFormat === 'pdf' ? 'pdf' : 'xlsx'}
              </p>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="trackLogo">Include Track Logo</Label>
                <p className="text-xs text-muted-foreground">
                  Add your track logo to the exported file
                </p>
              </div>
              <Switch
                id="trackLogo"
                checked={exportSettings.includeTrackLogo}
                onCheckedChange={(checked) => setExportSettings({...exportSettings, includeTrackLogo: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="rowColors">Alternate Row Colors</Label>
                <p className="text-xs text-muted-foreground">
                  Use alternating colors for better readability
                </p>
              </div>
              <Switch
                id="rowColors"
                checked={exportSettings.alternateRowColors}
                onCheckedChange={(checked) => setExportSettings({...exportSettings, alternateRowColors: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="headers">Include Headers</Label>
                <p className="text-xs text-muted-foreground">
                  Add column headers to the exported file
                </p>
              </div>
              <Switch
                id="headers"
                checked={exportSettings.includeHeaders}
                onCheckedChange={(checked) => setExportSettings({...exportSettings, includeHeaders: checked})}
              />
            </div>
          </div>
          
          <DialogFooter className="flex space-x-2 justify-between">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            {exportSettings.exportFormat === 'pdf' && (
              <Button variant="secondary" onClick={handlePreviewAndExport}>
                <Eye className="mr-2 h-4 w-4" />
                Preview & Export
              </Button>
            )}
            <Button onClick={handleExport}>
              <FileText className="mr-2 h-4 w-4" />
              Export Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Preview Modal */}
      <LineupPreviewModal
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        lineup={lineupToPreview}
        onExport={handleExport}
      />
    </>
  );
};

export default ExportOptions;
