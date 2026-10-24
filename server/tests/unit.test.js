/**
 * INNOVRUSH 2K26 — Unit Test Suite
 * Tests core business logic, security helpers, timer calculations, and schemas in isolation.
 */

import assert from 'node:assert';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'innovrush_super_secure_jwt_secret_2026_nbkrist_autonomous';
const AUTHORIZED_ADMIN_EMAIL = 'admin@innovrush.nbkrist.org';
const TEST_PASSWORD = 'InnovRush@2026!';
const PASSWORD_HASH = bcrypt.hashSync(TEST_PASSWORD, 10);

// Helper: Calculate remaining timer seconds in isolation
function calculateRemainingSeconds(timer) {
  if (timer.status === 'WAITING') return timer.durationSeconds;
  if (!timer.startedAt) return timer.durationSeconds;

  const now = new Date();
  const startTime = new Date(timer.startedAt);
  const totalElapsedMs = now - startTime;
  const pausedMs = (timer.accumulatedPausedSeconds || 0) * 1000;
  const netElapsedSeconds = Math.max(0, Math.floor((totalElapsedMs - pausedMs) / 1000));
  return Math.max(0, timer.durationSeconds - netElapsedSeconds);
}

// Helper: Rate limiter simulation
function createRateLimiter() {
  const attempts = new Map();
  return {
    check(ip) {
      const record = attempts.get(ip);
      if (!record) return { allowed: true };
      if (record.lockedUntil && Date.now() < record.lockedUntil) {
        return { allowed: false, waitSec: Math.ceil((record.lockedUntil - Date.now()) / 1000) };
      }
      return { allowed: true };
    },
    recordFailure(ip) {
      const rec = attempts.get(ip) || { count: 0, lockedUntil: null };
      rec.count += 1;
      if (rec.count >= 5) {
        rec.lockedUntil = Date.now() + 60000;
      }
      attempts.set(ip, rec);
    },
    reset(ip) {
      attempts.delete(ip);
    }
  };
}

let passed = 0;
let failed = 0;

function it(description, fn) {
  try {
    fn();
    console.log(`  ✓ [UNIT PASS] ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ [UNIT FAIL] ${description}: ${err.message}`);
    failed++;
  }
}

console.log('\n============================================================');
console.log('  RUNNING UNIT TESTS — INNOVRUSH 2K26 CORE LOGIC');
console.log('============================================================\n');

// 1. Single-Admin Authorization Gate
it('Single-Admin Gate: Allows primary admin email', () => {
  const email = 'admin@innovrush.nbkrist.org';
  const isAuthorized = email.toLowerCase().trim() === AUTHORIZED_ADMIN_EMAIL;
  assert.strictEqual(isAuthorized, true);
});

it('Single-Admin Gate: Blocks arbitrary student / attacker email', () => {
  const unauthorizedEmails = [
    'student@gmail.com',
    'hacker@hack.org',
    'admin@otherdomain.com',
    'attacker@nbkrist.org'
  ];
  for (const email of unauthorizedEmails) {
    const isAuthorized = email.toLowerCase().trim() === AUTHORIZED_ADMIN_EMAIL;
    assert.strictEqual(isAuthorized, false, `Failed to block ${email}`);
  }
});

// 2. Password Hashing and Security
it('Password Verification: Validates official admin password against bcrypt hash', () => {
  const isValid = bcrypt.compareSync('InnovRush@2026!', PASSWORD_HASH);
  assert.strictEqual(isValid, true);
});

it('Password Verification: Rejects incorrect passwords', () => {
  const isInvalid = bcrypt.compareSync('WrongPassword123', PASSWORD_HASH);
  assert.strictEqual(isInvalid, false);
});

// 3. JWT Token Generation & Verification
it('JWT Session: Generates signed admin token with 12h expiration', () => {
  const token = jwt.sign(
    { adminId: AUTHORIZED_ADMIN_EMAIL, role: 'ADMIN', institution: 'N.B.K.R.I.S.T' },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
  assert(typeof token === 'string' && token.length > 20);

  const decoded = jwt.verify(token, JWT_SECRET);
  assert.strictEqual(decoded.adminId, AUTHORIZED_ADMIN_EMAIL);
  assert.strictEqual(decoded.role, 'ADMIN');
  assert.strictEqual(decoded.institution, 'N.B.K.R.I.S.T');
});

it('JWT Session: Rejects tampered token with invalid signature', () => {
  const token = jwt.sign({ adminId: 'intruder', role: 'ADMIN' }, 'wrong_secret');
  assert.throws(() => {
    jwt.verify(token, JWT_SECRET);
  }, /invalid signature/);
});

// 4. Authoritative Timer Computation
it('Timer Calculation: Returns full duration when status is WAITING', () => {
  const timer = { status: 'WAITING', durationSeconds: 5400, startedAt: null };
  const rem = calculateRemainingSeconds(timer);
  assert.strictEqual(rem, 5400);
});

it('Timer Calculation: Accurately subtracts elapsed seconds when RUNNING', () => {
  const tenMinutesAgo = new Date(Date.now() - 600 * 1000).toISOString();
  const timer = {
    status: 'RUNNING',
    durationSeconds: 5400,
    startedAt: tenMinutesAgo,
    accumulatedPausedSeconds: 0
  };
  const rem = calculateRemainingSeconds(timer);
  // Expected remaining: ~4800s (tolerance +/- 2 seconds)
  assert(rem >= 4798 && rem <= 4802, `Remaining was ${rem}, expected ~4800`);
});

it('Timer Calculation: Never returns negative seconds if duration has passed', () => {
  const threeHoursAgo = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
  const timer = {
    status: 'RUNNING',
    durationSeconds: 5400,
    startedAt: threeHoursAgo,
    accumulatedPausedSeconds: 0
  };
  const rem = calculateRemainingSeconds(timer);
  assert.strictEqual(rem, 0);
});

// 5. Rate Limiting Protection
it('Rate Limiting: Allows normal login attempts up to threshold', () => {
  const limiter = createRateLimiter();
  const ip = '192.168.1.100';
  for (let i = 0; i < 4; i++) {
    assert.strictEqual(limiter.check(ip).allowed, true);
    limiter.recordFailure(ip);
  }
});

it('Rate Limiting: Locks out IP after 5 consecutive failures', () => {
  const limiter = createRateLimiter();
  const ip = '192.168.1.101';
  for (let i = 0; i < 5; i++) {
    limiter.recordFailure(ip);
  }
  const check = limiter.check(ip);
  assert.strictEqual(check.allowed, false);
  assert(check.waitSec > 0);
});

console.log(`\nUnit Tests Finished: Passed: ${passed} | Failed: ${failed}\n`);
if (failed > 0) process.exit(1);
