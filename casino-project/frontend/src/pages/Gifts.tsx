// src/pages/Gifts.tsx
import { useState, useEffect } from "react";
import { Gift, ExternalLink, Star, CheckCircle, Clock } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface GiftItem {
  id: string;
  title_ar: string;
  description_ar: string;
  gift_type: string;
  points_cost: number;
  points_value: number;
  requires_discord: boolean;
  remaining: number | null;
  user_claimed_count: number;
}

interface Redemption {
  id: string;
  title_ar: string;
  gift_type: string;
  points_spent: number;
  status: string;
  redeemed_at: string;
}

export default function Gifts() {
  const { user, updateBalance } = useAuth();
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [discordUsername, setDiscordUsername] = useState("");
  const [showDiscordInput, setShowDiscordInput] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"gifts" | "history">("gifts");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [giftsRes, redRes]: any[] = await Promise.all([
        api.getGifts(),
        api.getMyRedemptions(),
      ]);
      setGifts(giftsRes.data);
      setRedemptions(redRes.data);
    } catch (err: any) {
      toast.error(err.message || "خطأ في التحميل");
    } finally {
      setLoading(false);
    }
  }

  const handleRedeem = async (gift: GiftItem) => {
    if (!user) { toast.error("يجب تسجيل الدخول"); return; }
    if (user.balance < gift.points_cost) {
      toast.error(`تحتاج ${gift.points_cost} نقطة. رصيدك ${user.balance.toFixed(0)}`);
      return;
    }
    if (gift.requires_discord && !discordUsername) {
      setShowDiscordInput(gift.id);
      return;
    }

    setRedeemingId(gift.id);
    try {
      const res: any = await api.redeemGift(gift.id, gift.requires_discord ? discordUsername : undefined);
      if (res.success) {
        toast.success(res.message);
        updateBalance(res.data.balance);
        setShowDiscordInput(null);
        setDiscordUsername("");
        await loadData();
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setRedeemingId(null);
    }
  };

  const giftTypeIcon = (type: string) => {
    switch (type) {
      case "points": return "💰";
      case "discord_role": return "🏆";
      case "item": return "🎁";
      default: return "✨";
    }
  };

  const canAfford = (cost: number) => user && user.balance >= cost;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl gradient-secondary flex items-center justify-center">
            <Gift className="h-8 w-8 text-secondary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">متجر الهدايا</h1>
            <p className="text-muted-foreground">استبدل نقاطك بهدايا رائعة من Discord</p>
          </div>
        </div>

        {/* Balance + Discord CTA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="casino-card neon-border-purple">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="text-sm text-muted-foreground">نقاطك الحالية</p>
                <p className="text-3xl font-bold text-foreground">
                  {user?.balance?.toFixed(0) || "0"}
                </p>
              </div>
            </div>
          </div>

          <div className="casino-card neon-border-green">
            <div className="flex items-center gap-3">
              <div className="text-3xl">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-indigo-400">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">انضم إلى مجتمعنا</p>
                <p className="text-sm font-bold text-foreground">احصل على هدايا حصرية!</p>
              </div>
              <Button variant="casino-outline-purple" size="sm"
                onClick={() => window.open(import.meta.env.VITE_DISCORD_INVITE || "https://discord.gg/placeholder", "_blank")}>
                <ExternalLink className="h-4 w-4 ml-1" />
                انضم
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          <button onClick={() => setActiveTab("gifts")}
            className={cn("pb-3 px-4 font-medium transition-colors",
              activeTab === "gifts" ? "text-primary border-b-2 border-primary" : "text-muted-foreground")}>
            🎁 الهدايا المتاحة
          </button>
          <button onClick={() => setActiveTab("history")}
            className={cn("pb-3 px-4 font-medium transition-colors",
              activeTab === "history" ? "text-primary border-b-2 border-primary" : "text-muted-foreground")}>
            📜 سجل استبداداتي
          </button>
        </div>

        {activeTab === "gifts" ? (
          loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="casino-card h-48 animate-pulse bg-muted/20" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gifts.map(gift => (
                <div key={gift.id} className={cn(
                  "casino-card flex flex-col",
                  canAfford(gift.points_cost) ? "neon-border-purple" : "opacity-70"
                )}>
                  {/* Gift icon */}
                  <div className="text-5xl mb-3 text-center">{giftTypeIcon(gift.gift_type)}</div>
                  <h3 className="text-xl font-bold text-center mb-2">{gift.title_ar}</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">{gift.description_ar}</p>

                  {gift.points_value > 0 && (
                    <div className="bg-primary/10 rounded-lg py-2 px-4 text-center mb-4">
                      <p className="text-sm text-muted-foreground">تحصل على</p>
                      <p className="text-2xl font-bold text-primary">+{gift.points_value} نقطة</p>
                    </div>
                  )}

                  {gift.requires_discord && (
                    <div className="flex items-center gap-2 text-sm text-indigo-400 mb-3 justify-center">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                      </svg>
                      يتطلب حساب Discord
                    </div>
                  )}

                  {showDiscordInput === gift.id && (
                    <div className="mb-3">
                      <Input
                        placeholder="اسم مستخدم Discord (مثال: user#1234)"
                        value={discordUsername}
                        onChange={e => setDiscordUsername(e.target.value)}
                        className="text-center"
                      />
                    </div>
                  )}

                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-yellow-400">{gift.points_cost} نقطة</span>
                      {gift.remaining !== null && (
                        <span className="text-sm text-muted-foreground">متبقي: {gift.remaining}</span>
                      )}
                    </div>
                    <Button
                      variant={canAfford(gift.points_cost) ? "casino" : "outline"}
                      className="w-full"
                      disabled={!canAfford(gift.points_cost) || redeemingId === gift.id}
                      onClick={() => handleRedeem(gift)}
                    >
                      {redeemingId === gift.id ? "جاري الاستبدال..." :
                       !canAfford(gift.points_cost) ? "نقاط غير كافية" :
                       showDiscordInput === gift.id ? "تأكيد الاستبدال" :
                       "🎁 استبدال الآن"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="casino-card">
            {redemptions.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">لا توجد استبدادات بعد</p>
              </div>
            ) : (
              <div className="space-y-3">
                {redemptions.map(r => (
                  <div key={r.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      r.status === "completed" ? "bg-primary/20" : "bg-yellow-500/20"
                    )}>
                      {r.status === "completed" ? <CheckCircle className="h-5 w-5 text-primary" /> : <Clock className="h-5 w-5 text-yellow-400" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{r.title_ar}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(r.redeemed_at).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-destructive font-bold">-{r.points_spent} نقطة</p>
                      <p className={cn("text-xs", r.status === "completed" ? "text-primary" : "text-yellow-400")}>
                        {r.status === "completed" ? "مكتمل" : "قيد المعالجة"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
