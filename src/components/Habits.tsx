import { useState, useEffect } from 'react';

interface HabitEntry {
  date: string;
  didHabit: boolean; // true = did bad habit (tick), false = avoided (cross)
}

interface Habit {
  id: string;
  name: string;
  category: 'health' | 'screen' | 'sleep' | 'productivity' | 'social';
  icon: string;
  entries: HabitEntry[];
  isPredefined: boolean;
}

// Predefined bad habits
const PREDEFINED_HABITS: Omit<Habit, 'id' | 'entries'>[] = [
  { name: 'Smoking', category: 'health', icon: '🚬', isPredefined: true },
  { name: 'Junk Food', category: 'health', icon: '🍔', isPredefined: true },
  { name: 'Too Much Coffee', category: 'health', icon: '☕', isPredefined: true },
  { name: 'Alcohol', category: 'health', icon: '🍺', isPredefined: true },
  { name: 'Skipping Meals', category: 'health', icon: '🍽️', isPredefined: true },
  { name: 'Skipping Exercise', category: 'health', icon: '🏃', isPredefined: true },
  { name: 'Nail Biting', category: 'health', icon: '💅', isPredefined: true },
  { name: 'Excessive Screen Time', category: 'screen', icon: '📱', isPredefined: true },
  { name: 'Late Night Gaming', category: 'screen', icon: '🎮', isPredefined: true },
  { name: 'Binge Watching TV', category: 'screen', icon: '📺', isPredefined: true },
  { name: 'Social Media Scrolling', category: 'screen', icon: '📲', isPredefined: true },
  { name: 'Staying Up Late', category: 'sleep', icon: '🌙', isPredefined: true },
  { name: 'Hitting Snooze', category: 'sleep', icon: '⏰', isPredefined: true },
  { name: 'Procrastination', category: 'productivity', icon: '⏳', isPredefined: true },
  { name: 'Overthinking', category: 'productivity', icon: '🤔', isPredefined: true },
  { name: 'Negative Self-Talk', category: 'social', icon: '💭', isPredefined: true },
];

const CATEGORY_LABELS: Record<string, string> = {
  health: '🏥 Health',
  screen: '📱 Screen',
  sleep: '😴 Sleep',
  productivity: '⚡ Productivity',
  social: '👥 Social',
};

const CATEGORY_COLORS: Record<string, string> = {
  health: 'bg-red-500/10 text-red-400 border-red-500/15',
  screen: 'bg-violet-500/10 text-violet-400 border-violet-500/15',
  sleep: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/15',
  productivity: 'bg-amber-500/10 text-amber-400 border-amber-500/15',
  social: 'bg-pink-500/10 text-pink-400 border-pink-500/15',
};

const ICON_OPTIONS = ['🚬', '🍔', '☕', '🍺', '📱', '🎮', '📺', '🌙', '⏰', '⏳', '🤔', '💭', '🍕', '🍰', '💤'];

