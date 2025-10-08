import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

async function testAdminAPI() {
  try {
    console.log('🧪 Testing Admin Storage Settings API...\n');

    const API_URL = process.env.API_URL || 'http://localhost:5100';
    const endpoint = `${API_URL}/api/v1/admin/storage-settings`;

    console.log(`📡 Calling: ${endpoint}\n`);

    // Note: This will fail with 401 if not authenticated, but we can see the structure
    try {
      const response = await axios.get(endpoint, {
        withCredentials: true,
      });

      console.log('✅ API Response:');
      console.log(JSON.stringify(response.data, null, 2));
      console.log('');

      // Check if youtubeConfigured field exists
      if (response.data.youtubeConfigured !== undefined) {
        console.log(
          '✅ youtubeConfigured field present:',
          response.data.youtubeConfigured
        );
      } else {
        console.log('❌ youtubeConfigured field missing!');
      }

      // Check if storageProvider field exists
      if (response.data.storageProvider !== undefined) {
        console.log(
          '✅ storageProvider field present:',
          response.data.storageProvider
        );
      } else {
        console.log('❌ storageProvider field missing!');
      }
    } catch (error) {
      if (error.response) {
        console.log(`⚠️  API returned status ${error.response.status}`);
        if (error.response.status === 401) {
          console.log(
            '   (This is expected - endpoint requires authentication)'
          );
          console.log('   The endpoint is working, just needs admin login.\n');
        } else {
          console.log('   Response:', error.response.data);
        }
      } else {
        console.log('❌ Could not connect to server');
        console.log('   Make sure the server is running on', API_URL);
        console.log('   Error:', error.message);
      }
    }

    console.log('\n📋 Summary:');
    console.log('   To test in browser:');
    console.log('   1. Login as admin');
    console.log('   2. Go to Dashboard Settings');
    console.log('   3. Check Storage Settings section');
    console.log('   4. YouTube option should show as "Enabled" ✅');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminAPI();
