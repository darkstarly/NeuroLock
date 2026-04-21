// Real Step Counter Service using Device Motion API
// Uses accelerometer data to detect actual steps

export interface StepData {
  date: string;
  steps: number;
  goal: number;
  goalReached: boolean;
}

export interface StoredData {
  steps: StepData[];
  totalPoints: number;
  currentStreak: number;
  lastGoalDate: string;
  weeklyData: number[];
}

// Step detection state
let stepCount = 0;
let isTracking = false;
let motionListener: ((e: DeviceMotionEvent) => void) | null = null;

// Configuration
const STEP_THRESHOLD = 1.5; // Acceleration threshold for step detection
const MIN_STEP_INTERVAL = 250; // Minimum ms between steps
const DAILY_GOAL = 8000;
const POINTS_PER_GOAL = 100;

// Load data from localStorage
export function loadStoredData(): StoredData {
  const stored = localStorage.getItem('habitguard_data');
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    steps: [],
    totalPoints: 0,
    currentStreak: 0,
    lastGoalDate: '',
    weeklyData: [0, 0, 0, 0, 0, 0, 0],
  };
}

// Save data to localStorage
function saveData(data: StoredData): void {
  localStorage.setItem('habitguard_data', JSON.stringify(data));
}

// Get today's date string
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// Get yesterday's date string
function getYesterdayString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

// Get step data for a specific date
export function getStepData(date: string, data: StoredData): StepData {
  const existing = data.steps.find((s) => s.date === date);
  if (existing) return existing;
  return {
    date,
    steps: 0,
    goal: DAILY_GOAL,
    goalReached: false,
  };
}

// Initialize or resume step tracking
export function initializeStepCounter(): {
  hasMotionPermission: boolean;
  todaySteps: number;
  permissionStatus: 'granted' | 'denied' | 'prompt';
} {
  const stored = loadStoredData();
  const today = getTodayString();
  const todayData = getStepData(today, stored);

  // Check if we need to reset for a new day
  if (stored.lastGoalDate && stored.lastGoalDate !== today && stored.lastGoalDate !== getYesterdayString()) {
    // Streak broken - more than 1 day gap
    stored.currentStreak = 0;
    saveData(stored);
  }

  stepCount = todayData.steps;
  isTracking = true;

  return {
    hasMotionPermission: 'DeviceMotionEvent' in window,
    todaySteps: todayData.steps,
    permissionStatus: 'granted',
  };
}

