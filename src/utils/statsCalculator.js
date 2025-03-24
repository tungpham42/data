export const calculateStats = (numbers) => {
  if (!numbers || numbers.length === 0) {
    return {
      mean: 0,
      median: 0,
      stdDev: 0,
      min: 0,
      max: 0,
    };
  }

  // Remove any non-numeric values
  const validNumbers = numbers.filter(
    (num) => !isNaN(num) && num !== null && num !== undefined
  );

  if (validNumbers.length === 0) {
    return {
      mean: 0,
      median: 0,
      stdDev: 0,
      min: 0,
      max: 0,
    };
  }

  // Mean
  const mean =
    validNumbers.reduce((sum, num) => sum + num, 0) / validNumbers.length;

  // Median
  const sorted = [...validNumbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];

  // Standard Deviation
  const variance =
    validNumbers.reduce((sum, num) => {
      const diff = num - mean;
      return sum + diff * diff;
    }, 0) / validNumbers.length;
  const stdDev = Math.sqrt(variance);

  // Min and Max
  const min = Math.min(...validNumbers);
  const max = Math.max(...validNumbers);

  return {
    mean,
    median,
    stdDev,
    min,
    max,
  };
};
