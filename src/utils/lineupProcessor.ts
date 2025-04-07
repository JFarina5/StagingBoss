import { Driver, ProcessedLineup, RaceClass } from '@/types';

/**
 * Process raw tab-separated lineup data into structured driver objects
 */
export const parseRawData = (
  rawData: string, 
  classes: RaceClass[]
): { drivers: Driver[], errors: string[] } => {
  const drivers: Driver[] = [];
  const errors: string[] = [];
  
  if (!rawData.trim()) {
    return { drivers, errors: ['No data provided'] };
  }
  
  const lines = rawData.trim().split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split('\t');
    if (parts.length < 4) {
      errors.push(`Line ${i + 1}: Not enough data (expected 4 fields, got ${parts.length})`);
      continue;
    }
    
    const [carNumber, driverName, pillNumberStr, className] = parts;
    
    // Find the class
    const classObj = classes.find(c => c.name === className);
    if (!classObj) {
      errors.push(`Line ${i + 1}: Unknown class "${className}"`);
      continue;
    }
    
    // Parse pill number
    const pillNumber = parseInt(pillNumberStr, 10);
    if (isNaN(pillNumber)) {
      errors.push(`Line ${i + 1}: Invalid pill number "${pillNumberStr}"`);
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
  
  return { drivers, errors };
};

/**
 * Process a list of drivers into sorted class lineups
 */
export const processLineups = (
  drivers: Driver[], 
  classes: RaceClass[]
): ProcessedLineup[] => {
  // Group drivers by class
  const groupedByClass: Record<string, Driver[]> = {};
  
  drivers.forEach(driver => {
    if (!groupedByClass[driver.classId]) {
      groupedByClass[driver.classId] = [];
    }
    groupedByClass[driver.classId].push(driver);
  });
  
  // Sort each class by pill number and create processed lineups
  return Object.keys(groupedByClass).map(classId => {
    const classObj = classes.find(c => c.id === classId);
    
    // Handle duplicate pill numbers by resolving conflicts
    const driversWithUniqueNumbers = resolveDuplicatePillNumbers(groupedByClass[classId]);
    
    return {
      classId,
      className: classObj?.name || 'Unknown Class',
      drivers: driversWithUniqueNumbers.sort((a, b) => a.pillNumber - b.pillNumber),
    };
  });
};

/**
 * Resolve duplicate pill numbers by modifying them slightly
 */
export const resolveDuplicatePillNumbers = (drivers: Driver[]): Driver[] => {
  const pillNumberCounts: Record<number, number> = {};
  const result: Driver[] = [];
  
  // Count occurrences of each pill number
  drivers.forEach(driver => {
    pillNumberCounts[driver.pillNumber] = (pillNumberCounts[driver.pillNumber] || 0) + 1;
  });
  
  // Resolve duplicates
  drivers.forEach(driver => {
    const pillNumber = driver.pillNumber;
    
    if (pillNumberCounts[pillNumber] > 1) {
      // Get all drivers with this pill number
      const driversWithThisPill = drivers.filter(d => d.pillNumber === pillNumber);
      
      // Find the index of this driver in the duplicates
      const indexInDuplicates = driversWithThisPill.findIndex(
        d => d.carNumber === driver.carNumber && d.driverName === driver.driverName
      );
      
      if (indexInDuplicates > 0) {
        // Adjust pill number slightly for all but the first duplicate
        // Add a small decimal (0.001, 0.002, etc.) to maintain sorting order
        const adjustedDriver = {
          ...driver,
          pillNumber: pillNumber + (indexInDuplicates * 0.001),
        };
        result.push(adjustedDriver);
      } else {
        // Keep the first occurrence as is
        result.push(driver);
      }
    } else {
      // No duplicates for this pill number
      result.push(driver);
    }
  });
  
  return result;
};

/**
 * Generate a sample data string for testing
 */
export const generateSampleData = (classes: RaceClass[]): string => {
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
  
  return sample.trim();
};
