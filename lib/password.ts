import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Compare a plain text password with a hashed password
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    const match = await bcrypt.compare(plainPassword, hashedPassword);
    return match;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

/**
 * Generate a random family-friendly password
 * Format: Word-Number-Symbol (e.g., "Symphony-42-Gold")
 */
export function generateFamilyPassword(): string {
  const adjectives = [
    'Happy', 'Joyful', 'Bright', 'Cheerful', 'Golden',
    'Silver', 'Sparkle', 'Melody', 'Harmony', 'Blissful'
  ];
  
  const nouns = [
    'Love', 'Heart', 'Dream', 'Memory', 'Moment',
    'Joy', 'Smile', 'Star', 'Bloom', 'Gift'
  ];

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 100) + 1;

  return `${adjective}${noun}${number}`;
}
