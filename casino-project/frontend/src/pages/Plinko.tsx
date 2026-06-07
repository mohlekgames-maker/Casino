import { useState, useCallback, useEffect, useRef } from "react";
import { Gamepad2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGame } from "@/contexts/GameContext";
import { toast } from "sonner";

const MULTIPLIERS_16 = [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110];
const MULTIPLIERS_12 = [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33];
const MULTIPLIERS_8 = [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13];

const ROWS_OPTIONS = [8, 12, 16];

interface Ball {
  id: number;
  x: number;
  y: number;
  path: number[];
  step: number;
}

export default function Plinko() {
  const { balance, subtractBalance, addBalance } = useGame();
  const [betAmount, setBetAmount] = useState("10");
  const [rows, setRows] = useState(16);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastWin, setLastWin] = useState<{ amount: number; multiplier: number } | null>(null);
  const animationRef = useRef<number>();

  const getMultipliers = () => {
    if (rows === 8) return MULTIPLIERS_8;
    if (rows === 12) return MULTIPLIERS_12;
    return MULTIPLIERS_16;
  };

  const multipliers = getMultipliers();

  const dropBall = useCallback(() => {
    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet <= 0) {
      toast.error("أدخل مبلغ رهان صحيح");
      return;
    }
    if (!subtractBalance(bet)) {
      toast.error("رصيد غير كافي");
      return;
    }

    setIsPlaying(true);
    setLastWin(null);

    // Generate ball path
    const path: number[] = [];
    let position = 0;
    for (let i = 0; i < rows; i++) {
      const direction = Math.random() > 0.5 ? 1 : -1;
      position += direction;
      path.push(position);
    }

    const newBall: Ball = {
      id: Date.now(),
      x: 50,
      y: 0,
      path,
      step: 0,
    };

    setBalls([newBall]);

    // Animate ball
    let currentStep = 0;
    const animate = () => {
      if (currentStep >= rows) {
        // Calculate final bucket
        const finalPosition = path[path.length - 1];
        const normalizedPosition = (finalPosition + rows) / (2 * rows);
        const bucketIndex = Math.floor(normalizedPosition * multipliers.length);
        const clampedIndex = Math.max(0, Math.min(multipliers.length - 1, bucketIndex));
        const multiplier = multipliers[clampedIndex];
        const winAmount = bet * multiplier;

        addBalance(winAmount);
        setLastWin({ amount: winAmount - bet, multiplier });
        setBalls([]);
        setIsPlaying(false);
        return;
      }

      const progress = path[currentStep];
      const maxOffset = rows;
      const xPosition = 50 + (progress / maxOffset) * 40;
      const yPosition = ((currentStep + 1) / rows) * 85;

      setBalls([{
        ...newBall,
        x: xPosition,
        y: yPosition,
        step: currentStep,
      }]);

      currentStep++;
      animationRef.current = setTimeout(animate, 100) as unknown as number;
    };

    animate();
  }, [betAmount, rows, multipliers, subtractBalance, addBalance]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  const getMultiplierColor = (mult: number) => {
    if (mult >= 10) return "bg-primary/40 text-primary border-primary";
    if (mult >= 3) return "bg-secondary/40 text-secondary border-secondary";
    if (mult >= 1) return "bg-muted/60 text-muted-foreground border-muted";
    return "bg-destructive/30 text-destructive border-destructive";
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
            <Gamepad2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">بلينكو</h1>
            <p className="text-muted-foreground">أسقط الكرة واربح</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <div className="casino-card neon-border-green aspect-[4/3] relative overflow-hidden">
              {/* Triangle Peg Layout */}
              <svg 
                className="absolute inset-0 w-full h-full" 
                viewBox="0 0 100 100" 
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Pegs in triangle formation */}
                {Array.from({ length: rows }).map((_, rowIndex) => {
                  const pinsInRow = rowIndex + 3;
                  const rowY = 8 + (rowIndex * (75 / rows));
                  const startX = 50 - ((pinsInRow - 1) * 2.5);
                  
                  return Array.from({ length: pinsInRow }).map((_, pinIndex) => (
                    <circle
                      key={`${rowIndex}-${pinIndex}`}
                      cx={startX + (pinIndex * 5)}
                      cy={rowY}
                      r="1.2"
                      className="fill-neon-purple"
                      style={{
                        filter: "drop-shadow(0 0 4px hsl(var(--neon-purple)))"
                      }}
                    />
                  ));
                })}
              </svg>

              {/* Ball with smoother animation */}
              {balls.map((ball) => (
                <div
                  key={ball.id}
                  className="absolute w-6 h-6 rounded-full gradient-primary z-10"
                  style={{
                    left: `${ball.x}%`,
                    top: `${ball.y}%`,
                    transform: "translate(-50%, -50%)",
                    boxShadow: "0 0 25px hsl(var(--neon-green)), 0 0 50px hsl(var(--neon-green) / 0.6)",
                    transition: "left 80ms cubic-bezier(0.25, 0.46, 0.45, 0.94), top 80ms cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                  }}
                />
              ))}

              {/* Multiplier Buckets */}
              <div className="absolute bottom-0 left-0 right-0 flex px-2">
                {multipliers.map((mult, index) => (
                  <div
                    key={index}
                    className={`flex-1 py-2 text-center text-xs font-bold border mx-0.5 rounded-t-lg ${getMultiplierColor(mult)}`}
                  >
                    {mult}x
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Max Multiplier Banner */}
            <div className="casino-card neon-border-purple text-center py-4">
              <p className="text-xs text-muted-foreground mb-1">أقصى مضاعف</p>
              <p className="text-4xl font-black text-secondary neon-text-purple">110x</p>
            </div>

            {/* Bet Amount - Larger Panel */}
            <div className="casino-card p-6">
              <label className="block text-lg font-bold text-foreground mb-4">
                مبلغ الرهان
              </label>
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                min="1"
                className="text-4xl font-black h-20 text-center mb-4"
              />
              <div className="grid grid-cols-4 gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg font-bold"
                  onClick={() => setBetAmount(String(Math.max(1, parseFloat(betAmount) / 2)))}
                >
                  ½
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg font-bold"
                  onClick={() => setBetAmount(String(parseFloat(betAmount) * 2))}
                >
                  2x
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg font-bold"
                  onClick={() => setBetAmount("50")}
                >
                  50
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg font-bold"
                  onClick={() => setBetAmount("100")}
                >
                  100
                </Button>
              </div>
            </div>

            {/* Rows Selection */}
            <div className="casino-card">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                عدد الصفوف
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ROWS_OPTIONS.map((option) => (
                  <Button
                    key={option}
                    variant={rows === option ? "casino" : "outline"}
                    size="lg"
                    onClick={() => setRows(option)}
                    disabled={isPlaying}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            {/* Play Button */}
            <Button
              variant="casino"
              size="xl"
              className="w-full h-16 text-xl"
              onClick={dropBall}
              disabled={isPlaying}
            >
              {isPlaying ? "جاري اللعب..." : "أسقط الكرة"}
            </Button>

            {/* Last Win */}
            {lastWin !== null && (
              <div className={`casino-card ${lastWin.amount >= 0 ? "neon-border-green" : "neon-border-purple"} text-center animate-reveal`}>
                <p className="text-sm text-muted-foreground mb-1">
                  المضاعف: {lastWin.multiplier}x
                </p>
                <p className={`text-3xl font-bold ${lastWin.amount >= 0 ? "text-primary neon-text-green" : "text-destructive"}`}>
                  {lastWin.amount >= 0 ? "+" : ""}${lastWin.amount.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
