import { useState, useEffect } from 'react';
import {
  getDashboardData,
  startStepTracking,
  stopStepTracking,
  saveCurrentSteps,
  setDailyGoal,
  requestMotionPermission,
  formatNumber,
  getMotivationalMessage,
} from '../services/stepCounter';

const goals = [5000, 8000, 10000, 12000];

interface PointsHistoryEntry {
  date: string;
  points: number;
}

export default function Dashboard() {
  const [todaySteps, setTodaySteps] = useState(0);
  const [dailyGoal, setDailyGoalState] = useState(8000);
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [weeklyData, setWeeklyData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [goalReached, setGoalReached] = useState(false);
  const [hasMotionPermission, setHasMotionPermission] = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [goalNotification, setGoalNotification] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  // Habits graph state
  const [habitPoints, setHabitPoints] = useState(0);
  const [pointsHistory, setPointsHistory] = useState<PointsHistoryEntry[]>([]);

  // Load initial data
  useEffect(() => {
    const data = getDashboardData();
    setTodaySteps(data.todaySteps);
    setDailyGoalState(data.todayGoal);
    setTotalPoints(data.totalPoints);
    setCurrentStreak(data.currentStreak);
    setWeeklyData(data.weeklyData);
    setGoalReached(data.goalReached);
    setHasMotionPermission(data.hasMotionPermission);

    if (data.hasMotionPermission) {
      startTracking();
    }

    loadHabitsData();
  }, []);

  // Reload habits data every time dashboard is shown
  useEffect(() => {
    const interval = setInterval(() => {
      loadHabitsData();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadHabitsData = () => {
    const savedPoints = localStorage.getItem('habitPoints');
    const savedHistory = localStorage.getItem('pointsHistory');
    if (savedPoints) setHabitPoints(JSON.parse(savedPoints));
    if (savedHistory) setPointsHistory(JSON.parse(savedHistory));
  };

  // Request permission and start tracking
  const startTracking = async () => {
    const granted = await requestMotionPermission();
    setHasMotionPermission(granted);

    if (granted) {
      setIsTracking(true);
      startStepTracking(
        (steps) => {
          setTodaySteps(steps);
          const data = getDashboardData();
          setTotalPoints(data.totalPoints);
          setCurrentStreak(data.currentStreak);
          setWeeklyData(data.weeklyData);
          setGoalReached(data.goalReached);
        },
        () => {
          setGoalReached(true);
          setGoalNotification(true);
          setTimeout(() => setGoalNotification(false), 4000);
        }
      );
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStepTracking();
      saveCurrentSteps();
    };
  }, []);

  // Save steps periodically
  useEffect(() => {
    const interval = setInterval(() => {
      saveCurrentSteps();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle goal change
  const handleGoalChange = (newGoal: number) => {
    setDailyGoalState(newGoal);
    setDailyGoal(newGoal);
    setShowGoalPicker(false);
  };

  const progress = Math.min((todaySteps / dailyGoal) * 100, 100);

  const maxWeeklySteps = Math.max(...weeklyData, dailyGoal);
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date().getDay();

  // Circular progress ring calculations
  const ringRadius = 72;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (progress / 100) * ringCircumference;

  // Build last 7 days habits graph data
  const getLast7Days = () => {
    const days = [];
    let cumulativePoints = 0;

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const historyEntry = pointsHistory.find((h) => h.date === dateStr);
      if (historyEntry) {
        cumulativePoints = historyEntry.points;
      }

      days.push({
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        points: cumulativePoints,
      });
    }
    return days;
  };

  const last7Days = getLast7Days();
  const maxAbsPoints = Math.max(...last7Days.map((d) => Math.abs(d.points)), 10);

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">

      {/* Goal Reached Notification */}
      {goalNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-2xl shadow-2xl shadow-emerald-500/30 animate-bounce-in flex items-center gap-2">
          <span className="text-xl">🎉</span>
          <span className="font-bold text-sm">Daily Goal Reached! +100 points</span>
        </div>
      )}

      {/* Steps Counter with Circular Ring */}
      <div className="glass rounded-3xl p-6 card-hover relative overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-500/[0.06] rounded-full blur-2xl" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">👟</span>
            <h2 className="text-slate-300 text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Today's Steps</h2>
          </div>
          {isTracking ? (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
              <span className="text-[10px] text-emerald-400 font-medium">Tracking</span>
            </div>
          ) : (
            <button
              onClick={startTracking}
              className="text-xs text-violet-400 hover:text-violet-300 font-medium px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/15 transition-all hover:bg-violet-500/15"
            >
              Tap to track →
            </button>
          )}
        </div>

        <div className="flex items-center gap-6">
          {/* Circular Progress Ring */}
          <div className="relative flex-shrink-0">
            <svg width="160" height="160" className="transform -rotate-90">
              {/* Background ring */}
              <circle
                cx="80" cy="80" r={ringRadius}
                fill="none"
                stroke="rgba(99, 102, 241, 0.08)"
                strokeWidth="10"
              />
              {/* Progress ring */}
              <circle
                cx="80" cy="80" r={ringRadius}
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                className="progress-ring-circle"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={goalReached ? '#34d399' : '#8b5cf6'} />
                  <stop offset="100%" stopColor={goalReached ? '#10b981' : '#d946ef'} />
                </linearGradient>
              </defs>
            </svg>
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {formatNumber(todaySteps)}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                / {formatNumber(dailyGoal)}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* Right side info */}
          <div className="flex-1 flex flex-col gap-2.5">
            <p className={`text-sm font-medium leading-snug ${goalReached ? 'text-emerald-400' : 'text-slate-300'}`}>
              {getMotivationalMessage(todaySteps, dailyGoal)}
            </p>
            <div className="flex gap-2">
              <div className="flex-1 bg-slate-800/40 rounded-xl p-2.5 border border-slate-700/20">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Streak</p>
                <p className="text-lg font-bold text-white">{currentStreak} <span className="text-xs">🔥</span></p>
              </div>
              <div className="flex-1 bg-slate-800/40 rounded-xl p-2.5 border border-slate-700/20">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Points</p>
                <p className="text-lg font-bold text-white">{formatNumber(totalPoints)} <span className="text-xs">⭐</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Goal Picker Modal */}
      {showGoalPicker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 flex items-center justify-center p-4">
          <div className="glass-heavy rounded-3xl p-6 w-full max-w-sm animate-scale-in">
            <h3 className="text-white font-bold mb-1 text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Set Daily Goal</h3>
            <p className="text-slate-400 text-xs mb-4">Choose your daily step target</p>
            <div className="space-y-2">
              {goals.map((goal) => (
                <button
                  key={goal}
                  onClick={() => handleGoalChange(goal)}
                  className={`w-full p-3.5 rounded-2xl text-left transition-all duration-300 flex items-center justify-between ${
                    dailyGoal === goal
                      ? 'bg-gradient-to-r from-violet-600/30 to-fuchsia-600/20 border border-violet-500/40 text-white'
                      : 'bg-slate-800/40 border border-slate-700/20 text-slate-300 hover:bg-slate-800/60 hover:border-slate-600/30'
                  }`}
                >
                  <span className="font-semibold">{formatNumber(goal)} steps</span>
                  {dailyGoal === goal && <span className="text-violet-400">✓</span>}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowGoalPicker(false)}
              className="w-full mt-4 py-2.5 text-slate-400 hover:text-white text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Weekly Steps Chart */}
      <div className="glass rounded-3xl p-5 card-hover">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-200 text-sm font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Steps — Last 7 Days</h3>
          <div className="text-slate-500 text-xs font-medium bg-slate-800/40 px-2.5 py-1 rounded-full border border-slate-700/20">
            Avg: {formatNumber(Math.round(weeklyData.reduce((a, b) => a + b, 0) / 7))}
          </div>
        </div>

        <div className="flex items-end justify-between gap-2 h-32">
          {weeklyData.map((steps, index) => {
            const height = maxWeeklySteps > 0 ? (steps / maxWeeklySteps) * 100 : 0;
            const isToday = index === today;
            const reachedGoal = steps >= dailyGoal;

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full h-24 bg-slate-800/30 rounded-xl relative overflow-hidden border border-slate-700/10">
                  <div
                    className={`absolute bottom-0 left-0 right-0 rounded-xl transition-all duration-700 ease-out ${
                      reachedGoal
                        ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                        : isToday
                        ? 'bg-gradient-to-t from-violet-600 to-violet-400'
                        : 'bg-gradient-to-t from-slate-600/80 to-slate-500/60'
                    }`}
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                </div>
                <span className={`text-[10px] font-semibold ${isToday ? 'text-violet-400' : 'text-slate-500'}`}>
                  {dayLabels[index]}
                </span>
                <span className="text-[9px] text-slate-600">{formatNumber(steps)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Habits Points Graph */}
      <div className="glass rounded-3xl p-5 card-hover">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-slate-200 text-sm font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Habits — Last 7 Days</h3>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              habitPoints >= 0
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {habitPoints >= 0 ? '+' : ''}{habitPoints} pts
          </span>
        </div>

        <p className="text-[10px] text-slate-500 mb-4">✓ Did habit = −2 pts &nbsp;|&nbsp; ✗ Avoided = +3 pts</p>

        {/* Zero baseline label */}
        <div className="relative">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[10px] text-slate-500">0</span>
            <div className="flex-1 h-px bg-slate-700/50" />
          </div>

          {/* Bars */}
          <div className="flex items-center justify-between gap-2" style={{ height: '160px' }}>
            {last7Days.map((day) => {
              const isPositive = day.points >= 0;
              const heightPercent = maxAbsPoints > 0
                ? (Math.abs(day.points) / maxAbsPoints) * 100
                : 0;
              const barHeight = `${Math.max(heightPercent, day.points !== 0 ? 6 : 0)}%`;
              const isDayToday = day.date === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center"
                  style={{ height: '160px' }}
                >
                  {/* Point value */}
                  <div
                    className={`text-[10px] font-bold mb-1 ${
                      isPositive ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {day.points > 0 ? '+' : ''}{day.points}
                  </div>

                  {/* Positive bar (top half) */}
                  <div className="flex-1 flex flex-col justify-end w-full">
                    {isPositive && (
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600/80 to-emerald-400/60 transition-all duration-500"
                        style={{ height: barHeight, minHeight: day.points !== 0 ? '4px' : '0' }}
                      />
                    )}
                  </div>

                  {/* Zero line divider */}
                  <div className={`w-full h-0.5 rounded-full ${isDayToday ? 'bg-violet-500' : 'bg-slate-700/40'}`} />

                  {/* Negative bar (bottom half) */}
                  <div className="flex-1 flex flex-col justify-start w-full">
                    {!isPositive && (
                      <div
                        className="w-full rounded-b-lg bg-gradient-to-b from-red-500/70 to-orange-400/50 transition-all duration-500"
                        style={{ height: barHeight, minHeight: day.points !== 0 ? '4px' : '0' }}
                      />
                    )}
                  </div>

                  {/* Day label */}
                  <div
                    className={`text-[10px] mt-1 font-medium ${
                      isDayToday ? 'text-violet-400 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {day.day}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-700/30">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400/80" />
            <span className="text-[10px] text-slate-400">Positive</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-red-400/80" />
            <span className="text-[10px] text-slate-400">Negative</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-violet-500 rounded-full" />
            <span className="text-[10px] text-slate-400">Today</span>
          </div>
        </div>
      </div>

      {/* Daily Goal Setting */}
      <div className="glass rounded-3xl p-4 card-hover">
        <button
          onClick={() => setShowGoalPicker(true)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 border border-amber-500/10 flex items-center justify-center">
              <span className="text-lg">🎯</span>
            </div>
            <div className="text-left">
              <div className="text-white font-semibold text-sm">Daily Step Goal</div>
              <div className="text-slate-400 text-xs">{formatNumber(dailyGoal)} steps</div>
            </div>
          </div>
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Permission Notice */}
      {!hasMotionPermission && (
        <div className="glass rounded-2xl p-4 border-amber-500/15">
          <div className="flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <p className="text-amber-300/80 text-xs leading-relaxed">
              Motion sensors not available. On mobile, tap "Tap to track" to enable step counting using your phone's accelerometer.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
