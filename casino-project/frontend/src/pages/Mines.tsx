import { useState, useCallback } from "react";
import { Bomb, Gem, Play, ArrowDownToLine } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Cell {
  revealed: boolean;
  isMine: boolean;
}

const GRID_SIZE = 5;
const MINE_OPTIONS = [1, 3, 5, 10, 15];

export default function Mines() {
  const [betAmount, setBetAmount] = useState("10");
  const [mineCount, setMineCount] = useState(5);
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [revealedCount, setRevealedCount] = useState(0);

  const initializeGame = useCallback(() => {
    const newGrid: Cell[][] = Array(GRID_SIZE)
      .fill(null)
      .map(() =>
        Array(GRID_SIZE)
          .fill(null)
          .map(() => ({ revealed: false, isMine: false }))
      );

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      if (!newGrid[row][col].isMine) {
        newGrid[row][col].isMine = true;
        minesPlaced++;
      }
    }

    setGrid(newGrid);
    setIsPlaying(true);
    setGameOver(false);
    setMultiplier(1);
    setRevealedCount(0);
  }, [mineCount]);

  const revealCell = (row: number, col: number) => {
    if (!isPlaying || gameOver || grid[row][col].revealed) return;

    const newGrid = [...grid.map((r) => [...r])];
    newGrid[row][col].revealed = true;
    setGrid(newGrid);

    if (newGrid[row][col].isMine) {
      // Hit a mine - game over
      setGameOver(true);
      setIsPlaying(false);
      // Reveal all mines
      const revealedGrid = newGrid.map((r) =>
        r.map((cell) => (cell.isMine ? { ...cell, revealed: true } : cell))
      );
      setGrid(revealedGrid);
    } else {
      // Found gem - increase multiplier
      const newCount = revealedCount + 1;
      setRevealedCount(newCount);
      
      // Calculate new multiplier based on revealed gems
      const safeSquares = GRID_SIZE * GRID_SIZE - mineCount;
      const newMultiplier = 1 + (newCount * (mineCount / safeSquares)) * 2;
      setMultiplier(parseFloat(newMultiplier.toFixed(2)));
    }
  };

  const cashOut = () => {
    if (!isPlaying || gameOver) return;
    setIsPlaying(false);
    // Keep the current multiplier as winnings
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl gradient-secondary flex items-center justify-center">
            <Bomb className="h-8 w-8 text-secondary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">الألغام</h1>
            <p className="text-muted-foreground">اكتشف الجواهر وتجنب الألغام</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <div className="casino-card neon-border-purple">
              <div className="grid grid-cols-5 gap-2">
                {grid.length > 0 ? (
                  grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => revealCell(rowIndex, colIndex)}
                        disabled={!isPlaying || cell.revealed}
                        className={cn(
                          "aspect-square rounded-lg flex items-center justify-center transition-all duration-300",
                          cell.revealed
                            ? cell.isMine
                              ? "bg-destructive/30 animate-explode"
                              : "bg-primary/30 animate-reveal"
                            : "bg-muted hover:bg-muted/80 hover:scale-105"
                        )}
                      >
                        {cell.revealed && (
                          cell.isMine ? (
                            <Bomb className="h-8 w-8 text-destructive" />
                          ) : (
                            <Gem className="h-8 w-8 text-primary" />
                          )
                        )}
                      </button>
                    ))
                  )
                ) : (
                  Array(25)
                    .fill(null)
                    .map((_, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg bg-muted flex items-center justify-center"
                      >
                        <span className="text-muted-foreground text-2xl">?</span>
                      </div>
                    ))
                )}
              </div>

              {/* Game Status */}
              {gameOver && (
                <div className="mt-6 text-center">
                  <p className="text-2xl font-bold text-destructive">💥 انفجار!</p>
                  <p className="text-muted-foreground">لقد أصبت بلغم</p>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Bet Amount */}
            <div className="casino-card">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                مبلغ الرهان
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  min="1"
                  disabled={isPlaying}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBetAmount((prev) => String(parseFloat(prev) / 2))}
                  disabled={isPlaying}
                >
                  ½
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBetAmount((prev) => String(parseFloat(prev) * 2))}
                  disabled={isPlaying}
                >
                  2x
                </Button>
              </div>
            </div>

            {/* Mine Count */}
            <div className="casino-card">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                عدد الألغام
              </label>
              <div className="grid grid-cols-5 gap-2">
                {MINE_OPTIONS.map((option) => (
                  <Button
                    key={option}
                    variant={mineCount === option ? "casino-purple" : "outline"}
                    size="sm"
                    onClick={() => setMineCount(option)}
                    disabled={isPlaying}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            {/* Multiplier Display */}
            {isPlaying && (
              <div className="casino-card neon-border-green text-center">
                <p className="text-sm text-muted-foreground mb-1">المضاعف الحالي</p>
                <p className="text-3xl font-bold text-primary neon-text-green">
                  {multiplier}x
                </p>
                <p className="text-lg text-muted-foreground mt-1">
                  ${(parseFloat(betAmount) * multiplier).toFixed(2)}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {!isPlaying ? (
              <Button
                variant="casino"
                size="xl"
                className="w-full"
                onClick={initializeGame}
              >
                <Play className="h-5 w-5 ml-2" />
                ابدأ اللعب
              </Button>
            ) : (
              <Button
                variant="casino"
                size="xl"
                className="w-full"
                onClick={cashOut}
                disabled={revealedCount === 0}
              >
                <ArrowDownToLine className="h-5 w-5 ml-2" />
                اسحب ${(parseFloat(betAmount) * multiplier).toFixed(2)}
              </Button>
            )}

            {/* Info */}
            <div className="casino-card">
              <p className="text-sm text-muted-foreground text-center">
                {isPlaying
                  ? `اكتشفت ${revealedCount} جوهرة من ${GRID_SIZE * GRID_SIZE - mineCount}`
                  : "اضغط على المربعات للكشف عن الجواهر"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
