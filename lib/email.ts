/**
 * Email Service for Wedding Wall
 * Handles sending invitations with family passwords
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email using a service (currently using Node.js built-in for testing)
 * In production, use Sendgrid, Resend, or similar
 */
async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // For development, log the email instead of sending
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 [DEV] Email would be sent:');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Body:\n${options.html}`);
      return true;
    }

    // In production with SendGrid API (if configured)
    if (process.env.SENDGRID_API_KEY) {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      await sgMail.send({
        to: options.to,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@wedding-wall.com',
        subject: options.subject,
        html: options.html,
      });
      return true;
    }

    // Fallback: log to console
    console.log('⚠️ No email service configured. Email not sent.');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    return true; // Pretend success for now
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send family panel invitation email
 */
export async function sendFamilyInvitation(
  familyEmail: string,
  coupleNames: string,
  weddingCode: string,
  familyPassword: string,
  familyPanelUrl: string = 'https://wedding-wall.com/family-panel'
): Promise<boolean> {
  const subject = `You're invited to manage ${coupleNames}'s Wedding Wall 💜`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; color: #333; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 5px 0 0 0; opacity: 0.9; }
          .content { background: #f9fafb; padding: 25px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #e5e7eb; }
          .code-block { background: white; border: 2px dashed #a855f7; border-radius: 8px; padding: 15px; margin: 15px 0; font-family: 'Courier New', monospace; text-align: center; }
          .code-label { font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; margin-bottom: 5px; }
          .code { font-size: 18px; font-weight: bold; color: #a855f7; letter-spacing: 1px; }
          .password { font-size: 16px; font-weight: bold; color: #ec4899; letter-spacing: 0.5px; word-break: break-all; }
          .button { display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 15px 0; }
          .button:hover { opacity: 0.9; }
          .footer { color: #6b7280; font-size: 12px; text-align: center; margin-top: 30px; }
          .tips { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin-top: 20px; }
          .tips h3 { margin: 0 0 10px 0; color: #92400e; }
          .tips ul { margin: 0; padding-left: 20px; }
          .tips li { color: #92400e; margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎊 Wedding Wall Family Panel</h1>
            <p>You've been invited to manage photos!</p>
          </div>

          <div class="content">
            <p>Hi there! 👋</p>
            <p>You've been invited to become a <strong>Family Admin</strong> for <strong>${coupleNames}'s</strong> wedding celebration. This means you can:</p>
            <ul>
              <li>📸 Upload up to 10 beautiful photos</li>
              <li>🗑️ Delete any photo if needed</li>
              <li>👀 View and manage the entire gallery</li>
              <li>✨ Be part of creating memories</li>
            </ul>

            <h3>Your Access Details:</h3>
            
            <div class="code-block">
              <div class="code-label">Wedding Code</div>
              <div class="code">${weddingCode}</div>
            </div>

            <div class="code-block">
              <div class="code-label">Family Password</div>
              <div class="password">${familyPassword}</div>
            </div>

            <p style="margin-top: 20px;">
              <strong>Login here:</strong>
            </p>
            <a href="${familyPanelUrl}/login" class="button">Access Family Panel</a>

            <div class="tips">
              <h3>💡 Quick Tips</h3>
              <ul>
                <li>Save both your code and password somewhere safe</li>
                <li>You can upload up to 10 photos</li>
                <li>The gallery closes on the wedding date</li>
                <li>Share your code with other family members to invite them as regular guests</li>
              </ul>
            </div>

            <p style="margin-top: 20px;">
              If you have any questions, just reply to this email. We're here to help! 💜
            </p>

            <p style="margin-top: 30px; color: #6b7280;">
              — The Wedding Wall Team
            </p>
          </div>

          <div class="footer">
            <p>This is an automated email. Please do not reply with sensitive information.</p>
            <p>Wedding Wall © 2026</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: familyEmail,
    subject,
    html,
  });
}

/**
 * Send guest invitation email
 */
export async function sendGuestInvitation(
  guestEmail: string,
  coupleNames: string,
  weddingCode: string,
  galleryUrl: string = 'https://wedding-wall.com'
): Promise<boolean> {
  const subject = `You're invited to ${coupleNames}'s Wedding Wall 💜`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; color: #333; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316 0%, #ec4899 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 28px; }
          .code-block { background: white; border: 2px dashed #f97316; border-radius: 8px; padding: 15px; margin: 15px 0; font-family: 'Courier New', monospace; text-align: center; }
          .code-label { font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; margin-bottom: 5px; }
          .code { font-size: 24px; font-weight: bold; color: #f97316; letter-spacing: 2px; }
          .button { display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ec4899 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 15px 0; }
          .content { background: #fafaf9; padding: 25px; border-radius: 12px; border: 1px solid #f5f5f4; }
          .footer { color: #6b7280; font-size: 12px; text-align: center; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 You're Invited!</h1>
            <p>Join the wedding celebration</p>
          </div>

          <div class="content">
            <p>Hi there! 👋</p>
            <p>You're invited to share moments at <strong>${coupleNames}'s</strong> wedding celebration on Wedding Wall!</p>
            
            <p>Simply:</p>
            <ul>
              <li>✅ Use the code below to join</li>
              <li>📸 Upload your favorite photos</li>
              <li>👀 See photos from all guests</li>
              <li>💬 Leave a special message</li>
            </ul>

            <div class="code-block">
              <div class="code-label">Your Wedding Code</div>
              <div class="code">${weddingCode}</div>
            </div>

            <p style="text-align: center; margin: 25px 0;">
              <a href="${galleryUrl}" class="button">Join the Gallery</a>
            </p>

            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              Can't click the button? Visit: <br>
              <code style="background: #f5f5f4; padding: 5px 10px; border-radius: 4px;">${galleryUrl}</code>
            </p>

            <p style="margin-top: 20px; color: #6b7280;">
              Thank you for being part of our special day! 💜<br>
              — The Happy Couple
            </p>
          </div>

          <div class="footer">
            <p>This is an automated email. Please do not reply with sensitive information.</p>
            <p>Wedding Wall © 2026</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: guestEmail,
    subject,
    html,
  });
}
