import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  LayoutDashboard, 
  Gamepad2, 
  Bomb, 
  CreditCard,
  Hand,
  Circle,
  Grid3X3,
  Menu,
  X,
  LogOut,
  Wallet,
  TrendingUp,
  Gift,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useGame } from "@/contexts/GameContext";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  { icon: Home, label: "الرئيسية", path: "/home" },
  { icon: LayoutDashboard, label: "لوحة التحكم", path: "/dashboard" },
  { icon: Gift, label: "🎁 الهدايا", path: "/gifts" },
  { divider: true, label: "الألعاب" },
  { icon: TrendingUp, label: "كراش 💥", path: "/crash" },
  { icon: Circle, label: "روليت 🎡", path: "/roulette" },
  { emoji: "🍒", label: "سلوت فواكه", path: "/slots/fruits" },
  { emoji: "🌙", label: "الليالي العربية", path: "/slots/arabic" },
  { emoji: "🏺", label: "كنوز مصر", path: "/slots/egyptian" },
  { icon: Gamepad2, label: "بلينكو", path: "/plinko" },
  { icon: Bomb, label: "الألغام", path: "/mines" },
  { icon: CreditCard, label: "بلاك جاك", path: "/blackjack" },
  { icon: Hand, label: "حجر ورقة مقص", path: "/rps" },
  { icon: Circle, label: "عجلة الحظ", path: "/wheel" },
  { icon: Grid3X3, label: "كينو", path: "/keno" },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { balance } = useGame();
  const { user, logout } = useAuth();

  const displayBalance = user?.balance ?? balance;

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 right-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 right-0 z-40 h-screen w-72 bg-sidebar border-l border-sidebar-border transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="mb-8">
            <Link to="/home" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-casino flex items-center justify-center">
                <Gamepad2 className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground neon-text-green">
                  Gamebred
                </h1>
                <p className="text-xs text-muted-foreground">Casino</p>
              </div>
            </Link>
          </div>

          {/* Balance Card */}
          <div className="casino-card mb-4 neon-border-purple">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-secondary flex items-center justify-center">
                <Wallet className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">الرصيد</p>
                <p className="text-lg font-bold text-foreground">{displayBalance.toFixed(2)} نقطة</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {menuItems.map((item, idx) => {
              if ('divider' in item && item.divider) {
                return <p key={idx} className="text-xs text-muted-foreground pt-3 pb-1 px-3 uppercase tracking-wider">{item.label}</p>;
              }
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path!}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-primary/20 text-primary neon-border-green"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {item.icon ? <item.icon className="h-5 w-5 shrink-0" /> : 
                   item.emoji ? <span className="text-xl">{item.emoji}</span> : null}
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info + Logout */}
          {user && (
            <div className="border-t border-border pt-3 mt-2">
              <p className="text-xs text-muted-foreground px-3 mb-2">مرحباً، {user.username}</p>
            </div>
          )}
          <button
            onClick={() => { logout(); }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 w-full"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
}
