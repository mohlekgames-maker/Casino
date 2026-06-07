# 🎰 Gamebred Casino - دليل التشغيل الكامل

## نظرة عامة
كازينو بالنقاط — بدون أموال حقيقية. اكسب نقاطاً من مشاهدة الفيديوهات، تسجيل الدخول اليومي، وإكمال المهام. استبدل نقاطك بهدايا حصرية من Discord.

---

## 🗂️ هيكل المشروع

```
casino-project/
├── frontend/          ← React + Vite + TypeScript (عربي)
│   ├── src/
│   │   ├── pages/     ← جميع صفحات الألعاب
│   │   ├── contexts/  ← AuthContext + GameContext
│   │   └── lib/api.ts ← خدمة API
│   ├── .env.example
│   └── Dockerfile
├── backend/           ← Node.js + Express + MySQL
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── config/
│   │   └── utils/
│   ├── .env.example
│   └── Dockerfile
└── docker-compose.yml
```

---

## ⚡ إعداد سريع (Development)

### 1. قاعدة البيانات MySQL
```bash
# تأكد من تشغيل MySQL
mysql -u root -p

# أنشئ قاعدة البيانات
CREATE DATABASE gamebred_casino CHARACTER SET utf8mb4;
CREATE USER 'casino_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL ON gamebred_casino.* TO 'casino_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. إعداد Backend
```bash
cd backend

# انسخ ملف البيئة
cp .env.example .env

# عدّل .env (مهم جداً!)
nano .env  # أو أي محرر نصوص

# ثبّت الحزم
npm install

# أنشئ الجداول
node src/config/migrate.js

# أضف البيانات الأولية
node src/config/seed.js

# شغّل الخادم
npm run dev
```

### 3. إعداد Frontend
```bash
cd frontend

# انسخ ملف البيئة
cp .env.example .env

# عدّل .env
VITE_API_URL=http://localhost:5000/api
VITE_DISCORD_INVITE=https://discord.gg/your_server

# ثبّت الحزم
npm install

# شغّل واجهة التطوير
npm run dev
```

الآن افتح: **http://localhost:5173**

---

## 🚀 نشر على الإنترنت

### الخيار 1: Docker Compose (أسهل - VPS)

```bash
# أنشئ ملف .env في المجلد الجذر
cat > .env << EOF
DB_NAME=gamebred_casino
DB_USER=casino_user
DB_PASSWORD=STRONG_PASSWORD_HERE
DB_ROOT_PASSWORD=ROOT_PASSWORD_HERE
JWT_SECRET=VERY_LONG_RANDOM_STRING_64_CHARS_MIN
JWT_REFRESH_SECRET=ANOTHER_VERY_LONG_RANDOM_STRING_64_CHARS
FRONTEND_URL=https://yourdomain.com
VITE_API_URL=https://yourdomain.com/api
VITE_DISCORD_INVITE=https://discord.gg/your_invite
STARTING_BALANCE=1000
EOF

# شغّل الكل
docker-compose up -d

# أنشئ الجداول (مرة واحدة)
docker exec gamebred_backend node src/config/migrate.js
docker exec gamebred_backend node src/config/seed.js
```

### الخيار 2: Railway (سحابي - مجاني جزئياً)

1. ارفع الكود على GitHub
2. افتح [railway.app](https://railway.app)
3. أنشئ مشروع جديد
4. أضف MySQL من قاعدة البيانات
5. ادفع Backend من المجلد `/backend`
6. ادفع Frontend من المجلد `/frontend`
7. أضف متغيرات البيئة

### الخيار 3: Vercel + Railway/PlanetScale

**Frontend → Vercel:**
```bash
cd frontend
npx vercel --prod
```

**Backend → Railway:**
```bash
cd backend
railway up
```

---

## 🎮 الألعاب المتاحة

| اللعبة | المسار | الوصف |
|--------|--------|-------|
| 🍒 سلوت فواكه | /slots/fruits | سلوت كلاسيكي |
| 🌙 الليالي العربية | /slots/arabic | سلوت بطابع عربي |
| 🏺 كنوز مصر | /slots/egyptian | سلوت بطابع فرعوني |
| 💥 كراش | /crash | اصرف قبل الانفجار |
| 🎡 روليت أمريكي | /roulette | روليت كامل |
| 🎰 بلينكو | /plinko | أسقط الكرة |
| 💣 الألغام | /mines | اكتشف الجواهر |
| 🃏 بلاك جاك | /blackjack | اقترب من 21 |
| ✌️ حجر ورقة مقص | /rps | اختر يدك |
| 🎡 عجلة الحظ | /wheel | أدر العجلة |
| 🔢 كينو | /keno | اختر أرقامك |

---

## 💰 نظام النقاط

| الطريقة | النقاط |
|---------|--------|
| رصيد البداية | 1000 نقطة |
| تسجيل الدخول اليومي | 100 نقطة |
| مشاهدة فيديو | 50 نقطة |
| إكمال مهمة | 100-300 نقطة |
| مكافأة السلسلة اليومية | +10/يوم (حتى +60) |

---

## 🎁 هدايا Discord

- استبدل نقاطك بحزم نقاط إضافية
- احصل على رتبة VIP في Discord
- هدايا حصرية للأعضاء المميزين

---

## 🔒 الأمان

- ✅ JWT + Refresh tokens
- ✅ bcrypt (12 rounds)
- ✅ Rate limiting على جميع المسارات
- ✅ Helmet.js للحماية من هجمات الويب
- ✅ تحقق من الرهان على الخادم (لا ثقة بالعميل)
- ✅ نتائج عادلة مُثبتة (Provably Fair)
- ✅ الخادم يتحكم بجميع نتائج الألعاب

---

## 🛠️ ضبط الإعدادات

في `.env` يمكنك تغيير:
```
STARTING_BALANCE=1000    # رصيد البداية
DAILY_LOGIN_POINTS=100   # نقاط تسجيل الدخول اليومي
VIDEO_WATCH_POINTS=50    # نقاط مشاهدة الفيديو
MIN_BET=1                # أقل رهان
MAX_BET=10000            # أعلى رهان
```

---

## 👑 لوحة الإدارة (Admin)

يمكن للمدير عبر API:
- `GET /api/admin/users` - قائمة المستخدمين
- `GET /api/admin/stats` - إحصائيات الموقع
- `POST /api/admin/ban/:userId` - حظر مستخدم
- `POST /api/admin/grant-points` - منح نقاط

لجعل مستخدم مدير:
```sql
UPDATE users SET is_admin = TRUE WHERE email = 'your@email.com';
```
