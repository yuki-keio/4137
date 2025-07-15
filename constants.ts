export const GRID_SIZE = 8;
export const SEQUENCE = [4, 1, 3, 7];
export const INITIAL_TIME_LIMIT = 60;
export const HINT_TIMEOUT = 500; // 3 seconds

export const NUMBER_COLORS: { [key: number]: string } = {
  4: 'text-red-400',
  1: 'text-sky-300',
  3: 'text-yellow-300',
  7: 'text-purple-400',
};

const generateLevelThresholds = (): number[] => {
  const thresholds: number[] = [];
  const seq = [4, 1, 3, 7];
  let thresholdStr = `${seq[0]}`;
  for (let i = 0; i < 30; i++) { // Generate for 30 levels
      thresholdStr += `${seq[(i + 1) % seq.length]}`;
      thresholds.push(parseInt(thresholdStr, 10));
  }
  return thresholds;
};

export const LEVEL_THRESHOLDS = generateLevelThresholds();

export const WEIGHTED_NUMBERS = [4, 4, 4, 1, 1, 1, 3, 3, 7, 7];
