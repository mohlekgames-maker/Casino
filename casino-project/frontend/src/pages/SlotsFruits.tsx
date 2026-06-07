// src/pages/SlotsFruits.tsx
import { useState, useRef } from "react";
import { Dices } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SYMBOLS = ["🍒", "🍋", "🍊", "🔔", "⭐", "💎", "7️⃣", "🎰"];
const PAYOUTS: Record<string, number> = {
  "🍒🍒🍒": 2, "🍋🍋🍋": 3, "🍊🍊🍊": 4,
  "🔔🔔🔔": 5, "⭐⭐⭐": 8, "💎💎💎": 15,
  "7️⃣7️⃣7️⃣": 25, "🎰🎰🎰": 50,
};

const SLOT_TYPE_INFO = {
  fruits: { name: "سلوت الفواكه", bg: "gradient-primary", border: "neon-border-green", emoji: "🍒" },
  arabic: { name: "سلوت عربي", bg: "gradient-secondary", border: "neon-border-purple", emoji: "🌙" },
  egyptian: { name: "سلوت مصري", bg: "bg-amber-900/60", border: "neon-border-green", emoji: "🏺" },
};

const ARABIC_SYMBOLS = ["🌙", "⭐", "🐪", "🏺", "💫", "🌟", "🎯", "🏆"];
const EGYPTIAN_SYMBOLS = ["𓂀", "🏺", "🌾", "☀️", "🐍", "🦅", "💎", "👑"];

interface SlotProps {
  slotType: "fruits" | "arabic" | "egyptian";
}

