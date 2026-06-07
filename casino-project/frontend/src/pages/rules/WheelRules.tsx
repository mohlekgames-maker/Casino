import { MainLayout } from "@/components/layout/MainLayout";
import { Circle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function WheelRules() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
            <Circle className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">قواعد عجلة الحظ</h1>
            <p className="text-muted-foreground">تعلم كيفية لعب Wheel</p>
          </div>
        </div>

        <div className="casino-card space-y-6">
          <section>
            <h2 className="text-xl font-bold text-primary mb-3">كيفية اللعب</h2>
            <ol className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">1</span>
                <span>حدد مبلغ الرهان</span>
              </li>
              <li className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">2</span>
                <span>اضغط على زر "أدر العجلة"</span>
              </li>
              <li className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">3</span>
                <span>شاهد العجلة وهي تدور</span>
              </li>
              <li className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">4</span>
                <span>اربح حسب المضاعف الذي تتوقف عنده العجلة</span>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">المضاعفات المتاحة</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-destructive/20 rounded-lg text-center border border-destructive/30">
                <p className="text-2xl font-bold text-destructive">x0</p>
                <p className="text-xs text-muted-foreground mt-1">تخسر الرهان</p>
              </div>
              <div className="p-4 bg-primary/20 rounded-lg text-center border border-primary/30">
                <p className="text-2xl font-bold text-primary">x2</p>
                <p className="text-xs text-muted-foreground mt-1">ضعف الرهان</p>
              </div>
              <div className="p-4 bg-secondary/20 rounded-lg text-center border border-secondary/30">
                <p className="text-2xl font-bold text-secondary">x5</p>
                <p className="text-xs text-muted-foreground mt-1">5 أضعاف</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-lg text-center border border-primary/50">
                <p className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">x10</p>
                <p className="text-xs text-muted-foreground mt-1">10 أضعاف</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">احتمالات الفوز</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• x0: احتمالية أعلى (أكثر شريحة)</li>
              <li>• x2: احتمالية متوسطة</li>
              <li>• x5: احتمالية منخفضة</li>
              <li>• x10: احتمالية نادرة (أصغر شريحة)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-secondary mb-3">أقصى مضاعف</h2>
            <div className="p-4 bg-secondary/20 rounded-lg border border-secondary/30">
              <p className="text-2xl font-bold text-secondary text-center">10x</p>
              <p className="text-sm text-muted-foreground text-center mt-2">
                يمكنك الفوز بـ 10 أضعاف رهانك!
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">نصائح</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• اللعبة تعتمد على الحظ بشكل كامل</li>
              <li>• المضاعفات العالية نادرة لكنها مجزية</li>
              <li>• العب بمسؤولية وحدد ميزانيتك</li>
            </ul>
          </section>
        </div>

        <div className="flex justify-center">
          <Link to="/wheel">
            <Button variant="casino" size="lg" className="gap-2">
              العب الآن
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
