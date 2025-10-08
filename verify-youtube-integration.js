#!/usr/bin/env node

/**
 * YouTube Integration Verification Script
 *
 * This script checks if all necessary files and configurations
 * are in place for the YouTube storage integration.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying YouTube Integration Setup...\n');

let allChecksPass = true;

// Files to check
const requiredFiles = [
  {
    path: 'server/utils/youtubeUploader.js',
    description: 'YouTube uploader service',
  },
  {
    path: 'server/scripts/setupYouTube.js',
    description: 'YouTube OAuth setup script',
  },
  {
    path: 'client/src/pages/dashboard/DashboardSettings.jsx',
    description: 'Admin settings UI',
  },
  {
    path: 'client/src/pages/Video.jsx',
    description: 'Video player component',
  },
  {
    path: 'client/src/components/PostCard.jsx',
    description: 'PostCard component',
  },
  {
    path: 'YOUTUBE_SETUP_GUIDE.md',
    description: 'Setup guide documentation',
  },
];

// Check if files exist
console.log('📁 Checking Required Files:\n');
requiredFiles.forEach((file) => {
  const fullPath = path.join(__dirname, file.path);
  const exists = fs.existsSync(fullPath);

  if (exists) {
    console.log(`✅ ${file.description}`);
    console.log(`   ${file.path}`);
  } else {
    console.log(`❌ ${file.description} - MISSING`);
    console.log(`   ${file.path}`);
    allChecksPass = false;
  }
  console.log();
});

// Check for environment variables
console.log('🔐 Checking Environment Variables:\n');

const envPath = path.join(__dirname, 'server', '.env');
let envContent = '';

if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
  envContent = fs.readFileSync(envPath, 'utf8');
} else {
  console.log('⚠️  .env file not found (this is normal if not set up yet)');
}

const requiredEnvVars = [
  'YOUTUBE_CLIENT_ID',
  'YOUTUBE_CLIENT_SECRET',
  'YOUTUBE_REDIRECT_URI',
  'YOUTUBE_REFRESH_TOKEN',
];

console.log('\nRequired environment variables:');
requiredEnvVars.forEach((varName) => {
  const hasVar = envContent.includes(varName);
  const hasValue = envContent.match(new RegExp(`${varName}=.+`));

  if (hasValue) {
    console.log(`✅ ${varName} - configured`);
  } else if (hasVar) {
    console.log(`⚠️  ${varName} - found but no value set`);
  } else {
    console.log(`❌ ${varName} - not found`);
  }
});

// Check for specific code patterns in key files
console.log('\n🔎 Checking Code Implementation:\n');

const codeChecks = [
  {
    file: 'client/src/pages/Video.jsx',
    pattern: 'YouTubePlayer',
    description: 'YouTube player component',
  },
  {
    file: 'client/src/pages/Video.jsx',
    pattern: 'isYouTubeVideo',
    description: 'YouTube video detection logic',
  },
  {
    file: 'client/src/components/PostCard.jsx',
    pattern: 'YouTubeEmbed',
    description: 'YouTube embed in PostCard',
  },
  {
    file: 'client/src/pages/dashboard/DashboardSettings.jsx',
    pattern: 'storageSettings',
    description: 'Storage settings state management',
  },
  {
    file: 'client/src/pages/dashboard/DashboardSettings.jsx',
    pattern: 'Video Storage Provider',
    description: 'Storage provider UI section',
  },
];

codeChecks.forEach((check) => {
  const fullPath = path.join(__dirname, check.file);

  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const hasPattern = content.includes(check.pattern);

    if (hasPattern) {
      console.log(`✅ ${check.description}`);
    } else {
      console.log(`❌ ${check.description} - NOT FOUND`);
      allChecksPass = false;
    }
  } else {
    console.log(`❌ ${check.description} - FILE MISSING`);
    allChecksPass = false;
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 VERIFICATION SUMMARY:\n');

if (allChecksPass) {
  console.log('✅ All code files are in place!');
  console.log('✅ Implementation is complete!');
  console.log('\n📝 Next Steps:');
  console.log('   1. Follow YOUTUBE_SETUP_GUIDE.md to configure YouTube API');
  console.log('   2. Add YouTube credentials to server/.env');
  console.log('   3. Run: node server/scripts/setupYouTube.js');
  console.log('   4. Restart your server');
  console.log('   5. Test the integration!');
} else {
  console.log('❌ Some files or implementations are missing.');
  console.log('   Please check the errors above.');
}

console.log('\n' + '='.repeat(60));
console.log(
  '\n💡 For detailed setup instructions, see: YOUTUBE_SETUP_GUIDE.md\n'
);
