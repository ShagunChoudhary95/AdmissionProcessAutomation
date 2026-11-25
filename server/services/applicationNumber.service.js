import crypto from 'crypto';
import Application from '../models/Application.js';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomCode(len = 6) {
  const bytes = crypto.randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) {
    out += CHARS[bytes[i] % CHARS.length];
  }
  return out;
}

export async function generateUniqueApplicationNumber() {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = `ADM${year}-${randomCode(6)}`;
    const exists = await Application.exists({ applicationNumber: candidate });
    if (!exists) return candidate;
  }
  throw new Error('Could not generate unique application number');
}

