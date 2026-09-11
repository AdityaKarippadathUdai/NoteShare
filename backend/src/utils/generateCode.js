import crypto from 'crypto';

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function generateDropCode(length = 6) {
  const validLength = length >= 6 && length <= 8 ? length : 6;
  let code = '';

  for (let i = 0; i < validLength; i += 1) {
    const index = crypto.randomInt(0, ALPHABET.length);
    code += ALPHABET[index];
  }

  return code;
}

export function generateUniqueDropCode(existingCodes = []) {
  let attempts = 0;
  while (attempts < 20) {
    const code = generateDropCode(Math.random() > 0.7 ? 8 : 6);
    if (!existingCodes.includes(code)) {
      return code;
    }
    attempts += 1;
  }

  throw new Error('Unable to generate a unique drop code.');
}

export default generateDropCode;
