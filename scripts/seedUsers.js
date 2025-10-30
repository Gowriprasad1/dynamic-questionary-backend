const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const initialUsers = [
  { userId: 'gembalih', password: 'Hdfc@123' },
  { userId: 'sagars', password: 'Hdfc@123' }
];

async function seedUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-dynamic-form', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');

    // Check and create users
    for (const userData of initialUsers) {
      const existingUser = await User.findOne({ userId: userData.userId });
      
      if (existingUser) {
        console.log(`User ${userData.userId} already exists, skipping...`);
      } else {
        const user = new User({
          userId: userData.userId,
          password: userData.password,
          createdBy: 'system'
        });
        await user.save();
        console.log(`✓ Created user: ${userData.userId}`);
      }
    }

    console.log('\n✓ User seeding completed successfully!');
    console.log('\nInitial users:');
    initialUsers.forEach(u => {
      console.log(`  - UserId: ${u.userId}, Password: ${u.password}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();
