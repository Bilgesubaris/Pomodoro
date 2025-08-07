import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Kullanıcıya özel Pomodoro ayarlarını getir
router.get('/', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
  res.json(user.pomodoroSettings);
});

// Pomodoro ayarlarını güncelle
router.put('/', auth, async (req, res) => {
  const { pomodoro, shortBreak, longBreak } = req.body;
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
  user.pomodoroSettings = {
    pomodoro: pomodoro || user.pomodoroSettings.pomodoro,
    shortBreak: shortBreak || user.pomodoroSettings.shortBreak,
    longBreak: longBreak || user.pomodoroSettings.longBreak
  };
  await user.save();
  res.json(user.pomodoroSettings);
});

export default router;