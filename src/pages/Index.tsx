
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import RaceLineupInput from '@/components/RaceLineupInput';
import ClassManager from '@/components/ClassManager';
import LineupPreview from '@/components/LineupPreview';
import SettingsPanel from '@/components/SettingsPanel';
import { AppProvider } from '@/contexts/AppContext';
import ExportOptions from '@/components/ExportOptions';
import { motion, AnimatePresence } from 'framer-motion';

// Add framer-motion as a dependency
<lov-add-dependency>framer-motion@latest</lov-add-dependency>

const Index = () => {
  const [activeTab, setActiveTab] = useState('input');
  const [prevTab, setPrevTab] = useState('');

  // Handle tab change with animation direction calculation
  const handleTabChange = (newTab: string) => {
    setPrevTab(activeTab);
    setActiveTab(newTab);
  };

  // Determine animation direction based on tab order
  const getAnimationDirection = () => {
    const tabOrder = ['input', 'classes', 'lineup', 'settings'];
    const prevIndex = tabOrder.indexOf(prevTab);
    const currentIndex = tabOrder.indexOf(activeTab);
    
    if (prevIndex === -1 || currentIndex === -1) return 1;
    return prevIndex < currentIndex ? 1 : -1;
  };

  // Animation variants
  const pageVariants = {
    initial: (direction: number) => ({
      x: direction * 20,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: (direction: number) => ({
      x: direction * -20,
      opacity: 0,
      transition: { duration: 0.2 }
    })
  };

  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header activeTab={activeTab} onTabChange={handleTabChange} />
        
        <main className="flex-1 p-4 md:p-6 container max-w-5xl">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold tracking-tight">
                {activeTab === 'input' && 'Race Lineup Input'}
                {activeTab === 'classes' && 'Racing Classes'}
                {activeTab === 'lineup' && 'Lineup Preview'}
                {activeTab === 'settings' && 'Settings'}
              </h2>
              
              {activeTab === 'lineup' && (
                <div className="mt-2 sm:mt-0">
                  <ExportOptions />
                </div>
              )}
            </div>
            
            <p className="text-muted-foreground mt-1">
              {activeTab === 'input' && 'Enter your race lineup data to get started'}
              {activeTab === 'classes' && 'Manage the racing classes for your event'}
              {activeTab === 'lineup' && 'View and export your processed lineups'}
              {activeTab === 'settings' && 'Configure application preferences'}
            </p>
          </div>
          
          <div className="pb-10 relative overflow-hidden">
            <AnimatePresence mode="wait" initial={false} custom={getAnimationDirection()}>
              <motion.div
                key={activeTab}
                custom={getAnimationDirection()}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full"
              >
                {activeTab === 'input' && <RaceLineupInput />}
                {activeTab === 'classes' && <ClassManager />}
                {activeTab === 'lineup' && <LineupPreview />}
                {activeTab === 'settings' && <SettingsPanel />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
        
        <footer className="border-t py-4 bg-muted/20">
          <div className="container text-center text-sm text-muted-foreground">
            <p>StagingBoss Race Lineup Manager &copy; {new Date().getFullYear()}</p>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
};

export default Index;
