import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAppContext } from '@/contexts/AppContext';
import { Moon, Settings, Sun, Upload, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const SettingsPanel: React.FC = () => {
  const { settings, updateTrackInfo, toggleDarkMode, darkMode } = useAppContext();
  const [trackName, setTrackName] = useState(settings.trackInfo.name);
  const [trackLocation, setTrackLocation] = useState(settings.trackInfo.location || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleSaveTrackInfo = () => {
    updateTrackInfo({
      name: trackName,
      location: trackLocation || undefined,
      logoUrl: settings.trackInfo.logoUrl
    });
  };
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Logo image must be less than 5MB",
        variant: "destructive"
      });
      return;
    }
    
    // Read and convert file to data URL
    const reader = new FileReader();
    
    // Create an AbortController for cleanup
    const controller = new AbortController();
    
    reader.onload = (event) => {
      if (controller.signal.aborted) return;
      
      const logoUrl = event.target?.result as string;
      if (!logoUrl) {
        toast({
          title: "Upload Failed",
          description: "Failed to process the image",
          variant: "destructive"
        });
        return;
      }
      
      updateTrackInfo({
        ...settings.trackInfo,
        logoUrl
      });
      
      toast({
        title: "Logo Uploaded",
        description: "Track logo has been updated and saved"
      });
    };
    
    reader.onerror = () => {
      if (controller.signal.aborted) return;
      
      toast({
        title: "Upload Failed",
        description: "An error occurred while processing the image",
        variant: "destructive"
      });
    };
    
    reader.readAsDataURL(file);
    
    // Cleanup function
    return () => {
      controller.abort();
      reader.abort();
    };
  };
  
  const handleRemoveLogo = () => {
    updateTrackInfo({
      ...settings.trackInfo,
      logoUrl: undefined
    });
    
    toast({
      title: "Logo Removed",
      description: "Track logo has been removed"
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Theme Settings</CardTitle>
          <CardDescription>
            Customize the appearance of the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Toggle between light and dark theme
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch 
                id="dark-mode" 
                checked={darkMode}
                onCheckedChange={toggleDarkMode}
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <Separator />
          
          <div className="p-4 rounded-md bg-primary/5 border">
            <h3 className="font-medium mb-2">Current Theme</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-primary"></div>
                  <span className="text-sm">Primary</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-secondary"></div>
                  <span className="text-sm">Secondary</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-accent"></div>
                  <span className="text-sm">Accent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-muted"></div>
                  <span className="text-sm">Muted</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Track Information</CardTitle>
          <CardDescription>
            Set details about your racing venue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="track-name">Track Name</Label>
            <Input 
              id="track-name" 
              placeholder="e.g., Speedway Park"
              value={trackName}
              onChange={(e) => setTrackName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="track-location">Location (Optional)</Label>
            <Input 
              id="track-location" 
              placeholder="e.g., Anytown, GA"
              value={trackLocation}
              onChange={(e) => setTrackLocation(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="track-logo">Track Logo</Label>
            <input
              type="file"
              id="track-logo"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {settings.trackInfo.logoUrl ? (
              <div className="space-y-3">
                <div className="border rounded-md p-4 flex justify-center bg-muted/30">
                  <img 
                    src={settings.trackInfo.logoUrl} 
                    alt="Track Logo" 
                    className="max-h-32 max-w-full object-contain"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleUploadClick}
                    className="flex-1"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Change Logo
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleRemoveLogo}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border rounded-md p-6 bg-muted/30 flex flex-col items-center justify-center space-y-2">
                <Button 
                  variant="outline" 
                  onClick={handleUploadClick}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Logo
                </Button>
                <p className="text-sm text-muted-foreground">
                  Upload a PNG or JPG image (max 5MB)
                </p>
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleSaveTrackInfo}
            disabled={!trackName.trim()}
            className="w-full mt-2"
          >
            Save Track Information
          </Button>
        </CardContent>
      </Card>
      
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Export Settings</CardTitle>
          <CardDescription>
            Configure how your race lineups are exported
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="include-logo">Include Track Logo</Label>
              <p className="text-sm text-muted-foreground">
                Add your track logo to exported documents
              </p>
            </div>
            <Switch id="include-logo" defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="row-colors">Alternate Row Colors</Label>
              <p className="text-sm text-muted-foreground">
                Use alternating colors for rows in exports
              </p>
            </div>
            <Switch id="row-colors" defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="include-headers">Include Headers</Label>
              <p className="text-sm text-muted-foreground">
                Add column headers to exported documents
              </p>
            </div>
            <Switch id="include-headers" defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPanel;
