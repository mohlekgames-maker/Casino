// src/pages/Roulette.tsx
import { useState } from "react";
import { Circle } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const RED_NUMBERS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
const NUMBERS = Array.from({ length: 37 }, (_, i) => i); // 0-36

function getColor(n: number): string {
  if (n === 0) return "green";
  return RED_NUMBERS.includes(n) ? "red" : "black";
}

interface Bet {
  type: string;
  numbers: number[];
  amount: number;
  label: string;
}

export default function Roulette() {
  const { user, updateBalance } = useAuth();
  const [chipAmount, setChipAmount] = useState("10");
  const [bets, setBets] = useState<Bet[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [ballAngle, setBallAngle] = useState(0);
  const [result, setResult] = useState<{ winAmount: number; profit: number } | null>(null);
  const [history, setHistory] = useState<number[]>([]);

  const totalBet = bets.reduce((s, b) => s + b.amount, 0);

  const addBet = (type: string, numbers: number[], label: string) => {
    const amount = parseFloat(chipAmount);
    if (isNaN(amount) || amount < 1) { toast.error("أدخل مبلغ رقاقة صحيح"); return; }
    setBets(prev => {
      const existing = prev.findIndex(b => b.type === type && JSON.stringify(b.numbers) === JSON.stringify(numbers));
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], amount: updated[existing].amount + amount };
        return updated;
      }
      return [...prev, { type, numbers, amount, label }];
    });
  };

  const clearBets = () => setBets([]);

  const spin = async () => {
    if (!user) { toast.error("يجب تسجيل الدخول"); return; }
    if (bets.length === 0) { toast.error("ضع رهاناً أولاً"); return; }
    if (spinning) return;

    setSpinning(true);
    setResult(null);
    setWinningNumber(null);

    // Animate wheel
    const totalSpin = 360 * 8 + Math.random() * 360;
    let current = ballAngle;
    const animate = () => {
      current += 12;
      setBallAngle(current % 360);
    };
    const anim = setInterval(animate, 16);

    try {
      const clientSeed = crypto.randomUUID();
      const apiRes: any = await api.playRoulette(
        bets.map(b => ({ type: b.type, numbers: b.numbers, amount: b.amount })),
        clientSeed
      );

      setTimeout(() => {
        clearInterval(anim);
        const winning = apiRes.data.winningNumber;
        const angle = (winning / 37) * 360;
        setBallAngle(angle);
        setWinningNumber(winning);
        setResult({ winAmount: apiRes.data.winAmount, profit: apiRes.data.profit });
        updateBalance(apiRes.data.balance);
        setHistory(prev => [winning, ...prev.slice(0, 9)]);
        setSpinning(false);

        if (apiRes.data.winAmount > 0) {
          toast.success(`🎉 فوز! ${winning} ${apiRes.data.color === 'red' ? '🔴' : apiRes.data.color === 'black' ? '⚫' : '🟢'} - +${apiRes.data.profit.toFixed(2)}`);
        } else {
          toast.error(`خسارة. الفائز: ${winning}`);
        }
      }, 3500);
    } catch (err: any) {
      clearInterval(anim);
      setSpinning(false);
      toast.error(err.message || "خطأ");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
            <Circle className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">الروليت الأمريكي</h1>
            <p className="text-muted-foreground">ضع رهاناتك واستعد لعجلة الثروة</p>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {history.map((n, i) => (
              <span key={i} className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white",
                getColor(n) === "red" ? "bg-red-600" :
                getColor(n) === "black" ? "bg-gray-800 border border-gray-600" : "bg-green-600"
              )}>{n}</span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Wheel */}
          <div className="xl:col-span-1">
            <div className="casino-card neon-border-purple text-center">
              {/* Visual wheel */}
              <div className="relative w-56 h-56 mx-auto mb-4">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {NUMBERS.map((n, i) => {
                    const angle = (i / 37) * 360;
                    const color = getColor(n);
                    const x = 100 + 85 * Math.cos((angle - 90) * Math.PI / 180);
                    const y = 100 + 85 * Math.sin((angle - 90) * Math.PI / 180);
                    return (
                      <g key={n} transform={`rotate(${angle}, 100, 100)`}>
                        <path
                          d={`M 100 100 L ${100 + 80 * Math.cos(-Math.PI / 2)} ${100 + 80 * Math.sin(-Math.PI / 2)} A 80 80 0 0 1 ${100 + 80 * Math.cos(-Math.PI / 2 + 2 * Math.PI / 37)} ${100 + 80 * Math.sin(-Math.PI / 2 + 2 * Math.PI / 37)} Z`}
                          fill={color === "red" ? "#dc2626" : color === "black" ? "#1f2937" : "#16a34a"}
                          stroke="#111"
                          strokeWidth="0.5"
                        />
                      </g>
                    );
                  })}
                  {/* Ball */}
                  <circle
                    cx={100 + 65 * Math.cos((ballAngle - 90) * Math.PI / 180)}
                    cy={100 + 65 * Math.sin((ballAngle - 90) * Math.PI / 180)}
                    r="6"
                    fill="white"
                    className="drop-shadow-lg"
                    style={{ transition: spinning ? "none" : "all 0.3s" }}
                  />
                  <circle cx="100" cy="100" r="18" fill="#111" stroke="#333" strokeWidth="2" />
                  {winningNumber !== null && (
                    <text x="100" y="105" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                      {winningNumber}
                    </text>
                  )}
                </svg>
              </div>

              {winningNumber !== null && !spinning && (
                <div className={cn(
                  "py-2 px-4 rounded-xl inline-block font-bold text-xl",
                  getColor(winningNumber) === "red" ? "bg-red-600/30 text-red-400" :
                  getColor(winningNumber) === "black" ? "bg-gray-600/30 text-gray-300" : "bg-green-600/30 text-green-400"
                )}>
                  {winningNumber} {getColor(winningNumber) === "red" ? "🔴" : getColor(winningNumber) === "black" ? "⚫" : "🟢"}
                </div>
              )}

              {result && (
                <div className={cn("mt-3 font-bold text-xl", result.profit >= 0 ? "text-primary" : "text-destructive")}>
                  {result.profit >= 0 ? `+${result.profit.toFixed(2)}` : result.profit.toFixed(2)} نقطة
                </div>
              )}
            </div>
          </div>

          {/* Betting Board */}
          <div className="xl:col-span-2 space-y-4">
            {/* Chip selector */}
            <div className="casino-card">
              <div className="flex gap-2 items-center flex-wrap">
                <span className="text-sm text-muted-foreground">الرقاقة:</span>
                {[5, 10, 25, 50, 100].map(v => (
                  <button key={v} onClick={() => setChipAmount(String(v))}
                    className={cn(
                      "w-12 h-12 rounded-full font-bold text-sm border-2 transition-all",
                      chipAmount === String(v)
                        ? "bg-primary text-primary-foreground border-primary scale-110"
                        : "bg-muted text-muted-foreground border-border hover:border-primary"
                    )}>{v}</button>
                ))}
                <Input type="number" value={chipAmount} onChange={e => setChipAmount(e.target.value)}
                  className="w-20 h-10 text-center" placeholder="كمية" />
              </div>
            </div>

            {/* Numbers grid */}
            <div className="casino-card overflow-x-auto">
              {/* Zero */}
              <div className="mb-2">
                <button onClick={() => addBet("straight", [0], "0")}
                  className="w-full py-2 bg-green-700 hover:bg-green-600 text-white font-bold rounded-lg transition-all">
                  0
                </button>
              </div>

              {/* Number grid 1-36 */}
              <div className="grid grid-cols-12 gap-1 mb-3">
                {Array.from({length: 3}, (_, row) =>
                  Array.from({length: 12}, (_, col) => {
                    const n = row + 1 + col * 3;
                    const color = getColor(n);
                    return (
                      <button key={n} onClick={() => addBet("straight", [n], String(n))}
                        className={cn(
                          "aspect-square rounded text-white font-bold text-xs transition-all hover:opacity-80 hover:scale-105",
                          color === "red" ? "bg-red-600" : "bg-gray-800 border border-gray-600"
                        )}>
                        {n}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Outside bets */}
              <div className="grid grid-cols-6 gap-1">
                {[
                  { type: "1-18", nums: Array.from({length:18},(_,i)=>i+1), label: "1-18" },
                  { type: "even", nums: Array.from({length:36},(_,i)=>i+2).filter(n=>n%2===0&&n<=36), label: "زوجي" },
                  { type: "red", nums: RED_NUMBERS, label: "🔴 أحمر" },
                  { type: "black", nums: Array.from({length:36},(_,i)=>i+1).filter(n=>!RED_NUMBERS.includes(n)), label: "⚫ أسود" },
                  { type: "odd", nums: Array.from({length:36},(_,i)=>i+1).filter(n=>n%2!==0), label: "فردي" },
                  { type: "19-36", nums: Array.from({length:18},(_,i)=>i+19), label: "19-36" },
                ].map(b => (
                  <button key={b.type} onClick={() => addBet(b.type, b.nums, b.label)}
                    className="py-2 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold rounded transition-all">
                    {b.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-1 mt-1">
                {[
                  { type: "1st12", nums: Array.from({length:12},(_,i)=>i+1), label: "1-12" },
                  { type: "2nd12", nums: Array.from({length:12},(_,i)=>i+13), label: "13-24" },
                  { type: "3rd12", nums: Array.from({length:12},(_,i)=>i+25), label: "25-36" },
                ].map(b => (
                  <button key={b.type} onClick={() => addBet(b.type, b.nums, b.label)}
                    className="py-2 bg-muted hover:bg-muted/80 text-foreground text-sm font-bold rounded transition-all">
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Current bets */}
            {bets.length > 0 && (
              <div className="casino-card">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold">رهاناتك</span>
                  <Button variant="outline" size="sm" onClick={clearBets}>مسح الكل</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {bets.map((b, i) => (
                    <span key={i} className="bg-primary/20 text-primary px-2 py-1 rounded text-sm">
                      {b.label}: {b.amount}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">المجموع: {totalBet} نقطة</p>
              </div>
            )}

            <Button variant="casino" size="xl" className="w-full h-14 text-xl"
              onClick={spin} disabled={spinning || bets.length === 0}>
              {spinning ? "🎡 الدوران..." : "🎡 أدر العجلة"}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
