export const welcomeEmailTemplate = (user) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to MySoov!</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.displayName || user.username}!</h2>
          <p>Thank you for joining MySoov. We're excited to have you on board!</p>
          <p>Your account has been successfully created. You can now start exploring our platform and all the features we offer.</p>
          <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
          <p style="text-align: center;">
            <a href="${process.env.CLIENT_URL}/feeds" class="button">Get Started</a>
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} MySoov. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const passwordResetTemplate = (user, resetUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .button { display: inline-block; padding: 10px 20px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .warning { background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.displayName || user.username}!</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <div class="warning">
            <strong>Security Note:</strong> This link will expire in 1 hour for security reasons. If you didn't request a password reset, please ignore this email.
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all;">${resetUrl}</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} MySoov. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const purchaseConfirmationTemplate = (user, purchaseDetails) => {
  const {
    type,
    filmName,
    planName,
    amount,
    currency,
    date,
    transactionId,
  } = purchaseDetails;

  const isPlanPurchase = type === 'subscription';
  const title = isPlanPurchase ? 'Subscription Confirmation' : 'Purchase Confirmation';
  const itemName = isPlanPurchase ? planName : filmName;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .details { background-color: white; padding: 15px; border: 1px solid #ddd; margin: 15px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .detail-label { font-weight: bold; }
        .total { font-size: 18px; font-weight: bold; color: #FF9800; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
        </div>
        <div class="content">
          <h2>Thank you for your purchase, ${user.displayName || user.username}!</h2>
          <p>Your payment has been successfully processed. Here are the details of your purchase:</p>
          
          <div class="details">
            <div class="detail-row">
              <span class="detail-label">${isPlanPurchase ? 'Plan' : 'Item'}:</span>
              <span>${itemName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Amount:</span>
              <span class="total">${currency.toUpperCase()} ${amount}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span>${new Date(date).toLocaleDateString()}</span>
            </div>
            ${transactionId ? `
            <div class="detail-row">
              <span class="detail-label">Transaction ID:</span>
              <span>${transactionId}</span>
            </div>
            ` : ''}
          </div>

          ${isPlanPurchase ? `
            <p>Your subscription is now active and you can enjoy all the premium features!</p>
          ` : `
            <p>You can now access your purchased content anytime from your library.</p>
          `}
          
          <p>If you have any questions about your purchase, please don't hesitate to contact our support team.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} MySoov. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
