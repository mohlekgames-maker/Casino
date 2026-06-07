import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  BookOpen, 
  Gamepad2, 
  Bomb, 
  CreditCard, 
  Hand, 
  Circle, 
  Grid3X3 
} from "lucide-react";

const games = [
  { 
    icon: Gamepad2, 
    name: "بلينكو", 
    path: "/rules/plinko",
    description: "أسقط الكرة واربح المضاعفات"
  },
  { 
    icon: Bomb, 
    name: "الألغام", 
    path: "/rules/mines",
    description: "اكشف الجواهر وتجنب الألغام"
  },
  { 
    icon: CreditCard, 
    name: "بلاك جاك", 
    path: "/rules/blackjack",
    description: "اقترب من 21 لتفوز"
  },
  { 
    icon: Hand, 
    name: "حجر ورقة مقص", 
    path: "/rules/rps",
    description: "تغلب على الموزع"
  },
  { 
    icon: Circle, 
    name: "عجلة الحظ", 
    path: "/rules/wheel",
    description: "أدر العجلة واربح المضاعفات"
  },
  { 
    icon: Grid3X3, 
    name: "كينو", 
    path: "/rules/keno",
    description: "اختر أرقامك واربح حتى 5000x"
  },
];

export default function GameRules() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">قوانين الألعاب</h1>
            <p className="text-muted-foreground">تعرف على قواعد كل لعبة</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {games.map((game) => (
            <Link 
              key={game.path}
              to={game.path}
              className="casino-card hover:neon-border-green transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted group-hover:gradient-primary flex items-center justify-center transition-all duration-300">
                  <game.icon className="h-6 w-6 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                    {game.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{game.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
