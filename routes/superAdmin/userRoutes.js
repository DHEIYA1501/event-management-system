const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const { protect } = require('../../middleware/auth');
const superAdminMiddleware = require('../../middleware/superAdminMiddleware');

router.use(protect);
router.use(superAdminMiddleware);

// GET ALL USERS
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}).select('-password -otp -otpExpires');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// UPDATE USER ROLE
router.put('/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['student', 'club_admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    user.role = role;
    await user.save();
    
    res.json({ success: true, user: { id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
