import { useState, useCallback } from "react";
import { CreditCard, Play, Plus, Hand, Copy } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CardSuit = "♠" | "♥" | "♦" | "♣";
type CardValue = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

interface Card {
  suit: CardSuit;
  value: CardValue;
  hidden?: boolean;
}

const SUITS: CardSuit[] = ["♠", "♥", "♦", "♣"];
const VALUES: CardValue[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({ suit, value });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
}

function getCardValue(card: Card): number {
  if (card.value === "A") return 11;
  if (["K", "Q", "J"].includes(card.value)) return 10;
  return parseInt(card.value);
}

function calculateHand(cards: Card[]): number {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.hidden) continue;
    if (card.value === "A") aces++;
    total += getCardValue(card);
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
}

function CardComponent({ card, index }: { card: Card; index: number }) {
  const isRed = card.suit === "♥" || card.suit === "♦";
  
  return (
    <div
      className={cn(
        "w-16 h-24 md:w-20 md:h-28 rounded-lg border-2 border-border flex flex-col items-center justify-center transition-all duration-300 animate-card-flip",
        card.hidden
          ? "bg-gradient-to-br from-secondary to-secondary/80"
          : "bg-card"
      )}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {card.hidden ? (
        <div className="text-2xl text-secondary-foreground">?</div>
      ) : (
        <>
          <span className={cn("text-lg font-bold", isRed ? "text-destructive" : "text-foreground")}>
            {card.value}
          </span>
          <span className={cn("text-2xl", isRed ? "text-destructive" : "text-foreground")}>
            {card.suit}
          </span>
        </>
      )}
    </div>
  );
}

export default function Blackjack() {
  const [betAmount, setBetAmount] = useState("10");
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState<"win" | "lose" | "push" | null>(null);

  const startGame = useCallback(() => {
    const newDeck = createDeck();
    const playerCards = [newDeck.pop()!, newDeck.pop()!];
    const dealerCards: Card[] = [newDeck.pop()!, { ...newDeck.pop()!, hidden: true }];
    
    setDeck(newDeck);
    setPlayerHand(playerCards);
    setDealerHand(dealerCards);
    setIsPlaying(true);
    setGameResult(null);

    // Check for blackjack
    if (calculateHand(playerCards) === 21) {
      setTimeout(() => endGame(newDeck, playerCards, dealerCards), 500);
    }
  }, []);

  const hit = () => {
    if (!isPlaying) return;
    
    const newCard = deck.pop()!;
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    setDeck([...deck]);

    if (calculateHand(newHand) > 21) {
      endGame(deck, newHand, dealerHand);
    }
  };

  const stand = () => {
    if (!isPlaying) return;
    endGame(deck, playerHand, dealerHand);
  };

  const doubleDown = () => {
    if (!isPlaying || playerHand.length !== 2) return;
    
    setBetAmount((prev) => String(parseFloat(prev) * 2));
    const newCard = deck.pop()!;
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    setDeck([...deck]);
    
    if (calculateHand(newHand) <= 21) {
      endGame(deck, newHand, dealerHand);
    } else {
      endGame(deck, newHand, dealerHand);
    }
  };

  const endGame = (currentDeck: Card[], pHand: Card[], dHand: Card[]) => {
    setIsPlaying(false);
    
    // Reveal dealer's card
    const revealedDealer: Card[] = dHand.map((c) => ({ ...c, hidden: false }));
    
    // Dealer draws
    let dealerFinal = [...revealedDealer];
    while (calculateHand(dealerFinal) < 17) {
      dealerFinal.push(currentDeck.pop()!);
    }
    
    setDealerHand(dealerFinal);
    setDeck(currentDeck);

    const playerTotal = calculateHand(pHand);
    const dealerTotal = calculateHand(dealerFinal);

    if (playerTotal > 21) {
      setGameResult("lose");
    } else if (dealerTotal > 21 || playerTotal > dealerTotal) {
      setGameResult("win");
    } else if (playerTotal < dealerTotal) {
      setGameResult("lose");
    } else {
      setGameResult("push");
    }
  };

  const playerTotal = calculateHand(playerHand);
  const dealerTotal = calculateHand(dealerHand);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
            <CreditCard className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">بلاك جاك</h1>
            <p className="text-muted-foreground">اقترب من 21 واهزم الموزع</p>
          </div>
        </div>

        {/* Game Table */}
        <div className="casino-card neon-border-green min-h-[400px] relative overflow-hidden">
          {/* Table Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-secondary/5" />
          
          <div className="relative z-10 flex flex-col items-center justify-between h-full py-8">
            {/* Dealer Section */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">الموزع</p>
              <div className="flex gap-2 justify-center mb-2">
                {dealerHand.map((card, index) => (
                  <CardComponent key={index} card={card} index={index} />
                ))}
              </div>
              <span className="text-lg font-bold text-foreground">
                {dealerHand.length > 0 && dealerTotal}
              </span>
            </div>

            {/* Result */}
            {gameResult && (
              <div className={cn(
                "text-center py-4 px-8 rounded-xl animate-reveal",
                gameResult === "win" && "bg-primary/20 neon-border-green",
                gameResult === "lose" && "bg-destructive/20",
                gameResult === "push" && "bg-muted"
              )}>
                <p className={cn(
                  "text-2xl font-bold",
                  gameResult === "win" && "text-primary neon-text-green",
                  gameResult === "lose" && "text-destructive",
                  gameResult === "push" && "text-muted-foreground"
                )}>
                  {gameResult === "win" && "🎉 فوز!"}
                  {gameResult === "lose" && "😢 خسارة"}
                  {gameResult === "push" && "🤝 تعادل"}
                </p>
              </div>
            )}

            {/* Player Section */}
            <div className="text-center">
              <div className="flex gap-2 justify-center mb-2">
                {playerHand.map((card, index) => (
                  <CardComponent key={index} card={card} index={index} />
                ))}
              </div>
              <span className={cn(
                "text-lg font-bold",
                playerTotal > 21 ? "text-destructive" : playerTotal === 21 ? "text-primary" : "text-foreground"
              )}>
                {playerHand.length > 0 && playerTotal}
              </span>
              <p className="text-sm text-muted-foreground mt-1">يدك</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bet Amount */}
          <div className="casino-card">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              مبلغ الرهان
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                min="1"
                disabled={isPlaying}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBetAmount((prev) => String(parseFloat(prev) / 2))}
                disabled={isPlaying}
              >
                ½
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBetAmount((prev) => String(parseFloat(prev) * 2))}
                disabled={isPlaying}
              >
                2x
              </Button>
            </div>
          </div>

          {/* Game Actions */}
          <div className="casino-card">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              الإجراءات
            </label>
            {!isPlaying ? (
              <Button variant="casino" size="lg" className="w-full" onClick={startGame}>
                <Play className="h-5 w-5 ml-2" />
                ابدأ اللعب
              </Button>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <Button variant="casino" onClick={hit}>
                  <Plus className="h-4 w-4 ml-1" />
                  Hit
                </Button>
                <Button variant="casino-purple" onClick={stand}>
                  <Hand className="h-4 w-4 ml-1" />
                  Stand
                </Button>
                <Button 
                  variant="outline" 
                  onClick={doubleDown}
                  disabled={playerHand.length !== 2}
                >
                  <Copy className="h-4 w-4 ml-1" />
                  Double
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
