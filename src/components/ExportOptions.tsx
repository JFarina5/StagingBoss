
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useAppContext } from '@/contexts/AppContext';
import { Download } from 'lucide-react';
import { ExportSettings } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ExportOptionsProps {
  triggerButton?: React.ReactNode;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ 
  triggerButton = (
    <Button variant="default">
      <Download className="mr-2 h-4 w-4" />
      Export Lineups
    </Button>
  ) 
}) => {
  const { exportLineups, settings } = useAppContext();
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    includeTrackLogo: settings.defaultExportSettings.includeTrackLogo,
    alternateRowColors: settings.defaultExportSettings.alternateRowColors,
    includeHeaders: settings.defaultExportSettings.includeHeaders,
    fileName: settings.defaultExportSettings.fileName,
    exportFormat: settings.defaultExportSettings.exportFormat || 'pdf',
  });
  const [isOpen, setIsOpen] = useState(false);
  
  const handleExport = () => {
    exportLineups(exportSettings);
    setIsOpen(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
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
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            Export Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportOptions;
