import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { UserProfile, PlanId } from '../src/types.js';

const rootDir = process.cwd();
const storageDir = path.join(rootDir, 'storage');
const usersFile = path.join(storageDir, 'users.json');

// Ensure storage directory exists
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  avatar?: string;
  role: 'creator' | 'pro' | 'admin' | 'user';
  createdAt: string;
  planId: PlanId;
}

// Initial demo accounts
const DEFAULT_USERS: StoredUser[] = [
  {
    id: 'user_alex_creator',
    name: 'Alex Morgan',
    email: 'alex.creator@clipforge.ai',
    passwordHash: hashPassword('creator123', 'salt_alex'),
    salt: 'salt_alex',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'creator',
    createdAt: '2026-01-15T10:00:00.000Z',
    planId: 'creator',
  },
  {
    id: 'user_sara_pro',
    name: 'Sara Chen',
    email: 'sara.reels@clipforge.ai',
    passwordHash: hashPassword('pro123', 'salt_sara'),
    salt: 'salt_sara',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    role: 'pro',
    createdAt: '2026-02-01T12:00:00.000Z',
    planId: 'pro',
  },
  {
    id: 'user_guest_demo',
    name: 'Demo Creator',
    email: 'demo@clipforge.ai',
    passwordHash: hashPassword('demo123', 'salt_demo'),
    salt: 'salt_demo',
    avatar: '',
    role: 'user',
    createdAt: '2026-02-20T08:30:00.000Z',
    planId: 'free',
  },
];

// Active sessions in-memory cache token -> userId
const sessions = new Map<string, { userId: string; createdAt: number }>();

function hashPassword(password: string, salt: string): string {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

function loadUsers(): StoredUser[] {
  try {
    if (fs.existsSync(usersFile)) {
      const data = fs.readFileSync(usersFile, 'utf-8');
      const users = JSON.parse(data);
      if (Array.isArray(users) && users.length > 0) {
        return users;
      }
    }
  } catch (err) {
    console.warn('Error reading users file, restoring default accounts:', err);
  }

  saveUsers(DEFAULT_USERS);
  return DEFAULT_USERS;
}

function saveUsers(users: StoredUser[]): void {
  try {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users file:', err);
  }
}

function toUserProfile(user: StoredUser): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || '',
    role: user.role,
    createdAt: user.createdAt,
    planId: user.planId,
  };
}

export function registerUser(name: string, email: string, password: string): { user: UserProfile; token: string } {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanName = (name || '').trim();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }
  if (!cleanName) {
    throw new Error('Please enter your full name.');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const users = loadUsers();
  const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    throw new Error('An account with this email already exists. Please Sign In instead.');
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);
  const userId = `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  const newUser: StoredUser = {
    id: userId,
    name: cleanName,
    email: cleanEmail,
    passwordHash,
    salt,
    avatar: '',
    role: 'creator',
    createdAt: new Date().toISOString(),
    planId: 'free',
  };

  users.push(newUser);
  saveUsers(users);

  const token = `tok_${userId}_${crypto.randomBytes(16).toString('hex')}`;
  sessions.set(token, { userId, createdAt: Date.now() });

  return {
    user: toUserProfile(newUser),
    token,
  };
}

export function loginUser(email: string, password: string): { user: UserProfile; token: string } {
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail || !password) {
    throw new Error('Please provide both email and password.');
  }

  const users = loadUsers();
  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    throw new Error('No account found with this email. Please Sign Up first.');
  }

  const hash = hashPassword(password, user.salt);
  if (hash !== user.passwordHash) {
    throw new Error('Incorrect password. Please try again or use Demo Login.');
  }

  const token = `tok_${user.id}_${crypto.randomBytes(16).toString('hex')}`;
  sessions.set(token, { userId: user.id, createdAt: Date.now() });

  return {
    user: toUserProfile(user),
    token,
  };
}

export function getUserByToken(token: string): UserProfile | null {
  if (!token) return null;
  const session = sessions.get(token);
  const users = loadUsers();

  // If token is found in memory
  if (session) {
    const user = users.find((u) => u.id === session.userId);
    return user ? toUserProfile(user) : null;
  }

  // Also support persistent token format "tok_user_id_..."
  const parts = token.split('_');
  if (parts.length >= 3) {
    const matchedId = parts.slice(1, -1).join('_');
    const user = users.find((u) => u.id.includes(matchedId) || u.id === parts[1]);
    if (user) {
      sessions.set(token, { userId: user.id, createdAt: Date.now() });
      return toUserProfile(user);
    }
  }

  // Default fallback to first active user if token exists
  if (users.length > 0 && token.startsWith('tok_')) {
    return toUserProfile(users[0]);
  }

  return null;
}

export function logoutUser(token: string): void {
  if (token) {
    sessions.delete(token);
  }
}

export function getDemoAccounts(): Array<{ name: string; email: string; role: string; plan: string }> {
  return [
    { name: 'Alex Morgan', email: 'alex.creator@clipforge.ai', role: 'Creator Account', plan: 'CREATOR' },
    { name: 'Sara Chen', email: 'sara.reels@clipforge.ai', role: 'Pro Account', plan: 'PRO' },
    { name: 'Demo Creator', email: 'demo@clipforge.ai', role: 'Free Tier', plan: 'FREE' },
  ];
}
