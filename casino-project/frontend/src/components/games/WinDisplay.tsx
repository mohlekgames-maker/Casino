interface WinDisplayProps {
  amount: number | null;
  label?: string;
}

export function WinDisplay({ amount, label = "ربحت" }: WinDisplayProps) {
  if (amount === null) return null;

  const isWin = amount > 0;

  return (
    <div className={`casino-card ${isWin ? "neon-border-green" : "neon-border-purple"} text-center animate-reveal`}>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className={`text-3xl font-bold ${isWin ? "text-primary neon-text-green" : "text-destructive"}`}>
        {isWin ? "+" : ""}${amount.toFixed(2)}
      </p>
    </div>
  );
}
