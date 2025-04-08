import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Driver, ProcessedLineup, RaceClass, AppSettings, TrackInfo, ExportSettings, STORAGE_KEYS } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { parseRawData, processLineups as processLineupUtil } from '@/utils/lineupProcessor';
import { exportLineups as exportLineupsUtil } from '@/utils/exportUtils';

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
  processLineups: (selectedClassId: string) => string | null;
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
    exportFormat: 'pdf',
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
    const loadPersistedData = () => {
      try {
        const persistedTrackInfo = localStorage.getItem(STORAGE_KEYS.TRACK_INFO);
        if (persistedTrackInfo) {
          const trackInfo = JSON.parse(persistedTrackInfo);
          setSettings(prev => ({ ...prev, trackInfo }));
        }

        const persistedDarkMode = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
        if (persistedDarkMode !== null) {
          setSettings(prev => ({ ...prev, darkMode: persistedDarkMode === 'true' }));
        }

        const persistedClasses = localStorage.getItem(STORAGE_KEYS.CLASSES);
        if (persistedClasses) {
          setClasses(JSON.parse(persistedClasses));
        }

        const persistedExportSettings = localStorage.getItem(STORAGE_KEYS.EXPORT_SETTINGS);
        if (persistedExportSettings) {
          setSettings(prev => ({ ...prev, defaultExportSettings: JSON.parse(persistedExportSettings) }));
        }
      } catch (error) {
        console.error('Error loading persisted data:', error);
      }
    };

    loadPersistedData();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, darkMode.toString());
  }, [darkMode]);

  const addClass = (newClass: RaceClass) => {
    const updatedClasses = [...classes, { ...newClass, id: newClass.id || Date.now().toString() }];
    setClasses(updatedClasses);
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(updatedClasses));
    
    toast({
      title: 'Class Added',
      description: `${newClass.name} has been added to your classes.`,
    });
  };

  const updateClass = (updatedClass: RaceClass) => {
    const updatedClasses = classes.map(c => c.id === updatedClass.id ? updatedClass : c);
    setClasses(updatedClasses);
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(updatedClasses));
    
    toast({
      title: 'Class Updated',
      description: `${updatedClass.name} has been updated.`,
    });
  };

  const removeClass = (classId: string) => {
    const classToRemove = classes.find(c => c.id === classId);
    if (!classToRemove) return;
    
    const updatedClasses = classes.filter(c => c.id !== classId);
    setClasses(updatedClasses);
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(updatedClasses));
    
    setLineups(prev => prev.filter(lineup => lineup.classId !== classId));
    
    toast({
      title: 'Class Removed',
      description: `${classToRemove.name} has been removed.`,
    });
  };

  const getNextClass = (currentClassId: string): RaceClass | undefined => {
    const currentIndex = classes.findIndex(c => c.id === currentClassId);
    if (currentIndex === -1) return undefined;
    
    // Get next index, wrapping around to the beginning if needed
    const nextIndex = (currentIndex + 1) % classes.length;
    return classes[nextIndex];
  };

  const processLineups = (selectedClassId: string): string | null => {
    if (!rawData.trim()) {
      toast({
        title: 'No Data',
        description: 'Please enter lineup data first.',
        variant: 'destructive',
      });
      return null;
    }
    
    if (!selectedClassId) {
      toast({
        title: 'No Class Selected',
        description: 'Please select a racing class for this lineup.',
        variant: 'destructive',
      });
      return null;
    }
    
    try {
      const { drivers, errors } = parseRawData(rawData, classes, selectedClassId);
      
      if (errors.length > 0) {
        errors.forEach(error => {
          toast({
            title: 'Warning',
            description: error,
            variant: 'default',
          });
        });
      }
      
      if (drivers.length === 0) {
        toast({
          title: 'No Valid Drivers',
          description: 'No valid driver data was found in the input.',
          variant: 'destructive',
        });
        return null;
      }
      
      const processedLineups = processLineupUtil(drivers, classes);
      
      setLineups(prev => {
        const existingLineups = prev.filter(lineup => 
          !processedLineups.some(pl => pl.classId === lineup.classId)
        );
        
        return [...existingLineups, ...processedLineups];
      });
      
      const classObj = classes.find(c => c.id === selectedClassId);
      toast({
        title: 'Lineup Processed',
        description: `Successfully processed lineup for ${classObj?.name || 'Unknown Class'} with ${drivers.length} drivers.`,
      });

      // Auto-advance to the next class
      const nextClass = getNextClass(selectedClassId);
      if (nextClass) {
        // Clear the input field if the next class doesn't already have data
        const hasLineupData = lineups.some(lineup => lineup.classId === nextClass.id);
        if (!hasLineupData) {
          setRawData('');
        }
        
        // Return the next class ID for the UI to update selectors
        return nextClass.id;
      }
      
    } catch (error) {
      console.error('Error processing lineups:', error);
      toast({
        title: 'Processing Error',
        description: `An error occurred while processing the lineup data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
    
    return null; // No next class to advance to
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const toggleDarkMode = () => {
    setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const updateTrackInfo = (info: TrackInfo) => {
    const updatedTrackInfo = { ...settings.trackInfo, ...info };
    setSettings(prev => ({ ...prev, trackInfo: updatedTrackInfo }));
    
    localStorage.setItem(STORAGE_KEYS.TRACK_INFO, JSON.stringify(updatedTrackInfo));
    
    toast({
      title: 'Track Info Updated',
      description: `Track information has been updated.`,
    });
  };

  const clearLineups = () => {
    setLineups([]);
    setRawData('');
    toast({
      title: 'Lineups Cleared',
      description: 'All lineup data has been cleared.',
    });
  };

  const exportLineups = (exportSettings?: ExportSettings) => {
    const currentExportSettings = exportSettings || settings.defaultExportSettings;
    
    if (exportSettings) {
      setSettings(prev => ({ ...prev, defaultExportSettings: exportSettings }));
      localStorage.setItem(STORAGE_KEYS.EXPORT_SETTINGS, JSON.stringify(exportSettings));
    }
    
    if (lineups.length === 0) {
      toast({
        title: 'No Lineups',
        description: 'There are no lineups to export.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      exportLineupsUtil(lineups, currentExportSettings, settings.trackInfo);
      
      toast({
        title: 'Export Complete',
        description: `Your lineups have been exported in ${currentExportSettings.exportFormat.toUpperCase()} format.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: `There was an error exporting your lineups: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
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
