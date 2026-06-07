import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BetControlsProps {
  betAmount: string;
  setBetAmount: (value: string) => void;
  onPlay: () => void;
  disabled?: boolean;
  playText?: string;
  playingText?: string;
}

export function BetControls({
  betAmount,
  setBetAmount,
  onPlay,
  disabled = false,
  playText = "العب",
  playingText = "جاري اللعب...",
}: BetControlsProps) {
  return (
    <div className="casino-card space-y-4">
      <label className="block text-sm font-medium text-muted-foreground">
        مبلغ الرهان
      </label>
      <div className="flex gap-2">
        <Input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          min="1"
          className="text-2xl font-bold h-14 text-center"
        />
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={() => setBetAmount(String(Math.max(1, parseFloat(betAmount) / 2)))}
        >
          ½
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={() => setBetAmount(String(parseFloat(betAmount) * 2))}
        >
          2x
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={() => setBetAmount("100")}
        >
          100
        </Button>
      </div>
      <Button
        variant="casino"
        size="xl"
        className="w-full"
        onClick={onPlay}
        disabled={disabled}
      >
        {disabled ? playingText : playText}
      </Button>
    </div>
  );
}
