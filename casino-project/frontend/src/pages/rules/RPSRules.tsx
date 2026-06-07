import { MainLayout } from "@/components/layout/MainLayout";
import { Hand, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function RPSRules() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl gradient-secondary flex items-center justify-center">
            <Hand className="h-8 w-8 text-secondary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">قواعد حجر ورقة مقص</h1>
            <p className="text-muted-foreground">تعلم كيفية اللعب</p>
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
                <span>اختر: حجر ✊ أو ورقة ✋ أو مقص ✌️</span>
              </li>
              <li className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">3</span>
                <span>الموزع يختار عشوائياً</span>
              </li>
              <li className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">4</span>
                <span>تظهر النتيجة: فوز، خسارة، أو تعادل</span>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">قواعد الفوز</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-primary/20 rounded-lg text-center">
                <p className="text-3xl mb-2">✊</p>
                <p className="font-bold text-foreground">الحجر</p>
                <p className="text-sm text-muted-foreground">يكسر المقص</p>
              </div>
              <div className="p-4 bg-secondary/20 rounded-lg text-center">
                <p className="text-3xl mb-2">✋</p>
                <p className="font-bold text-foreground">الورقة</p>
                <p className="text-sm text-muted-foreground">تغطي الحجر</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-3xl mb-2">✌️</p>
                <p className="font-bold text-foreground">المقص</p>
                <p className="text-sm text-muted-foreground">يقطع الورقة</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">النتائج</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• <span className="text-primary font-bold">فوز:</span> تحصل على ضعف رهانك (2x)</li>
              <li>• <span className="text-destructive font-bold">خسارة:</span> تخسر مبلغ الرهان</li>
              <li>• <span className="text-secondary font-bold">تعادل:</span> يعود إليك مبلغ الرهان</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-secondary mb-3">أقصى مضاعف</h2>
            <div className="p-4 bg-secondary/20 rounded-lg border border-secondary/30">
              <p className="text-2xl font-bold text-secondary text-center">2x</p>
              <p className="text-sm text-muted-foreground text-center mt-2">
                ضاعف رهانك مع كل فوز!
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">نصائح</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• اللعبة تعتمد على الحظ بشكل كامل</li>
              <li>• احتمالية الفوز، الخسارة، والتعادل متساوية (33.3% لكل منها)</li>
              <li>• استمتع باللعبة ولا تراهن بأكثر مما يمكنك خسارته</li>
            </ul>
          </section>
        </div>

        <div className="flex justify-center">
          <Link to="/rps">
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
