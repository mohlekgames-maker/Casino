import { Link } from "react-router-dom";
import { 
  Gamepad2, 
  Bomb, 
  CreditCard, 
  Hand,
  Circle,
  Grid3X3,
  Sparkles,
  Trophy,
  Users,
  Zap
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";

const games = [
  {
    id: "plinko",
    name: "بلينكو",
    description: "أسقط الكرة واربح جوائز مذهلة",
    icon: Gamepad2,
    path: "/plinko",
    gradient: "gradient-primary",
    borderClass: "neon-border-green",
  },
  {
    id: "mines",
    name: "الألغام",
    description: "اكتشف الجواهر وتجنب الألغام",
    icon: Bomb,
    path: "/mines",
    gradient: "gradient-secondary",
    borderClass: "neon-border-purple",
  },
  {
    id: "blackjack",
    name: "بلاك جاك",
    description: "اقترب من 21 واهزم الموزع",
    icon: CreditCard,
    path: "/blackjack",
    gradient: "gradient-primary",
    borderClass: "neon-border-green",
  },
  {
    id: "rps",
    name: "حجر ورقة مقص",
    description: "اختر يدك واهزم الموزع",
    icon: Hand,
    path: "/rps",
    gradient: "gradient-secondary",
    borderClass: "neon-border-purple",
  },
  {
    id: "wheel",
    name: "عجلة الحظ",
    description: "أدر العجلة واربح مضاعفات كبيرة",
    icon: Circle,
    path: "/wheel",
    gradient: "gradient-primary",
    borderClass: "neon-border-green",
  },
  {
    id: "keno",
    name: "كينو",
    description: "اختر أرقامك وانتظر الحظ",
    icon: Grid3X3,
    path: "/keno",
    gradient: "gradient-secondary",
    borderClass: "neon-border-purple",
  },
];

const stats = [
  { icon: Users, label: "لاعب نشط", value: "12,458" },
  { icon: Trophy, label: "إجمالي الأرباح", value: "$2.5M" },
  { icon: Zap, label: "لعبة اليوم", value: "45,892" },
];

export default function Home() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative mb-12">
        <div className="casino-card neon-border-green overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full gradient-casino opacity-30" />
          <div className="relative z-10 py-8 px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              <span>مرحباً بك في عالم الإثارة</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4 neon-text-green">
              Gamebred Casino
            </h1>
            <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
              استمتع بأفضل ألعاب الكازينو مع فرص ربح حقيقية. ابدأ اللعب الآن واكتشف متعة لا تنتهي!
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/plinko">
                <Button variant="casino" size="xl">
                  <Gamepad2 className="h-5 w-5 ml-2" />
                  ابدأ اللعب
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="casino-outline-purple" size="xl">
                  لوحة التحكم
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="casino-card text-center hover:scale-105 transition-transform duration-300"
          >
            <div className="w-12 h-12 rounded-xl gradient-secondary flex items-center justify-center mx-auto mb-3">
              <stat.icon className="h-6 w-6 text-secondary-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Games Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">الألعاب المتاحة</h2>
          <span className="text-muted-foreground text-sm">{games.length} ألعاب</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Link 
              key={game.id} 
              to={game.path}
              className="group"
            >
              <div className={`casino-card ${game.borderClass} h-full transition-all duration-300 hover:scale-[1.02]`}>
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl ${game.gradient} flex items-center justify-center shrink-0 group-hover:animate-float`}>
                    <game.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-1">{game.name}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{game.description}</p>
                    <Button variant="ghost" size="sm" className="text-primary p-0">
                      العب الآن ←
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}
