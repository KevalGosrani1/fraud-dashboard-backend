// scripts/createAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
      console.error('❌ Usage: node createAdmin.js <email> <password>');
      process.exit(1);
    }

    const existing = await User.findOne({ email });
    if (existing) {
      console.error('❌ User already exists');
      process.exit(1);
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashed,
      role: 'admin'
    });

    console.log(`✅ Admin user created: ${user.email}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin:', err);
    process.exit(1);
  }
})();
