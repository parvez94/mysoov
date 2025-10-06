import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const checkAdminRole = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    // Find all admin users
    const admins = await User.find({ role: 'admin' }).select(
      'username email role displayName'
    );

    console.log('\n📋 Admin Users:');
    console.log('================');
    if (admins.length === 0) {
      console.log('❌ No admin users found!');
    } else {
      admins.forEach((admin, index) => {
        console.log(`\n${index + 1}. ${admin.displayName || admin.username}`);
        console.log(`   Username: ${admin.username}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   ID: ${admin._id}`);
      });
    }

    // Count total users
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalRegularUsers = await User.countDocuments({ role: 'user' });

    console.log('\n📊 Statistics:');
    console.log('================');
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Admins: ${totalAdmins}`);
    console.log(`Regular Users: ${totalRegularUsers}`);

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkAdminRole();
