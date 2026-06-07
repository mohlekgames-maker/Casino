import { useState, useRef } from "react";
import { Circle } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGame } from "@/contexts/GameContext";
import { toast } from "sonner";

const SEGMENTS = [
  { multiplier: 0, color: "hsl(0, 70%, 50%)", label: "0x" },
  { multiplier: 2, color: "hsl(120, 100%, 40%)", label: "2x" },
  { multiplier: 0, color: "hsl(0, 70%, 50%)", label: "0x" },
  { multiplier: 1.5, color: "hsl(45, 100%, 50%)", label: "1.5x" },
  { multiplier: 0, color: "hsl(0, 70%, 50%)", label: "0x" },
  { multiplier: 5, color: "hsl(270, 91%, 65%)", label: "5x" },
  { multiplier: 0, color: "hsl(0, 70%, 50%)", label: "0x" },
  { multiplier: 2, color: "hsl(120, 100%, 40%)", label: "2x" },
  { multiplier: 0, color: "hsl(0, 70%, 50%)", label: "0x" },
  { multiplier: 10, color: "hsl(180, 100%, 40%)", label: "10x" },
  { multiplier: 0, color: "hsl(0, 70%, 50%)", label: "0x" },
  { multiplier: 1.5, color: "hsl(45, 100%, 50%)", label: "1.5x" },
];

export default function Wheel() {
  const { subtractBalance, addBalance } = useGame();
  const [betAmount, setBetAmount] = useState("10");
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<{ multiplier: number; win: number } | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  const spin = () => {
    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet <= 0) {
      toast.error("أدخل مبلغ رهان صحيح");
      return;
    }
    if (!subtractBalance(bet)) {
      toast.error("رصيد غير كافي");
      return;
    }

    setIsSpinning(true);
    setResult(null);

    // Random result
    const winningIndex = Math.floor(Math.random() * SEGMENTS.length);
    const segmentAngle = 360 / SEGMENTS.length;
    const targetRotation = 360 * 5 + (360 - winningIndex * segmentAngle - segmentAngle / 2);

    setRotation((prev) => prev + targetRotation);

    setTimeout(() => {
      const segment = SEGMENTS[winningIndex];
      const winAmount = bet * segment.multiplier;
      
      if (winAmount > 0) {
        addBalance(winAmount);
      }

      setResult({
        multiplier: segment.multiplier,
        win: winAmount - bet,
      });
      setIsSpinning(false);

      if (segment.multiplier > 0) {
        toast.success(`ربحت $${winAmount.toFixed(2)}!`);
      } else {
        toast.error("حظ أوفر في المرة القادمة!");
      }
    }, 4000);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl gradient-secondary flex items-center justify-center">
            <Circle className="h-8 w-8 text-secondary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">عجلة الحظ</h1>
            <p className="text-muted-foreground">أدر العجلة واربح</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wheel Area */}
          <div className="lg:col-span-2">
            <div className="casino-card neon-border-purple aspect-square max-w-lg mx-auto relative flex items-center justify-center overflow-hidden">
              {/* Pointer */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[30px] border-l-transparent border-r-transparent border-t-primary" 
                  style={{ filter: "drop-shadow(0 0 10px hsl(var(--neon-green)))" }}
                />
              </div>

              {/* Wheel */}
              <div
                ref={wheelRef}
                className="relative w-[85%] h-[85%] rounded-full transition-transform ease-out"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transitionDuration: isSpinning ? "4s" : "0s",
                  background: `conic-gradient(${SEGMENTS.map((s, i) => 
                    `${s.color} ${(i / SEGMENTS.length) * 100}% ${((i + 1) / SEGMENTS.length) * 100}%`
                  ).join(", ")})`,
                  boxShadow: "0 0 30px hsl(var(--neon-purple) / 0.5), inset 0 0 50px rgba(0,0,0,0.5)"
                }}
              >
                {/* Segment Labels */}
                {SEGMENTS.map((segment, index) => {
                  const angle = (index / SEGMENTS.length) * 360 + (180 / SEGMENTS.length);
                  return (
                    <div
                      key={index}
                      className="absolute text-white font-bold text-sm"
                      style={{
                        left: "50%",
                        top: "50%",
                        transform: `rotate(${angle}deg) translate(-50%, -140px)`,
                        textShadow: "0 0 5px rgba(0,0,0,0.8)"
                      }}
                    >
                      {segment.label}
                    </div>
                  );
                })}

                {/* Center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-background border-4 border-primary flex items-center justify-center"
                    style={{ boxShadow: "0 0 20px hsl(var(--neon-green))" }}
                  >
                    <span className="text-2xl font-bold text-primary">🎡</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Bet Amount */}
            <div className="casino-card">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                مبلغ الرهان
              </label>
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                min="1"
                className="text-2xl font-bold h-16 text-center mb-3"
                disabled={isSpinning}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => setBetAmount(String(Math.max(1, parseFloat(betAmount) / 2)))}
                  disabled={isSpinning}
                >
                  ½
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => setBetAmount(String(parseFloat(betAmount) * 2))}
                  disabled={isSpinning}
                >
                  2x
                </Button>
              </div>
            </div>

            {/* Spin Button */}
            <Button
              variant="casino"
              size="xl"
              className="w-full h-16 text-xl"
              onClick={spin}
              disabled={isSpinning}
            >
              {isSpinning ? "جاري الدوران..." : "أدر العجلة 🎡"}
            </Button>

            {/* Result */}
            {result && (
              <div className={`casino-card ${result.win >= 0 ? "neon-border-green" : "neon-border-purple"} text-center animate-reveal`}>
                <p className="text-sm text-muted-foreground mb-1">
                  المضاعف: {result.multiplier}x
                </p>
                <p className={`text-3xl font-bold ${result.win >= 0 ? "text-primary neon-text-green" : "text-destructive"}`}>
                  {result.win >= 0 ? "+" : ""}${result.win.toFixed(2)}
                </p>
              </div>
            )}

            {/* Payout Table */}
            <div className="casino-card">
              <h3 className="text-lg font-bold text-foreground mb-3">المضاعفات</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: "hsl(180, 100%, 40%)" }} />
                  <span>10x</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: "hsl(270, 91%, 65%)" }} />
                  <span>5x</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: "hsl(120, 100%, 40%)" }} />
                  <span>2x</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: "hsl(45, 100%, 50%)" }} />
                  <span>1.5x</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <div className="w-4 h-4 rounded" style={{ background: "hsl(0, 70%, 50%)" }} />
                  <span>0x (خسارة)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
