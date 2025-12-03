import mongoose from 'mongoose';
import Settings from '../models/Settings.js';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const fixPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB\n');

    const settings = await Settings.findOne();
    
    if (!settings) {
      console.log('Creating new settings document...');
      settings = new Settings({});
    }

    console.log('Current email config:');
    console.log('  Enabled:', settings.emailConfig?.enabled || false);
    console.log('  Host:', settings.emailConfig?.host || '(not set)');
    console.log('  Port:', settings.emailConfig?.port || 587);
    console.log('  Username:', settings.emailConfig?.username || '(not set)');
    console.log('  Password:', settings.emailConfig?.password || '(not set)');
    console.log('  From Email:', settings.emailConfig?.fromEmail || '(not set)');
    console.log('');

    const enabled = await question('Enable email system? (yes/no): ');
    const host = await question('SMTP Host (smtp.gmail.com): ') || 'smtp.gmail.com';
    const port = await question('SMTP Port (587): ') || '587';
    const username = await question('Username/Email: ');
    const password = await question('Password (paste app password with spaces): ');
    const fromEmail = await question('From Email: ') || username;
    const fromName = await question('From Name (MySoov): ') || 'MySoov';

    // Remove all spaces from password
    const cleanPassword = password.replace(/\s/g, '');
    
    console.log('\n📧 Saving configuration:');
    console.log('  Enabled:', enabled.toLowerCase() === 'yes');
    console.log('  Host:', host);
    console.log('  Port:', port);
    console.log('  Username:', username);
    console.log('  Password length (with spaces):', password.length);
    console.log('  Password length (cleaned):', cleanPassword.length);
    console.log('  From Email:', fromEmail);
    console.log('  From Name:', fromName);
    console.log('');

    settings.emailConfig = {
      enabled: enabled.toLowerCase() === 'yes',
      host: host.trim(),
      port: parseInt(port, 10),
      username: username.trim(),
      password: cleanPassword,
      fromEmail: fromEmail.trim(),
      fromName: fromName.trim()
    };

    await settings.save();
    
    console.log('✅ Settings saved successfully!\n');
    console.log('Verify with: node scripts/checkEmailConfig.js');
    console.log('Test with: node scripts/testEmail.js');
    
    rl.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    rl.close();
    process.exit(1);
  }
};

console.log('🔧 MySoov Email Configuration Fix\n');
console.log('This will update email settings directly in the database.\n');
fixPassword();
