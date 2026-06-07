import { MainLayout } from "@/components/layout/MainLayout";
import { Gamepad2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PlinkoRules() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
            <Gamepad2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">قواعد بلينكو</h1>
            <p className="text-muted-foreground">تعلم كيفية لعب Plinko</p>
          </div>
        </div>

        <div className="casino-card space-y-6">
          <section>
            <h2 className="text-xl font-bold text-primary mb-3">كيفية اللعب</h2>
            <ol className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">1</span>
                <span>حدد مبلغ الرهان الذي تريده</span>
              </li>
              <li className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">2</span>
                <span>اختر عدد الصفوف (كلما زادت الصفوف، زادت المضاعفات)</span>
              </li>
              <li className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">3</span>
                <span>اضغط على زر "أسقط الكرة"</span>
              </li>
              <li className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">4</span>
                <span>شاهد الكرة وهي تسقط عبر المسامير</span>
              </li>
              <li className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">5</span>
                <span>اربح حسب المضاعف الذي تسقط فيه الكرة</span>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">كيف تحدد المكاسب والخسائر</h2>
            <p className="text-muted-foreground mb-3">
              الكرة تسقط بشكل عشوائي عبر المسامير وتستقر في أحد الصناديق في الأسفل. 
              كل صندوق له مضاعف مختلف:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• الصناديق في الأطراف لها مضاعفات أعلى (أصعب الوصول إليها)</li>
              <li>• الصناديق في المنتصف لها مضاعفات أقل (أسهل الوصول إليها)</li>
              <li>• ربحك = مبلغ الرهان × المضاعف</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-secondary mb-3">أقصى مضاعف</h2>
            <div className="p-4 bg-secondary/20 rounded-lg border border-secondary/30">
              <p className="text-2xl font-bold text-secondary text-center">1000x</p>
              <p className="text-sm text-muted-foreground text-center mt-2">
                يمكنك الفوز بما يصل إلى 1000 ضعف رهانك!
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">نصائح</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• ابدأ برهانات صغيرة للتعرف على اللعبة</li>
              <li>• كلما زاد عدد الصفوف، زادت فرص الفوز بمضاعفات عالية</li>
              <li>• اللعبة تعتمد على الحظ بشكل كامل</li>
            </ul>
          </section>
        </div>

        <div className="flex justify-center">
          <Link to="/plinko">
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
