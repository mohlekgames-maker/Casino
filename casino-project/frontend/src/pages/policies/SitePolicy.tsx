import { MainLayout } from "@/components/layout/MainLayout";
import { Shield } from "lucide-react";

export default function SitePolicy() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">سياسة الموقع</h1>
            <p className="text-muted-foreground">قواعد ومعايير Gamebred Casino</p>
          </div>
        </div>

        <div className="casino-card space-y-6">
          <section>
            <h2 className="text-xl font-bold text-primary mb-3">قواعد المنصة العامة</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• يجب على جميع المستخدمين الالتزام بقواعد اللعب النظيف</li>
              <li>• يُمنع استخدام أي برامج أو أدوات خارجية للغش</li>
              <li>• يجب احترام جميع المستخدمين الآخرين</li>
              <li>• يُمنع إنشاء حسابات متعددة للحصول على مزايا غير مشروعة</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">اللعب النظيف</h2>
            <p className="text-muted-foreground">
              نحن ملتزمون بتوفير بيئة لعب عادلة لجميع المستخدمين. جميع الألعاب تعتمد على 
              خوارزميات عشوائية لضمان نتائج عادلة. أي محاولة للتلاعب بالنظام ستؤدي إلى 
              إيقاف الحساب فوراً.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-secondary mb-3">⚠️ تنبيه مهم: لا توجد أموال حقيقية</h2>
            <p className="text-muted-foreground">
              هذا الموقع للترفيه فقط ولا يتضمن أي معاملات مالية حقيقية. جميع الأرصدة 
              والمكاسب افتراضية تماماً. لا يمكن استبدال الرصيد الافتراضي بأموال حقيقية.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">متطلبات العمر</h2>
            <p className="text-muted-foreground">
              يجب أن يكون عمرك 18 عاماً على الأقل لاستخدام هذا الموقع. باستخدامك للموقع، 
              فإنك تؤكد أنك تستوفي هذا الشرط.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">قواعد الحساب</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• يُسمح بحساب واحد فقط لكل مستخدم</li>
              <li>• أنت مسؤول عن الحفاظ على أمان حسابك</li>
              <li>• يُمنع مشاركة معلومات حسابك مع الآخرين</li>
              <li>• يحق للإدارة إيقاف أي حساب يخالف القواعد</li>
            </ul>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