function SlotMachine({ slotType }: SlotProps) {
  const { user, updateBalance } = useAuth();
  const [betAmount, setBetAmount] = useState("10");
  const [reels, setReels] = useState(["❓", "❓", "❓"]);
  const [spinning, setSpinning] = useState(false);
  const [displayReels, setDisplayReels] = useState(["❓", "❓", "❓"]);
  const [lastResult, setLastResult] = useState<{ multiplier: number; win: number } | null>(null);
  const intervalRefs = useRef<NodeJS.Timeout[]>([]);

  const symbols = slotType === "arabic" ? ARABIC_SYMBOLS : slotType === "egyptian" ? EGYPTIAN_SYMBOLS : SYMBOLS;
  const info = SLOT_TYPE_INFO[slotType];

  const spin = async () => {
    if (!user) { toast.error("يجب تسجيل الدخول أولاً"); return; }
    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet < 1) { toast.error("أدخل مبلغ صحيح"); return; }

    setSpinning(true);
    setLastResult(null);

    // Animate spinning
    intervalRefs.current = [0, 1, 2].map((i) =>
      setInterval(() => {
        setDisplayReels(prev => {
          const next = [...prev];
          next[i] = symbols[Math.floor(Math.random() * symbols.length)];
          return next;
        });
      }, 80)
    );

    try {
      const clientSeed = Math.random().toString(36).substring(7);
      const res: any = await api.playSlots(bet, clientSeed, slotType);

      // Stop reels one by one
      setTimeout(() => {
        clearInterval(intervalRefs.current[0]);
        setDisplayReels(prev => { const n = [...prev]; n[0] = res.data.reels[0]; return n; });
      }, 600);
      setTimeout(() => {
        clearInterval(intervalRefs.current[1]);
        setDisplayReels(prev => { const n = [...prev]; n[1] = res.data.reels[1]; return n; });
      }, 900);
      setTimeout(() => {
        clearInterval(intervalRefs.current[2]);
        setDisplayReels(prev => { const n = [...prev]; n[2] = res.data.reels[2]; return n; });
        setReels(res.data.reels);
        setLastResult({ multiplier: res.data.multiplier, win: res.data.profit });
        updateBalance(res.data.balance);
        setSpinning(false);

        if (res.data.winAmount > 0) {
          toast.success(`🎉 ربحت ${res.data.winAmount.toFixed(2)} نقطة! (${res.data.multiplier}x)`);
        } else {
          toast.error("حظ أوفر في المرة القادمة!");
        }
      }, 1200);
    } catch (err: any) {
      intervalRefs.current.forEach(clearInterval);
      toast.error(err.message || "خطأ في اللعبة");
      setSpinning(false);
    }
  };

  const isWin = lastResult && lastResult.win > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-xl ${info.bg} flex items-center justify-center text-3xl`}>
          {info.emoji}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{info.name}</h1>
          <p className="text-muted-foreground">أدر البكرات واربح الجوائز الكبيرة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Slot Machine */}
        <div className="lg:col-span-2">
          <div className={`casino-card ${info.border} flex flex-col items-center py-12 relative overflow-hidden`}>
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              {Array.from({length: 20}).map((_, i) => (
                <div key={i} className="absolute text-4xl opacity-20"
                  style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%` }}>
                  {symbols[i % symbols.length]}
                </div>
              ))}
            </div>

            {/* Machine Frame */}
            <div className="relative z-10 bg-card/80 rounded-2xl border-4 border-primary/50 p-6 shadow-[0_0_40px_hsl(var(--neon-green)/0.3)]">
              {/* Reels */}
              <div className="flex gap-3 mb-4">
                {displayReels.map((symbol, i) => (
                  <div key={i} className={cn(
                    "w-24 h-24 md:w-28 md:h-28 rounded-xl flex items-center justify-center text-5xl md:text-6xl",
                    "bg-background border-2 border-border transition-all duration-100",
                    spinning && "animate-pulse",
                    !spinning && isWin && reels[i] && reels[0] === reels[1] && reels[1] === reels[2]
                      ? "border-primary neon-border-green"
                      : ""
                  )}>
                    {symbol}
                  </div>
                ))}
              </div>

              {/* Win line indicator */}
              <div className="h-1 w-full bg-primary/30 rounded-full mb-2">
                {isWin && <div className="h-full bg-primary rounded-full animate-pulse" />}
              </div>
            </div>

            {/* Result */}
            {lastResult && (
              <div className={cn(
                "mt-6 px-8 py-4 rounded-xl text-center animate-reveal",
                isWin ? "bg-primary/20 neon-border-green" : "bg-destructive/20"
              )}>
                {isWin ? (
                  <>
                    <p className="text-xl text-primary font-bold neon-text-green">🎉 فوز!</p>
                    <p className="text-3xl font-bold text-primary">
                      +{lastResult.win.toFixed(2)} نقطة
                    </p>
                    <p className="text-muted-foreground">{lastResult.multiplier}x مضاعف</p>
                  </>
                ) : (
                  <p className="text-xl text-destructive font-bold">😢 حظ أوفر!</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Balance */}
          <div className="casino-card neon-border-green text-center">
            <p className="text-sm text-muted-foreground">رصيدك</p>
            <p className="text-2xl font-bold text-primary neon-text-green">
              {user?.balance.toFixed(2) || '0.00'} نقطة
            </p>
          </div>

          {/* Bet */}
          <div className="casino-card">
            <label className="block text-sm font-medium text-muted-foreground mb-2">مبلغ الرهان</label>
            <Input
              type="number" value={betAmount}
              onChange={e => setBetAmount(e.target.value)}
              min="1" disabled={spinning}
              className="text-xl font-bold text-center h-14 mb-3"
            />
            <div className="grid grid-cols-4 gap-2">
              {[10, 25, 50, 100].map(v => (
                <Button key={v} variant="outline" size="sm"
                  onClick={() => setBetAmount(String(v))} disabled={spinning}>
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

          {/* Spin Button */}
          <Button variant="casino" size="xl" className="w-full h-16 text-2xl" onClick={spin} disabled={spinning}>
            {spinning ? "🎰 جاري الدوران..." : "🎰 العب الآن"}
          </Button>

          {/* Paytable */}
          <div className="casino-card">
            <h3 className="font-bold mb-3">جدول الدفع</h3>
            <div className="space-y-1 text-sm">
              {Object.entries(PAYOUTS).map(([combo, mult]) => (
                <div key={combo} className="flex justify-between">
                  <span className="text-lg">{combo}</span>
                  <span className="text-primary font-bold">{mult}x</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SlotsFruits() {
  return <MainLayout><SlotMachine slotType="fruits" /></MainLayout>;
}
