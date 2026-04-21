import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Habits from './components/Habits';
import AIAssistant from './components/AIAssistant';
import Devices from './components/Devices';
import AuthScreen from './components/AuthScreen';
import Profile from './components/Profile';
import type { UserProfile } from './components/AuthScreen';

type Tab = 'dashboard' | 'habits' | 'devices' | 'ai' | 'profile';

const tabs = [
  {
    id: 'dashboard',
    label: 'Home',
    icon: (active: boolean) => (
      <svg className={`w-[22px] h-[22px] transition-all duration-300 ${active ? 'text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.2 : 1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'habits',
    label: 'Habits',
    icon: (active: boolean) => (
      <svg className={`w-[22px] h-[22px] transition-all duration-300 ${active ? 'text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.2 : 1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 'ai',
    label: 'AI',
    icon: (active: boolean) => (
      <div className={`w-[52px] h-[52px] rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 ${
        active
          ? 'bg-gradient-to-br from-violet-500 via-fuchsia-500 to-purple-600 shadow-violet-500/40 scale-105 glow-accent'
          : 'bg-gradient-to-br from-violet-700/80 to-fuchsia-700/80 shadow-violet-900/30'
      }`}>
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1" />
        </svg>
      </div>
    ),
  },
  {
    id: 'devices',
    label: 'Devices',
    icon: (active: boolean) => (
      <svg className={`w-[22px] h-[22px] transition-all duration-300 ${active ? 'text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.2 : 1.8} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: (active: boolean, avatar?: string) => avatar ? (
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-base transition-all duration-300 ${
        active ? 'ring-2 ring-violet-400 ring-offset-1 ring-offset-[#0a0a1a] scale-110' : 'ring-1 ring-slate-700'
      }`}>
        {avatar}
      </div>
    ) : (
      <svg className={`w-[22px] h-[22px] transition-all duration-300 ${active ? 'text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.2 : 1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [authChecked, setAuthChecked] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('habitguard_user');
    const session = localStorage.getItem('habitguard_session');
    if (savedUser && session === 'active') {
      const full = JSON.parse(savedUser);
      const { password: _pw, ...profile } = full;
      setUser(profile);
    }
    setAuthChecked(true);

    // Initialize dark mode
    const darkMode = localStorage.getItem('habitguard_darkmode');
    if (darkMode !== null) {
      if (darkMode === 'true') {
        document.body.classList.add('dark');
        document.body.style.backgroundColor = '#06060f';
      } else {
        document.body.classList.remove('dark');
        document.body.style.backgroundColor = '#f4f4fb';
      }
    } else {
      // Default to dark mode
      document.body.classList.add('dark');
      document.body.style.backgroundColor = '#06060f';
      localStorage.setItem('habitguard_darkmode', 'true');
    }
  }, []);

  const handleAuth = (profile: UserProfile) => {
    localStorage.setItem('habitguard_session', 'active');
    setUser(profile);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('habitguard_session');
    setUser(null);
    setActiveTab('dashboard');
  };

  const handleUpdateUser = (updated: UserProfile) => {
    setUser(updated);
  };

  // Loading splash
  if (!authChecked) {
    return (
      <div className="min-h-screen mesh-gradient flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-purple-600 flex items-center justify-center text-4xl shadow-2xl glow-accent animate-float">
              🛡️
            </div>
            <div className="absolute inset-0 w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 blur-xl opacity-30 animate-pulse" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-slate-300 text-sm font-semibold tracking-wide">Habit Guard</p>
            <p className="text-slate-500 text-xs">Loading your wellness data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Auth screens
  if (!user) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  return (
    <div className="min-h-screen mesh-gradient text-white flex flex-col max-w-lg mx-auto relative overflow-hidden">

      {/* Ambient glow orbs */}
      <div className="fixed top-0 left-0 right-0 bottom-0 pointer-events-none max-w-lg mx-auto overflow-hidden z-0">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-violet-600/[0.04] rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/3 -right-20 w-72 h-72 bg-fuchsia-600/[0.03] rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
        <div className="absolute bottom-20 -left-10 w-48 h-48 bg-indigo-600/[0.04] rounded-full blur-3xl animate-float" style={{ animationDelay: '-4s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 glass-heavy">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-purple-600 flex items-center justify-center shadow-lg glow-accent">
                <span className="text-lg">🛡️</span>
              </div>
            </div>
            <div>
              <h1 className="text-[15px] font-bold shimmer-text leading-none tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Habit Guard
              </h1>
              <span className="text-[10px] text-slate-500/80 leading-none tracking-widest uppercase">Neurolock</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Greeting */}
            <span className="text-xs text-slate-400 hidden sm:block">
              Hey, <span className="text-violet-300 font-semibold">{user.name.split(' ')[0]}</span> 👋
            </span>
            {/* Active pill */}
            <div className="flex items-center gap-1.5 bg-emerald-500/8 border border-emerald-500/15 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
              <span className="text-[10px] text-emerald-400/90 font-medium tracking-wide">Active</span>
            </div>
            {/* Avatar in header */}
            <button
              onClick={() => setActiveTab('profile')}
              className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-lg hover:border-violet-500/30 transition-all duration-300"
            >
              {user.avatar}
            </button>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 overflow-hidden pb-24 relative z-10">
        <div key={activeTab} className="animate-fade-in">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'habits' && <Habits />}
          {activeTab === 'ai' && <AIAssistant />}
          {activeTab === 'devices' && <Devices />}
          {activeTab === 'profile' && (
            <Profile
              user={user}
              onLogout={handleLogout}
              onUpdateUser={handleUpdateUser}
            />
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 max-w-lg mx-auto">
        <div className="glass-heavy px-2 pb-safe">
          <div className="flex items-end justify-around py-2">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              const isAI = tab.id === 'ai';
              const isProfile = tab.id === 'profile';

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                    isAI ? '-mt-5 pb-1' : 'py-1 px-3'
                  }`}
                >
                  {isProfile
                    ? tab.icon(active, user.avatar)
                    : tab.icon(active)
                  }

                  <span className={`text-[10px] font-semibold transition-all duration-300 ${
                    isAI
                      ? active ? 'text-violet-300' : 'text-slate-500'
                      : active ? 'text-violet-400' : 'text-slate-600'
                  }`}>
                    {tab.label}
                  </span>

                  {active && !isAI && (
                    <span className="w-1 h-1 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(139,92,246,0.6)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
