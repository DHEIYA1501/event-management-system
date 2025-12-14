const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding');
    
    // Import User model
    const User = require('../models/user');
    
    // Hash passwords
    const hashedPasswords = await Promise.all([
      bcrypt.hash('student123', 10),
      bcrypt.hash('admin123', 10),
      bcrypt.hash('alex123', 10)
    ]);
    
    // Test users data with HASHED passwords
    const testUsers = [
      {
        name: 'John Student',
        email: 'john@college.edu',
        password: hashedPasswords[0],
        collegeId: '2023001',
        role: 'student',
        phone: '9876543210',
        department: 'CSE',
        year: 2,
        emailVerified: true
      },
      {
        name: 'Emma Club Admin',
        email: 'emma@college.edu',
        password: hashedPasswords[1],
        collegeId: '2023002',
        role: 'club_admin',
        phone: '9876543211',
        department: 'ECE',
        year: 3,
        clubName: 'Coding Club',
        clubDescription: 'Programming and development club',
        emailVerified: true
      },
      {
        name: 'Alex Student',
        email: 'alex@college.edu',
        password: hashedPasswords[2],
        collegeId: '2023003',
        role: 'student',
        phone: '9876543212',
        department: 'MECH',
        year: 1,
        emailVerified: false
      }
    ];
    
    console.log('🗑️  Clearing existing test users...');
    // Clear only test users (by email)
    const emailsToDelete = testUsers.map(user => user.email);
    await User.deleteMany({ email: { $in: emailsToDelete } });
    
    console.log('👤 Creating test users...');
    // Create new test users
    const createdUsers = await User.insertMany(testUsers);
    
    console.log(`✅ Created ${createdUsers.length} test users:`);
    console.log('   Test Credentials:');
    console.log('   1. john@college.edu / student123');
    console.log('   2. emma@college.edu / admin123');
    console.log('   3. alex@college.edu / alex123');
    
    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Seeding complete! Database ready for testing.');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();