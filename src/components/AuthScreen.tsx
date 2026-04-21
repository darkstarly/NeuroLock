import { useState } from 'react';

interface AuthScreenProps {
  onAuth: (user: UserProfile) => void;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  goal: string;
  avatar: string;
  joinedAt: string;
  points: number;
  streak: number;
}

type AuthMode = 'welcome' | 'login' | 'signup' | 'onboarding';

export default function AuthScreen({ onAuth }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('welcome');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [onboardingData, setOnboardingData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    goal: '',
    avatar: '🧑',
  });

  const avatars = ['🧑', '👩', '👨', '🧔', '👩‍🦱', '👨‍🦱', '👩‍🦰', '👨‍🦳', '🧕', '👲'];
  const goals = [
    { id: 'fitness', label: 'Improve Fitness', icon: '🏃' },
    { id: 'sleep', label: 'Better Sleep', icon: '😴' },
    { id: 'habits', label: 'Break Bad Habits', icon: '🚫' },
    { id: 'stress', label: 'Reduce Stress', icon: '🧘' },
    { id: 'weight', label: 'Manage Weight', icon: '⚖️' },
    { id: 'mindful', label: 'Be Mindful', icon: '🧠' },
  ];

  const handleLogin = async () => {
    setError('');
    if (!loginData.email || !loginData.password) {
      setError('Please fill in all fields');
      return;
    }
    if (!loginData.email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));

    const saved = localStorage.getItem('habitguard_user');
    if (!saved) {
      setError('No account found. Please sign up first.');
      setLoading(false);
      return;
    }
    const user: UserProfile & { password: string } = JSON.parse(saved);
    if (user.email !== loginData.email) {
      setError('Email not found. Please check and try again.');
      setLoading(false);
      return;
    }
    if (user.password !== loginData.password) {
      setError('Incorrect password. Please try again.');
      setLoading(false);
      return;
    }
    const { password: _pw, ...profile } = user;
    setLoading(false);
    onAuth(profile);
  };

  const handleSignup = async () => {
    setError('');
    if (!signupData.name || !signupData.email || !signupData.password || !signupData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (!signupData.email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setMode('onboarding');
    setStep(1);
  };

  const handleOnboardingNext = () => {
    setError('');
    if (step === 1) {
      if (!onboardingData.avatar) { setError('Pick an avatar'); return; }
      setStep(2);
    } else if (step === 2) {
      if (!onboardingData.age || !onboardingData.gender) {
        setError('Please fill in your age and gender');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!onboardingData.height || !onboardingData.weight) {
        setError('Please enter your height and weight');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (!onboardingData.goal) {
        setError('Please select a goal');
        return;
      }
      completeSignup();
    }
  };

  const completeSignup = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    const profile: UserProfile & { password: string } = {
      id: Date.now().toString(),
      name: signupData.name,
      email: signupData.email,
      password: signupData.password,
      age: onboardingData.age,
      gender: onboardingData.gender,
      height: onboardingData.height,
      weight: onboardingData.weight,
      goal: onboardingData.goal,
      avatar: onboardingData.avatar,
      joinedAt: new Date().toISOString(),
      points: 0,
      streak: 0,
    };
    localStorage.setItem('habitguard_user', JSON.stringify(profile));
    const { password: _pw, ...userProfile } = profile;
    setLoading(false);
    onAuth(userProfile);
  };

  const inputClass = "w-full bg-slate-800/40 border border-slate-700/30 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 text-sm transition-all";
  const inputWithToggleClass = "w-full bg-slate-800/40 border border-slate-700/30 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-slate-500 text-sm transition-all";

  /* ───────── WELCOME ───────── */
  if (mode === 'welcome') return (
    <div className="min-h-screen mesh-gradient flex flex-col items-center justify-between px-6 py-12 max-w-lg mx-auto relative overflow-hidden">
      {/* Glow blobs */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-violet-600/[0.08] rounded-full blur-3xl pointer-events-none animate-float" />
      <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-fuchsia-600/[0.06] rounded-full blur-3xl pointer-events-none animate-float" style={{ animationDelay: '-3s' }} />
      <div className="absolute top-1/2 right-0 w-40 h-40 bg-indigo-600/[0.05] rounded-full blur-3xl pointer-events-none animate-float" style={{ animationDelay: '-5s' }} />

      <div />

      {/* Logo */}
      <div className="flex flex-col items-center text-center relative z-10">
        <div className="relative mb-8">
          <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-violet-500 via-fuchsia-500 to-purple-600 flex items-center justify-center shadow-2xl glow-accent">
            <span className="text-6xl">🛡️</span>
          </div>
          <div className="absolute inset-0 w-28 h-28 rounded-[2rem] bg-gradient-to-br from-violet-500 to-fuchsia-500 blur-2xl opacity-20 animate-pulse" />
        </div>
        <h1 className="text-4xl font-extrabold shimmer-text mb-2 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Habit Guard
        </h1>
        <p className="text-slate-400/80 text-xs font-semibold tracking-[0.3em] uppercase mb-5">by Neurolock</p>
        <p className="text-slate-300/80 text-sm leading-relaxed max-w-xs">
          Track your daily habits, monitor wellness and break bad patterns with AI guidance.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center mt-6">
          {['🏃 Step Tracking', '🤖 AI Coach', '🔒 Screen Lock', '📊 Analytics'].map(f => (
            <span key={f} className="px-3.5 py-1.5 rounded-full glass text-[11px] text-slate-300/80 font-medium">{f}</span>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="w-full flex flex-col gap-3 relative z-10">
        <button
          onClick={() => setMode('signup')}
          className="w-full py-4 btn-primary rounded-2xl text-base"
        >
          Get Started
        </button>
        <button
          onClick={() => setMode('login')}
          className="w-full py-4 rounded-2xl glass text-slate-300 font-semibold text-sm active:scale-[0.97] transition-all"
        >
          I already have an account
        </button>
        <p className="text-center text-[10px] text-slate-600/60 mt-2">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );

  /* ───────── LOGIN ───────── */
  if (mode === 'login') return (
    <div className="min-h-screen mesh-gradient flex flex-col px-6 py-10 max-w-lg mx-auto relative overflow-hidden">
      <div className="absolute top-20 right-10 w-56 h-56 bg-violet-600/[0.06] rounded-full blur-3xl pointer-events-none animate-float" />

      <button onClick={() => { setMode('welcome'); setError(''); }} className="flex items-center gap-2 text-slate-400 mb-8 w-fit hover:text-slate-300 transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-purple-600 flex items-center justify-center shadow-lg glow-accent mb-4">
          <span className="text-2xl">🛡️</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Welcome back</h2>
        <p className="text-slate-400 text-sm">Sign in to continue your wellness journey</p>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Email</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </span>
            <input
              type="email"
              placeholder="you@example.com"
              value={loginData.email}
              onChange={e => setLoginData({ ...loginData, email: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Password</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={loginData.password}
              onChange={e => setLoginData({ ...loginData, password: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className={inputWithToggleClass}
            />
            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 transition-colors">
              {showPassword
                ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              }
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 glass rounded-xl px-4 py-3 border-red-500/15">
            <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-4 btn-primary rounded-2xl text-base disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing in...
            </>
          ) : 'Sign In'}
        </button>

        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-slate-800/60" />
          <span className="text-slate-600 text-[10px] uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-slate-800/60" />
        </div>

        <button
          onClick={() => { setMode('signup'); setError(''); }}
          className="w-full py-4 rounded-2xl glass text-slate-300 font-semibold text-sm active:scale-[0.97] transition-all"
        >
          Don't have an account? <span className="text-violet-400">Sign Up</span>
        </button>
      </div>
    </div>
  );

  /* ───────── SIGNUP ───────── */
  if (mode === 'signup') return (
    <div className="min-h-screen mesh-gradient flex flex-col px-6 py-10 max-w-lg mx-auto relative overflow-hidden">
      <div className="absolute top-10 left-10 w-56 h-56 bg-fuchsia-600/[0.05] rounded-full blur-3xl pointer-events-none animate-float" />

      <button onClick={() => { setMode('welcome'); setError(''); }} className="flex items-center gap-2 text-slate-400 mb-8 w-fit hover:text-slate-300 transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-purple-600 flex items-center justify-center shadow-lg glow-accent mb-4">
          <span className="text-2xl">✨</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Create account</h2>
        <p className="text-slate-400 text-sm">Start your wellness journey today</p>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Full Name</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            <input type="text" placeholder="Your full name" value={signupData.name}
              onChange={e => setSignupData({ ...signupData, name: e.target.value })}
              className={inputClass} />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Email</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </span>
            <input type="email" placeholder="you@example.com" value={signupData.email}
              onChange={e => setSignupData({ ...signupData, email: e.target.value })}
              className={inputClass} />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Password</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            <input type={showPassword ? 'text' : 'password'} placeholder="Min. 6 characters" value={signupData.password}
              onChange={e => setSignupData({ ...signupData, password: e.target.value })}
              className={inputWithToggleClass} />
            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 transition-colors">
              {showPassword
                ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              }
            </button>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Confirm Password</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </span>
            <input type={showConfirm ? 'text' : 'password'} placeholder="Repeat your password" value={signupData.confirmPassword}
              onChange={e => setSignupData({ ...signupData, confirmPassword: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSignup()}
              className={inputWithToggleClass} />
            <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 transition-colors">
              {showConfirm
                ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              }
            </button>
          </div>
        </div>

        {/* Password strength */}
        {signupData.password && (
          <div className="flex gap-1.5">
            {[1,2,3,4].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                signupData.password.length >= i * 3
                  ? i <= 2 ? 'bg-red-500/70' : i === 3 ? 'bg-yellow-500/70' : 'bg-emerald-500/70'
                  : 'bg-slate-700/40'
              }`} />
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 glass rounded-xl px-4 py-3 border-red-500/15">
            <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full py-4 btn-primary rounded-2xl text-base disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating account...
            </>
          ) : 'Continue →'}
        </button>

        <button
          onClick={() => { setMode('login'); setError(''); }}
          className="text-center text-sm text-slate-400"
        >
          Already have an account? <span className="text-violet-400 font-semibold">Sign In</span>
        </button>
      </div>
    </div>
  );

  /* ───────── ONBOARDING ───────── */
  return (
    <div className="min-h-screen mesh-gradient flex flex-col px-6 py-10 max-w-lg mx-auto relative overflow-hidden">
      <div className="absolute top-20 right-5 w-48 h-48 bg-violet-600/[0.06] rounded-full blur-3xl pointer-events-none animate-float" />

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1,2,3,4].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
            i <= step
              ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-[0_0_8px_rgba(139,92,246,0.3)]'
              : 'bg-slate-800/40'
          }`} />
        ))}
      </div>

      <div className="mb-6">
        <p className="text-violet-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Step {step} of 4</p>
        <h2 className="text-2xl font-extrabold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {step === 1 && 'Pick your avatar'}
          {step === 2 && 'About you'}
          {step === 3 && 'Body metrics'}
          {step === 4 && 'Your main goal'}
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {step === 1 && 'Choose how you appear in the app'}
          {step === 2 && 'Help us personalize your experience'}
          {step === 3 && 'Used for fitness calculations'}
          {step === 4 && 'We\'ll build your habit plan around this'}
        </p>
      </div>

      {/* Step 1 - Avatar */}
      {step === 1 && (
        <div className="flex-1 animate-fade-in">
          <div className="grid grid-cols-5 gap-3">
            {avatars.map(av => (
              <button
                key={av}
                onClick={() => setOnboardingData({ ...onboardingData, avatar: av })}
                className={`aspect-square rounded-2xl text-3xl flex items-center justify-center border-2 transition-all duration-300 ${
                  onboardingData.avatar === av
                    ? 'border-violet-500 bg-violet-500/15 scale-110 shadow-[0_0_20px_rgba(139,92,246,0.2)]'
                    : 'border-slate-700/30 bg-slate-800/30 hover:bg-slate-800/50'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
          {onboardingData.avatar && (
            <div className="mt-6 flex flex-col items-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/15 to-fuchsia-500/15 border-2 border-violet-500/25 flex items-center justify-center text-5xl shadow-lg shadow-violet-500/10">
                {onboardingData.avatar}
              </div>
              <p className="text-slate-400 text-sm mt-2">Hello, {signupData.name.split(' ')[0]}! 👋</p>
            </div>
          )}
        </div>
      )}

      {/* Step 2 - Age & Gender */}
      {step === 2 && (
        <div className="flex-1 flex flex-col gap-5 animate-fade-in">
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Age</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🎂</span>
              <input type="number" placeholder="Your age" value={onboardingData.age}
                onChange={e => setOnboardingData({ ...onboardingData, age: e.target.value })}
                className={inputClass} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Gender</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'male', label: 'Male', icon: '👨' },
                { id: 'female', label: 'Female', icon: '👩' },
                { id: 'other', label: 'Other', icon: '🧑' },
              ].map(g => (
                <button
                  key={g.id}
                  onClick={() => setOnboardingData({ ...onboardingData, gender: g.id })}
                  className={`flex flex-col items-center gap-1 py-4 rounded-2xl border-2 transition-all duration-300 ${
                    onboardingData.gender === g.id
                      ? 'border-violet-500 bg-violet-500/15 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                      : 'border-slate-700/30 bg-slate-800/30 hover:bg-slate-800/50'
                  }`}
                >
                  <span className="text-2xl">{g.icon}</span>
                  <span className="text-xs font-medium text-slate-300">{g.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3 - Height & Weight */}
      {step === 3 && (
        <div className="flex-1 flex flex-col gap-5 animate-fade-in">
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Height (cm)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">📏</span>
              <input type="number" placeholder="e.g. 175" value={onboardingData.height}
                onChange={e => setOnboardingData({ ...onboardingData, height: e.target.value })}
                className={inputClass} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Weight (kg)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">⚖️</span>
              <input type="number" placeholder="e.g. 70" value={onboardingData.weight}
                onChange={e => setOnboardingData({ ...onboardingData, weight: e.target.value })}
                className={inputClass} />
            </div>
          </div>
          {onboardingData.height && onboardingData.weight && (
            <div className="glass rounded-2xl p-4">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Your BMI</p>
              <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {(Number(onboardingData.weight) / Math.pow(Number(onboardingData.height) / 100, 2)).toFixed(1)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {(() => {
                  const bmi = Number(onboardingData.weight) / Math.pow(Number(onboardingData.height) / 100, 2);
                  if (bmi < 18.5) return '⚠️ Underweight';
                  if (bmi < 25) return '✅ Normal weight';
                  if (bmi < 30) return '⚠️ Overweight';
                  return '🔴 Obese';
                })()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 4 - Goal */}
      {step === 4 && (
        <div className="flex-1 animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            {goals.map(g => (
              <button
                key={g.id}
                onClick={() => setOnboardingData({ ...onboardingData, goal: g.id })}
                className={`flex flex-col items-start gap-2 p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                  onboardingData.goal === g.id
                    ? 'border-violet-500 bg-violet-500/15 shadow-[0_0_20px_rgba(139,92,246,0.15)]'
                    : 'border-slate-700/30 bg-slate-800/30 hover:bg-slate-800/50'
                }`}
              >
                <span className="text-2xl">{g.icon}</span>
                <span className="text-sm font-semibold text-white leading-tight">{g.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 glass rounded-xl px-4 py-3 mt-4 border-red-500/15">
          <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 py-4 rounded-2xl glass text-slate-300 font-semibold text-base active:scale-[0.97] transition-all"
          >
            ← Back
          </button>
        )}
        <button
          onClick={handleOnboardingNext}
          disabled={loading}
          className="flex-1 py-4 btn-primary rounded-2xl text-base disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Setting up...
            </>
          ) : step === 4 ? '🚀 Launch App' : 'Continue →'}
        </button>
      </div>
    </div>
  );
}
