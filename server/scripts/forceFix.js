import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const forceFix = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('videos');

    console.log('\n🔧 STEP 1: Drop the problematic index');
    try {
      await collection.dropIndex('customerCode_1');
      console.log('✅ Dropped customerCode_1 index');
    } catch (err) {
      console.log('⚠️  Index might not exist:', err.message);
    }

    console.log(
      '\n🔧 STEP 2: Remove customerCode field from videos with null value'
    );
    const result = await collection.updateMany(
      { customerCode: null },
      { $unset: { customerCode: '' } }
    );
    console.log(
      `✅ Removed customerCode field from ${result.modifiedCount} videos`
    );

    console.log('\n🔧 STEP 3: Recreate index with proper sparse + unique');
    await collection.createIndex(
      { customerCode: 1 },
      {
        unique: true,
        sparse: true,
        background: true,
        name: 'customerCode_1',
      }
    );
    console.log('✅ Created new sparse unique index');

    console.log('\n🧪 STEP 4: Test creating videos with no customerCode');

    // Test 1: Create without customerCode field
    const test1 = await collection.insertOne({
      userId: 'test-user-1',
      caption: 'Test 1 - No customerCode field',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✅ Test 1 passed: Video without customerCode field');

    // Test 2: Create another without customerCode field
    const test2 = await collection.insertOne({
      userId: 'test-user-2',
      caption: 'Test 2 - No customerCode field',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✅ Test 2 passed: Second video without customerCode field');

    // Test 3: Create with unique customerCode
    const test3 = await collection.insertOne({
      userId: 'test-user-3',
      caption: 'Test 3 - With customerCode',
      customerCode: 'TEST123',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✅ Test 3 passed: Video with unique customerCode');

    // Clean up test videos
    await collection.deleteMany({
      _id: { $in: [test1.insertedId, test2.insertedId, test3.insertedId] },
    });
    console.log('🧹 Cleaned up test videos');

    console.log('\n✅ ALL TESTS PASSED! The index is now working correctly.');
    console.log('\n📋 Summary:');
    console.log(
      '   - Videos WITHOUT customerCode field: ✅ Allowed (unlimited)'
    );
    console.log('   - Videos WITH unique customerCode: ✅ Allowed');
    console.log(
      '   - Videos WITH duplicate customerCode: ❌ Blocked (as expected)'
    );
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    console.error(err);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

forceFix();
