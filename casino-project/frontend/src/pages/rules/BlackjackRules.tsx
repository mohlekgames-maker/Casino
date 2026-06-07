import { MainLayout } from "@/components/layout/MainLayout";
import { CreditCard, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function BlackjackRules() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
            <CreditCard className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">قواعد بلاك جاك</h1>
            <p className="text-muted-foreground">تعلم كيفية لعب Blackjack</p>
          </div>
        </div>

        <div className="casino-card space-y-6">
          <section>
            <h2 className="text-xl font-bold text-primary mb-3">الهدف من اللعبة</h2>
            <p className="text-muted-foreground">
              الحصول على مجموع بطاقات أقرب إلى 21 من الموزع، دون تجاوز 21.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">قيم البطاقات</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• البطاقات من 2 إلى 10: قيمتها الفعلية</li>
              <li>• الصور (J, Q, K): قيمتها 10</li>
              <li>• الآس (A): قيمته 1 أو 11 (أيهما أفضل لك)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">كيفية اللعب</h2>
            <ol className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">1</span>
                <span>حدد مبلغ الرهان</span>
              </li>
              <li className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">2</span>
                <span>تحصل على بطاقتين والموزع يحصل على بطاقتين (واحدة مكشوفة)</span>
              </li>
              <li className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">3</span>
                <span>اختر: Hit (بطاقة إضافية) أو Stand (توقف) أو Double (مضاعفة)</span>
              </li>
              <li className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">4</span>
                <span>الموزع يكشف بطاقته ويسحب حتى يصل 17 أو أكثر</span>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">الخيارات المتاحة</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-bold text-primary mb-2">Hit</h3>
                <p className="text-sm text-muted-foreground">احصل على بطاقة إضافية</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-bold text-secondary mb-2">Stand</h3>
                <p className="text-sm text-muted-foreground">توقف عن سحب البطاقات</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-bold text-foreground mb-2">Double</h3>
                <p className="text-sm text-muted-foreground">ضاعف رهانك واحصل على بطاقة واحدة فقط</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-secondary mb-3">أقصى مضاعف</h2>
            <div className="p-4 bg-secondary/20 rounded-lg border border-secondary/30">
              <p className="text-2xl font-bold text-secondary text-center">2.5x</p>
              <p className="text-sm text-muted-foreground text-center mt-2">
                بلاك جاك (21 من أول بطاقتين) يدفع 3:2
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">نصائح</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• إذا كان مجموعك 11 أو أقل، دائماً اسحب بطاقة</li>
              <li>• إذا كان مجموعك 17 أو أكثر، دائماً توقف</li>
              <li>• راقب بطاقة الموزع المكشوفة لاتخاذ قرارك</li>
            </ul>
          </section>
        </div>

        <div className="flex justify-center">
          <Link to="/blackjack">
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
