
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Driver, ProcessedLineup, RaceClass, AppSettings, TrackInfo, ExportSettings } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface AppContextType {
  classes: RaceClass[];
  lineups: ProcessedLineup[];
  rawData: string;
  settings: AppSettings;
  darkMode: boolean;
  // Actions
  addClass: (newClass: RaceClass) => void;
  updateClass: (updatedClass: RaceClass) => void;
  removeClass: (classId: string) => void;
  setRawData: (data: string) => void;
  processLineups: () => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  toggleDarkMode: () => void;
  updateTrackInfo: (info: TrackInfo) => void;
  clearLineups: () => void;
  exportLineups: (exportSettings?: ExportSettings) => void;
}

const defaultSettings: AppSettings = {
  darkMode: false,
  trackInfo: {
    name: 'Default Track',
  },
  defaultExportSettings: {
    includeTrackLogo: true,
    alternateRowColors: true,
    includeHeaders: true,
    fileName: 'race_lineups',
  },
};

const defaultClasses: RaceClass[] = [
  { id: '1', name: 'Super Late Models' },
  { id: '2', name: 'Limited Late Models' },
  { id: '3', name: 'Street Stock' },
];

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [classes, setClasses] = useState<RaceClass[]>(defaultClasses);
  const [lineups, setLineups] = useState<ProcessedLineup[]>([]);
  const [rawData, setRawData] = useState<string>('');
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  const darkMode = settings.darkMode;

  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Add a new racing class
  const addClass = (newClass: RaceClass) => {
    setClasses(prev => [...prev, { ...newClass, id: newClass.id || Date.now().toString() }]);
    toast({
      title: 'Class Added',
      description: `${newClass.name} has been added to your classes.`,
    });
  };

  // Update an existing class
  const updateClass = (updatedClass: RaceClass) => {
    setClasses(prev => prev.map(c => c.id === updatedClass.id ? updatedClass : c));
    toast({
      title: 'Class Updated',
      description: `${updatedClass.name} has been updated.`,
    });
  };

  // Remove a class
  const removeClass = (classId: string) => {
    const classToRemove = classes.find(c => c.id === classId);
    if (!classToRemove) return;
    
    setClasses(prev => prev.filter(c => c.id !== classId));
    // Also remove any lineups associated with this class
    setLineups(prev => prev.filter(lineup => lineup.classId !== classId));
    
    toast({
      title: 'Class Removed',
      description: `${classToRemove.name} has been removed.`,
    });
  };

  // Process the raw input data into lineups
  const processLineups = () => {
    if (!rawData.trim()) {
      toast({
        title: 'No Data',
        description: 'Please enter lineup data first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Split by lines and parse
      const lines = rawData.trim().split('\n');
      const drivers: Driver[] = [];
      
      for (const line of lines) {
        const [carNumber, driverName, pillNumberStr, className] = line.split('\t');
        
        // Find the class ID
        const classObj = classes.find(c => c.name === className);
        if (!classObj) {
          toast({
            title: 'Unknown Class',
            description: `Class "${className}" not found. Please add it first.`,
            variant: 'destructive',
          });
          continue;
        }
        
        const pillNumber = parseInt(pillNumberStr, 10);
        if (isNaN(pillNumber)) {
          toast({
            title: 'Invalid Pill Number',
            description: `Pill number for ${driverName} is not a valid number.`,
            variant: 'destructive',
          });
          continue;
        }
        
        drivers.push({
          carNumber,
          driverName,
          pillNumber,
          className,
          classId: classObj.id,
        });
      }
      
      // Group by class
      const groupedByClass: Record<string, Driver[]> = {};
      
      drivers.forEach(driver => {
        if (!groupedByClass[driver.classId]) {
          groupedByClass[driver.classId] = [];
        }
        groupedByClass[driver.classId].push(driver);
      });
      
      // Sort each class by pill number and create processed lineups
      const processedLineups: ProcessedLineup[] = Object.keys(groupedByClass).map(classId => {
        const classObj = classes.find(c => c.id === classId);
        return {
          classId,
          className: classObj?.name || 'Unknown Class',
          drivers: groupedByClass[classId].sort((a, b) => a.pillNumber - b.pillNumber),
        };
      });
      
      setLineups(processedLineups);
      
      toast({
        title: 'Lineups Processed',
        description: `Successfully processed lineups for ${processedLineups.length} classes.`,
      });
    } catch (error) {
      console.error('Error processing lineups:', error);
      toast({
        title: 'Processing Error',
        description: 'An error occurred while processing the lineup data.',
        variant: 'destructive',
      });
    }
  };

  // Update app settings
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  // Update track info
  const updateTrackInfo = (info: TrackInfo) => {
    setSettings(prev => ({ ...prev, trackInfo: { ...prev.trackInfo, ...info } }));
    toast({
      title: 'Track Info Updated',
      description: `Track information has been updated.`,
    });
  };

  // Clear all lineups
  const clearLineups = () => {
    setLineups([]);
    setRawData('');
    toast({
      title: 'Lineups Cleared',
      description: 'All lineup data has been cleared.',
    });
  };

  // Export lineups
  const exportLineups = (exportSettings?: ExportSettings) => {
    const settings = exportSettings || defaultSettings.defaultExportSettings;
    
    if (lineups.length === 0) {
      toast({
        title: 'No Lineups',
        description: 'There are no lineups to export.',
        variant: 'destructive',
      });
      return;
    }
    
    // In a real app, this would generate and download an Excel file
    // For now, we'll just show a success toast
    toast({
      title: 'Export Started',
      description: `Exporting ${lineups.length} classes to ${settings.fileName}.xlsx`,
    });
    
    // Simulate export success after a delay
    setTimeout(() => {
      toast({
        title: 'Export Complete',
        description: 'Your lineups have been exported successfully.',
      });
    }, 1500);
  };

  const value = useMemo(() => ({
    classes,
    lineups,
    rawData,
    settings,
    darkMode,
    addClass,
    updateClass,
    removeClass,
    setRawData,
    processLineups,
    updateSettings,
    toggleDarkMode,
    updateTrackInfo,
    clearLineups,
    exportLineups,
  }), [classes, lineups, rawData, settings, darkMode]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
