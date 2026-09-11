import test from 'node:test';
import assert from 'node:assert/strict';
import { generateDropCode, generateUniqueDropCode } from '../src/utils/generateCode.js';
import { validateExpiry, validateMaxDownloads } from '../src/middleware/validateDrop.js';
import { AppError } from '../src/utils/errors.js';

test('generateDropCode returns uppercase alphanumeric characters', () => {
  const code = generateDropCode();
  assert.match(code, /^[A-Z0-9]{6}$/);
});

test('generateUniqueDropCode avoids existing values', () => {
  const code = generateUniqueDropCode(['ABC123', 'XYZ999']);
  assert.ok(code.length >= 6 && code.length <= 8);
  assert.ok(!['ABC123', 'XYZ999'].includes(code));
});

test('validateExpiry accepts valid durations', () => {
  assert.doesNotThrow(() => validateExpiry('30m'));
  assert.doesNotThrow(() => validateExpiry('1h'));
});

test('validateExpiry rejects invalid durations', () => {
  assert.throws(() => validateExpiry('2d'), (error) => error instanceof AppError && error.code === 'INVALID_EXPIRY');
});

test('validateMaxDownloads rejects invalid limits', () => {
  assert.throws(() => validateMaxDownloads(0), (error) => error instanceof AppError && error.code === 'INVALID_DOWNLOAD_LIMIT');
});

test('validateMaxDownloads permits unlimited or valid values', () => {
  assert.doesNotThrow(() => validateMaxDownloads(null));
  assert.doesNotThrow(() => validateMaxDownloads(3));
});
