
import React, { useState } from 'react';
import Header from '@/components/Header';
import RaceLineupInput from '@/components/RaceLineupInput';
import ClassManager from '@/components/ClassManager';
import LineupPreview from '@/components/LineupPreview';
import SettingsPanel from '@/components/SettingsPanel';
import { AppProvider } from '@/contexts/AppContext';
import ExportOptions from '@/components/ExportOptions';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  const [activeTab, setActiveTab] = useState('input');

  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />
        
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
          
          <div className="pb-10">
            {activeTab === 'input' && <RaceLineupInput />}
            {activeTab === 'classes' && <ClassManager />}
            {activeTab === 'lineup' && <LineupPreview />}
            {activeTab === 'settings' && <SettingsPanel />}
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
