import { Link } from "react-router-dom";
import { Shield, FileText, Lock, BookOpen, Gamepad2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-casino flex items-center justify-center">
                <Gamepad2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground neon-text-green">
                Gamebred Casino
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              منصة ترفيهية للعب الكازينو. جميع الأرصدة افتراضية ولا تتضمن أي معاملات مالية حقيقية.
            </p>
          </div>

          {/* Policy Links */}
          <div className="space-y-4">
            <h3 className="font-bold text-foreground">السياسات</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/site-policy" 
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  سياسة الموقع
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  الشروط والأحكام
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Lock className="h-4 w-4" />
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link 
                  to="/rules" 
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <BookOpen className="h-4 w-4" />
                  قوانين الألعاب
                </Link>
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="space-y-4">
            <h3 className="font-bold text-foreground">تنبيه مهم</h3>
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-xs text-muted-foreground">
                ⚠️ هذا الموقع للترفيه فقط. جميع الأرصدة والمكاسب افتراضية. 
                يجب أن يكون عمرك 18 عاماً على الأقل لاستخدام هذا الموقع.
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © 2024 Gamebred Casino. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
