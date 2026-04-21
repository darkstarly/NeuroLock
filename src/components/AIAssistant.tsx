import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  time: string;
}

const getTime = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const quickQuestions = [
  { label: '😴 Better Sleep', q: 'How can I improve my sleep quality?' },
  { label: '🧘 Stress Relief', q: 'How do I manage stress effectively?' },
  { label: '🏃 Exercise Tips', q: 'What exercise routine is best for beginners?' },
  { label: '📱 Screen Time', q: 'How do I reduce my screen time?' },
  { label: '🍎 Nutrition', q: 'What foods help with energy and focus?' },
  { label: '💧 Hydration', q: 'How much water should I drink daily?' },
  { label: '❤️ Heart Health', q: 'How do I improve my heart health?' },
  { label: '🧠 Mental Health', q: 'How can I improve my mental wellbeing?' },
];

const knowledgeBase: { keywords: string[]; response: string }[] = [
  {
    keywords: ['sleep', 'insomnia', 'tired', 'rest', 'bedtime', 'wake up', 'fatigue'],
    response: `**Sleep Improvement Guide 😴**

Here are science-backed tips to improve your sleep:

1. **Consistent Schedule** — Go to bed and wake up at the same time every day, even on weekends.
2. **Screen-Free Zone** — Avoid screens at least 1 hour before bed. Blue light suppresses melatonin.
3. **Cool Dark Room** — Keep your bedroom at 65–68°F (18–20°C) for optimal sleep.
4. **Avoid Caffeine** — Don't consume caffeine after 2 PM.
5. **Wind-Down Routine** — Read, meditate, or take a warm shower 30 minutes before bed.
6. **Limit Alcohol** — Alcohol disrupts REM sleep even if it makes you feel sleepy.
7. **No Heavy Meals** — Avoid large meals 2–3 hours before bed.

💡 **Recommended Sleep Duration:** 7–9 hours for adults.

Would you like a personalized bedtime routine?`,
  },
  {
    keywords: ['stress', 'anxiety', 'overwhelm', 'panic', 'relax', 'calm', 'worry', 'tense'],
    response: `**Stress & Anxiety Management 🧘**

Immediate relief techniques:

1. **4-7-8 Breathing** — Inhale 4 sec → Hold 7 sec → Exhale 8 sec. Repeat 4 times.
2. **Box Breathing** — Inhale 4 → Hold 4 → Exhale 4 → Hold 4.
3. **5-4-3-2-1 Grounding** — Name 5 things you see, 4 you hear, 3 you can touch, 2 you smell, 1 you taste.

Daily habits to reduce stress:
- 🏃 Exercise for 30 minutes daily (reduces cortisol)
- 📓 Journaling — write 3 things you're grateful for each morning
- 🎵 Listen to calming music
- 🌿 Spend 20 mins in nature
- 📵 Digital detox 1 hour daily
- 🧘 10 mins of meditation (try apps like Headspace or Calm)

Would you like a personalized stress management plan?`,
  },
  {
    keywords: ['exercise', 'workout', 'fitness', 'gym', 'run', 'walk', 'steps', 'active', 'beginner'],
    response: `**Exercise & Fitness Guide 🏃**

**Beginner Workout Plan (3 days/week):**

Day 1 - Cardio:
- 20 min brisk walk or jog
- 10 min stretching

Day 2 - Strength:
- 3x10 Push-ups
- 3x10 Squats
- 3x10 Lunges
- 3x30s Plank

Day 3 - Active Recovery:
- Yoga or light stretching
- 15 min walk

**Daily Step Goals:**
- 🎯 Minimum: 5,000 steps
- ✅ Good: 8,000 steps
- 🏆 Excellent: 10,000+ steps

**Benefits:**
- Burns calories 🔥
- Reduces stress hormones
- Improves sleep quality
- Boosts mood (endorphins!)
- Reduces risk of heart disease

Start slow and increase intensity gradually. Consistency beats intensity!`,
  },
  {
    keywords: ['screen time', 'phone', 'social media', 'digital', 'addiction', 'scroll', 'device'],
    response: `**Reducing Screen Time 📱**

The average person spends 7+ hours on screens daily. Here's how to cut back:

**Immediate Actions:**
1. Set app time limits (Settings > Screen Time on iOS / Digital Wellbeing on Android)
2. Turn off non-essential notifications
3. Use grayscale mode to make the phone less appealing
4. Keep phone out of the bedroom

**Daily Habits:**
- 📵 First 30 mins after waking — no phone
- 🍽️ No phones during meals
- ⏰ Set a "phone curfew" at 9 PM
- 📚 Replace scrolling with reading
- 🚶 Go for a walk instead of watching videos

**Apps to Help:**
- Digital Wellbeing (Android)
- Screen Time (iOS)
- Forest App (gamified focus)
- One Sec (adds pause before opening apps)

**Habit Guard Tip:** Use our Screen Lock feature to enforce your screen time limits!`,
  },
  {
    keywords: ['nutrition', 'food', 'diet', 'eat', 'meal', 'weight', 'healthy eating', 'calories'],
    response: `**Nutrition & Healthy Eating 🍎**

**The Plate Method (Simple & Effective):**
- 🥦 Half your plate: Vegetables & fruits
- 🍗 Quarter plate: Lean protein (chicken, fish, legumes)
- 🍚 Quarter plate: Whole grains (brown rice, quinoa)

**Foods That Boost Energy & Focus:**
- 🫐 Blueberries — antioxidants for brain health
- 🥑 Avocado — healthy fats for sustained energy
- 🥜 Nuts — protein and omega-3s
- 🍳 Eggs — choline for memory
- 🐟 Salmon — omega-3 fatty acids
- 🍵 Green tea — caffeine + L-theanine for calm focus

**Foods to Avoid:**
- ❌ Sugary drinks and sodas
- ❌ Ultra-processed snacks
- ❌ White bread and refined carbs
- ❌ Excessive alcohol

**Meal Timing:**
- Eat breakfast within 1 hour of waking
- Don't skip meals (causes energy crashes)
- Last meal 2–3 hours before bed`,
  },
  {
    keywords: ['water', 'hydration', 'dehydrated', 'drink', 'thirst'],
    response: `**Hydration Guide 💧**

**How Much Water Do You Need?**
- 🧑 Men: ~3.7 liters (125 oz) per day
- 👩 Women: ~2.7 liters (91 oz) per day
- 🏃 Add 500ml for every 30 mins of exercise
- ☀️ Add more in hot weather

**Signs of Dehydration:**
- Dark yellow urine (should be pale yellow)
- Headaches
- Fatigue and dizziness
- Dry mouth and skin
- Poor concentration

**Tips to Drink More Water:**
1. Start your day with a full glass of water
2. Carry a water bottle everywhere
3. Set reminders every 2 hours
4. Eat water-rich foods (cucumber, watermelon, oranges)
5. Drink a glass before each meal
6. Flavor water with lemon, mint, or cucumber

**Hydration Tracker:** 
Aim for 8 glasses (2L) minimum daily as a simple rule!`,
  },
  {
    keywords: ['heart', 'cardiovascular', 'blood pressure', 'cholesterol', 'cardiac'],
    response: `**Heart Health Guide ❤️**

**Key Numbers to Know:**
- Blood Pressure: Under 120/80 mmHg (normal)
- Resting Heart Rate: 60–100 bpm (60–70 is ideal)
- Cholesterol: Under 200 mg/dL total

**Heart-Healthy Habits:**
1. **Exercise** — 150 mins moderate cardio/week
2. **Diet** — Mediterranean diet (olive oil, fish, vegetables)
3. **Sleep** — 7–9 hours reduces heart disease risk
4. **No Smoking** — Smoking doubles heart disease risk
5. **Limit Alcohol** — Max 1 drink/day for women, 2 for men
6. **Manage Stress** — Chronic stress raises blood pressure
7. **Regular Checkups** — Monitor BP and cholesterol annually

**Heart-Healthy Foods:**
- 🐟 Fatty fish (salmon, mackerel)
- 🫒 Olive oil
- 🥦 Leafy greens
- 🫐 Berries
- 🥜 Nuts and seeds
- 🫘 Legumes and beans

**Warning Signs — See a Doctor If:**
- Chest pain or pressure
- Shortness of breath
- Irregular heartbeat
- Dizziness or fainting`,
  },
  {
    keywords: ['mental health', 'depression', 'mood', 'sad', 'happy', 'wellbeing', 'emotional', 'mindset'],
    response: `**Mental Wellbeing Guide 🧠**

**Daily Mental Health Practices:**

1. **Morning Routine:**
   - 5 mins meditation or deep breathing
   - Write 3 things you're grateful for
   - Set 1–3 intentions for the day

2. **Movement:** Exercise releases serotonin and dopamine — natural mood boosters!

3. **Social Connection:** Call or meet a friend/family member regularly. Isolation worsens mental health.

4. **Limit News & Social Media:** These are proven contributors to anxiety and low mood.

5. **Journaling:** Write your thoughts and feelings. It helps process emotions.

6. **Therapy:** Talking to a therapist is a sign of strength, not weakness.

**When to Seek Help:**
- Persistent sadness lasting 2+ weeks
- Loss of interest in things you used to enjoy
- Difficulty sleeping or sleeping too much
- Thoughts of self-harm — call a crisis line immediately

**Resources:**
- 🆘 Crisis Text Line: Text HOME to 741741
- 📞 SAMHSA Helpline: 1-800-662-4357
- 🌐 BetterHelp / Talkspace (online therapy)

You are not alone. Mental health matters as much as physical health! 💙`,
  },
  {
    keywords: ['habit', 'routine', 'goal', 'discipline', 'motivation', 'productive', 'consistency'],
    response: `**Building & Breaking Habits 🔄**

**The Habit Loop:**
Cue → Routine → Reward

To build a new habit:
1. **Start tiny** — "I will walk for 5 minutes after lunch"
2. **Stack habits** — Attach to existing routine ("After I brush teeth, I will meditate 2 mins")
3. **Make it easy** — Lay out gym clothes the night before
4. **Track it** — Use Habit Guard to mark daily completions
5. **Reward yourself** — Celebrate small wins

**To Break a Bad Habit:**
1. **Identify the cue** — What triggers it? (boredom, stress, time of day)
2. **Replace, don't erase** — Replace bad habit with a positive one
3. **Make it hard** — Add friction (delete apps, keep junk food out of house)
4. **Change your environment** — Environment shapes behavior
5. **Tell someone** — Accountability partners boost success by 65%

**Timeline:**
- 21 days — habit starts to form
- 66 days — habit becomes automatic
- 90 days — habit is deeply ingrained

**Use Habit Guard to track your progress every day!** 🛡️`,
  },
  {
    keywords: ['headache', 'migraine', 'pain', 'ache'],
    response: `**Headache & Migraine Relief 🤕**

**Common Causes:**
- Dehydration (most common!)
- Eye strain from screens
- Poor posture
- Stress and tension
- Lack of sleep
- Skipping meals

**Immediate Relief:**
1. Drink 2 glasses of water immediately
2. Take a break from screens (20-20-20 rule: every 20 mins, look 20 feet away for 20 secs)
3. Apply cold or warm compress to forehead/neck
4. Massage temples gently in circular motion
5. Lie down in a dark, quiet room
6. Try peppermint or lavender essential oil on temples

**Prevention:**
- Stay hydrated throughout the day
- Take regular screen breaks
- Maintain good posture
- Get consistent sleep
- Manage stress with breathing exercises

**See a Doctor If:**
- Sudden severe "thunderclap" headache
- Headache with fever and stiff neck
- Headache after head injury
- Frequent headaches (3+ per week)`,
  },
  {
    keywords: ['weight', 'lose weight', 'fat', 'bmi', 'obesity', 'slim', 'diet plan'],
    response: `**Healthy Weight Management ⚖️**

**The Basics:**
- Weight loss = Calories in < Calories out
- Safe rate: 0.5–1 kg (1–2 lbs) per week
- Crash diets don't work long-term

**Sustainable Approach:**
1. **Calculate your TDEE** (Total Daily Energy Expenditure) — eat 300–500 calories below it
2. **High protein diet** — keeps you full, preserves muscle (aim for 1.6g per kg of body weight)
3. **Strength training** — builds muscle, boosts metabolism
4. **Cardio** — walks, swimming, cycling
5. **Track food** — use MyFitnessPal or similar

**Foods to Focus On:**
- High volume, low calorie: vegetables, fruits, broth soups
- Lean proteins: chicken breast, fish, eggs, legumes
- Fiber-rich: oats, beans, vegetables

**Mindset Shifts:**
- Progress over perfection
- Focus on health, not just appearance
- Celebrate non-scale victories (more energy, better sleep)
- Sustainability > Speed

**Avoid:**
- ❌ Extreme calorie restriction
- ❌ Skipping meals
- ❌ Fad diets (keto, juice cleanses, etc.)
- ❌ Comparing yourself to others`,
  },
];

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();

  for (const entry of knowledgeBase) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.response;
    }
  }

  return `**Thanks for your question! 🤖**

I'm your Habit Guard AI Health Assistant. I can help you with:

- 😴 **Sleep** — quality, duration, bedtime routines
- 🧘 **Stress & Anxiety** — management techniques
- 🏃 **Exercise** — workout plans, step goals
- 🍎 **Nutrition** — healthy eating, meal plans
- 💧 **Hydration** — daily water intake
- ❤️ **Heart Health** — cardiovascular tips
- 🧠 **Mental Health** — emotional wellbeing
- 📱 **Screen Time** — digital detox tips
- 🔄 **Habits** — building and breaking habits
- ⚖️ **Weight** — healthy weight management
- 🤕 **Headaches** — relief and prevention

Try asking something like:
*"How can I sleep better?"* or *"What foods boost energy?"*

⚠️ *I provide wellness information only. Always consult a doctor for medical conditions.*`;
}

