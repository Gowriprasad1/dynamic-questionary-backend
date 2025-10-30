const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const dropIndex = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/green-givers-nursery');
    console.log('Connected to MongoDB');

    // Get the forms collection
    const db = mongoose.connection.db;
    const collection = db.collection('forms');

    // Get all indexes
    console.log('\nCurrent indexes:');
    const indexes = await collection.indexes();
    console.log(JSON.stringify(indexes, null, 2));

    // Drop the problematic index
    try {
      await collection.dropIndex('questions.questionId_1');
      console.log('\n✓ Successfully dropped index: questions.questionId_1');
    } catch (error) {
      if (error.code === 27) {
        console.log('\n✓ Index questions.questionId_1 does not exist (already dropped or never created)');
      } else {
        throw error;
      }
    }

    // Show remaining indexes
    console.log('\nRemaining indexes:');
    const remainingIndexes = await collection.indexes();
    console.log(JSON.stringify(remainingIndexes, null, 2));

    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

dropIndex();
