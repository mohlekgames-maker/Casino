import { 
  Wallet, 
  History, 
  PlayCircle, 
  Gift, 
  Settings, 
  Trophy,
  TrendingUp,
  TrendingDown,
  Gamepad2
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useGame } from "@/contexts/GameContext";

const gameHistory = [
  { id: 1, game: "بلينكو", result: "ربح", amount: "+$125.00", time: "منذ 5 دقائق" },
  { id: 2, game: "عجلة الحظ", result: "خسارة", amount: "-$50.00", time: "منذ 15 دقيقة" },
  { id: 3, game: "الألغام", result: "ربح", amount: "+$200.00", time: "منذ 30 دقيقة" },
  { id: 4, game: "بلاك جاك", result: "ربح", amount: "+$75.00", time: "منذ ساعة" },
  { id: 5, game: "بلينكو", result: "خسارة", amount: "-$30.00", time: "منذ ساعتين" },
];

export default function Dashboard() {
  const { balance } = useGame();

  const handleRewardsClick = () => {
    window.open("https://discord.gg/placeholder", "_blank");
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">لوحة التحكم</h1>
          <p className="text-muted-foreground">إدارة حسابك ومتابعة نشاطك</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="casino-card neon-border-green">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الرصيد الحالي</p>
                <p className="text-2xl font-bold text-foreground">${balance.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="casino-card neon-border-purple">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-secondary flex items-center justify-center">
                <Trophy className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الأرباح</p>
                <p className="text-2xl font-bold text-primary">+$3,450.00</p>
              </div>
            </div>
          </div>

          <div className="casino-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <Gamepad2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">عدد الألعاب</p>
                <p className="text-2xl font-bold text-foreground">156</p>
              </div>
            </div>
          </div>

          <div className="casino-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">نسبة الفوز</p>
                <p className="text-2xl font-bold text-foreground">67%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game History */}
          <div className="lg:col-span-2 casino-card">
            <div className="flex items-center gap-3 mb-6">
              <History className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">سجل الألعاب</h2>
            </div>
            <div className="space-y-3">
              {gameHistory.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      item.result === "ربح" ? "bg-primary/20" : "bg-destructive/20"
                    }`}>
                      {item.result === "ربح" ? (
                        <TrendingUp className="h-5 w-5 text-primary" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.game}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                  <span className={`font-bold ${
                    item.result === "ربح" ? "text-primary" : "text-destructive"
                  }`}>
                    {item.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-6">
            {/* Watch Ads */}
            <div className="casino-card neon-border-purple">
              <div className="flex items-center gap-3 mb-4">
                <PlayCircle className="h-6 w-6 text-secondary" />
                <h3 className="text-lg font-bold text-foreground">مشاهدة الإعلانات</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                شاهد إعلانات واحصل على رصيد مجاني
              </p>
              <Button variant="casino-purple" className="w-full" disabled>
                قريباً
              </Button>
            </div>

            {/* Get Rewards */}
            <div className="casino-card neon-border-green">
              <div className="flex items-center gap-3 mb-4">
                <Gift className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-bold text-foreground">الحصول على المكافآت</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                انضم إلى مجتمعنا على Discord واحصل على مكافآت حصرية
              </p>
              <Button variant="casino" className="w-full" onClick={handleRewardsClick}>
                🎁 الحصول على المكافآت
              </Button>
            </div>

            {/* Settings */}
            <div className="casino-card">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="h-6 w-6 text-muted-foreground" />
                <h3 className="text-lg font-bold text-foreground">إعدادات الحساب</h3>
              </div>
              <Button variant="outline" className="w-full">
                تعديل الإعدادات
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
