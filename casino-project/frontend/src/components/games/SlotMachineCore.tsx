// src/components/games/SlotMachineCore.tsx
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SlotType = "fruits" | "arabic" | "egyptian";

const SLOT_CONFIG: Record<SlotType, {
  name: string; symbols: string[]; bg: string;
  border: string; emoji: string; color: string; description: string;
  payouts: Record<string, number>;
}> = {
  fruits: {
    name: "سلوت الفواكه", emoji: "🍒", bg: "gradient-primary",
    border: "neon-border-green", color: "text-primary", description: "الكلاسيكي - فواكه محظوظة",
    symbols: ["🍒", "🍋", "🍊", "🔔", "⭐", "💎", "7️⃣", "🎰"],
    payouts: { "🍒🍒🍒": 2, "🍋🍋🍋": 3, "🍊🍊🍊": 4, "🔔🔔🔔": 5, "⭐⭐⭐": 8, "💎💎💎": 15, "7️⃣7️⃣7️⃣": 25, "🎰🎰🎰": 50 },
  },
  arabic: {
    name: "الليالي العربية", emoji: "🌙", bg: "gradient-secondary",
    border: "neon-border-purple", color: "text-secondary", description: "ليالٍ ساحرة وجوائز رائعة",
    symbols: ["🌙", "⭐", "🐪", "🏺", "💫", "🌟", "🎯", "🏆"],
    payouts: { "🌙🌙🌙": 2, "⭐⭐⭐": 3, "🐪🐪🐪": 4, "🏺🏺🏺": 5, "💫💫💫": 8, "🌟🌟🌟": 15, "🎯🎯🎯": 25, "🏆🏆🏆": 50 },
  },
  egyptian: {
    name: "كنوز مصر", emoji: "🏺", bg: "bg-amber-800/60",
    border: "neon-border-green", color: "text-yellow-400", description: "اكتشف كنوز الفراعنة",
    symbols: ["🏺", "☀️", "🌾", "🦅", "👁️", "🐍", "💎", "👑"],
    payouts: { "🏺🏺🏺": 2, "☀️☀️☀️": 3, "🌾🌾🌾": 4, "🦅🦅🦅": 5, "👁️👁️👁️": 8, "🐍🐍🐍": 15, "💎💎💎": 25, "👑👑👑": 50 },
  },
};

interface Props {
  slotType: SlotType;
}

