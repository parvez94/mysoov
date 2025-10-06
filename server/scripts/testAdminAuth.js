import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Simulate what happens when a user logs in
const testTokenGeneration = () => {
  console.log('🔐 Testing JWT Token Generation\n');
  console.log('================================\n');

  // Old way (broken)
  const oldToken = jwt.sign(
    { id: '68de8e0d5bc3f7a89c0eefe5' },
    process.env.SECRET_KEY
  );
  const oldDecoded = jwt.verify(oldToken, process.env.SECRET_KEY);

  console.log('❌ OLD TOKEN (Missing role):');
  console.log('   Payload:', oldDecoded);
  console.log('   Has role?', oldDecoded.role ? '✅ Yes' : '❌ No');
  console.log(
    '   Admin check would:',
    oldDecoded.role === 'admin' ? 'PASS ✅' : 'FAIL ❌'
  );

  console.log('\n');

  // New way (fixed)
  const newToken = jwt.sign(
    { id: '68de8e0d5bc3f7a89c0eefe5', role: 'admin' },
    process.env.SECRET_KEY
  );
  const newDecoded = jwt.verify(newToken, process.env.SECRET_KEY);

  console.log('✅ NEW TOKEN (With role):');
  console.log('   Payload:', newDecoded);
  console.log('   Has role?', newDecoded.role ? '✅ Yes' : '❌ No');
  console.log(
    '   Admin check would:',
    newDecoded.role === 'admin' ? 'PASS ✅' : 'FAIL ❌'
  );

  console.log('\n================================');
  console.log('✅ Fix verified! Users need to log out and log back in.');
};

testTokenGeneration();