function formatResponse(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return (
        <p key={i} className="font-bold text-violet-300 text-sm mt-2 mb-1">
          {line.replace(/\*\*/g, '')}
        </p>
      );
    }
    if (line.includes('**')) {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className="text-sm text-slate-200 leading-relaxed">
          {parts.map((part, j) =>
            j % 2 === 1 ? (
              <span key={j} className="font-semibold text-white">
                {part}
              </span>
            ) : (
              part
            )
          )}
        </p>
      );
    }
    if (line.startsWith('- ') || line.startsWith('• ')) {
      return (
        <p key={i} className="text-sm text-slate-200 leading-relaxed pl-2">
          {line}
        </p>
      );
    }
    if (line.match(/^\d+\./)) {
      return (
        <p key={i} className="text-sm text-slate-200 leading-relaxed pl-2">
          {line}
        </p>
      );
    }
    if (line === '') return <div key={i} className="h-1" />;
    return (
      <p key={i} className="text-sm text-slate-200 leading-relaxed">
        {line}
      </p>
    );
  });
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'ai',
      text: `**Hello! I'm your Habit Guard AI Health Assistant 🛡️🤖**

I'm here to help you with all your health and wellness questions — from sleep and stress to nutrition, exercise, and breaking bad habits.

Ask me anything or tap a quick question below to get started!

⚠️ *I provide wellness information only. For medical conditions, please consult a qualified doctor.*`,
      time: getTime(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      time: getTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: getAIResponse(text),
        time: getTime(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage(input);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)]">
      {/* Header */}
      <div className="px-4 py-3 glass-heavy flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-purple-600 flex items-center justify-center text-xl shadow-lg glow-accent">
            🤖
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0a0a1a] shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
        </div>
        <div>
          <p className="font-bold text-white text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Habit Guard AI</p>
          <p className="text-[10px] text-emerald-400/80 font-medium">Online · Health Assistant</p>
        </div>
        <button
          onClick={() =>
            setMessages([
              {
                id: '0',
                role: 'ai',
                text: `**Hello again! I'm your Habit Guard AI Health Assistant 🛡️🤖**\n\nHow can I help you today?`,
                time: getTime(),
              },
            ])
          }
          className="ml-auto text-[10px] text-slate-400 hover:text-slate-200 bg-slate-800/40 px-3 py-1.5 rounded-xl border border-slate-700/20 transition-all hover:bg-slate-800/60 font-medium"
        >
          🗑️ Clear
        </button>
      </div>

      {/* Quick Questions */}
      <div className="px-3 py-2.5 border-b border-slate-800/30 flex gap-2 overflow-x-auto scrollbar-hide">
        {quickQuestions.map((q) => (
          <button
            key={q.label}
            onClick={() => sendMessage(q.q)}
            className="flex-shrink-0 text-[11px] glass hover:bg-violet-900/20 hover:border-violet-500/20 text-slate-300 hover:text-violet-300 px-3 py-1.5 rounded-full transition-all duration-300 font-medium"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center text-xs ${
                msg.role === 'ai'
                  ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/20'
                  : 'bg-gradient-to-br from-slate-600 to-slate-700'
              }`}
            >
              {msg.role === 'ai' ? '🤖' : '👤'}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[82%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-violet-600/90 to-fuchsia-600/80 rounded-tr-md shadow-lg shadow-violet-500/10'
                  : 'glass rounded-tl-md'
              }`}
            >
              <div className="space-y-0.5">{formatResponse(msg.text)}</div>
              <p className="text-[9px] text-slate-400/60 mt-2 text-right">{msg.time}</p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-2 items-end animate-fade-in">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-xs shadow-lg shadow-violet-500/20">
              🤖
            </div>
            <div className="glass rounded-2xl rounded-tl-md px-4 py-3">
              <div className="flex gap-1.5 items-center h-5">
                <span className="w-2 h-2 bg-violet-400/80 rounded-full" style={{ animation: 'dot-bounce 1.4s infinite ease-in-out', animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-violet-400/80 rounded-full" style={{ animation: 'dot-bounce 1.4s infinite ease-in-out', animationDelay: '200ms' }} />
                <span className="w-2 h-2 bg-violet-400/80 rounded-full" style={{ animation: 'dot-bounce 1.4s infinite ease-in-out', animationDelay: '400ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 glass-heavy">
        <div className="flex gap-2 items-center bg-slate-800/40 border border-slate-700/20 rounded-2xl px-4 py-2.5 focus-within:border-violet-500/30 focus-within:shadow-[0_0_20px_rgba(139,92,246,0.05)] transition-all duration-300">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your health..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-300 flex-shrink-0"
          >
            <svg className="w-4 h-4 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[9px] text-slate-600 mt-2">
          For medical emergencies, call 911 or your local emergency number
        </p>
      </div>
    </div>
  );
}
