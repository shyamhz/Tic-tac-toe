import { useState, useRef, useCallback, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const pad = (n, d = 2) => String(Math.floor(n)).padStart(d, "0");

function splitTime(ms) {
  return {
    h: Math.floor(ms / 3600000),
    m: Math.floor((ms % 3600000) / 60000),
    s: Math.floor((ms % 60000) / 1000),
    cs: Math.floor((ms % 1000) / 10),
  };
}

function fmtLap(ms) {
  const { h, m, s, cs } = splitTime(ms);
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`;
}

// ── Plain text time display ──────────────────────────────────────────────────
function TimeDisplay({ ms }) {
  const { h, m, s, cs } = splitTime(ms);
  return (
    <div className="flex items-center justify-center gap-1 tabular-nums">
      <span className="text-5xl font-semibold tracking-tight text-foreground">
        {pad(h)}:{pad(m)}:{pad(s)}
      </span>
      <span className="text-2xl font-normal text-muted-foreground self-end pb-1">
        .{pad(cs)}
      </span>
    </div>
  );
}

// ── Custom Lap Button ────────────────────────────────────────────────────────
function LapButton({ onClick, disabled, count }) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full min-w-[80px] gap-2"
    >
      <svg
        width={13}
        height={13}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx={12} cy={12} r={10} />
        <polyline points="12 6 12 12 16 14" />
        <line x1={2} y1={12} x2={5} y2={12} />
        <line x1={19} y1={12} x2={22} y2={12} />
      </svg>
      Lap
      {count > 0 && (
        <Badge
          variant="secondary"
          className="h-4 min-w-4 px-1 text-[10px] rounded-full"
        >
          {count}
        </Badge>
      )}
    </Button>
  );
}

// ── Stopwatch ────────────────────────────────────────────────────────────────
function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const [lapStart, setLapStart] = useState(0);
  const startTs = useRef(null);
  const rafId = useRef(null);

  const tick = useCallback(() => {
    setElapsed(Date.now() - startTs.current);
    rafId.current = requestAnimationFrame(tick);
  }, []);

  const toggle = () => {
    if (!running) {
      startTs.current = Date.now() - elapsed;
      rafId.current = requestAnimationFrame(tick);
      setRunning(true);
    } else {
      cancelAnimationFrame(rafId.current);
      setRunning(false);
    }
  };

  const recordLap = () => {
    if (!running) return;
    const split = elapsed - lapStart;
    setLaps((prev) => [...prev, { n: prev.length + 1, split, total: elapsed }]);
    setLapStart(elapsed);
  };

  const reset = () => {
    cancelAnimationFrame(rafId.current);
    setRunning(false);
    setElapsed(0);
    setLapStart(0);
    setLaps([]);
  };

  useEffect(() => () => cancelAnimationFrame(rafId.current), []);

  const splits = laps.map((l) => l.split);
  const minS = Math.min(...splits),
    maxS = Math.max(...splits);
  const displayLaps = [...laps].reverse();

  return (
    <div>
      <div className="py-6 flex justify-center">
        <TimeDisplay ms={elapsed} />
      </div>

      <div className="flex gap-2 justify-center mb-5">
        <LapButton
          onClick={recordLap}
          disabled={!running}
          count={laps.length}
        />
        <Button
          variant="outline"
          onClick={reset}
          className="rounded-full min-w-[80px]"
        >
          Reset
        </Button>
        <Button
          onClick={toggle}
          className="rounded-full min-w-[90px]"
          variant={running ? "destructive" : "default"}
        >
          {running ? "Stop" : "Start"}
        </Button>
      </div>

      {laps.length > 0 && (
        <div className="border-t pt-3">
          <div className="grid grid-cols-[36px_1fr_auto_8px] gap-x-3 text-[11px] text-muted-foreground uppercase tracking-wider px-2 pb-2">
            <span>#</span>
            <span>Split</span>
            <span>Total</span>
            <span />
          </div>
          <div className="max-h-48 overflow-y-auto flex flex-col gap-0.5">
            {displayLaps.map((l) => {
              const isFastest = laps.length > 1 && l.split === minS;
              const isSlowest = laps.length > 1 && l.split === maxS;
              const isLatest = l.n === laps.length;
              return (
                <div
                  key={l.n}
                  className={`grid grid-cols-[36px_1fr_auto_8px] gap-x-3 items-center px-2 py-2 rounded-lg text-sm tabular-nums ${isLatest ? "bg-muted" : ""}`}
                >
                  <span className="text-muted-foreground font-medium">
                    {pad(l.n, 2)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {fmtLap(l.split)}
                    {isFastest && (
                      <Badge
                        variant="outline"
                        className="text-[10px] h-4 px-1.5 text-green-600 border-green-300 bg-green-50"
                      >
                        ↑ best
                      </Badge>
                    )}
                    {isSlowest && (
                      <Badge
                        variant="outline"
                        className="text-[10px] h-4 px-1.5 text-red-600 border-red-300 bg-red-50"
                      >
                        ↓ slow
                      </Badge>
                    )}
                  </span>
                  <span className="text-muted-foreground">
                    {fmtLap(l.total)}
                  </span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full justify-self-center ${isLatest ? "bg-foreground" : ""}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Custom Timer Input ───────────────────────────────────────────────────────
function TimerInput({ value, onChange, label, max }) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState("");

  const commit = (val) => {
    const n = Math.max(0, Math.min(max - 1, parseInt(val, 10) || 0));
    onChange(n);
    setEditing(false);
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-9 p-0 text-muted-foreground"
        onClick={() => onChange((value + 1) % max)}
      >
        ▲
      </Button>

      {editing ? (
        <input
          autoFocus
          type="number"
          min={0}
          max={max - 1}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          onBlur={() => commit(raw)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit(raw);
            if (e.key === "Escape") setEditing(false);
          }}
          className="w-14 text-center text-2xl font-semibold tabular-nums border border-input rounded-md bg-background text-foreground py-1 outline-none focus:ring-2 focus:ring-ring"
        />
      ) : (
        <button
          onClick={() => {
            setRaw(String(value));
            setEditing(true);
          }}
          title="Click to type"
          className="text-2xl font-semibold tabular-nums text-foreground w-14 text-center py-1 rounded-md hover:bg-muted cursor-text transition-colors"
        >
          {pad(value)}
        </button>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-9 p-0 text-muted-foreground"
        onClick={() => onChange((value - 1 + max) % max)}
      >
        ▼
      </Button>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

// ── Countdown Timer ──────────────────────────────────────────────────────────
function Timer() {
  const [setting, setSetting] = useState({ h: 0, m: 5, s: 0 });
  const [remaining, setRemaining] = useState(null);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const startTs = useRef(null);
  const initialMs = useRef(0);
  const rafId = useRef(null);

  const totalMs = setting.h * 3600000 + setting.m * 60000 + setting.s * 1000;

  const tick = useCallback(() => {
    const left = initialMs.current - (Date.now() - startTs.current);
    if (left <= 0) {
      setRemaining(0);
      setRunning(false);
      setDone(true);
      return;
    }
    setRemaining(left);
    rafId.current = requestAnimationFrame(tick);
  }, []);

  const start = () => {
    const ms = remaining !== null ? remaining : totalMs;
    if (ms <= 0) return;
    initialMs.current = ms;
    startTs.current = Date.now();
    setDone(false);
    setRunning(true);
    rafId.current = requestAnimationFrame(tick);
  };

  const pause = () => {
    cancelAnimationFrame(rafId.current);
    setRunning(false);
  };

  const reset = () => {
    cancelAnimationFrame(rafId.current);
    setRunning(false);
    setRemaining(null);
    setDone(false);
  };

  useEffect(() => () => cancelAnimationFrame(rafId.current), []);

  const displayMs = remaining !== null ? remaining : totalMs;
  const progress = totalMs > 0 && remaining !== null ? remaining / totalMs : 1;

  return (
    <div>
      {!running && remaining === null ? (
        <div className="py-5">
          <div className="flex justify-center items-center gap-2">
            <TimerInput
              value={setting.h}
              onChange={(v) => setSetting((p) => ({ ...p, h: v }))}
              label="hr"
              max={24}
            />
            <span className="text-2xl text-muted-foreground mb-6 font-light">
              :
            </span>
            <TimerInput
              value={setting.m}
              onChange={(v) => setSetting((p) => ({ ...p, m: v }))}
              label="min"
              max={60}
            />
            <span className="text-2xl text-muted-foreground mb-6 font-light">
              :
            </span>
            <TimerInput
              value={setting.s}
              onChange={(v) => setSetting((p) => ({ ...p, s: v }))}
              label="sec"
              max={60}
            />
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2">
            tap a number to type a custom value
          </p>
        </div>
      ) : (
        <div className="py-6 flex flex-col items-center gap-3">
          <TimeDisplay ms={displayMs} />
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${done ? "bg-destructive" : "bg-primary"}`}
              style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
            />
          </div>
          {done && (
            <p className="text-destructive text-sm font-medium flex items-center gap-1.5">
              <svg
                width={14}
                height={14}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <circle cx={12} cy={12} r={10} />
                <line x1={12} y1={8} x2={12} y2={12} />
                <line x1={12} y1={16} x2={12.01} y2={16} />
              </svg>
              Time's up!
            </p>
          )}
        </div>
      )}

      <div className="flex gap-2 justify-center">
        <Button
          variant="outline"
          onClick={reset}
          className="rounded-full min-w-[80px]"
        >
          Reset
        </Button>
        <Button
          onClick={running ? pause : start}
          disabled={!running && remaining === null && totalMs === 0}
          variant={running ? "destructive" : "default"}
          className="rounded-full min-w-[90px]"
        >
          {running ? "Pause" : remaining !== null && !done ? "Resume" : "Start"}
        </Button>
      </div>
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[440px] rounded-2xl shadow-md">
        <CardContent className="p-8">
          <Tabs defaultValue="stopwatch">
            <TabsList className="w-full rounded-full mb-1">
              <TabsTrigger value="stopwatch" className="flex-1 rounded-full">
                Stopwatch
              </TabsTrigger>
              <TabsTrigger value="timer" className="flex-1 rounded-full">
                Timer
              </TabsTrigger>
            </TabsList>
            <TabsContent value="stopwatch">
              <Stopwatch />
            </TabsContent>
            <TabsContent value="timer">
              <Timer />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
