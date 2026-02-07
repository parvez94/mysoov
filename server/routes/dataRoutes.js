import express from 'express';
import crypto from 'crypto';

const router = express.Router();

router.get('/facebook-data-deletion', (req, res) => {
  res.json({
    message: 'Facebook Data Deletion Callback Endpoint',
    status: 'active',
    method: 'POST',
    description: 'This endpoint receives data deletion requests from Facebook. Use POST method with signed_request parameter.',
  });
});

router.post('/facebook-data-deletion', async (req, res) => {
  try {
    const signedRequest = req.body.signed_request;
    
    if (!signedRequest) {
      return res.status(400).json({ error: 'Missing signed_request parameter' });
    }

    const data = parseSignedRequest(signedRequest, process.env.FACEBOOK_APP_SECRET);
    
    if (!data) {
      return res.status(400).json({ error: 'Invalid signed_request' });
    }

    const userId = data.user_id;
    
    const confirmationCode = crypto.randomBytes(16).toString('hex');
    const statusUrl = `${process.env.CLIENT_URL || process.env.FRONTEND_URL || 'https://mysoov.tv'}/data-deletion-status/${confirmationCode}`;


    return res.json({
      url: statusUrl,
      confirmation_code: confirmationCode,
    });
  } catch (error) {
    console.error('Error processing Facebook data deletion request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

function parseSignedRequest(signedRequest, appSecret) {
  if (!signedRequest || !appSecret) {
    return null;
  }

  const [encodedSig, payload] = signedRequest.split('.');
  
  if (!encodedSig || !payload) {
    return null;
  }

  const sig = base64UrlDecode(encodedSig);
  const data = JSON.parse(base64UrlDecode(payload));

  const expectedSig = crypto
    .createHmac('sha256', appSecret)
    .update(payload)
    .digest();

  if (!crypto.timingSafeEqual(sig, expectedSig)) {
    console.error('Invalid signature');
    return null;
  }

  return data;
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  
  while (base64.length % 4) {
    base64 += '=';
  }
  
  return Buffer.from(base64, 'base64');
}

router.get('/data-deletion-status/:confirmationCode', (req, res) => {
  const { confirmationCode } = req.params;
  
  res.json({
    message: 'Your data deletion request has been received and is being processed.',
    confirmation_code: confirmationCode,
    status: 'pending',
    estimated_completion: '30 days',
  });
});

export default router;
