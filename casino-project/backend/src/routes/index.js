// src/routes/index.js
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const gameController = require('../controllers/gameController');
const pointsController = require('../controllers/pointsController');
const giftsController = require('../controllers/giftsController');
const { auth, adminAuth } = require('../middleware/auth');
const { authLimiter, gameLimiter, apiLimiter, videoLimiter } = require('../middleware/rateLimiter');

// ─── Auth ─────────────────────────────────────────────────────────────────────
router.post('/auth/register', authLimiter, authController.register);
router.post('/auth/login', authLimiter, authController.login);
router.post('/auth/refresh', authController.refreshToken);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', auth, authController.getMe);

// ─── Games ────────────────────────────────────────────────────────────────────
router.post('/games/slots', auth, gameLimiter, gameController.playSlots);

router.post('/games/crash/start', auth, gameLimiter, gameController.startCrash);
router.post('/games/crash/cashout', auth, gameController.cashoutCrash);
router.get('/games/crash/verify', gameController.getCrashResult);

router.post('/games/roulette', auth, gameLimiter, gameController.playRoulette);

router.post('/games/mines/start', auth, gameLimiter, gameController.startMines);
router.post('/games/mines/reveal', auth, gameController.revealMineCell);
router.post('/games/mines/cashout', auth, gameController.cashoutMines);

router.get('/games/history', auth, gameController.getGameHistory);
router.get('/games/leaderboard', gameController.getLeaderboard);

// ─── Points ───────────────────────────────────────────────────────────────────
router.post('/points/daily', auth, pointsController.claimDailyBonus);
router.get('/points/videos', auth, pointsController.getVideos);
router.post('/points/videos/watch', auth, videoLimiter, pointsController.watchVideo);
router.get('/points/tasks', auth, pointsController.getTasks);
router.post('/points/tasks/complete', auth, apiLimiter, pointsController.completeTask);
router.get('/points/history', auth, pointsController.getPointsHistory);

// ─── Gifts ────────────────────────────────────────────────────────────────────
router.get('/gifts', auth, giftsController.getGifts);
router.post('/gifts/redeem', auth, apiLimiter, giftsController.redeemGift);
router.get('/gifts/my-redemptions', auth, giftsController.getMyRedemptions);

// ─── Admin ────────────────────────────────────────────────────────────────────
router.get('/admin/users', adminAuth, async (req, res) => {
  const db = require('../config/db');
  const [rows] = await db.execute(
    'SELECT id, username, email, balance, is_banned, games_played, created_at FROM users ORDER BY created_at DESC LIMIT 100'
  );
  res.json({ success: true, data: rows });
});

router.post('/admin/ban/:userId', adminAuth, async (req, res) => {
  const db = require('../config/db');
  await db.execute('UPDATE users SET is_banned = TRUE WHERE id = ?', [req.params.userId]);
  res.json({ success: true, message: 'تم حظر المستخدم' });
});

router.post('/admin/grant-points', adminAuth, async (req, res) => {
  const { userId, amount, reason } = req.body;
  const db = require('../config/db');
  const { v4: uuidv4 } = require('uuid');
  await db.execute('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, userId]);
  await db.execute(
    'INSERT INTO points_transactions (id, user_id, amount, type, description) VALUES (?,?,?,?,?)',
    [uuidv4(), userId, amount, 'admin_grant', reason || 'منحة من الإدارة']
  );
  res.json({ success: true, message: 'تم منح النقاط' });
});

router.get('/admin/stats', adminAuth, async (req, res) => {
  const db = require('../config/db');
  const [[users]] = await db.execute('SELECT COUNT(*) as total FROM users');
  const [[games]] = await db.execute('SELECT COUNT(*) as total, SUM(bet_amount) as wagered, SUM(win_amount) as won FROM game_history');
  const [[today]] = await db.execute('SELECT COUNT(*) as games_today FROM game_history WHERE DATE(created_at) = CURDATE()');
  res.json({ success: true, data: { users: users.total, ...games, ...today } });
});

module.exports = router;
