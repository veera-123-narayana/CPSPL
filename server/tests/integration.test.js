/**
 * INNOVRUSH 2K26 — Integration Test Suite
 * Tests full client-server API lifecycle, authentication, problem publishing, timer state, constraints, and real-time sync.
 */

import assert from 'node:assert';
import WebSocket from 'ws';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000';
const WS_URL = process.env.TEST_WS_URL || 'ws://localhost:5000';

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓ [INTEGRATION PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ [INTEGRATION FAIL] ${name}: ${err.message}`);
    failed++;
  }
}

console.log('\n============================================================');
console.log('  RUNNING INTEGRATION TESTS — END-TO-END PLATFORM API');
console.log(`  Target: ${BASE_URL}`);
console.log('============================================================\n');

async function runIntegration() {
  let adminToken = null;

  // 1. Health & Public Event Metadata
  await test('Public API: /api/public/event returns 200 with institution branding', async () => {
    const res = await fetch(`${BASE_URL}/api/public/event`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(data.institution.includes('N.B.K.R'), `Expected institution branding, got: ${data.institution}`);
    assert(data.name.includes('INNOVRUSH'), `Expected event name, got: ${data.name}`);
    assert(data.domainCounts && typeof data.domainCounts.totalPublished === 'number');
  });

  // 2. Public Timer Endpoint
  await test('Public API: /api/public/timer returns active timer state', async () => {
    const res = await fetch(`${BASE_URL}/api/public/timer`);
    assert.strictEqual(res.status, 200);
    const timer = await res.json();
    assert(typeof timer.durationSeconds === 'number');
    assert(typeof timer.remainingSeconds === 'number');
    assert(['READY', 'WAITING', 'RUNNING', 'PAUSED', 'TIME EXPIRED'].includes(timer.status), `Unexpected timer status: ${timer.status}`);
  });

  // 3. Security: Unauthorized Admin Access Rejection
  await test('Security Gate: Rejects unauthenticated request to /api/admin/overview with 401', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/overview`);
    assert.strictEqual(res.status, 401);
  });

  // 4. Security: Block Public Sign-up Endpoints
  await test('Security Gate: All public registration/signup endpoints return 403 Forbidden', async () => {
    const endpoints = ['/api/signup', '/api/register', '/api/admin/signup', '/api/auth/register'];
    for (const ep of endpoints) {
      const res = await fetch(`${BASE_URL}${ep}`, { method: 'POST' });
      assert.strictEqual(res.status, 403, `Failed to block ${ep}`);
    }
  });

  // 5. Security: Reject Non-Admin Email Login
  await test('Security Gate: Rejects login with non-admin email with 403', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student_team1@test.com', password: 'anyPassword' })
    });
    assert.strictEqual(res.status, 403);
  });

  // 6. Security: Reject Incorrect Password
  await test('Security Gate: Rejects valid admin email with incorrect password with 401', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@innovrush.nbkrist.org', password: 'WrongPassword999!' })
    });
    assert.strictEqual(res.status, 401);
  });

  // 7. Successful Single-Admin Login & Token Issue
  await test('Authentication: Valid admin logs in successfully and receives JWT session token', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@innovrush.nbkrist.org', password: 'InnovRush@2026!' })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(data.token, 'Expected JWT token in response');
    assert.strictEqual(data.admin.email, 'admin@innovrush.nbkrist.org');
    assert.strictEqual(data.admin.role, 'ADMIN');
    adminToken = data.token;
  });

  // 8. Authorized Admin Overview Access
  await test('Admin API: Authenticated admin can view system overview metrics', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/overview`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(data.stats && typeof data.stats.totalProblems === 'number');
    assert(data.eventStatus && data.timer);
  });

  // 9. Problem Statement Querying
  await test('Public API: /api/public/problems returns published problem list', async () => {
    const res = await fetch(`${BASE_URL}/api/public/problems`);
    assert.strictEqual(res.status, 200);
    const problems = await res.json();
    assert(Array.isArray(problems));
    for (const p of problems) {
      assert(p.problemId && p.title && p.domain);
      assert.strictEqual(p.publicationStatus, 'PUBLISHED');
    }
  });

  // 10. Audit Logging Verification
  await test('Audit Trail: Admin actions are recorded in immutable audit log', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/audit-log`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.status, 200);
    const audit = await res.json();
    assert(Array.isArray(audit) && audit.length > 0);
  });

  // 11. Real-Time WebSocket Handshake
  await test('Real-Time WebSocket: Client connects and receives INITIAL_SYNC message', async () => {
    await new Promise((resolve, reject) => {
      const ws = new WebSocket(WS_URL);
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('WebSocket initial sync timeout'));
      }, 5000);

      ws.on('open', () => {});
      ws.on('message', (raw) => {
        try {
          const msg = JSON.parse(raw.toString());
          if (msg.type === 'INITIAL_SYNC') {
            clearTimeout(timeout);
            assert(msg.event && msg.timer, 'INITIAL_SYNC message must contain event and timer');
            ws.close();
            resolve();
          }
        } catch (e) {
          clearTimeout(timeout);
          ws.close();
          reject(e);
        }
      });
      ws.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  });

  console.log(`\nIntegration Tests Finished: Passed: ${passed} | Failed: ${failed}\n`);
  if (failed > 0) process.exit(1);
}

runIntegration().catch(err => {
  console.error('Fatal Integration Test Error:', err);
  process.exit(1);
});
