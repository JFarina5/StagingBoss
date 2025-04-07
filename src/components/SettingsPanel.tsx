
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAppContext } from '@/contexts/AppContext';
import { Moon, Settings, Sun } from 'lucide-react';

const SettingsPanel: React.FC = () => {
  const { settings, updateTrackInfo, toggleDarkMode, darkMode } = useAppContext();
  const [trackName, setTrackName] = useState(settings.trackInfo.name);
  const [trackLocation, setTrackLocation] = useState(settings.trackInfo.location || '');

  const handleSaveTrackInfo = () => {
    updateTrackInfo({
      name: trackName,
      location: trackLocation || undefined,
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
            <Label htmlFor="track-logo">Track Logo (Coming Soon)</Label>
            <div className="border rounded-md p-6 bg-muted/30 text-center text-muted-foreground">
              <p>Logo upload functionality will be available soon</p>
            </div>
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
