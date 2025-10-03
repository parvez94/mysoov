import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const makeInitialAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    const email = 'freakypeepsbd@gmail.com';

    const user = await User.findOneAndUpdate(
      { email: email },
      { role: 1 },
      { new: true }
    );

    if (user) {
      console.log(`✅ Successfully made ${email} an admin!`);
      console.log(
        `User: ${user.username} (${user.email}) - Role: ${user.role}`
      );
    } else {
      console.log(`❌ User with email ${email} not found`);
    }

    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

makeInitialAdmin();
