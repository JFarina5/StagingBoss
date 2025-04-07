import { Driver, ProcessedLineup, RaceClass } from '@/types';

/**
 * Process raw tab-separated lineup data into structured driver objects
 */
export const parseRawData = (
  rawData: string, 
  classes: RaceClass[],
  selectedClassId: string
): { drivers: Driver[], errors: string[] } => {
  const drivers: Driver[] = [];
  const errors: string[] = [];
  
  if (!rawData.trim()) {
    return { drivers, errors: ['No data provided'] };
  }
  
  // Find the selected class
  const classObj = classes.find(c => c.id === selectedClassId);
  if (!classObj) {
    return { drivers, errors: ['Selected class not found'] };
  }
  
  const lines = rawData.trim().split('\n');
  let lineCounter = 0;
  
  for (let i = 0; i < lines.length; i++) {
    lineCounter++;
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split('\t');
    
    // Handle different column formats
    if (parts.length < 2) {
      errors.push(`Line ${lineCounter}: Not enough data (expected at least 2 fields, got ${parts.length})`);
      continue;
    }
    
    const carNumber = parts[0].trim();
    const driverName = parts[1].trim();
    
    // Extract pill number if provided (3rd column)
    let pillNumber: number | null = null;
    if (parts.length >= 3 && parts[2].trim()) {
      const pillValue = parseInt(parts[2].trim(), 10);
      if (!isNaN(pillValue)) {
        pillNumber = pillValue;
      } else {
        errors.push(`Line ${lineCounter}: Invalid pill number "${parts[2].trim()}". Using order received.`);
      }
    }
    
    drivers.push({
      carNumber,
      driverName,
      pillNumber: pillNumber !== null ? pillNumber : Number.MAX_SAFE_INTEGER,
      className: classObj.name,
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
    
    // Sort based on pill number first (putting those without pill numbers at the end)
    // For those without pill numbers, preserve the original order
    const driversWithSortedPills = [...groupedByClass[classId]];
    
    // Keep track of original order for drivers without pill numbers
    const withoutPills: Driver[] = [];
    const withPills: Driver[] = [];
    
    driversWithSortedPills.forEach(driver => {
      if (driver.pillNumber === Number.MAX_SAFE_INTEGER) {
        withoutPills.push(driver);
      } else {
        withPills.push(driver);
      }
    });
    
    // Sort drivers with pill numbers by their pill number
    withPills.sort((a, b) => a.pillNumber - b.pillNumber);
    
    // Combine the two arrays - drivers with pill numbers first, followed by those without
    const sortedDrivers = [...withPills, ...withoutPills];
    
    // Handle duplicate pill numbers by assigning a small decimal adjustment
    const resolved = resolveDuplicatePillNumbers(sortedDrivers);
    
    return {
      classId,
      className: classObj?.name || 'Unknown Class',
      drivers: resolved,
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
      sample += `${carNum}\t${driverName}\t${pillNum}\n`;
    }
  });
  
  return sample.trim();
};
