import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Moon, Settings, Sun } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const { darkMode, toggleDarkMode, settings } = useAppContext();

  return (
    <div className="w-full border-b border-border">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center">
            <img 
              src="/stagingboss.png" 
              alt="StagingBoss Logo" 
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>
          <h1 className="font-bold text-lg sm:text-xl">
            StagingBoss <span className="hidden sm:inline-block text-muted-foreground font-normal">Race Lineup Manager</span>
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {settings.trackInfo.name}
          </div>
        </div>
      </div>
      <div className="container flex items-center px-4 md:px-6 h-12 border-t bg-muted/20">
        <Tabs defaultValue={activeTab} className="w-full" onValueChange={onTabChange}>
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="input">Input</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="lineup">Lineup</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default Header;
