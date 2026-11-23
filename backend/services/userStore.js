import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
const file = path.join(dir, 'users.json');

function load() {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return []; }
}
function save(users) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(users, null, 2));
}

export const findByEmail = (email) => load().find((u) => u.email === email.toLowerCase());

export function createUser({ name, email, passwordHash }) {
  const users = load();
  const user = { id: crypto.randomUUID(), name, email: email.toLowerCase(), passwordHash, createdAt: new Date().toISOString() };
  users.push(user);
  save(users);
  return user;
}
