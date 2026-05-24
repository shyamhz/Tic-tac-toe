# Tic Tac Toe

Two-player Tic Tac Toe built with React and shadcn/ui.

## Setup

1. Install dependencies

```bash
npm install
```

2. Make sure shadcn/ui is initialised in your project. If not:

```bash
npx shadcn@latest init
npx shadcn@latest add button card
```

3. Drop `TicTacToe.jsx` into your components folder and import it:

```tsx
import TicTacToe from "./components/TicTacToe";

export default function App() {
  return <TicTacToe />;
}
```

## Requirements

- React 18+
- Tailwind CSS
- shadcn/ui
