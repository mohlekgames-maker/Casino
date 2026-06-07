// src/controllers/pointsController.js
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

const DAILY_LOGIN_POINTS = parseInt(process.env.DAILY_LOGIN_POINTS) || 100;
const VIDEO_WATCH_POINTS = parseInt(process.env.VIDEO_WATCH_POINTS) || 50;
const VIDEO_COOLDOWN = parseInt(process.env.VIDEO_COOLDOWN_SECONDS) || 30;

// ─── Daily Login Bonus ────────────────────────────────────────────────────────

async function claimDailyBonus(req, res) {
  try {
    const [rows] = await db.execute(
      'SELECT last_daily_claim, daily_streak FROM users WHERE id = ?',
      [req.user.id]
    );
    const user = rows[0];
    const now = new Date();

    if (user.last_daily_claim) {
      const lastClaim = new Date(user.last_daily_claim);
      const hoursSince = (now - lastClaim) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        const nextClaim = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000);
        return res.status(400).json({
          success: false,
          message: 'لقد سبق وحصلت على مكافأة اليوم',
          data: { nextClaimAt: nextClaim }
        });
      }
    }

    // Check streak
    const lastClaim = user.last_daily_claim ? new Date(user.last_daily_claim) : null;
    let streak = 1;
    if (lastClaim) {
      const hoursSince = (now - lastClaim) / (1000 * 60 * 60);
      streak = hoursSince < 48 ? (user.daily_streak || 0) + 1 : 1;
    }

    // Bonus for streaks
    const streakBonus = Math.min(streak - 1, 6) * 10; // +10 per day, max +60
    const totalPoints = DAILY_LOGIN_POINTS + streakBonus;

    await db.execute(
      'UPDATE users SET balance = balance + ?, last_daily_claim = NOW(), daily_streak = ? WHERE id = ?',
      [totalPoints, streak, req.user.id]
    );

    await db.execute(
      'INSERT INTO points_transactions (id, user_id, amount, type, description) VALUES (?,?,?,?,?)',
      [uuidv4(), req.user.id, totalPoints, 'daily_login', `مكافأة اليوم - الأيام المتتالية: ${streak}`]
    );

    const [updated] = await db.execute('SELECT balance FROM users WHERE id = ?', [req.user.id]);

    res.json({
      success: true,
      message: `تم إضافة ${totalPoints} نقطة!`,
      data: { pointsEarned: totalPoints, streak, balance: updated[0].balance }
    });
  } catch (err) {
    console.error('Daily bonus error:', err);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
}

// ─── Videos ───────────────────────────────────────────────────────────────────

