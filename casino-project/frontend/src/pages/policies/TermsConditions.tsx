import { MainLayout } from "@/components/layout/MainLayout";
import { FileText } from "lucide-react";

export default function TermsConditions() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl gradient-secondary flex items-center justify-center">
            <FileText className="h-8 w-8 text-secondary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">الشروط والأحكام</h1>
            <p className="text-muted-foreground">شروط استخدام Gamebred Casino</p>
          </div>
        </div>

        <div className="casino-card space-y-6">
          <section>
            <h2 className="text-xl font-bold text-primary mb-3">شروط الاستخدام</h2>
            <p className="text-muted-foreground mb-3">
              باستخدامك لموقع Gamebred Casino، فإنك توافق على الشروط والأحكام التالية:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• الموقع مخصص للترفيه فقط</li>
              <li>• يجب استخدام الموقع بطريقة مسؤولة</li>
              <li>• يُمنع استخدام الموقع لأي أغراض غير قانونية</li>
              <li>• يجب الالتزام بجميع القوانين المحلية والدولية</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-secondary mb-3">إخلاء المسؤولية</h2>
            <p className="text-muted-foreground">
              Gamebred Casino غير مسؤول عن أي خسائر افتراضية قد تحدث أثناء اللعب. 
              جميع الألعاب تعتمد على الحظ والمهارة، ولا يوجد ضمان للفوز. المستخدم 
              يتحمل كامل المسؤولية عن قراراته في اللعب.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">الرصيد الافتراضي</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• جميع الأرصدة في الموقع افتراضية بالكامل</li>
              <li>• لا يمكن استبدال الرصيد الافتراضي بأموال حقيقية</li>
              <li>• لا توجد عمليات شراء أو بيع للرصيد</li>
              <li>• الرصيد مخصص للعب داخل الموقع فقط</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">صلاحيات الإدارة</h2>
            <p className="text-muted-foreground mb-3">
              تحتفظ إدارة Gamebred Casino بالحقوق التالية:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• تعديل أو تحديث الشروط والأحكام في أي وقت</li>
              <li>• إيقاف أو حذف أي حساب يخالف القواعد</li>
              <li>• تعديل أو إزالة أي محتوى غير مناسب</li>
              <li>• إجراء تغييرات على الألعاب والميزات</li>
              <li>• إيقاف الخدمة مؤقتاً للصيانة</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">التعديلات</h2>
            <p className="text-muted-foreground">
              نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إخطار المستخدمين بأي 
              تغييرات جوهرية. استمرارك في استخدام الموقع بعد التعديلات يعني موافقتك على 
              الشروط الجديدة.
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
