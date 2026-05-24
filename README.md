# ⏱ Stopwatch & Timer

A clean, accessible stopwatch and countdown timer built with **React**, **shadcn/ui**, and **Tailwind CSS**. Supports lap tracking with split/total times, a fully custom countdown input, and a live progress bar — all styled with shadcn's default token system so it adapts to your theme out of the box.

---

## Preview

```
┌─────────────────────────────────┐
│  [ Stopwatch ]     Timer        │
│                                 │
│       00:01:23.07               │
│                                 │
│  🕐 Lap ②   Reset    Stop       │
│ ─────────────────────────────── │
│  #   Split          Total       │
│  02  00:00:41.03 ↑ best  ...    │
│  01  00:00:42.04         ...    │
└─────────────────────────────────┘
```

---

## Features

### Stopwatch

- **Live centisecond display** using `requestAnimationFrame` — no drift
- **Custom Lap button** with a live badge showing the lap count
- **Lap list** with split and cumulative total times
- Newest lap highlighted; **fastest** and **slowest** laps auto-tagged

### Countdown Timer

- **Custom input** — click any digit (hours / minutes / seconds) to type a value directly, or use ▲ ▼ to increment
- **Resume support** — pause and pick up exactly where you left off
- **Progress bar** that drains in real time, turns destructive red on completion
- "Time's up!" alert when the countdown finishes

---

## File Structure

```
StopwatchTimer.jsx
├── TimeDisplay          # Plain-text HH:MM:SS.cs display
├── LapButton            # Button with lap-count badge
├── Stopwatch            # Full stopwatch with lap tracking
├── TimerInput           # Click-to-type ▲▼ spinner input
├── Timer                # Countdown timer with progress bar
└── App (default export) # Card + Tabs shell
```

---