async function getVideos(req, res) {
  try {
    const [videos] = await db.execute(
      'SELECT * FROM reward_videos WHERE is_active = TRUE ORDER BY sort_order ASC'
    );

    // Check which ones were watched today
    const [watched] = await db.execute(
      `SELECT video_id FROM video_watches WHERE user_id = ? AND watched_at >= CURDATE()`,
      [req.user.id]
    );

    const watchedIds = watched.map(w => w.video_id);

    res.json({
      success: true,
      data: videos.map(v => ({ ...v, watched_today: watchedIds.includes(v.id) }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
}

async function watchVideo(req, res) {
  try {
    const { videoId, watchDuration } = req.body;

    const [videos] = await db.execute(
      'SELECT * FROM reward_videos WHERE id = ? AND is_active = TRUE',
      [videoId]
    );

    if (videos.length === 0) {
      return res.status(404).json({ success: false, message: 'الفيديو غير موجود' });
    }

    const video = videos[0];

    // Check already watched today
    const [todayWatch] = await db.execute(
      `SELECT id FROM video_watches WHERE user_id = ? AND video_id = ? AND watched_at >= CURDATE()`,
      [req.user.id, videoId]
    );

    if (todayWatch.length > 0) {
      return res.status(400).json({ success: false, message: 'لقد شاهدت هذا الفيديو اليوم بالفعل' });
    }

    // Verify watch duration (must watch at least 80% of video)
    const minDuration = Math.floor(video.duration_seconds * 0.8);
    if (!watchDuration || parseInt(watchDuration) < minDuration) {
      return res.status(400).json({ success: false, message: 'يجب مشاهدة الفيديو بالكامل' });
    }

    // Check daily video limit (max 10 per day)
    const [user] = await db.execute('SELECT videos_watched_today, last_video_watch FROM users WHERE id = ?', [req.user.id]);
    const today = new Date().toDateString();
    const lastWatch = user[0].last_video_watch ? new Date(user[0].last_video_watch).toDateString() : null;
    const watchedToday = lastWatch === today ? user[0].videos_watched_today : 0;

    if (watchedToday >= 10) {
      return res.status(400).json({ success: false, message: 'وصلت إلى الحد اليومي لمشاهدة الفيديوهات (10 فيديوهات)' });
    }

    const points = video.points_reward;

    await db.execute(
      'INSERT INTO video_watches (id, user_id, video_id, points_earned) VALUES (?,?,?,?)',
      [uuidv4(), req.user.id, videoId, points]
    );

    await db.execute(
      'UPDATE users SET balance = balance + ?, videos_watched_today = ?, last_video_watch = NOW() WHERE id = ?',
      [points, watchedToday + 1, req.user.id]
    );

    await db.execute(
      'UPDATE reward_videos SET total_views = total_views + 1 WHERE id = ?',
      [videoId]
    );

    await db.execute(
      'INSERT INTO points_transactions (id, user_id, amount, type, description, reference_id) VALUES (?,?,?,?,?,?)',
      [uuidv4(), req.user.id, points, 'video_watch', `شاهدت: ${video.title_ar}`, videoId]
    );

    const [updated] = await db.execute('SELECT balance FROM users WHERE id = ?', [req.user.id]);

    res.json({
      success: true,
      message: `ممتاز! ربحت ${points} نقطة`,
      data: { pointsEarned: points, balance: updated[0].balance, videosWatchedToday: watchedToday + 1 }
    });
  } catch (err) {
    console.error('Watch video error:', err);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

async function getTasks(req, res) {
  try {
    const [tasks] = await db.execute(
      'SELECT * FROM tasks WHERE is_active = TRUE ORDER BY sort_order ASC'
    );

    const [completed] = await db.execute(
      'SELECT task_id FROM user_tasks WHERE user_id = ?',
      [req.user.id]
    );

    const completedIds = completed.map(t => t.task_id);

    res.json({
      success: true,
      data: tasks.map(t => ({
        ...t,
        is_completed: completedIds.includes(t.id),
        can_complete: t.is_repeatable || !completedIds.includes(t.id)
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
}

async function completeTask(req, res) {
  try {
    const { taskId } = req.body;

    const [tasks] = await db.execute(
      'SELECT * FROM tasks WHERE id = ? AND is_active = TRUE',
      [taskId]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: 'المهمة غير موجودة' });
    }

    const task = tasks[0];

    if (!task.is_repeatable) {
      const [existing] = await db.execute(
        'SELECT id FROM user_tasks WHERE user_id = ? AND task_id = ?',
        [req.user.id, taskId]
      );
      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'تم إكمال هذه المهمة بالفعل' });
      }
    }

    await db.execute(
      'INSERT INTO user_tasks (id, user_id, task_id) VALUES (?,?,?)',
      [uuidv4(), req.user.id, taskId]
    );

    await db.execute(
      'UPDATE users SET balance = balance + ?, tasks_completed = tasks_completed + 1 WHERE id = ?',
      [task.points_reward, req.user.id]
    );

    await db.execute(
      'INSERT INTO points_transactions (id, user_id, amount, type, description, reference_id) VALUES (?,?,?,?,?,?)',
      [uuidv4(), req.user.id, task.points_reward, 'task_complete', `أكملت: ${task.title_ar}`, taskId]
    );

    const [updated] = await db.execute('SELECT balance FROM users WHERE id = ?', [req.user.id]);

    res.json({
      success: true,
      message: `تهانينا! ربحت ${task.points_reward} نقطة`,
      data: { pointsEarned: task.points_reward, balance: updated[0].balance }
    });
  } catch (err) {
    console.error('Complete task error:', err);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
}

async function getPointsHistory(req, res) {
  try {
    const [rows] = await db.execute(
      `SELECT type, amount, description, created_at FROM points_transactions 
       WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
}

module.exports = { claimDailyBonus, getVideos, watchVideo, getTasks, completeTask, getPointsHistory };
