import { createContext, useContext, useState, ReactNode } from "react";

interface GameContextType {
  balance: number;
  setBalance: (balance: number) => void;
  addBalance: (amount: number) => void;
  subtractBalance: (amount: number) => boolean;
  activeGame: string | null;
  setActiveGame: (game: string | null) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(1250);
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const addBalance = (amount: number) => {
    setBalance((prev) => prev + amount);
  };

  const subtractBalance = (amount: number): boolean => {
    if (balance >= amount) {
      setBalance((prev) => prev - amount);
      return true;
    }
    return false;
  };

  return (
    <GameContext.Provider
      value={{
        balance,
        setBalance,
        addBalance,
        subtractBalance,
        activeGame,
        setActiveGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