export default function Habits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [pointsHistory, setPointsHistory] = useState<{ date: string; points: number }[]>([]);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<Habit['category']>('health');
  const [customIcon, setCustomIcon] = useState('🎯');

  // Initialize
  useEffect(() => {
    const savedHabits = localStorage.getItem('habits_v2');
    const savedPoints = localStorage.getItem('habitPoints');
    const savedHistory = localStorage.getItem('pointsHistory');

    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    } else {
      const initial: Habit[] = PREDEFINED_HABITS.map((h, i) => ({
        ...h,
        id: `predefined-${i}`,
        entries: [],
      }));
      setHabits(initial);
      localStorage.setItem('habits_v2', JSON.stringify(initial));
    }

    if (savedPoints) setTotalPoints(JSON.parse(savedPoints));
    if (savedHistory) setPointsHistory(JSON.parse(savedHistory));
  }, []);

  const saveData = (newHabits: Habit[], newPoints: number, newHistory: { date: string; points: number }[]) => {
    setHabits(newHabits);
    setTotalPoints(newPoints);
    setPointsHistory(newHistory);
    localStorage.setItem('habits_v2', JSON.stringify(newHabits));
    localStorage.setItem('habitPoints', JSON.stringify(newPoints));
    localStorage.setItem('pointsHistory', JSON.stringify(newHistory));
  };

  const markHabit = (habitId: string, didHabit: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    let pointChange = 0;

    const newHabits = habits.map((habit) => {
      if (habit.id === habitId) {
        const existingEntry = habit.entries.find((e) => e.date === today);

        if (existingEntry) {
          pointChange += existingEntry.didHabit ? 2 : -3;
          pointChange += didHabit ? -2 : 3;

          return {
            ...habit,
            entries: habit.entries.map((e) =>
              e.date === today ? { date: today, didHabit } : e
            ),
          };
        } else {
          pointChange = didHabit ? -2 : 3;
          return {
            ...habit,
            entries: [...habit.entries, { date: today, didHabit }],
          };
        }
      }
      return habit;
    });

    const newPoints = totalPoints + pointChange;

    const historyEntry = pointsHistory.find((h) => h.date === today);
    let newHistory;
    if (historyEntry) {
      newHistory = pointsHistory.map((h) =>
        h.date === today ? { date: today, points: newPoints } : h
      );
    } else {
      newHistory = [...pointsHistory, { date: today, points: newPoints }];
    }

    saveData(newHabits, newPoints, newHistory);
  };

  const addCustomHabit = () => {
    if (!customName.trim()) return;

    const custom: Habit = {
      id: `custom-${Date.now()}`,
      name: customName,
      category: customCategory,
      icon: customIcon,
      entries: [],
      isPredefined: false,
    };

    const newHabits = [...habits, custom];
    saveData(newHabits, totalPoints, pointsHistory);
    setCustomName('');
    setShowAddCustom(false);
  };

  const deleteHabit = (habitId: string) => {
    const newHabits = habits.filter((h) => h.id !== habitId);
    saveData(newHabits, totalPoints, pointsHistory);
  };

  const getTodayEntry = (habit: Habit) => {
    const today = new Date().toISOString().split('T')[0];
    return habit.entries.find((e) => e.date === today);
  };

  // Get last 7 days for graph
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
    <div className="max-w-4xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Habits Tracker
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <div
            className={`glass px-4 py-2.5 rounded-2xl font-bold flex items-center gap-2 ${
              totalPoints >= 0
                ? 'border-emerald-500/15'
                : 'border-red-500/15'
            }`}
          >
            <span className="text-sm text-slate-400">Total Points</span>
            <span className={`text-xl font-extrabold ${totalPoints >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {totalPoints >= 0 ? '+' : ''}{totalPoints}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 bg-slate-800/30 px-3 py-1.5 rounded-full border border-slate-700/20">
            ✓ Did = -2 pts | ✗ Avoided = +3 pts
          </div>
        </div>
      </div>

      {/* Graph */}
      <div className="mb-5 glass rounded-3xl p-5 card-hover">
        <h3 className="text-sm font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Last 7 Days Progress</h3>
        <div className="flex items-center justify-between gap-2 h-40">
          {last7Days.map((day) => {
            const isPositive = day.points >= 0;
            const heightPercent = (Math.abs(day.points) / maxAbsPoints) * 100;

            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1 relative">
                <div className={`text-[10px] font-bold mb-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {day.points > 0 ? '+' : ''}
                  {day.points}
                </div>
                <div className="w-full flex flex-col items-center h-28 justify-center relative">
                  {isPositive ? (
                    <div
                      className="w-full rounded-lg bg-gradient-to-t from-emerald-600/70 to-emerald-400/50 transition-all duration-500"
                      style={{
                        height: `${heightPercent}%`,
                        minHeight: day.points !== 0 ? '4px' : '0',
                      }}
                    />
                  ) : (
                    <div
                      className="w-full rounded-lg bg-gradient-to-b from-red-500/60 to-orange-400/40 transition-all duration-500"
                      style={{
                        height: `${heightPercent}%`,
                        minHeight: day.points !== 0 ? '4px' : '0',
                      }}
                    />
                  )}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 font-medium">{day.day}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Custom Button */}
      <button
        onClick={() => setShowAddCustom(!showAddCustom)}
        className="mb-4 px-4 py-2.5 bg-violet-500/8 hover:bg-violet-500/15 text-violet-300 rounded-2xl border border-violet-500/15 transition-all duration-300 text-sm font-semibold flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Custom Habit
      </button>

      {/* Add Custom Form */}
      {showAddCustom && (
        <div className="mb-5 glass rounded-3xl p-5 animate-slide-up">
          <h3 className="text-base font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Add Custom Habit</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g., Eating Late"
                className="w-full px-4 py-3 bg-slate-900/40 border border-slate-700/30 rounded-xl text-white text-sm placeholder-slate-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Category</label>
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value as Habit['category'])}
                className="w-full px-4 py-3 bg-slate-900/40 border border-slate-700/30 rounded-xl text-white text-sm"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Icon</label>
              <div className="flex gap-2 flex-wrap">
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setCustomIcon(icon)}
                    className={`w-11 h-11 text-xl rounded-xl transition-all duration-200 ${
                      customIcon === icon
                        ? 'bg-violet-500/20 border-2 border-violet-500 scale-110'
                        : 'bg-slate-900/40 border border-slate-700/30 hover:bg-slate-800/60'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={addCustomHabit}
                className="flex-1 py-3 btn-primary rounded-2xl text-sm"
              >
                Add Habit
              </button>
              <button
                onClick={() => setShowAddCustom(false)}
                className="px-6 py-3 bg-slate-800/60 text-slate-300 rounded-2xl hover:bg-slate-800/80 text-sm font-medium transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Habits List */}
      <div className="space-y-2.5">
        {habits.map((habit) => {
          const todayEntry = getTodayEntry(habit);

          return (
            <div
              key={habit.id}
              className="glass rounded-2xl p-3.5 card-hover"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/20 flex items-center justify-center text-lg flex-shrink-0">
                    {habit.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white text-sm">{habit.name}</h3>
                      {!habit.isPredefined && (
                        <span className="px-1.5 py-0.5 bg-violet-500/10 text-violet-400 text-[9px] rounded-full border border-violet-500/15 font-medium">
                          Custom
                        </span>
                      )}
                    </div>
                    <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border mt-0.5 ${CATEGORY_COLORS[habit.category]}`}>
                      {CATEGORY_LABELS[habit.category]}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Tick - Did habit (Bad) */}
                  <button
                    onClick={() => markHabit(habit.id, true)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition-all duration-300 text-xs ${
                      todayEntry && todayEntry.didHabit
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                        : 'bg-slate-800/40 text-slate-400 border border-slate-700/20 hover:bg-slate-800/60'
                    }`}
                  >
                    <span>✓</span>
                    <span>-2</span>
                  </button>

                  {/* Cross - Avoided (Good) */}
                  <button
                    onClick={() => markHabit(habit.id, false)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition-all duration-300 text-xs ${
                      todayEntry && !todayEntry.didHabit
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(52,211,153,0.15)]'
                        : 'bg-slate-800/40 text-slate-400 border border-slate-700/20 hover:bg-slate-800/60'
                    }`}
                  >
                    <span>✗</span>
                    <span>+3</span>
                  </button>

                  {!habit.isPredefined && (
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-2 text-red-400/60 hover:text-red-400 transition-colors text-xs"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {habits.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>No habits yet</h3>
          <p className="text-slate-400 text-sm">Reload the app to load predefined habits</p>
        </div>
      )}
    </div>
  );
}
