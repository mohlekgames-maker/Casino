import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gamepad2, Mail, Lock, User, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let success: boolean;
      if (isLogin) {
        success = await login(email, password);
      } else {
        if (!username) { toast.error("اسم المستخدم مطلوب"); setLoading(false); return; }
        success = await register(username, email, password) as boolean;
      }
      if (success) {
        toast.success(isLogin ? "مرحباً بعودتك!" : "تم إنشاء الحساب بنجاح!");
        navigate("/home");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: string) => {
    toast.info(`تسجيل الدخول عبر ${provider} قريباً`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-neon-purple/20 rounded-full blur-3xl animate-pulse-neon" />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-neon-green/20 rounded-full blur-3xl animate-pulse-neon" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] gradient-casino rounded-full blur-3xl opacity-30" />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="casino-card neon-border-purple">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl gradient-casino flex items-center justify-center mx-auto mb-4 animate-float">
              <Gamepad2 className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground neon-text-green">
              Gamebred Casino
            </h1>
            <p className="text-muted-foreground mt-2">
              {isLogin ? "مرحباً بعودتك!" : "أنشئ حسابك الآن"}
            </p>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              variant="casino-outline"
              size="lg"
              className="w-full"
              onClick={() => handleOAuth("google")}
            >
              <Chrome className="h-5 w-5 ml-2" />
              {isLogin ? "الدخول بحساب Google" : "التسجيل بحساب Google"}
            </Button>
            <Button
              variant="casino-outline-purple"
              size="lg"
              className="w-full"
              onClick={() => handleOAuth("discord")}
            >
              <svg className="h-5 w-5 ml-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              {isLogin ? "الدخول بحساب Discord" : "التسجيل بحساب Discord"}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-card text-muted-foreground">أو</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="اسم المستخدم"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pr-11"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pr-11"
              />
            </div>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-11"
              />
            </div>
            <Button type="submit" variant="casino" size="lg" className="w-full" disabled={loading}>
              {loading ? "جاري التحميل..." : (isLogin ? "تسجيل الدخول" : "إنشاء الحساب")}
            </Button>
          </form>

          {/* Toggle */}
          <p className="text-center text-muted-foreground mt-6">
            {isLogin ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:text-primary/80 font-bold mr-2 transition-colors"
            >
              {isLogin ? "أنشئ حساباً" : "سجل الدخول"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