export default function SlotMachineCore({ slotType }: Props) {
  const config = SLOT_CONFIG[slotType];
  const { user, updateBalance } = useAuth();
  const [betAmount, setBetAmount] = useState("10");
  const [displayReels, setDisplayReels] = useState(["❓", "❓", "❓"]);
  const [finalReels, setFinalReels] = useState<string[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<{ multiplier: number; win: number; winAmount: number } | null>(null);
  const intervals = useRef<NodeJS.Timeout[]>([]);

  const spin = async () => {
    if (!user) { toast.error("يجب تسجيل الدخول أولاً"); return; }
    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet < 1) { toast.error("أدخل مبلغ صحيح"); return; }

    setSpinning(true);
    setLastResult(null);
    setFinalReels([]);

    intervals.current = [0, 1, 2].map(i =>
      setInterval(() => {
        setDisplayReels(prev => {
          const n = [...prev];
          n[i] = config.symbols[Math.floor(Math.random() * config.symbols.length)];
          return n;
        });
      }, 70 + i * 20)
    );

    try {
      const clientSeed = crypto.randomUUID();
      const res: any = await api.playSlots(bet, clientSeed, slotType);

      // Stagger stops
      [0, 1, 2].forEach(i => {
        setTimeout(() => {
          clearInterval(intervals.current[i]);
          setDisplayReels(prev => {
            const n = [...prev];
            n[i] = res.data.reels[i];
            return n;
          });
          if (i === 2) {
            setFinalReels(res.data.reels);
            setLastResult({
              multiplier: res.data.multiplier,
              win: res.data.profit,
              winAmount: res.data.winAmount,
            });
            updateBalance(res.data.balance);
            setSpinning(false);
            if (res.data.winAmount > 0) {
              toast.success(`🎉 فوز! +${res.data.winAmount.toFixed(2)} (${res.data.multiplier}x)`);
            } else {
              toast.error("حظ أوفر في المرة القادمة 🍀");
            }
          }
        }, 600 + i * 350);
      });
    } catch (err: any) {
      intervals.current.forEach(clearInterval);
      toast.error(err.message || "خطأ في اللعبة");
      setSpinning(false);
    }
  };

  const isWin = lastResult && lastResult.win > 0;
  const isJackpot = lastResult && lastResult.multiplier >= 50;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-xl ${config.bg} flex items-center justify-center text-3xl`}>
          {config.emoji}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{config.name}</h1>
          <p className="text-muted-foreground">{config.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Machine */}
        <div className="lg:col-span-2">
          <div className={`casino-card ${config.border} py-10`}>
            {/* Jackpot banner */}
            {isJackpot && (
              <div className="text-center mb-6 animate-bounce">
                <p className="text-4xl font-black text-yellow-400 neon-text-green">🏆 JACKPOT! 🏆</p>
              </div>
            )}

            {/* Reels */}
            <div className="flex gap-3 justify-center mb-6">
              {displayReels.map((sym, i) => (
                <div key={i} className={cn(
                  "w-28 h-28 md:w-32 md:h-32 rounded-2xl flex items-center justify-center",
                  "bg-background/80 border-2 transition-all duration-150",
                  spinning ? "border-border animate-pulse" : (
                    isWin && finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]
                      ? `border-primary ${config.border}`
                      : "border-border"
                  )
                )}>
                  <span className="text-5xl md:text-6xl select-none">{sym}</span>
                </div>
              ))}
            </div>

            {/* Win line */}
            <div className="h-1 mx-8 bg-muted rounded-full overflow-hidden">
              <div className={cn("h-full transition-all duration-500 rounded-full",
                isWin ? "bg-primary w-full animate-pulse" : "bg-muted w-0")} />
            </div>

            {/* Result display */}
            {lastResult && (
              <div className={cn(
                "mt-6 mx-8 py-4 rounded-xl text-center",
                isWin ? "bg-primary/20" : "bg-destructive/20"
              )}>
                {isWin ? (
                  <div>
                    <p className={`text-2xl font-black ${config.color}`}>🎉 فوز!</p>
                    <p className="text-4xl font-bold text-foreground mt-1">+{lastResult.winAmount.toFixed(0)}</p>
                    <p className="text-muted-foreground">{lastResult.multiplier}x مضاعف</p>
                  </div>
                ) : (
                  <p className="text-xl text-destructive font-bold">حظ أوفر في المرة القادمة 🍀</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="casino-card text-center">
            <p className="text-sm text-muted-foreground">رصيدك</p>
            <p className={`text-2xl font-bold ${config.color}`}>
              {user?.balance?.toFixed(2) || "0.00"} نقطة
            </p>
          </div>

          <div className="casino-card">
            <label className="block text-sm font-medium text-muted-foreground mb-2">مبلغ الرهان</label>
            <Input type="number" value={betAmount}
              onChange={e => setBetAmount(e.target.value)}
              min="1" disabled={spinning}
              className="text-xl font-bold text-center h-14 mb-3" />
            <div className="grid grid-cols-2 gap-2">
              {[10, 50, 100, 500].map(v => (
                <Button key={v} variant="outline" size="sm"
                  disabled={spinning} onClick={() => setBetAmount(String(v))}>
                  {v}
                </Button>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" className="flex-1" disabled={spinning}
                onClick={() => setBetAmount(p => String(Math.max(1, parseFloat(p) / 2)))}>½</Button>
              <Button variant="outline" className="flex-1" disabled={spinning}
                onClick={() => setBetAmount(p => String(parseFloat(p) * 2))}>2x</Button>
            </div>
          </div>

          <Button variant="casino" size="xl" className="w-full h-16 text-xl"
            onClick={spin} disabled={spinning}>
            {spinning ? "🎰 دوران..." : `${config.emoji} العب الآن`}
          </Button>

          <div className="casino-card">
            <h3 className="font-bold mb-2 text-sm">جدول الدفع</h3>
            <div className="space-y-1">
              {Object.entries(config.payouts).map(([combo, mult]) => (
                <div key={combo} className="flex justify-between items-center text-sm">
                  <span className="text-lg tracking-widest">{combo}</span>
                  <span className={`font-bold ${config.color}`}>{mult}x</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
