// src/config/seed.js
require('dotenv').config();
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST, port: process.env.DB_PORT,
    user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  // Tasks
  const tasks = [
    { title: 'Join Discord', title_ar: 'انضم إلى ديسكورد', description: 'Join our Discord server', description_ar: 'انضم إلى سيرفر ديسكورد الخاص بنا', points_reward: 200, task_type: 'discord_join', action_url: process.env.DISCORD_SERVER_INVITE || 'https://discord.gg/placeholder', icon: 'discord' },
    { title: 'Complete Profile', title_ar: 'أكمل ملفك الشخصي', description: 'Add your username and avatar', description_ar: 'أضف اسمك وصورتك الشخصية', points_reward: 100, task_type: 'profile_complete', icon: 'user' },
    { title: 'Play First Game', title_ar: 'العب أول لعبة', description: 'Play any casino game', description_ar: 'العب أي لعبة كازينو', points_reward: 150, task_type: 'play_game', icon: 'gamepad' },
    { title: 'Play 10 Games', title_ar: 'العب 10 ألعاب', description: 'Play 10 casino games', description_ar: 'العب 10 ألعاب كازينو', points_reward: 300, task_type: 'play_game', icon: 'trophy' },
    { title: 'Watch First Video', title_ar: 'شاهد أول فيديو', description: 'Watch a reward video', description_ar: 'شاهد فيديو مكافأة', points_reward: 50, task_type: 'other', icon: 'play' },
  ];

  for (const task of tasks) {
    const [existing] = await connection.execute('SELECT id FROM tasks WHERE title = ?', [task.title]);
    if (existing.length === 0) {
      await connection.execute(
        'INSERT INTO tasks (id, title, title_ar, description, description_ar, points_reward, task_type, action_url, icon) VALUES (?,?,?,?,?,?,?,?,?)',
        [uuidv4(), task.title, task.title_ar, task.description, task.description_ar, task.points_reward, task.task_type, task.action_url || null, task.icon]
      );
    }
  }

  // Gifts
  const gifts = [
    { title: '500 Points Pack', title_ar: 'حزمة 500 نقطة', description: 'Get 500 bonus points', description_ar: 'احصل على 500 نقطة إضافية', gift_type: 'points', points_cost: 200, points_value: 500, image_url: null },
    { title: '1000 Points Pack', title_ar: 'حزمة 1000 نقطة', description: 'Get 1000 bonus points', description_ar: 'احصل على 1000 نقطة إضافية', gift_type: 'points', points_cost: 350, points_value: 1000, image_url: null },
    { title: 'VIP Discord Role', title_ar: 'رتبة VIP في ديسكورد', description: 'Get the VIP role in our Discord', description_ar: 'احصل على رتبة VIP في سيرفر ديسكورد', gift_type: 'discord_role', points_cost: 500, points_value: 0, requires_discord: true, image_url: null },
    { title: 'Lucky Pack', title_ar: 'حزمة الحظ', description: 'Get 2500 bonus points + VIP role', description_ar: 'احصل على 2500 نقطة + رتبة VIP', gift_type: 'points', points_cost: 800, points_value: 2500, requires_discord: true, image_url: null },
  ];

  for (const gift of gifts) {
    const [existing] = await connection.execute('SELECT id FROM gifts WHERE title = ?', [gift.title]);
    if (existing.length === 0) {
      await connection.execute(
        'INSERT INTO gifts (id, title, title_ar, description, description_ar, gift_type, points_cost, points_value, requires_discord, image_url) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [uuidv4(), gift.title, gift.title_ar, gift.description, gift.description_ar, gift.gift_type, gift.points_cost, gift.points_value, gift.requires_discord || false, gift.image_url]
      );
    }
  }

  // Reward Videos
  const videos = [
    { title: 'Casino Intro', title_ar: 'مقدمة الكازينو', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration_seconds: 30, points_reward: 50 },
    { title: 'How to Play Slots', title_ar: 'كيفية لعب السلوتس', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration_seconds: 45, points_reward: 75 },
    { title: 'Casino Tips', title_ar: 'نصائح الكازينو', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration_seconds: 60, points_reward: 100 },
  ];

  for (const video of videos) {
    const [existing] = await connection.execute('SELECT id FROM reward_videos WHERE title = ?', [video.title]);
    if (existing.length === 0) {
      await connection.execute(
        'INSERT INTO reward_videos (id, title, title_ar, video_url, duration_seconds, points_reward) VALUES (?,?,?,?,?,?)',
        [uuidv4(), video.title, video.title_ar, video.video_url, video.duration_seconds, video.points_reward]
      );
    }
  }

  console.log('✅ Seed completed!');
  await connection.end();
}

seed().catch(console.error);