// Request motion permission (required on iOS 13+)
export async function requestMotionPermission(): Promise<boolean> {
  if (typeof DeviceMotionEvent === 'undefined') {
    return false;
  }

  // Check if iOS 13+ requires permission
  if (typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function') {
    try {
      const permission = await (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }

  return true;
}

// Simple step detection algorithm using acceleration magnitude
let lastMagnitude = 0;
let lastPeakTime = 0;

function detectStep(acceleration: { x: number | null; y: number | null; z: number | null }): boolean {
  const x = acceleration.x ?? 0;
  const y = acceleration.y ?? 0;
  const z = acceleration.z ?? 0;
  
  const magnitude = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
  const now = Date.now();
  const delta = magnitude - lastMagnitude;
  
  // Detect peak (crossing threshold going up)
  if (delta > STEP_THRESHOLD && now - lastPeakTime > MIN_STEP_INTERVAL) {
    // Check if we're in a walking range (magnitude between 9 and 12)
    // This helps filter out false positives from shaking
    if (magnitude > 9 && magnitude < 12) {
      lastPeakTime = now;
      lastMagnitude = magnitude;
      return true;
    }
  }
  
  lastMagnitude = magnitude;
  return false;
}

// Start listening for motion data
export function startStepTracking(
  onStepUpdate: (steps: number) => void,
  onGoalReached: () => void
): void {
  if (motionListener) {
    stopStepTracking();
  }

  const stored = loadStoredData();
  const today = getTodayString();
  const todayData = getStepData(today, stored);
  
  stepCount = todayData.steps;
  isTracking = true;

  motionListener = (event: DeviceMotionEvent) => {
    if (!isTracking) return;
    
    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration) {
      return;
    }

    if (detectStep(acceleration)) {
      stepCount++;
      onStepUpdate(stepCount);
      
      // Check goal completion
      const currentStored = loadStoredData();
      const currentData = getStepData(today, currentStored);
      
      if (stepCount >= currentData.goal && !currentData.goalReached) {
        // Goal reached!
        currentData.goalReached = true;
        currentData.steps = stepCount;
        
        // Update streak
        if (currentStored.lastGoalDate === getYesterdayString() || currentStored.lastGoalDate === today) {
          currentStored.currentStreak++;
        } else {
          currentStored.currentStreak = 1;
        }
        
        currentStored.lastGoalDate = today;
        currentStored.totalPoints += POINTS_PER_GOAL;
        
        saveData(currentStored);
        onGoalReached();
      }
    }
  };

  window.addEventListener('devicemotion', motionListener);
}

// Stop listening for motion data
export function stopStepTracking(): void {
  if (motionListener) {
    window.removeEventListener('devicemotion', motionListener);
    motionListener = null;
  }
  isTracking = false;
}

// Save current steps to storage
export function saveCurrentSteps(): void {
  const stored = loadStoredData();
  const today = getTodayString();
  
  // Update or add today's data
  const todayIndex = stored.steps.findIndex((s) => s.date === today);
  if (todayIndex >= 0) {
    stored.steps[todayIndex].steps = stepCount;
    stored.steps[todayIndex].goalReached = stored.steps[todayIndex].steps >= stored.steps[todayIndex].goal;
  } else {
    stored.steps.push({
      date: today,
      steps: stepCount,
      goal: DAILY_GOAL,
      goalReached: stepCount >= DAILY_GOAL,
    });
  }
  
  // Keep only last 30 days
  stored.steps = stored.steps.slice(-30);
  
  // Update weekly data
  const dayOfWeek = new Date().getDay();
  stored.weeklyData[dayOfWeek] = stepCount;
  
  saveData(stored);
}

// Update goal
export function setDailyGoal(goal: number): void {
  const stored = loadStoredData();
  const today = getTodayString();
  const todayData = getStepData(today, stored);
  
  todayData.goal = goal;
  
  const todayIndex = stored.steps.findIndex((s) => s.date === today);
  if (todayIndex >= 0) {
    stored.steps[todayIndex].goal = goal;
    stored.steps[todayIndex].goalReached = stored.steps[todayIndex].steps >= goal;
  }
  
  saveData(stored);
}

// Get all required data for dashboard
export function getDashboardData(): {
  todaySteps: number;
  todayGoal: number;
  todayProgress: number;
  goalReached: boolean;
  totalPoints: number;
  currentStreak: number;
  weeklyData: number[];
  hasMotionPermission: boolean;
  permissionStatus: 'granted' | 'denied' | 'prompt';
  last7Days: { date: string; steps: number }[];
  averageSteps: number;
} {
  const stored = loadStoredData();
  const today = getTodayString();
  const todayData = getStepData(today, stored);
  
  // Calculate last 7 days
  const last7Days: { date: string; steps: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayData = getStepData(dateStr, stored);
    last7Days.push({
      date: dateStr,
      steps: dayData.steps,
    });
  }
  
  // Calculate average
  const totalSteps = last7Days.reduce((sum, day) => sum + day.steps, 0);
  const averageSteps = Math.round(totalSteps / 7);
  
  return {
    todaySteps: todayData.steps,
    todayGoal: todayData.goal,
    todayProgress: Math.min((todayData.steps / todayData.goal) * 100, 100),
    goalReached: todayData.goalReached,
    totalPoints: stored.totalPoints,
    currentStreak: stored.currentStreak,
    weeklyData: last7Days.map((d) => d.steps),
    hasMotionPermission: 'DeviceMotionEvent' in window,
    permissionStatus: 'granted',
    last7Days,
    averageSteps,
  };
}

// Format number with commas
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

// Get motivational message based on progress
export function getMotivationalMessage(steps: number, goal: number): string {
  const progress = steps / goal;
  if (progress >= 1) return '🎉 Goal crushed! Amazing work today!';
  if (progress >= 0.75) return '🔥 Almost there! Keep pushing!';
  if (progress >= 0.5) return '💪 Halfway done! You\'re doing great!';
  if (progress >= 0.25) return '🚶 Good start! Keep walking!';
  return '🌟 Let\'s get moving! Every step counts!';
}
