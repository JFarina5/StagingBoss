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
  
  if (!rawData?.trim()) {
    return { drivers, errors: ['No data provided'] };
  }
  
  if (!classes?.length) {
    return { drivers, errors: ['No classes available'] };
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
    const line = lines[i]?.trim();
    if (!line) continue;
    
    const parts = line.split('\t');
    
    // Handle different column formats (expanded capabilities)
    if (parts.length < 2) {
      errors.push(`Line ${lineCounter}: Not enough data (expected at least 2 fields, got ${parts.length})`);
      continue;
    }
    
    // Enhanced format handling based on test.py
    // Determine format based on number of columns
    let carNumber: string = '';
    let driverName: string = '';
    let pillNumber: number | null = null;
    
    try {
      if (parts.length >= 4) {
        // Format: Racer No. | Last Name | First Name | Pill No.
        carNumber = parts[0]?.trim() || '';
        const lastName = parts[1]?.trim() || '';
        const firstName = parts[2]?.trim() || '';
        driverName = `${firstName} ${lastName}`.trim();
        
        if (parts[3]?.trim()) {
          const pillValue = parseInt(parts[3].trim(), 10);
          if (!isNaN(pillValue)) {
            pillNumber = pillValue;
          } else {
            errors.push(`Line ${lineCounter}: Invalid pill number "${parts[3].trim()}". Using order received.`);
          }
        }
      } else if (parts.length === 3) {
        // Format: Racer No. | Driver Name | Pill No.
        carNumber = parts[0]?.trim() || '';
        driverName = parts[1]?.trim() || '';
        if (parts[2]?.trim()) {
          const pillValue = parseInt(parts[2].trim(), 10);
          if (!isNaN(pillValue)) {
            pillNumber = pillValue;
          } else {
            errors.push(`Line ${lineCounter}: Invalid pill number "${parts[2].trim()}". Using order received.`);
          }
        }
      } else if (parts.length === 2) {
        // Format: Racer No. | Driver Name
        carNumber = parts[0]?.trim() || '';
        driverName = parts[1]?.trim() || '';
      }
      
      if (!carNumber || !driverName) {
        errors.push(`Line ${lineCounter}: Missing required fields (car number and driver name)`);
        continue;
      }
      
      drivers.push({
        carNumber,
        driverName,
        pillNumber: pillNumber !== null ? pillNumber : Number.MAX_SAFE_INTEGER,
        className: classObj.name,
        classId: classObj.id,
      });
    } catch (error) {
      errors.push(`Line ${lineCounter}: Error processing data - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
    const driversInClass = [...groupedByClass[classId]];
    
    // Sort and resolve duplicate pills using enhanced algorithm
    return {
      classId,
      className: classObj?.name || 'Unknown Class',
      drivers: sortAndResolveDuplicatePills(driversInClass),
    };
  });
};

/**
 * Enhanced sort algorithm with multiple fallbacks and duplicate resolution
 * Similar to test.py implementation
 */
export const sortAndResolveDuplicatePills = (drivers: Driver[]): Driver[] => {
  // 1. First separate drivers with and without pill numbers
  const withPills: Driver[] = [];
  const withoutPills: Driver[] = [];
  
  // Add an original order attribute for stable sorting
  const driversWithOrder = drivers.map((driver, index) => ({
    ...driver,
    originalOrder: index
  }));
  
  driversWithOrder.forEach(driver => {
    if (driver.pillNumber === Number.MAX_SAFE_INTEGER) {
      withoutPills.push(driver);
    } else {
      withPills.push(driver);
    }
  });
  
  // Check if we need to resolve duplicates
  const pillCounts: Record<number, number> = {};
  withPills.forEach(driver => {
    const pill = Math.floor(driver.pillNumber); // Get the integer part
    pillCounts[pill] = (pillCounts[pill] || 0) + 1;
  });
  
  const hasDuplicates = Object.values(pillCounts).some(count => count > 1);
  
  // 2. If we have duplicates, resolve them by incrementing pill numbers
  if (hasDuplicates) {
    console.log("Resolving duplicate pill numbers");
    const resolvedPills: Driver[] = [];
    const assignedPills = new Set<number>();
    
    // Sort first by pill number then by original order for stable sorting
    withPills.sort((a, b) => {
      if (a.pillNumber !== b.pillNumber) {
        return a.pillNumber - b.pillNumber;
      }
      // If pill numbers are the same, preserve original order
      return (a as any).originalOrder - (b as any).originalOrder;
    });
    
    withPills.forEach(driver => {
      const originalPill = Math.floor(driver.pillNumber);
      let currentPill = originalPill;
      
      // Find next available pill number
      while (assignedPills.has(currentPill)) {
        currentPill++;
      }
      
      // Create a new driver object with resolved pill number
      const resolvedDriver: Driver = {
        ...driver,
        pillNumber: currentPill
      };
      
      resolvedPills.push(resolvedDriver);
      assignedPills.add(currentPill);
      
      // Log changes for debugging
      if (currentPill !== originalPill) {
        console.log(`Changed pill #${originalPill} to #${currentPill} for Car #${driver.carNumber} (${driver.driverName})`);
      }
    });
    
    // 3. Fallback: if no pills or after resolving duplicates, sort by car number
    const finalSortedDrivers = [...resolvedPills, ...withoutPills];
    
    // Secondary sort by car number for withoutPills if needed
    if (withoutPills.length > 0) {
      withoutPills.sort((a, b) => {
        // Try to extract numeric part from car numbers
        const aNum = parseInt(a.carNumber.replace(/\D/g, ''), 10);
        const bNum = parseInt(b.carNumber.replace(/\D/g, ''), 10);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum;
        }
        
        // If can't parse as numbers, sort alphabetically
        return a.carNumber.localeCompare(b.carNumber);
      });
    }
    
    return finalSortedDrivers;
  } else {
    // No duplicates, simply sort by pill number
    withPills.sort((a, b) => a.pillNumber - b.pillNumber);
    
    // Sort withoutPills by car number
    withoutPills.sort((a, b) => {
      // Try to extract numeric part from car numbers
      const aNum = parseInt(a.carNumber.replace(/\D/g, ''), 10);
      const bNum = parseInt(b.carNumber.replace(/\D/g, ''), 10);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      
      // If can't parse as numbers, sort alphabetically
      return a.carNumber.localeCompare(b.carNumber);
    });
    
    // Return combined sorted drivers
    return [...withPills, ...withoutPills];
  }
};

/**
 * Legacy duplicate resolution function - will be deprecated in favor of sortAndResolveDuplicatePills
 * Kept for backwards compatibility
 */
export const resolveDuplicatePillNumbers = (drivers: Driver[]): Driver[] => {
  // Call new function for better handling
  return sortAndResolveDuplicatePills(drivers);
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
