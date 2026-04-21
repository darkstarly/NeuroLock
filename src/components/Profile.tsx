import { useState } from 'react';
import type { UserProfile } from './AuthScreen';

interface ProfileProps {
  user: UserProfile;
  onLogout: () => void;
  onUpdateUser: (updated: UserProfile) => void;
}

export default function Profile({ user, onLogout, onUpdateUser }: ProfileProps) {
  const [editing, setEditing] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('habitguard_darkmode');
    return saved !== null ? saved === 'true' : true;
  });
  const [editData, setEditData] = useState({
    name: user.name,
    age: user.age,
    height: user.height,
    weight: user.weight,
    goal: user.goal,
    avatar: user.avatar,
  });

  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem('habitguard_darkmode', String(newValue));
    
    // Apply dark mode to body
    if (newValue) {
      document.body.classList.add('dark');
      document.body.style.backgroundColor = '#06060f';
    } else {
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = '#f4f4fb';
    }
  };

  const avatars = ['🧑', '👩', '👨', '🧔', '👩‍🦱', '👨‍🦱', '👩‍🦰', '👨‍🦳', '🧕', '👲'];

  const goalLabels: Record<string, string> = {
    fitness: '🏃 Improve Fitness',
    sleep: '😴 Better Sleep',
    habits: '🚫 Break Bad Habits',
    stress: '🧘 Reduce Stress',
    weight: '⚖️ Manage Weight',
    mindful: '🧠 Be Mindful',
  };

  const genderLabel: Record<string, string> = {
    male: '👨 Male',
    female: '👩 Female',
    other: '🧑 Other',
  };

  const bmi = user.height && user.weight
    ? Number(user.weight) / Math.pow(Number(user.height) / 100, 2)
    : null;

  const bmiLabel = bmi
    ? bmi < 18.5 ? 'Underweight'
      : bmi < 25 ? 'Normal'
      : bmi < 30 ? 'Overweight'
      : 'Obese'
    : null;

  const bmiColor = bmi
    ? bmi < 18.5 ? 'text-blue-400'
      : bmi < 25 ? 'text-emerald-400'
      : bmi < 30 ? 'text-yellow-400'
      : 'text-red-400'
    : '';

  const joinedDate = new Date(user.joinedAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });

  const handleSave = () => {
    const updated: UserProfile = { ...user, ...editData };
    const saved = localStorage.getItem('habitguard_user');
    if (saved) {
      const full = JSON.parse(saved);
      localStorage.setItem('habitguard_user', JSON.stringify({ ...full, ...editData }));
    }
    onUpdateUser(updated);
    setEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('habitguard_session');
    onLogout();
  };

  const stats = [
    { label: 'Points', value: user.points.toLocaleString(), icon: '⭐', gradient: 'from-amber-500/10 to-yellow-500/10', border: 'border-amber-500/10' },
    { label: 'Day Streak', value: user.streak.toString(), icon: '🔥', gradient: 'from-orange-500/10 to-red-500/10', border: 'border-orange-500/10' },
    { label: 'Days Active', value: Math.floor((Date.now() - new Date(user.joinedAt).getTime()) / 86400000).toString(), icon: '📅', gradient: 'from-violet-500/10 to-fuchsia-500/10', border: 'border-violet-500/10' },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="px-4 py-5 flex flex-col gap-4">

        {/* Profile Card */}
        <div className="relative glass rounded-3xl p-5 overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/[0.05] rounded-full -translate-y-10 translate-x-10 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-fuchsia-500/[0.04] rounded-full translate-y-10 -translate-x-10 blur-2xl" />

          <div className="flex items-start gap-4 relative z-10">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border-2 border-violet-500/25 flex items-center justify-center text-4xl shadow-lg shadow-violet-500/10">
                {user.avatar}
              </div>
              {editing && (
                <button
                  onClick={() => {}}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center text-[10px] shadow-lg"
                >
                  ✏️
                </button>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-extrabold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{user.name}</h2>
              <p className="text-sm text-slate-400 mb-1.5">{user.email}</p>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/15 text-[10px] text-violet-300 font-medium">
                {goalLabels[user.goal] || '🎯 Goal set'}
              </span>
              <p className="text-[10px] text-slate-500/80 mt-2">Joined {joinedDate}</p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2.5">
          {stats.map(s => (
            <div key={s.label} className={`glass rounded-2xl bg-gradient-to-br ${s.gradient} ${s.border} p-3 flex flex-col items-center gap-1`}>
              <span className="text-lg">{s.icon}</span>
              <span className="text-lg font-extrabold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</span>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider font-medium">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Body Info */}
        <div className="glass rounded-3xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700/20 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Body Information</h3>
            <button
              onClick={() => setEditing(!editing)}
              className="text-[10px] text-violet-400 font-semibold px-3 py-1.5 rounded-full bg-violet-500/8 border border-violet-500/15 hover:bg-violet-500/12 transition-all"
            >
              {editing ? 'Cancel' : '✏️ Edit'}
            </button>
          </div>

          {editing ? (
            <div className="p-4 flex flex-col gap-4">
              {/* Avatar picker */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mb-2 block">Avatar</label>
                <div className="flex flex-wrap gap-2">
                  {avatars.map(av => (
                    <button
                      key={av}
                      onClick={() => setEditData({ ...editData, avatar: av })}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all duration-200 ${
                        editData.avatar === av ? 'border-violet-500 bg-violet-500/15 scale-110' : 'border-slate-700/30 bg-slate-800/40'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mb-1.5 block">Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={e => setEditData({ ...editData, name: e.target.value })}
                  className="w-full bg-slate-900/40 border border-slate-700/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm transition-all"
                />
              </div>

              {/* Age */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mb-1.5 block">Age</label>
                <input
                  type="number"
                  value={editData.age}
                  onChange={e => setEditData({ ...editData, age: e.target.value })}
                  className="w-full bg-slate-900/40 border border-slate-700/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm transition-all"
                />
              </div>

              {/* Height & Weight */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mb-1.5 block">Height (cm)</label>
                  <input
                    type="number"
                    value={editData.height}
                    onChange={e => setEditData({ ...editData, height: e.target.value })}
                    className="w-full bg-slate-900/40 border border-slate-700/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mb-1.5 block">Weight (kg)</label>
                  <input
                    type="number"
                    value={editData.weight}
                    onChange={e => setEditData({ ...editData, weight: e.target.value })}
                    className="w-full bg-slate-900/40 border border-slate-700/30 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm transition-all"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                className="w-full py-3.5 btn-primary rounded-2xl text-sm"
              >
                Save Changes ✓
              </button>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-2 gap-2.5">
              {[
                { label: 'Age', value: user.age ? `${user.age} years` : 'Not set', icon: '🎂' },
                { label: 'Gender', value: genderLabel[user.gender] || 'Not set', icon: '' },
                { label: 'Height', value: user.height ? `${user.height} cm` : 'Not set', icon: '📏' },
                { label: 'Weight', value: user.weight ? `${user.weight} kg` : 'Not set', icon: '⚖️' },
              ].map(item => (
                <div key={item.label} className="bg-slate-900/30 rounded-2xl p-3 border border-slate-700/10">
                  <p className="text-[9px] text-slate-500 uppercase font-semibold tracking-wider mb-1">{item.label}</p>
                  <p className="text-sm font-semibold text-white">{item.value}</p>
                </div>
              ))}

              {bmi && (
                <div className="col-span-2 bg-slate-900/30 rounded-2xl p-3 border border-slate-700/10 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase font-semibold tracking-wider mb-1">BMI</p>
                    <p className={`text-lg font-extrabold ${bmiColor}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{bmi.toFixed(1)}</p>
                  </div>
                  <span className={`text-xs font-semibold ${bmiColor} bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-700/20`}>{bmiLabel}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <div className="glass rounded-3xl overflow-hidden">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700/30 to-slate-800/30 border border-slate-600/20 flex items-center justify-center text-lg">
                {darkMode ? '🌙' : '☀️'}
              </div>
              <div>
                <p className="text-sm font-bold text-white">Dark Mode</p>
                <p className="text-[10px] text-slate-400">{darkMode ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
            
            {/* Toggle Switch */}
            <button
              onClick={toggleDarkMode}
              className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                darkMode ? 'bg-violet-600 shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'bg-slate-600'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300 ${
                  darkMode ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full py-4 rounded-2xl bg-red-500/6 border border-red-500/12 text-red-400 font-bold text-sm active:scale-[0.97] transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>

        <p className="text-center text-[10px] text-slate-600/60 pb-2">Habit Guard · by Neurolock · v1.0.0</p>
      </div>

      {/* Logout Confirm Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-md px-4 pb-8">
          <div className="w-full max-w-sm glass-heavy rounded-3xl p-6 shadow-2xl animate-slide-up">
            <div className="w-14 h-14 rounded-2xl bg-red-500/8 border border-red-500/15 flex items-center justify-center text-2xl mx-auto mb-4">
              🚪
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Sign Out?</h3>
            <p className="text-sm text-slate-400 text-center mb-5">Your data is saved locally. You can sign back in anytime.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/30 text-slate-300 font-semibold text-sm active:scale-[0.97] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3.5 rounded-2xl bg-red-500/12 border border-red-500/20 text-red-400 font-bold text-sm active:scale-[0.97] transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
