const express = require('express');
const router = express.Router();
const User = require('../models/User');
const LoginLog = require('../models/LoginLog');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔍 Login attempt:');
    console.log('Email:', email);
    console.log('Password Provided:', !!password);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const user = await User.findOne({ email });
    console.log('✅ User lookup complete.');
    console.log('User found:', !!user);

    if (!user) {
      console.log('❌ No user found for email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('🔑 Checking password...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password matches:', isMatch);

    if (!isMatch) {
      console.log('❌ Invalid password.');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('🔐 Generating JWT...');
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('📝 Creating login log...');
    await LoginLog.create({
      userId: user._id,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    console.log('✅ Login successful for:', email);

    res.json({ token });

  } catch (error) {
    console.error('❌ Login error stack trace:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
