import { MainLayout } from "@/components/layout/MainLayout";
import { Bomb, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function MinesRules() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl gradient-secondary flex items-center justify-center">
            <Bomb className="h-8 w-8 text-secondary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">قواعد الألغام</h1>
            <p className="text-muted-foreground">تعلم كيفية لعب Mines</p>
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
                <span>اختر عدد الألغام (من 1 إلى 24)</span>
              </li>
              <li className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">3</span>
                <span>اضغط على "ابدأ اللعبة"</span>
              </li>
              <li className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">4</span>
                <span>اكشف المربعات واحداً تلو الآخر</span>
              </li>
              <li className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">5</span>
                <span>اسحب أرباحك قبل الكشف عن لغم!</span>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">كيف تحدد المكاسب والخسائر</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• <span className="text-primary">💎 جوهرة</span> = تستمر في اللعب والمضاعف يزداد</li>
              <li>• <span className="text-destructive">💣 لغم</span> = تخسر كل شيء</li>
              <li>• كلما زاد عدد الألغام، زاد المضاعف لكل جوهرة</li>
              <li>• يمكنك سحب أرباحك في أي وقت قبل الكشف عن لغم</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-secondary mb-3">أقصى مضاعف</h2>
            <div className="p-4 bg-secondary/20 rounded-lg border border-secondary/30">
              <p className="text-2xl font-bold text-secondary text-center">24x</p>
              <p className="text-sm text-muted-foreground text-center mt-2">
                مع لغم واحد فقط، يمكنك مضاعفة ربحك حتى 24 مرة!
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">نصائح</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• اعرف متى تتوقف وتسحب أرباحك</li>
              <li>• ألغام أكثر = مخاطر أعلى = مكافآت أكبر</li>
              <li>• ابدأ بعدد قليل من الألغام للتعلم</li>
              <li>• لا تكن جشعاً - اسحب في الوقت المناسب</li>
            </ul>
          </section>
        </div>

        <div className="flex justify-center">
          <Link to="/mines">
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
