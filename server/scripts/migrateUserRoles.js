/**
 * Database Migration Script
 * Converts user roles from Number to String format
 * Adds subscription fields to existing users
 *
 * Run with: node server/scripts/migrateUserRoles.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/mysoov';

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    runMigration();
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

async function runMigration() {
  try {
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    console.log('\n🔍 Starting migration...\n');

    // Step 1: Find users with numeric roles
    const usersWithNumericRoles = await usersCollection
      .find({
        role: { $type: 'number' },
      })
      .toArray();

    console.log(
      `📊 Found ${usersWithNumericRoles.length} users with numeric roles`
    );

    // Step 2: Convert numeric roles to strings
    let adminCount = 0;
    let userCount = 0;

    for (const user of usersWithNumericRoles) {
      const newRole = user.role === 1 ? 'admin' : 'user';

      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { role: newRole } }
      );

      if (newRole === 'admin') {
        adminCount++;
      } else {
        userCount++;
      }
    }

    console.log(
      `✅ Converted ${adminCount} admins and ${userCount} regular users`
    );

    // Step 3: Find users without subscription field
    const usersWithoutSubscription = await usersCollection
      .find({
        subscription: { $exists: false },
      })
      .toArray();

    console.log(
      `\n📊 Found ${usersWithoutSubscription.length} users without subscription field`
    );

    // Step 4: Add default subscription to users
    for (const user of usersWithoutSubscription) {
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            subscription: {
              isPaid: false,
              plan: 'free',
              maxUploadSize: 5,
              expiresAt: null,
            },
          },
        }
      );
    }

    console.log(
      `✅ Added default subscription to ${usersWithoutSubscription.length} users`
    );

    // Step 5: Find users without isVerified field
    const usersWithoutVerified = await usersCollection
      .find({
        isVerified: { $exists: false },
      })
      .toArray();

    console.log(
      `\n📊 Found ${usersWithoutVerified.length} users without isVerified field`
    );

    // Step 6: Add isVerified field (default false)
    for (const user of usersWithoutVerified) {
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { isVerified: false } }
      );
    }

    console.log(
      `✅ Added isVerified field to ${usersWithoutVerified.length} users`
    );

    // Step 7: Set admins to have higher upload limits
    const adminUsers = await usersCollection
      .find({
        role: 'admin',
      })
      .toArray();

    console.log(`\n📊 Found ${adminUsers.length} admin users`);

    for (const admin of adminUsers) {
      await usersCollection.updateOne(
        { _id: admin._id },
        {
          $set: {
            'subscription.maxUploadSize': 500,
            isVerified: true,
          },
        }
      );
    }

    console.log(
      `✅ Updated ${adminUsers.length} admins with 500MB upload limit`
    );

    // Step 8: Generate summary report
    console.log('\n' + '='.repeat(50));
    console.log('📋 MIGRATION SUMMARY');
    console.log('='.repeat(50));

    const totalUsers = await usersCollection.countDocuments();
    const totalAdmins = await usersCollection.countDocuments({ role: 'admin' });
    const totalRegularUsers = await usersCollection.countDocuments({
      role: 'user',
    });
    const totalPaidUsers = await usersCollection.countDocuments({
      'subscription.isPaid': true,
    });
    const totalFreeUsers = await usersCollection.countDocuments({
      'subscription.isPaid': false,
    });

    console.log(`\nTotal Users: ${totalUsers}`);
    console.log(`  - Admins: ${totalAdmins}`);
    console.log(`  - Regular Users: ${totalRegularUsers}`);
    console.log(`\nSubscription Status:`);
    console.log(`  - Paid Users: ${totalPaidUsers}`);
    console.log(`  - Free Users: ${totalFreeUsers}`);

    // Step 9: Verify migration
    console.log('\n' + '='.repeat(50));
    console.log('🔍 VERIFICATION');
    console.log('='.repeat(50));

    const usersStillNumeric = await usersCollection.countDocuments({
      role: { $type: 'number' },
    });

    const usersWithoutSub = await usersCollection.countDocuments({
      subscription: { $exists: false },
    });

    const usersStillWithoutVerified = await usersCollection.countDocuments({
      isVerified: { $exists: false },
    });

    if (
      usersStillNumeric === 0 &&
      usersWithoutSub === 0 &&
      usersStillWithoutVerified === 0
    ) {
      console.log('\n✅ Migration completed successfully!');
      console.log('All users have been updated with:');
      console.log('  - String-based roles');
      console.log('  - Subscription fields');
      console.log('  - Verification status');
    } else {
      console.log('\n⚠️  Migration incomplete:');
      if (usersStillNumeric > 0) {
        console.log(`  - ${usersStillNumeric} users still have numeric roles`);
      }
      if (usersWithoutSub > 0) {
        console.log(`  - ${usersWithoutSub} users missing subscription field`);
      }
      if (usersStillWithoutVerified > 0) {
        console.log(
          `  - ${usersStillWithoutVerified} users missing isVerified field`
        );
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✨ Migration script finished');
    console.log('='.repeat(50) + '\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Handle errors
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled rejection:', err);
  process.exit(1);
});
