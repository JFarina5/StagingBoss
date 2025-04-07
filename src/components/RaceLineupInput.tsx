
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/contexts/AppContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckIcon, ImportIcon } from 'lucide-react';

const RaceLineupInput: React.FC = () => {
  const { rawData, setRawData, processLineups, classes } = useAppContext();

  const handleProcess = () => {
    processLineups();
  };

  const handleSampleData = () => {
    if (classes.length === 0) return;
    
    // Create sample data based on available classes
    let sample = '';
    classes.forEach((cls, index) => {
      // Add 3 sample drivers for each class
      for (let i = 1; i <= 3; i++) {
        const carNum = `${10 + i * (index + 1)}`;
        const driverName = `Driver ${index + 1}-${i}`;
        const pillNum = (index * 10) + i;
        sample += `${carNum}\t${driverName}\t${pillNum}\t${cls.name}\n`;
      }
    });
    
    setRawData(sample.trim());
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>Race Lineup Input</CardTitle>
        <CardDescription>
          Enter your race lineup data in tab-separated format: 
          Car#, Driver Name, Pill#, Class Name
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 bg-muted">
          <AlertDescription>
            Each line should contain tab-separated values in this format:
            <code className="block bg-background p-2 rounded mt-1 font-mono text-xs">
              22\tJohn Doe\t15\tSuper Late Models
            </code>
          </AlertDescription>
        </Alert>
        
        <Textarea 
          value={rawData}
          onChange={(e) => setRawData(e.target.value)}
          placeholder="Enter lineup data here..."
          className="min-h-[200px] font-mono"
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleSampleData}
          disabled={classes.length === 0}
        >
          <ImportIcon className="mr-2 h-4 w-4" />
          Load Sample Data
        </Button>
        <Button 
          onClick={handleProcess}
          disabled={!rawData.trim()}
          className="bg-racing-blue hover:bg-racing-blue/90"
        >
          <CheckIcon className="mr-2 h-4 w-4" />
          Process Lineup
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RaceLineupInput;
