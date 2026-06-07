import { MainLayout } from "@/components/layout/MainLayout";
import { Lock } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
            <Lock className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">سياسة الخصوصية</h1>
            <p className="text-muted-foreground">كيف نحمي بياناتك في Gamebred Casino</p>
          </div>
        </div>

        <div className="casino-card space-y-6">
          <section>
            <h2 className="text-xl font-bold text-primary mb-3">استخدام البيانات</h2>
            <p className="text-muted-foreground mb-3">
              نحن نجمع ونستخدم بياناتك للأغراض التالية:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• إدارة حسابك وتوفير خدماتنا</li>
              <li>• تحسين تجربة المستخدم</li>
              <li>• إرسال إشعارات مهمة متعلقة بحسابك</li>
              <li>• منع الاحتيال وحماية أمان الموقع</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">مزودو تسجيل الدخول</h2>
            <p className="text-muted-foreground mb-3">
              نستخدم مزودي خدمات تسجيل الدخول التاليين:
            </p>
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-bold text-foreground mb-2">Google OAuth</h3>
                <p className="text-sm text-muted-foreground">
                  عند تسجيل الدخول باستخدام Google، نحصل على اسمك وبريدك الإلكتروني 
                  وصورة ملفك الشخصي فقط. لا نحصل على أي بيانات أخرى من حسابك.
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-bold text-foreground mb-2">Discord OAuth</h3>
                <p className="text-sm text-muted-foreground">
                  عند تسجيل الدخول باستخدام Discord، نحصل على اسم المستخدم وبريدك 
                  الإلكتروني وصورة ملفك الشخصي فقط. لا نحصل على رسائلك أو خوادمك.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-secondary mb-3">ملفات تعريف الارتباط (Cookies)</h2>
            <p className="text-muted-foreground mb-3">
              نستخدم ملفات تعريف الارتباط للأغراض التالية:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• الحفاظ على تسجيل دخولك</li>
              <li>• تذكر تفضيلاتك</li>
              <li>• تحليل استخدام الموقع لتحسينه</li>
              <li>• توفير تجربة مخصصة</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-3">
              يمكنك تعطيل ملفات تعريف الارتباط من إعدادات متصفحك، لكن هذا قد يؤثر 
              على بعض وظائف الموقع.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">حماية البيانات</h2>
            <p className="text-muted-foreground">
              نتخذ إجراءات أمنية مناسبة لحماية بياناتك من الوصول غير المصرح به أو 
              التعديل أو الإفصاح أو التدمير. نستخدم تشفير SSL لحماية جميع البيانات 
              المنقولة بين متصفحك وخوادمنا.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">حقوقك</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• الحق في الوصول إلى بياناتك الشخصية</li>
              <li>• الحق في تصحيح البيانات غير الدقيقة</li>
              <li>• الحق في حذف بياناتك</li>
              <li>• الحق في الاعتراض على معالجة بياناتك</li>
            </ul>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
