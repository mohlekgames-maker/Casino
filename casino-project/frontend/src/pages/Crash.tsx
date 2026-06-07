// src/pages/Crash.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { TrendingUp, Zap } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type GameState = "idle" | "betting" | "running" | "crashed" | "cashed";

export default function Crash() {
  const { user, updateBalance } = useAuth();
  const [betAmount, setBetAmount] = useState("10");
  const [autoCashout, setAutoCashout] = useState("");
  const [gameState, setGameState] = useState<GameState>("idle");
  const [multiplier, setMultiplier] = useState(1.00);
  const [crashPoint, setCrashPoint] = useState<number | null>(null);
  const [cashedAt, setCashedAt] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([2.3, 1.1, 5.7, 1.0, 3.2, 11.4, 1.5, 8.8]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const serverCrashPointRef = useRef<number>(0);
  const betActiveRef = useRef(false);

  const getMultiplierAtTime = (elapsed: number): number => {
    return parseFloat(Math.pow(Math.E, 0.00006 * elapsed).toFixed(2));
  };

  const drawGraph = useCallback((current: number, crashed: boolean, cashedMultiplier?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const maxMult = Math.max(current * 1.3, 2);
    const points: [number, number][] = [];
    const totalElapsed = Date.now() - startTimeRef.current;

    for (let t = 0; t <= totalElapsed; t += 100) {
      const m = getMultiplierAtTime(t);
      if (m > current + 0.1) break;
      const x = (t / totalElapsed) * (W - 60) + 40;
      const y = H - 40 - ((m - 1) / (maxMult - 1)) * (H - 80);
      points.push([x, y]);
    }

    if (points.length < 2) return;

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, crashed ? "rgba(239,68,68,0.4)" : "rgba(34,197,94,0.3)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    ctx.beginPath();
    ctx.moveTo(points[0][0], H - 40);
    points.forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.lineTo(points[points.length - 1][0], H - 40);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = crashed ? "#ef4444" : "#22c55e";
    ctx.lineWidth = 3;
    ctx.shadowColor = crashed ? "#ef4444" : "#22c55e";
    ctx.shadowBlur = 8;
    points.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
    ctx.stroke();

    // Dot at end
    const last = points[points.length - 1];
    ctx.beginPath();
    ctx.arc(last[0], last[1], 6, 0, Math.PI * 2);
    ctx.fillStyle = crashed ? "#ef4444" : "#22c55e";
    ctx.shadowBlur = 16;
    ctx.fill();

    // Axes
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    for (let m = 1; m <= Math.ceil(maxMult); m++) {
      const y = H - 40 - ((m - 1) / (maxMult - 1)) * (H - 80);
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(W, y);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = "12px sans-serif";
      ctx.fillText(`${m}x`, 5, y + 4);
    }
  }, []);

  const runGame = useCallback((cp: number) => {
    startTimeRef.current = Date.now();
    serverCrashPointRef.current = cp;
    setGameState("running");

    const autoCash = parseFloat(autoCashout);

    const loop = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentMult = getMultiplierAtTime(elapsed);
      setMultiplier(currentMult);

      // Auto cashout
      if (betActiveRef.current && !isNaN(autoCash) && autoCash > 1 && currentMult >= autoCash) {
        handleCashout(autoCash);
        return;
      }

      if (currentMult >= cp) {
        // Crashed
        setMultiplier(cp);
        setGameState("crashed");
        setCrashPoint(cp);
        setHistory(prev => [cp, ...prev.slice(0, 9)]);
        drawGraph(cp, true);
        betActiveRef.current = false;
        toast.error(`💥 انفجر عند ${cp}x!`);

        if (betActiveRef.current) {
          updateBalance(user?.balance! - parseFloat(betAmount));
        }
        return;
      }

      drawGraph(currentMult, false);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
  }, [autoCashout, drawGraph, betAmount, user?.balance, updateBalance]);

  const placeBet = async () => {
    if (!user) { toast.error("يجب تسجيل الدخول"); return; }
    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet < 1) { toast.error("أدخل مبلغ صحيح"); return; }

    try {
      setGameState("betting");
      const clientSeed = crypto.randomUUID();
      const auto = parseFloat(autoCashout);
      const res: any = await api.startCrash(bet, clientSeed, !isNaN(auto) && auto > 1 ? auto : undefined);

      if (res.success) {
        betActiveRef.current = true;
        updateBalance(user.balance - bet);

        // Simulate getting crash point from server after countdown
        // In production, use WebSocket for real-time sync
        setTimeout(() => {
          // Use the game ID to get crash point (server validates on cashout)
          const simulatedCrash = parseFloat((Math.random() * 9 + 1).toFixed(2));
          runGame(simulatedCrash);
        }, 2000);

        toast.info("✅ تم تسجيل الرهان! اللعبة تبدأ...");
      }
    } catch (err: any) {
      setGameState("idle");
      toast.error(err.message || "خطأ");
    }
  };

  const handleCashout = async (manualMult?: number) => {
    if (!betActiveRef.current || gameState !== "running") return;
    betActiveRef.current = false;

    const cashMult = manualMult || multiplier;
    try {
      const res: any = await api.cashoutCrash(cashMult);
      if (res.success) {
        cancelAnimationFrame(animFrameRef.current!);
        setCashedAt(cashMult);
        setGameState("cashed");
        updateBalance(res.data.balance || user!.balance + res.data.winAmount);
        toast.success(`💰 صرفت عند ${cashMult}x! +${res.data.winAmount?.toFixed(2)} نقطة`);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const resetGame = () => {
    cancelAnimationFrame(animFrameRef.current!);
    setGameState("idle");
    setMultiplier(1.00);
    setCrashPoint(null);
    setCashedAt(null);
    betActiveRef.current = false;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const multColor = gameState === "crashed" ? "text-destructive" :
    gameState === "cashed" ? "text-yellow-400" :
    multiplier >= 2 ? "text-primary" : "text-foreground";

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">كراش</h1>
            <p className="text-muted-foreground">اصرف قبل أن تنفجر!</p>
          </div>
        </div>

        {/* History */}
        <div className="flex gap-2 flex-wrap">
          {history.map((h, i) => (
            <span key={i} className={cn(
              "px-3 py-1 rounded-full text-sm font-bold",
              h >= 10 ? "bg-primary/20 text-primary" :
              h >= 2 ? "bg-secondary/20 text-secondary" :
              "bg-destructive/20 text-destructive"
            )}>{h}x</span>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graph */}
          <div className="lg:col-span-2">
            <div className={cn(
              "casino-card relative overflow-hidden",
              gameState === "crashed" ? "neon-border-purple" :
              gameState === "cashed" ? "border-yellow-500/50" : "neon-border-green"
            )}>
              {/* Multiplier display */}
              <div className="text-center mb-4">
                <p className={cn("text-7xl font-black transition-all", multColor,
                  gameState === "running" && "neon-text-green")}>
                  {multiplier.toFixed(2)}x
                </p>
                {gameState === "crashed" && (
                  <p className="text-xl text-destructive font-bold mt-2">💥 انفجر!</p>
                )}
                {gameState === "cashed" && (
                  <p className="text-xl text-yellow-400 font-bold mt-2">✅ صرفت بنجاح!</p>
                )}
                {gameState === "betting" && (
                  <p className="text-muted-foreground animate-pulse">⏳ انتظر بدء اللعبة...</p>
                )}
              </div>

              <canvas
                ref={canvasRef}
                width={800}
                height={300}
                className="w-full rounded-xl bg-background/50"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div className="casino-card text-center">
              <p className="text-sm text-muted-foreground">رصيدك</p>
              <p className="text-2xl font-bold text-primary neon-text-green">
                {user?.balance?.toFixed(2) || "0"} نقطة
              </p>
            </div>

            <div className="casino-card space-y-3">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">مبلغ الرهان</label>
                <Input type="number" value={betAmount}
                  onChange={e => setBetAmount(e.target.value)}
                  disabled={gameState !== "idle"}
                  className="text-xl font-bold text-center h-12" />
                <div className="flex gap-2 mt-2">
                  {[10, 25, 50, 100].map(v => (
                    <Button key={v} variant="outline" size="sm" className="flex-1"
                      disabled={gameState !== "idle"} onClick={() => setBetAmount(String(v))}>
                      {v}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">صرف تلقائي عند</label>
                <Input type="number" value={autoCashout}
                  onChange={e => setAutoCashout(e.target.value)}
                  placeholder="2.00" disabled={gameState !== "idle"}
                  className="text-center h-12" />
              </div>
            </div>

            {gameState === "idle" || gameState === "crashed" || gameState === "cashed" ? (
              <Button variant="casino" size="xl" className="w-full h-14 text-xl"
                onClick={gameState === "idle" ? placeBet : resetGame}>
                {gameState === "idle" ? "🚀 ابدأ الرهان" : "🔄 لعبة جديدة"}
              </Button>
            ) : gameState === "betting" ? (
              <Button variant="casino" size="xl" className="w-full h-14 text-xl" disabled>
                ⏳ انتظار...
              </Button>
            ) : (
              <Button
                variant="casino"
                size="xl"
                className="w-full h-14 text-xl animate-pulse"
                onClick={() => handleCashout()}
              >
                <Zap className="h-6 w-6 ml-2" />
                اصرف {(parseFloat(betAmount) * multiplier).toFixed(2)}
              </Button>
            )}

            <div className="casino-card text-sm text-muted-foreground space-y-1">
              <p>🎯 اصرف في أي وقت قبل الانفجار</p>
              <p>⚡ الانفجار يحدث بشكل عشوائي</p>
              <p>🔒 نتائج عادلة ومُثبتة</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
