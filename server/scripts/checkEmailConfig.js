import mongoose from 'mongoose';
import Settings from '../models/Settings.js';
import dotenv from 'dotenv';

dotenv.config();

const checkEmailConfig = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    const settings = await Settings.findOne();
    
    if (!settings) {
      console.log('\n❌ No settings document found in database');
      console.log('   Create one through the dashboard email settings page\n');
      process.exit(0);
    }

    console.log('\n📧 Email Configuration Status:\n');
    console.log('Enabled:', settings.emailConfig?.enabled || false);
    console.log('Host:', settings.emailConfig?.host || '(not set)');
    console.log('Port:', settings.emailConfig?.port || '(not set)');
    console.log('Username:', settings.emailConfig?.username || '(not set)');
    console.log('Password:', settings.emailConfig?.password ? '••••••••' : '(not set)');
    console.log('From Email:', settings.emailConfig?.fromEmail || '(not set)');
    console.log('From Name:', settings.emailConfig?.fromName || '(not set)');
    
    console.log('\n✅ Issues found:');
    const issues = [];
    
    if (!settings.emailConfig) {
      issues.push('  - Email config object is missing');
    } else {
      if (!settings.emailConfig.enabled) issues.push('  - Email system is disabled');
      if (!settings.emailConfig.host) issues.push('  - SMTP host is missing');
      if (!settings.emailConfig.username) issues.push('  - Username is missing');
      if (!settings.emailConfig.password) issues.push('  - Password is missing');
    }
    
    if (issues.length === 0) {
      console.log('  - None! Configuration looks complete.');
    } else {
      issues.forEach(issue => console.log(issue));
    }
    
    console.log('');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

checkEmailConfig();
