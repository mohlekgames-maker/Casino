// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'لم يتم توفير رمز المصادقة' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await db.execute(
      'SELECT id, username, email, balance, is_banned, is_admin FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'المستخدم غير موجود' });
    }

    if (rows[0].is_banned) {
      return res.status(403).json({ success: false, message: 'تم حظر حسابك' });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'انتهت صلاحية الرمز', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, message: 'رمز غير صالح' });
  }
};

const adminAuth = async (req, res, next) => {
  await auth(req, res, () => {
    if (!req.user.is_admin) {
      return res.status(403).json({ success: false, message: 'صلاحيات المدير مطلوبة' });
    }
    next();
  });
};

module.exports = { auth, adminAuth };
