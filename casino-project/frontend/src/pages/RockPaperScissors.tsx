import { useState } from "react";
import { Hand } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGame } from "@/contexts/GameContext";
import { toast } from "sonner";

type Choice = "rock" | "paper" | "scissors";
type Result = "win" | "lose" | "draw" | null;

const CHOICES: { id: Choice; emoji: string; label: string }[] = [
  { id: "rock", emoji: "✊", label: "حجر" },
  { id: "paper", emoji: "✋", label: "ورقة" },
  { id: "scissors", emoji: "✌️", label: "مقص" },
];

const getResult = (player: Choice, dealer: Choice): Result => {
  if (player === dealer) return "draw";
  if (
    (player === "rock" && dealer === "scissors") ||
    (player === "paper" && dealer === "rock") ||
    (player === "scissors" && dealer === "paper")
  ) {
    return "win";
  }
  return "lose";
};

export default function RockPaperScissors() {
  const { subtractBalance, addBalance } = useGame();
  const [betAmount, setBetAmount] = useState("10");
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [dealerChoice, setDealerChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<Result>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const play = (choice: Choice) => {
    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet <= 0) {
      toast.error("أدخل مبلغ رهان صحيح");
      return;
    }
    if (!subtractBalance(bet)) {
      toast.error("رصيد غير كافي");
      return;
    }

    setPlayerChoice(choice);
    setDealerChoice(null);
    setResult(null);
    setShowResult(false);
    setIsAnimating(true);

    // Animate dealer choice
    let count = 0;
    const interval = setInterval(() => {
      const randomChoice = CHOICES[Math.floor(Math.random() * 3)].id;
      setDealerChoice(randomChoice);
      count++;

      if (count >= 10) {
        clearInterval(interval);
        const finalDealerChoice = CHOICES[Math.floor(Math.random() * 3)].id;
        setDealerChoice(finalDealerChoice);

        const gameResult = getResult(choice, finalDealerChoice);
        setResult(gameResult);
        setIsAnimating(false);
        setShowResult(true);

        if (gameResult === "win") {
          addBalance(bet * 2);
          toast.success(`ربحت $${(bet * 2).toFixed(2)}!`);
        } else if (gameResult === "draw") {
          addBalance(bet);
          toast.info("تعادل! استرجعت رهانك");
        } else {
          toast.error("خسرت!");
        }
      }
    }, 100);
  };

  const reset = () => {
    setPlayerChoice(null);
    setDealerChoice(null);
    setResult(null);
    setShowResult(false);
  };

  const getChoiceEmoji = (choice: Choice | null) => {
    if (!choice) return "❓";
    return CHOICES.find((c) => c.id === choice)?.emoji || "❓";
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl gradient-secondary flex items-center justify-center">
            <Hand className="h-8 w-8 text-secondary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">حجر ورقة مقص</h1>
            <p className="text-muted-foreground">اختر واربح</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-2">
            <div className="casino-card neon-border-purple min-h-[400px] flex flex-col items-center justify-center">
              {/* VS Display */}
              <div className="flex items-center gap-8 mb-8">
                {/* Player */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">أنت</p>
                  <div
                    className={`w-32 h-32 rounded-2xl bg-muted flex items-center justify-center text-6xl transition-all duration-300 ${
                      playerChoice ? "neon-border-green scale-110" : ""
                    }`}
                  >
                    {getChoiceEmoji(playerChoice)}
                  </div>
                </div>

                {/* VS */}
                <div className="text-4xl font-bold text-muted-foreground">VS</div>

                {/* Dealer */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">الموزع</p>
                  <div
                    className={`w-32 h-32 rounded-2xl bg-muted flex items-center justify-center text-6xl transition-all duration-300 ${
                      isAnimating ? "animate-pulse" : dealerChoice ? "neon-border-purple scale-110" : ""
                    }`}
                  >
                    {getChoiceEmoji(dealerChoice)}
                  </div>
                </div>
              </div>

              {/* Result */}
              {showResult && result && (
                <div
                  className={`text-center animate-reveal p-6 rounded-xl ${
                    result === "win"
                      ? "bg-primary/20 neon-border-green"
                      : result === "lose"
                      ? "bg-destructive/20"
                      : "bg-secondary/20 neon-border-purple"
                  }`}
                >
                  <p className="text-3xl font-bold">
                    {result === "win" && "🎉 ربحت!"}
                    {result === "lose" && "😔 خسرت!"}
                    {result === "draw" && "🤝 تعادل!"}
                  </p>
                </div>
              )}

              {/* Choices */}
              {!playerChoice && (
                <div className="flex gap-4 mt-8">
                  {CHOICES.map((choice) => (
                    <Button
                      key={choice.id}
                      variant="outline"
                      className="w-28 h-28 text-5xl hover:scale-110 transition-transform hover:neon-border-green"
                      onClick={() => play(choice.id)}
                    >
                      {choice.emoji}
                    </Button>
                  ))}
                </div>
              )}

              {/* Play Again */}
              {showResult && (
                <Button
                  variant="casino"
                  size="xl"
                  className="mt-6"
                  onClick={reset}
                >
                  العب مجدداً
                </Button>
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
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                min="1"
                className="text-2xl font-bold h-16 text-center mb-3"
                disabled={isAnimating || !!playerChoice}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => setBetAmount(String(Math.max(1, parseFloat(betAmount) / 2)))}
                  disabled={isAnimating || !!playerChoice}
                >
                  ½
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => setBetAmount(String(parseFloat(betAmount) * 2))}
                  disabled={isAnimating || !!playerChoice}
                >
                  2x
                </Button>
              </div>
            </div>

            {/* Payout Info */}
            <div className="casino-card">
              <h3 className="text-lg font-bold text-foreground mb-4">جدول الأرباح</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">فوز</span>
                  <span className="text-primary font-bold">2x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">تعادل</span>
                  <span className="text-secondary font-bold">1x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">خسارة</span>
                  <span className="text-destructive font-bold">0x</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
