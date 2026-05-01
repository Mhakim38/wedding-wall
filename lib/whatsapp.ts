/**
 * WhatsApp Integration Utilities
 * Generates WhatsApp sharing links and messages
 */

export interface WhatsAppMessage {
  code: string;
  password: string;
  coupleName: string;
  eventDate: Date;
  validFromDate: Date;
  validToDate: Date;
  appUrl?: string;
}

/**
 * Generate WhatsApp message text with wedding credentials
 */
export function generateWhatsAppMessage(data: WhatsAppMessage): string {
  const eventDateStr = new Date(data.eventDate).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const validFromStr = new Date(data.validFromDate).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const validToStr = new Date(data.validToDate).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const appUrl = data.appUrl || 'https://wedding-wall.com/family-panel';

  return `🎊 Wedding Family Panel Access

Couple: ${data.coupleName}
Event: ${eventDateStr}

📱 Access Link: ${appUrl}
Code: ${data.code}
Password: ${data.password}

Access Valid: ${validFromStr} - ${validToStr}

How to Use:
1. Go to ${appUrl}
2. Enter the Code above
3. Enter the Password
4. View & share family photos!

Questions? Contact the couple 💕`;
}

/**
 * Generate WhatsApp Web share link
 * Opens WhatsApp web with pre-filled message
 */
export function generateWhatsAppLink(phoneNumber: string, message: string): string {
  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Remove any non-digit characters from phone number except leading +
  const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
  
  // WhatsApp Web share link format
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Alternative: Generate code-only message for quick sharing
 */
export function generateCodeOnlyMessage(code: string, password: string): string {
  return `Wedding Code: ${code}\nFamily Password: ${password}`;
}
