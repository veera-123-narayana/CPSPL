/**
 * INNOVRUSH 2K26 — AUTOMATED SECURITY & WORKFLOW VERIFICATION SUITE
 * Validates Section 16 & Section 19 requirements against the running server.
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000';

async function runTests() {
  console.log(`\n============================================================`);
  console.log(`  INNOVRUSH 2K26 — SECURITY & COMPLIANCE TEST SUITE`);
  console.log(`  Target: ${BASE_URL}`);
  console.log(`============================================================\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Unauthenticated admin overview request must be rejected (401)
    const unauthOverview = await fetch(`${BASE_URL}/api/admin/overview`);
    assert(unauthOverview.status === 401, 'Requirement 1: Unauthenticated user cannot access /api/admin/overview (401)');

    // 2. Unauthenticated timer modification must be rejected (401)
    const unauthTimer = await fetch(`${BASE_URL}/api/admin/timer/start`, { method: 'POST' });
    assert(unauthTimer.status === 401, 'Requirement 2: Unauthenticated user cannot start timer (401)');

    // 3. Unauthenticated problem launch must be rejected (401)
    const unauthLaunch = await fetch(`${BASE_URL}/api/admin/problems/PS-01/launch`, { method: 'POST' });
    assert(unauthLaunch.status === 401, 'Requirement 3: Unauthenticated user cannot launch problem (401)');

    // 4. Unauthenticated constraint release must be rejected (401)
    const unauthRelease = await fetch(`${BASE_URL}/api/admin/constraints/release`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ constraintIds: ['SC-01'] })
    });
    assert(unauthRelease.status === 401, 'Requirement 4: Unauthenticated user cannot release constraints (401)');

    // 5. Public problem statements must NOT return unpublished/draft problems
    const publicProblemsRes = await fetch(`${BASE_URL}/api/public/problems`);
    const publicProblems = await publicProblemsRes.json();
    const hasDraftsInPublicList = publicProblems.some(p => p.publicationStatus !== 'PUBLISHED');
    assert(!hasDraftsInPublicList, 'Requirement 5: Public problem list never leaks draft/unpublished records');

    // 6. Direct access to an unpublished problem statement must return 404
    // Find an unpublished problem ID
    const sampleUnpublishedId = 'PS-04';
    const directUnpublishedRes = await fetch(`${BASE_URL}/api/public/problems/${sampleUnpublishedId}`);
    assert(directUnpublishedRes.status === 404, `Requirement 6: Direct GET /api/public/problems/${sampleUnpublishedId} returns 404 when unpublished`);

    // 7. Public constraints endpoint must NOT return draft constraints
    const publicConstraintsRes = await fetch(`${BASE_URL}/api/public/constraints`);
    const publicConstraints = await publicConstraintsRes.json();
    const hasDraftConstraintsInPublic = publicConstraints.some(c => c.publicationStatus !== 'RELEASED');
    assert(!hasDraftConstraintsInPublic, 'Requirement 7: Public constraints endpoint never leaks unreleased drafts');

    // 8. Admin login with invalid password must fail (401)
    const invalidLogin = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@innovrush.nbkrist.org', password: 'WrongPassword123' })
    });
    assert(invalidLogin.status === 401, 'Requirement 8: Invalid admin credentials correctly rejected (401)');

    // 9. Admin login with valid credentials must succeed and return JWT
    const validLogin = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@innovrush.nbkrist.org', password: 'InnovRush@2026!' })
    });
    assert(validLogin.status === 200, 'Requirement 9: Valid admin login succeeds (200)');
    const loginData = await validLogin.json();
    const token = loginData.token;
    assert(Boolean(token), 'Requirement 9b: Login response contains valid JWT token');

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // 10. Admin can access overview with token
    const authOverview = await fetch(`${BASE_URL}/api/admin/overview`, { headers: authHeaders });
    assert(authOverview.status === 200, 'Requirement 10: Authenticated admin can view overview');

    // 11. Admin launches PS-01
    const launchRes = await fetch(`${BASE_URL}/api/admin/problems/PS-01/launch`, {
      method: 'POST',
      headers: authHeaders
    });
    assert(launchRes.status === 200, 'Requirement 11: Admin can launch PS-01');

    // 12. Participant can now access published PS-01
    const publishedCheckRes = await fetch(`${BASE_URL}/api/public/problems/PS-01`);
    assert(publishedCheckRes.status === 200, 'Requirement 12: Published PS-01 is now accessible to participants');
    const ps01Data = await publishedCheckRes.json();
    assert(ps01Data.title === 'AI-Based Student Early Warning System', 'Requirement 12b: PS-01 title matches source verbatim');
    assert(Array.isArray(ps01Data.functionalScope) && ps01Data.functionalScope.length > 0, 'Requirement 12c: PS-01 functional scope intact');

    // 13. Admin starts the timer
    const timerStartRes = await fetch(`${BASE_URL}/api/admin/timer/start`, {
      method: 'POST',
      headers: authHeaders
    });
    assert(timerStartRes.status === 200, 'Requirement 13: Admin can start the authoritative timer');

    // 14. Public timer reflects running state and remaining seconds
    const timerCheckRes = await fetch(`${BASE_URL}/api/public/timer`);
    const timerData = await timerCheckRes.json();
    assert(timerData.status === 'RUNNING', 'Requirement 14: Public timer reflects RUNNING status');
    assert(timerData.remainingSeconds <= 5400 && timerData.remainingSeconds > 0, 'Requirement 14b: Authoritative remaining seconds computed accurately');

    // 15. Admin releases surprise constraints
    const releaseRes = await fetch(`${BASE_URL}/api/admin/constraints/release`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ constraintIds: ['SC-01'] })
    });
    assert(releaseRes.status === 200, 'Requirement 15: Admin can explicitly release surprise constraints');

    // 16. Participant can now see released constraint SC-01
    const releasedConstraintsCheck = await fetch(`${BASE_URL}/api/public/constraints`);
    const releasedList = await releasedConstraintsCheck.json();
    const sc01 = releasedList.find(c => c.constraintId === 'SC-01');
    assert(Boolean(sc01), 'Requirement 16: Released constraint SC-01 is visible to participants');
    assert(sc01 && sc01.title === 'Resilient Offline Fallback Layer', 'Requirement 16b: SC-01 content matches release');

    // 17. Audit log contains all performed actions
    const auditRes = await fetch(`${BASE_URL}/api/admin/audit-log`, { headers: authHeaders });
    const auditLog = await auditRes.json();
    assert(auditLog.some(e => e.actionType === 'PROBLEM_LAUNCHED'), 'Requirement 17: Problem launch logged in audit trail');
    assert(auditLog.some(e => e.actionType === 'TIMER_STARTED'), 'Requirement 17b: Timer start logged in audit trail');
    assert(auditLog.some(e => e.actionType === 'CONSTRAINTS_RELEASED'), 'Requirement 17c: Constraint release logged in audit trail');

    console.log(`\n============================================================`);
    console.log(`  SECURITY & COMPLIANCE TEST SUMMARY`);
    console.log(`  Passed: ${passed} | Failed: ${failed}`);
    console.log(`============================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
