import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    const existingIndexes = await collection.indexes();
    console.log('\nExisting indexes:');
    existingIndexes.forEach(index => {
      console.log(`- ${index.name}:`, JSON.stringify(index.key));
    });

    const indexesToDrop = [];
    for (const index of existingIndexes) {
      if (index.name === 'email_1' || index.name === 'phone_1') {
        indexesToDrop.push(index.name);
      }
    }

    if (indexesToDrop.length > 0) {
      console.log('\nDropping old unique indexes:', indexesToDrop);
      for (const indexName of indexesToDrop) {
        await collection.dropIndex(indexName);
        console.log(`Dropped index: ${indexName}`);
      }
    } else {
      console.log('\nNo old indexes to drop');
    }

    const compoundIndexes = [
      { key: { email: 1, accountType: 1 }, unique: true },
      { key: { phone: 1, accountType: 1 }, unique: true }
    ];

    console.log('\nEnsuring compound indexes exist...');
    for (const indexSpec of compoundIndexes) {
      try {
        await collection.createIndex(indexSpec.key, { unique: indexSpec.unique });
        console.log(`Created/ensured index:`, JSON.stringify(indexSpec.key));
      } catch (err) {
        if (err.code === 85) {
          console.log(`Index already exists:`, JSON.stringify(indexSpec.key));
        } else {
          throw err;
        }
      }
    }

    const finalIndexes = await collection.indexes();
    console.log('\nFinal indexes:');
    finalIndexes.forEach(index => {
      console.log(`- ${index.name}:`, JSON.stringify(index.key), index.unique ? '(unique)' : '');
    });

    console.log('\n✅ Index fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing indexes:', error);
    process.exit(1);
  }
};

fixIndexes();
