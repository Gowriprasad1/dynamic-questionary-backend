const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function dropIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Get all indexes
    const indexes = await usersCollection.indexes();
    console.log('\nCurrent indexes:', indexes);

    // Drop the problematic applicationNumber index if it exists
    try {
      await usersCollection.dropIndex('applicationNumber_1');
      console.log('✓ Dropped applicationNumber_1 index');
    } catch (err) {
      console.log('applicationNumber_1 index does not exist or already dropped');
    }

    console.log('\n✓ Index cleanup completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

dropIndexes();
