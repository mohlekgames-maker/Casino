import { useState } from "react";
import { Grid3X3 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGame } from "@/contexts/GameContext";
import { toast } from "sonner";

const TOTAL_NUMBERS = 40;
const MAX_PICKS = 10;
const DRAW_COUNT = 10;

// Payout multipliers based on picks and hits
const PAYOUTS: Record<number, Record<number, number>> = {
  1: { 1: 3.5 },
  2: { 2: 9 },
  3: { 2: 2, 3: 26 },
  4: { 2: 1.5, 3: 5, 4: 75 },
  5: { 2: 1, 3: 2.5, 4: 12, 5: 250 },
  6: { 3: 1.5, 4: 5, 5: 25, 6: 700 },
  7: { 3: 1, 4: 3, 5: 10, 6: 100, 7: 2000 },
  8: { 4: 2, 5: 6, 6: 40, 7: 400, 8: 5000 },
  9: { 4: 1.5, 5: 4, 6: 15, 7: 80, 8: 1000, 9: 10000 },
  10: { 5: 2, 6: 8, 7: 30, 8: 200, 9: 2500, 10: 25000 },
};

export default function Keno() {
  const { subtractBalance, addBalance } = useGame();
  const [betAmount, setBetAmount] = useState("10");
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState<{ hits: number; win: number } | null>(null);

  const toggleNumber = (num: number) => {
    if (isPlaying) return;
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else if (selectedNumbers.length < MAX_PICKS) {
      setSelectedNumbers([...selectedNumbers, num]);
    }
  };

  const clearSelection = () => {
    if (isPlaying) return;
    setSelectedNumbers([]);
    setDrawnNumbers([]);
    setResult(null);
  };

  const quickPick = () => {
    if (isPlaying) return;
    const picks: number[] = [];
    while (picks.length < MAX_PICKS) {
      const num = Math.floor(Math.random() * TOTAL_NUMBERS) + 1;
      if (!picks.includes(num)) {
        picks.push(num);
      }
    }
    setSelectedNumbers(picks);
    setDrawnNumbers([]);
    setResult(null);
  };

  const play = () => {
    if (selectedNumbers.length === 0) {
      toast.error("اختر أرقاماً أولاً");
      return;
    }

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
    setDrawnNumbers([]);
    setResult(null);

    // Generate random draw
    const drawn: number[] = [];
    while (drawn.length < DRAW_COUNT) {
      const num = Math.floor(Math.random() * TOTAL_NUMBERS) + 1;
      if (!drawn.includes(num)) {
        drawn.push(num);
      }
    }

    // Animate drawing
    let index = 0;
    const interval = setInterval(() => {
      if (index >= drawn.length) {
        clearInterval(interval);

        // Calculate result
        const hits = selectedNumbers.filter((n) => drawn.includes(n)).length;
        const payoutTable = PAYOUTS[selectedNumbers.length];
        const multiplier = payoutTable?.[hits] || 0;
        const winAmount = bet * multiplier;

        if (winAmount > 0) {
          addBalance(winAmount);
        }

        setResult({ hits, win: winAmount - bet });
        setIsPlaying(false);

        if (multiplier > 0) {
          toast.success(`ربحت $${winAmount.toFixed(2)}!`);
        } else {
          toast.error("حظ أوفر في المرة القادمة!");
        }
        return;
      }

      setDrawnNumbers((prev) => [...prev, drawn[index]]);
      index++;
    }, 200);
  };

  const getNumberState = (num: number) => {
    const isSelected = selectedNumbers.includes(num);
    const isDrawn = drawnNumbers.includes(num);
    const isHit = isSelected && isDrawn;

    if (isHit) return "hit";
    if (isDrawn) return "drawn";
    if (isSelected) return "selected";
    return "default";
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
            <Grid3X3 className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">كينو</h1>
            <p className="text-muted-foreground">اختر أرقامك واربح</p>
          </div>
          <div className="casino-card neon-border-purple px-6 py-3 text-center">
            <p className="text-xs text-muted-foreground">أقصى ربح</p>
            <p className="text-3xl font-black text-secondary neon-text-purple">5000x</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <div className="casino-card neon-border-green">
              {/* Number Grid */}
              <div className="grid grid-cols-8 gap-2 mb-6">
                {Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).map((num) => {
                  const state = getNumberState(num);
                  return (
                    <button
                      key={num}
                      onClick={() => toggleNumber(num)}
                      disabled={isPlaying}
                      className={`
                        aspect-square rounded-lg font-bold text-lg transition-all duration-200
                        ${state === "hit" ? "bg-primary text-primary-foreground scale-110 neon-border-green" : ""}
                        ${state === "drawn" ? "bg-secondary/50 text-secondary-foreground" : ""}
                        ${state === "selected" ? "bg-primary/30 text-primary border-2 border-primary" : ""}
                        ${state === "default" ? "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground" : ""}
                        disabled:cursor-not-allowed
                      `}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={quickPick}
                  disabled={isPlaying}
                  className="flex-1"
                >
                  اختيار عشوائي
                </Button>
                <Button
                  variant="outline"
                  onClick={clearSelection}
                  disabled={isPlaying}
                  className="flex-1"
                >
                  مسح الاختيار
                </Button>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Selection Info */}
            <div className="casino-card">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">الأرقام المختارة</span>
                <span className="text-xl font-bold text-primary">
                  {selectedNumbers.length}/{MAX_PICKS}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[60px]">
                {selectedNumbers.sort((a, b) => a - b).map((num) => (
                  <span
                    key={num}
                    className="w-8 h-8 rounded bg-primary/20 text-primary flex items-center justify-center text-sm font-bold"
                  >
                    {num}
                  </span>
                ))}
              </div>
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
                disabled={isPlaying}
              />
              <div className="grid grid-cols-4 gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg font-bold"
                  onClick={() => setBetAmount(String(Math.max(1, parseFloat(betAmount) / 2)))}
                  disabled={isPlaying}
                >
                  ½
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg font-bold"
                  onClick={() => setBetAmount(String(parseFloat(betAmount) * 2))}
                  disabled={isPlaying}
                >
                  2x
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg font-bold"
                  onClick={() => setBetAmount("50")}
                  disabled={isPlaying}
                >
                  50
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg font-bold"
                  onClick={() => setBetAmount("100")}
                  disabled={isPlaying}
                >
                  100
                </Button>
              </div>
            </div>

            {/* Play Button */}
            <Button
              variant="casino"
              size="xl"
              className="w-full h-16 text-xl"
              onClick={play}
              disabled={isPlaying || selectedNumbers.length === 0}
            >
              {isPlaying ? "جاري السحب..." : "ابدأ اللعب"}
            </Button>

            {/* Result */}
            {result && (
              <div className={`casino-card ${result.win >= 0 ? "neon-border-green" : "neon-border-purple"} text-center animate-reveal`}>
                <p className="text-sm text-muted-foreground mb-1">
                  الإصابات: {result.hits}/{selectedNumbers.length}
                </p>
                <p className={`text-3xl font-bold ${result.win >= 0 ? "text-primary neon-text-green" : "text-destructive"}`}>
                  {result.win >= 0 ? "+" : ""}${result.win.toFixed(2)}
                </p>
              </div>
            )}

            {/* Payout Table Preview */}
            {selectedNumbers.length > 0 && (
              <div className="casino-card">
                <h3 className="text-sm font-bold text-foreground mb-2">
                  جدول الأرباح ({selectedNumbers.length} أرقام)
                </h3>
                <div className="space-y-1 text-xs">
                  {Object.entries(PAYOUTS[selectedNumbers.length] || {}).map(([hits, mult]) => (
                    <div key={hits} className="flex justify-between">
                      <span className="text-muted-foreground">{hits} إصابات</span>
                      <span className="text-primary font-bold">{mult}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
