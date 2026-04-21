# 🛡️ Habit Guard — AI Wellness Tracker

> **Break bad habits, track fitness, and build a healthier you.** Built by [Neurolock](https://github.com).

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🏃 **Step Tracker** | Real-time step counting using the Device Motion API with daily goals and streak tracking |
| 📋 **Habits Tracker** | Track bad habits with a points system — earn points for avoiding, lose points for slipping |
| 🤖 **AI Health Assistant** | Built-in wellness chatbot with knowledge on sleep, nutrition, exercise, stress, and more |
| 📱 **Device Manager** | Connect fitness trackers & smartwatches via Web Bluetooth API |
| 👤 **Profile & BMI** | Track your body metrics, BMI, and customize your wellness goals |
| 🌙 **Dark Mode** | Premium dark UI with glassmorphism design (light mode also available) |

---

## 🛠️ Tech Stack

- **Frontend:** React 19 + TypeScript 5.8
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 4 + custom glassmorphism design system
- **Fonts:** Inter (body) + Space Grotesk (headings) via Google Fonts
- **Storage:** Browser `localStorage` (no backend required)
- **APIs:** Web Bluetooth API, Device Motion API

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/habit-guard.git
cd habit-guard

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be output to the `dist/` folder.

---

## 📁 Project Structure

```
habit-guard/
├── index.html              # App entry point + Google Fonts
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
├── .gitignore              # Git ignore rules
├── README.md               # This file
└── src/
    ├── main.tsx            # React mount point
    ├── App.tsx             # App shell — header, navigation, routing
    ├── index.css           # Design system — tokens, animations, glass utilities
    ├── components/
    │   ├── AuthScreen.tsx  # Login, signup, and onboarding flow
    │   ├── Dashboard.tsx   # Step counter with circular progress ring
    │   ├── Habits.tsx      # Bad habits tracker with points system
    │   ├── AIAssistant.tsx # AI health chatbot
    │   ├── Devices.tsx     # Bluetooth device manager
    │   └── Profile.tsx     # User profile, BMI, dark mode toggle
    └── services/
        ├── stepCounter.ts  # Step detection via accelerometer
        └── deviceManager.ts # Web Bluetooth device manager
```

---

## 📱 How It Works

### Step Tracking
Uses the **Device Motion API** to detect walking steps via accelerometer data. Best experienced on mobile devices. Steps, streaks, and goals are saved to `localStorage`.

### Habits System
- **✓ Did the bad habit** → Lose 2 points
- **✗ Avoided the bad habit** → Gain 3 points
- Includes 16 predefined bad habits + custom habit creation
- 7-day progress graph with positive/negative visualization

### AI Assistant
An offline knowledge-base chatbot covering: sleep, stress, exercise, nutrition, hydration, heart health, mental health, weight management, headaches, and habit building.

### Device Connectivity
Uses **Web Bluetooth API** to pair with fitness trackers (Fitbit, Mi Band, Garmin, etc.). Works in Chrome/Edge on Android and desktop.

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

<div align="center">
  <sub>Built with ❤️ by Neurolock</sub>
</div>
