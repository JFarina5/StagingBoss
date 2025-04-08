
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/contexts/AppContext';
import { Play } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import ClassSelector from './ClassSelector';

const RaceLineupInput: React.FC = () => {
  const { classes, rawData, setRawData, processLineups, settings } = useAppContext();
  const { toast } = useToast();
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const { trackInfo } = settings;

  const handleProcess = () => {
    if (!selectedClassId) {
      toast({
        title: 'No Class Selected',
        description: 'Please select a racing class before processing.',
        variant: 'destructive'
      });
      return;
    }
    
    if (!rawData.trim()) {
      toast({
        title: 'No Data',
        description: 'Please enter lineup data first.',
        variant: 'destructive'
      });
      return;
    }
    
    // Process the lineup and get the next class ID
    const nextClassId = processLineups(selectedClassId);
    
    // If we have a next class ID, automatically select it
    if (nextClassId) {
      setSelectedClassId(nextClassId);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    setRawData(pasteData);
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="relative pb-2">
        {trackInfo.logoUrl && (
          <div className="absolute right-6 top-6">
            <img 
              src={trackInfo.logoUrl}
              alt={`${trackInfo.name} Logo`}
              className="h-12 object-contain"
            />
          </div>
        )}
        <CardTitle>Enter Race Lineup Data</CardTitle>
        <CardDescription>
          Input or paste car numbers and driver names with pill numbers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ClassSelector 
          selectedClassId={selectedClassId} 
          onClassChange={setSelectedClassId} 
        />

        <div className="space-y-2">
          <div className="flex justify-between items-center mb-1">
            <div className="text-sm font-medium">
              Data Format: Car# [tab] Driver Name [tab] Pill#
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setRawData('')}
            >
              Clear
            </Button>
          </div>
          
          <div className="p-2 bg-muted rounded-md mb-2 text-xs text-muted-foreground">
            <div>Example:</div>
            <pre className="whitespace-pre">
              7{'\t'}Jeff Johnson{'\t'}42{'\n'}
              42{'\t'}Richard Petty{'\t'}13{'\n'}
              3{'\t'}Dale Earnhardt{'\t'}99
            </pre>
          </div>
          
          <Textarea
            placeholder="Paste or enter your race lineup data here..."
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
            onPaste={handlePaste}
            className="min-h-[500px] font-mono text-sm" // Increased height to accommodate more racers
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleProcess}
          className="w-full"
          disabled={!rawData.trim() || !selectedClassId}
        >
          <Play className="mr-2 h-4 w-4" /> Process Lineup
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RaceLineupInput;
