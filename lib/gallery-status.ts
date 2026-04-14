/**
 * Check if a wedding gallery is still active based on subscription
 */
export function isGalleryActive(subscriptionEndDate: Date | string): boolean {
  const endDate = typeof subscriptionEndDate === 'string' 
    ? new Date(subscriptionEndDate) 
    : subscriptionEndDate;
  
  return new Date() < endDate;
}

/**
 * Get gallery status message
 */
export function getGalleryStatus(subscriptionEndDate: Date | string): {
  isActive: boolean;
  message: string;
  daysRemaining: number;
} {
  const endDate = typeof subscriptionEndDate === 'string' 
    ? new Date(subscriptionEndDate) 
    : subscriptionEndDate;
  
  const now = new Date();
  const isActive = now < endDate;
  const msRemaining = endDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

  let message = '';
  if (isActive) {
    if (daysRemaining === 0) {
      message = 'Gallery closes today';
    } else if (daysRemaining === 1) {
      message = '1 day remaining';
    } else {
      message = `${daysRemaining} days remaining`;
    }
  } else {
    message = 'Gallery is now closed';
  }

  return { isActive, message, daysRemaining };
}

/**
 * Calculate subscription end date from event date and package
 */
export function calculateSubscriptionEnd(eventDate: Date | string, packageDays: number): Date {
  const date = typeof eventDate === 'string' ? new Date(eventDate) : eventDate;
  return new Date(date.getTime() + packageDays * 24 * 60 * 60 * 1000);
}
