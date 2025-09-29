import bcrypt from 'bcryptjs';

export function hashPassword(plain) {
  const p = String(plain ?? '').normalize().trim()
  return bcrypt.hash(p, 10);
}

export async function verifyPassword(plain, hash) {
  if (typeof hash !== 'string' || hash.length !== 60 || !hash.startsWith('$2')) {
    return false                                   // bad hash shape
  }
  const p = String(plain ?? '').normalize().trim()
  return await bcrypt.compare(p, hash)             // compare(plain, hash)
}
