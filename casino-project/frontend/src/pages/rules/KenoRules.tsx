import { MainLayout } from "@/components/layout/MainLayout";
import { Grid3X3, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function KenoRules() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl gradient-secondary flex items-center justify-center">
            <Grid3X3 className="h-8 w-8 text-secondary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">قواعد كينو</h1>
            <p className="text-muted-foreground">تعلم كيفية لعب Keno</p>
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
                <span>اختر من 1 إلى 10 أرقام من الشبكة (1-40)</span>
              </li>
              <li className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">3</span>
                <span>اضغط على زر "ابدأ السحب"</span>
              </li>
              <li className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">4</span>
                <span>النظام يسحب 10 أرقام عشوائية</span>
              </li>
              <li className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">5</span>
                <span>اربح حسب عدد التطابقات</span>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">جدول المكافآت</h2>
            <p className="text-muted-foreground mb-4">
              المكافأة تعتمد على عدد الأرقام المختارة وعدد التطابقات:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-muted">
                    <th className="text-right py-2 text-muted-foreground">الأرقام المختارة</th>
                    <th className="text-right py-2 text-muted-foreground">التطابقات</th>
                    <th className="text-right py-2 text-primary">المضاعف</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-muted/50">
                    <td className="py-2">1 رقم</td>
                    <td className="py-2">1</td>
                    <td className="py-2 text-primary font-bold">3x</td>
                  </tr>
                  <tr className="border-b border-muted/50">
                    <td className="py-2">5 أرقام</td>
                    <td className="py-2">5</td>
                    <td className="py-2 text-primary font-bold">50x</td>
                  </tr>
                  <tr className="border-b border-muted/50">
                    <td className="py-2">10 أرقام</td>
                    <td className="py-2">10</td>
                    <td className="py-2 text-secondary font-bold">5000x</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-secondary mb-3">🏆 أقصى مضاعف</h2>
            <div className="p-6 bg-gradient-to-br from-secondary/30 to-primary/30 rounded-lg border border-secondary/50">
              <p className="text-4xl font-bold text-secondary text-center neon-text-purple">5000x</p>
              <p className="text-muted-foreground text-center mt-2">
                اختر 10 أرقام وطابق جميعها لتربح 5000 ضعف رهانك!
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">نصائح</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• اختيار أرقام أكثر يعني فرص أعلى للتطابق لكن مضاعفات أقل للتطابقات الجزئية</li>
              <li>• اختيار أرقام أقل يعني مضاعفات أعلى لكن فرص أقل</li>
              <li>• جميع الأرقام لها نفس احتمالية الظهور</li>
              <li>• اللعبة تعتمد على الحظ بشكل كامل</li>
            </ul>
          </section>
        </div>

        <div className="flex justify-center">
          <Link to="/keno">
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
