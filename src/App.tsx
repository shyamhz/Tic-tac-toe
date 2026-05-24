import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Player = "X" | "O";
type Board = (Player | null)[];
type WinResult = { winner: Player; line: [number, number, number] } | null;
type Scores = Record<Player, number>;

const WINNING_LINES: [number, number, number][] = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

// X → --primary, O → --accent-foreground (always a visible, contrasting shadcn color)
const X_COLOR = "hsl(var(--primary))";
const O_COLOR = "hsl(var(--accent-foreground))";

function checkWinner(board: Board): WinResult {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return { winner: board[a] as Player, line: [a, b, c] };
  }
  return null;
}

interface PlayerCardProps {
  player: Player;
  isActive: boolean;
  isWinner: boolean;
  score: number;
}

function PlayerCard({ player, isActive, isWinner, score }: PlayerCardProps) {
  const isX = player === "X";
  const playerColor = isX ? X_COLOR : O_COLOR;
  const dimColor = "hsl(var(--muted-foreground))";
  const symbolColor = isActive || isWinner ? playerColor : dimColor;

  const cardStyle: React.CSSProperties =
    isWinner || isActive
      ? {
          border: `2px solid ${playerColor}`,
          background: `color-mix(in srgb, ${playerColor} 8%, transparent)`,
          boxShadow: isWinner ? `0 0 0 3px color-mix(in srgb, ${playerColor} 20%, transparent)` : undefined,
        }
      : {};

  const labelStyle: React.CSSProperties =
    isWinner || isActive ? { color: playerColor } : {};

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
          ${isActive || isWinner ? "" : "border border-border bg-muted"}`}
        style={cardStyle}
      >
        <span className="text-2xl font-bold leading-none" style={{ color: symbolColor }}>
          {isX ? "x" : "o"}
        </span>
      </div>
      <span
        className="text-xs font-semibold tracking-widest uppercase transition-colors duration-300"
        style={isWinner ? { ...labelStyle, fontWeight: 900 } : isActive ? labelStyle : { color: dimColor }}
      >
        {isWinner ? "🏆 Winner!" : `Player ${player}`}
      </span>
      <span className={`text-lg font-bold tabular-nums ${isActive || isWinner ? "text-foreground" : "text-muted-foreground"}`}>
        {score}
      </span>
    </div>
  );
}

interface CellProps {
  value: Player | null;
  onClick: () => void;
  isWinning: boolean;
  disabled: boolean;
}

function Cell({ value, onClick, isWinning, disabled }: CellProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || !!value}
      className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-200
        ${isWinning
          ? "bg-primary/10 border-2 border-primary"
          : value
          ? "bg-background border border-border"
          : "bg-muted border border-border hover:bg-background hover:border-input hover:shadow-sm cursor-pointer active:scale-95"
        }`}
    >
      {value === "X" && (
        <span className="text-3xl font-bold leading-none animate-[pop_0.15s_ease-out]"
          style={{ color: X_COLOR }}>x</span>
      )}
      {value === "O" && (
        <span className="text-3xl font-bold leading-none animate-[pop_0.15s_ease-out]"
          style={{ color: O_COLOR }}>o</span>
      )}
    </button>
  );
}

export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isX, setIsX] = useState<boolean>(true);
  const [scores, setScores] = useState<Scores>({ X: 0, O: 0 });
  const [nextStartsX, setNextStartsX] = useState<boolean>(false);

  const result = checkWinner(board);
  const winner = result?.winner;
  const winLine: number[] = result?.line ?? [];
  const isDraw = !winner && board.every(Boolean);

  const handleClick = (i: number): void => {
    if (board[i] || winner) return;
    const next: Board = [...board];
    next[i] = isX ? "X" : "O";
    const newResult = checkWinner(next);
    if (newResult) {
      setScores(s => ({ ...s, [newResult.winner]: s[newResult.winner] + 1 }));
    }
    setBoard(next);
    setIsX(!isX);
  };

  const reset = (): void => {
    setBoard(Array(9).fill(null));
    setIsX(nextStartsX);
    setNextStartsX(prev => !prev);
  };

  const currentPlayer: Player = isX ? "X" : "O";
  const status = winner
    ? `Player ${winner} wins!`
    : isDraw
    ? "It's a draw!"
    : `Player ${currentPlayer}'s turn`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <style>{`@keyframes pop{0%{transform:scale(0.5);opacity:0}80%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}`}</style>

      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black tracking-tight">
          <span className="text-foreground">TIC </span>
          <span className="text-primary">TAC </span>
          <span className="text-foreground">TOE</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">{status}</p>
      </div>

      <div className="flex items-center gap-10 mb-8">
        <PlayerCard player="X" isActive={!winner && !isDraw && isX} isWinner={winner === "X"} score={scores.X} />
        <span className="text-sm font-bold text-muted-foreground tracking-widest">VS</span>
        <PlayerCard player="O" isActive={!winner && !isDraw && !isX} isWinner={winner === "O"} score={scores.O} />
      </div>

      <Card className="p-4 rounded-3xl border-0 shadow-sm bg-muted">
        <div className="grid grid-cols-3 gap-3 w-[280px]">
          {board.map((cell, i) => (
            <Cell
              key={i}
              value={cell}
              onClick={() => handleClick(i)}
              isWinning={winLine.includes(i)}
              disabled={!!winner || isDraw}
            />
          ))}
        </div>
      </Card>

      <Button
        variant="ghost"
        onClick={reset}
        className="mt-8 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground gap-2"
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
        </svg>
        New Game
      </Button>
    </div>
  );
}
