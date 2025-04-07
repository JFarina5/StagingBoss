
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/contexts/AppContext';
import { Label } from '@/components/ui/label';

interface ClassSelectorProps {
  selectedClassId: string;
  onClassChange: (classId: string) => void;
}

const ClassSelector: React.FC<ClassSelectorProps> = ({ selectedClassId, onClassChange }) => {
  const { classes } = useAppContext();

  return (
    <div className="space-y-2">
      <Label htmlFor="class-selector">Select Racing Class</Label>
      <Select value={selectedClassId} onValueChange={onClassChange}>
        <SelectTrigger id="class-selector" className="w-full">
          <SelectValue placeholder="Select a class" />
        </SelectTrigger>
        <SelectContent>
          {classes.map((raceClass) => (
            <SelectItem key={raceClass.id} value={raceClass.id}>
              {raceClass.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ClassSelector;
