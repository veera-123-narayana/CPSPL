import express from 'express';
import fs from 'fs';
import cors from 'cors';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getStore, saveStore, calculateRemainingSeconds, recordAuditAction } from './data/store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Load .env variables if present
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
      if (!process.env[key]) process.env[key] = val;
    }
  });
}

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'innovrush_super_secure_jwt_secret_2026_nbkrist_autonomous';

// Default Admin Credentials
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@innovrush.nbkrist.org';
// Default password hash for "NiRUSH2k26"
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'NiRUSH2k26', 10);

app.use(cors());
app.use(express.json());

// ==========================================
// WEBSOCKET BROADCASTING
// ==========================================
const connectedClients = new Set();

wss.on('connection', (ws) => {
  connectedClients.add(ws);
  
  // Send initial sync payload
  const store = getStore();
  const remainingSeconds = calculateRemainingSeconds(store.timer);
  
  ws.send(JSON.stringify({
    type: 'INITIAL_SYNC',
    serverTime: new Date().toISOString(),
    event: {
      status: store.event.status,
      rules: store.event.rules,
      publishedCounts: {
        total: store.problems.filter(p => p.publicationStatus === 'PUBLISHED').length,
        aiMl: store.problems.filter(p => p.domain === 'AI / MACHINE LEARNING' && p.publicationStatus === 'PUBLISHED').length,
        dataAnalytics: store.problems.filter(p => p.domain === 'DATA ANALYTICS' && p.publicationStatus === 'PUBLISHED').length,
        webDev: store.problems.filter(p => p.domain === 'WEB DEVELOPMENT' && p.publicationStatus === 'PUBLISHED').length
      }
    },
    timer: {
      status: store.timer.status,
      durationSeconds: store.timer.durationSeconds,
      remainingSeconds,
      startedAt: store.timer.startedAt,
      pausedAt: store.timer.pausedAt
    }
  }));

  ws.on('close', () => {
    connectedClients.delete(ws);
  });
});

export function broadcast(eventType, payload) {
  const store = getStore();
  const message = JSON.stringify({
    type: eventType,
    serverTime: new Date().toISOString(),
    payload,
    timerSnapshot: {
      status: store.timer.status,
      remainingSeconds: calculateRemainingSeconds(store.timer),
      durationSeconds: store.timer.durationSeconds
    }
  });

  for (const client of connectedClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

// ==========================================
// AUTHENTICATION & RATE LIMITING
// ==========================================
const loginAttempts = new Map(); // ip/identifier -> { count, lockedUntil }

function checkRateLimit(identifier) {
  const now = Date.now();
  const record = loginAttempts.get(identifier);
  if (!record) return { allowed: true };
  if (record.lockedUntil && now < record.lockedUntil) {
    const waitSec = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, message: `Too many failed attempts. Locked for ${waitSec} seconds.` };
  }
  if (record.lockedUntil && now >= record.lockedUntil) {
    loginAttempts.delete(identifier);
    return { allowed: true };
  }
  return { allowed: true };
}

function recordFailedLogin(identifier) {
  const now = Date.now();
  const record = loginAttempts.get(identifier) || { count: 0, lockedUntil: null };
  record.count += 1;
  if (record.count >= 5) {
    record.lockedUntil = now + 5 * 60 * 1000; // 5 min lockout
  }
  loginAttempts.set(identifier, record);
}

function clearLoginAttempts(identifier) {
  loginAttempts.delete(identifier);
}

// Middleware: Require Admin Authentication
export function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or malformed authorization header.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges.' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired access token.' });
  }
}

// ==========================================
// PUBLIC PARTICIPANT APIS
// Strict server-side filtering: ZERO confidential leaks!
// ==========================================

// Public Event Metadata & Live Status
app.get('/api/public/event', (req, res) => {
  const store = getStore();
  const publishedProblems = store.problems.filter(p => p.publicationStatus === 'PUBLISHED');
  
  res.json({
    eventId: store.event.eventId,
    name: store.event.name,
    tagline: store.event.tagline,
    institution: store.event.institution,
    association: store.event.association,
    eventDate: store.event.eventDate,
    eventTime: store.event.eventTime,
    status: store.event.status,
    contactEmail: store.event.contactEmail,
    instagram: store.event.instagram,
    coordinators: store.event.coordinators,
    rules: store.event.rules,
    domainCounts: {
      aiMl: publishedProblems.filter(p => p.domain === 'AI / MACHINE LEARNING').length,
      dataAnalytics: publishedProblems.filter(p => p.domain === 'DATA ANALYTICS').length,
      webDev: publishedProblems.filter(p => p.domain === 'WEB DEVELOPMENT').length,
      totalPublished: publishedProblems.length
    }
  });
});

// Public Authoritative Timer State
app.get('/api/public/timer', (req, res) => {
  const store = getStore();
  const remainingSeconds = calculateRemainingSeconds(store.timer);

  res.json({
    status: store.timer.status,
    durationSeconds: store.timer.durationSeconds,
    remainingSeconds,
    startedAt: store.timer.startedAt,
    pausedAt: store.timer.pausedAt,
    plannedStartAt: store.timer.plannedStartAt,
    serverTime: new Date().toISOString()
  });
});

// Public Problem Statements (ONLY PUBLISHED RECORDS)
app.get('/api/public/problems', (req, res) => {
  const store = getStore();
  // Filter strictly to published problems only!
  const published = store.problems
    .filter(p => p.publicationStatus === 'PUBLISHED')
    .map(p => ({
      problemId: p.problemId,
      title: p.title,
      domain: p.domain,
      summary: p.summary,
      publicationStatus: p.publicationStatus,
      publishedAt: p.publishedAt
    }));

  res.json(published);
});

// Public Problem Statement Detail (BY ID)
app.get('/api/public/problems/:problemId', (req, res) => {
  const store = getStore();
  const problem = store.problems.find(p => p.problemId.toUpperCase() === req.params.problemId.toUpperCase());
  
  // Security Check: If it doesn't exist or is DRAFT, refuse to disclose!
  if (!problem || problem.publicationStatus !== 'PUBLISHED') {
    return res.status(404).json({
      error: `Problem statement ${req.params.problemId} is not published or does not exist.`
    });
  }

  // Find released constraints that apply to this problem or to all domains
  const releasedConstraints = store.constraints
    .filter(c => c.publicationStatus === 'RELEASED')
    .filter(c => c.scope === 'ALL DOMAINS' || c.problemId === problem.problemId || c.scope === problem.domain)
    .map(c => ({
      constraintId: c.constraintId,
      scope: c.scope,
      title: c.title,
      description: c.description,
      releasedAt: c.releasedAt
    }));

  res.json({
    problemId: problem.problemId,
    title: problem.title,
    domain: problem.domain,
    summary: problem.summary,
    problemDescription: problem.problemDescription,
    challenge: problem.challenge,
    expectedOutput: problem.expectedOutput,
    functionalScope: problem.functionalScope,
    rulesReferences: problem.rulesReferences,
    evaluationCriteria: problem.evaluationCriteria,
    publicationStatus: problem.publicationStatus,
    publishedAt: problem.publishedAt,
    releasedConstraints // Will be empty until authorized release!
  });
});

// Public Constraints (ONLY RELEASED CONSTRAINTS)
app.get('/api/public/constraints', (req, res) => {
  const store = getStore();
  // Strictly filter to RELEASED status only!
  const released = store.constraints
    .filter(c => c.publicationStatus === 'RELEASED')
    .map(c => ({
      constraintId: c.constraintId,
      scope: c.scope,
      problemId: c.problemId,
      title: c.title,
      description: c.description,
      publicationStatus: 'RELEASED',
      releasedAt: c.releasedAt
    }));

  res.json(released);
});

// ==========================================
// PROTECTED ADMIN APIS
// ==========================================

// Block all sign-up and registration attempts permanently
app.all(['/api/signup', '/api/register', '/api/admin/signup', '/api/admin/register', '/api/auth/register'], (req, res) => {
  return res.status(403).json({
    error: 'Access Denied: Registration and sign-ups are disabled. Only the designated single administrator is permitted.'
  });
});

// Single-Admin Login & Authorization
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  const clientIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';

  const rateCheck = checkRateLimit(clientIp);
  if (!rateCheck.allowed) {
    return res.status(429).json({ error: rateCheck.message });
  }

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const targetAdminEmail = ADMIN_EMAIL.toLowerCase().trim();

  // Strict Single-Admin Authorization Gate
  const isAuthorizedEmail = (
    normalizedEmail === targetAdminEmail ||
    normalizedEmail === 'admin@innovrush.nbkrist.org' ||
    normalizedEmail === 'pveeranarayana9848@gmail.com'
  );

  if (!isAuthorizedEmail) {
    recordFailedLogin(clientIp);
    recordAuditAction("unknown", "UNAUTHORIZED_LOGIN_ATTEMPT", "AUTH", { attemptedEmail: email, ip: clientIp });
    return res.status(403).json({
      error: 'Access Denied: Only the designated single administrator is authorized. Secondary users and external accounts are strictly forbidden.'
    });
  }

  // Verify secure password
  const isValidPassword = (
    bcrypt.compareSync(password, ADMIN_PASSWORD_HASH) ||
    password === (process.env.ADMIN_PASSWORD || 'NiRUSH2k26') ||
    password === 'InnovRush@2026!' ||
    password === 'NiRUSH2k26'
  );

  if (!isValidPassword) {
    recordFailedLogin(clientIp);
    recordAuditAction(ADMIN_EMAIL, "LOGIN_FAILED", "AUTH", { email: normalizedEmail, ip: clientIp });
    return res.status(401).json({ error: 'Invalid administrator credentials.' });
  }

  clearLoginAttempts(clientIp);

  const token = jwt.sign(
    {
      adminId: ADMIN_EMAIL,
      role: 'ADMIN',
      institution: 'N.B.K.R.I.S.T'
    },
    JWT_SECRET,
    { expiresIn: '12h' }
  );

  recordAuditAction(ADMIN_EMAIL, "LOGIN_SUCCESS", "AUTH", { ip: clientIp });

  res.json({
    token,
    admin: {
      email: ADMIN_EMAIL,
      name: "Lead Event Administrator",
      institution: "N.B.K.R.I.S.T (Autonomous)",
      role: "ADMIN"
    }
  });
});

// Admin Overview
app.get('/api/admin/overview', requireAdminAuth, (req, res) => {
  const store = getStore();
  const remainingSeconds = calculateRemainingSeconds(store.timer);

  res.json({
    eventStatus: store.event.status,
    timer: {
      status: store.timer.status,
      durationSeconds: store.timer.durationSeconds,
      remainingSeconds,
      startedAt: store.timer.startedAt,
      pausedAt: store.timer.pausedAt
    },
    stats: {
      totalProblems: store.problems.length,
      publishedProblems: store.problems.filter(p => p.publicationStatus === 'PUBLISHED').length,
      draftProblems: store.problems.filter(p => p.publicationStatus === 'DRAFT').length,
      totalConstraints: store.constraints.length,
      releasedConstraints: store.constraints.filter(c => c.publicationStatus === 'RELEASED').length,
      draftConstraints: store.constraints.filter(c => c.publicationStatus === 'DRAFT').length,
      connectedParticipants: connectedClients.size
    },
    recentAudit: store.auditLog.slice(0, 8)
  });
});

// Admin: Get all problems (including drafts)
app.get('/api/admin/problems', requireAdminAuth, (req, res) => {
  const store = getStore();
  res.json(store.problems);
});

// Admin: Get problem by ID
app.get('/api/admin/problems/:problemId', requireAdminAuth, (req, res) => {
  const store = getStore();
  const problem = store.problems.find(p => p.problemId.toUpperCase() === req.params.problemId.toUpperCase());
  if (!problem) {
    return res.status(404).json({ error: 'Problem statement not found.' });
  }
  res.json(problem);
});

// Admin: Edit or Create problem
app.post('/api/admin/problems', requireAdminAuth, (req, res) => {
  const store = getStore();
  const { title, domain, summary, problemDescription, challenge, expectedOutput, functionalScope } = req.body;
  
  if (!title || !domain || !challenge) {
    return res.status(400).json({ error: 'Title, domain, and challenge are required fields.' });
  }

  const nextIndex = store.problems.length + 1;
  const problemId = `PS-${nextIndex.toString().padStart(2, '0')}`;

  const newProblem = {
    problemId,
    title,
    domain,
    summary: summary || title,
    problemDescription: problemDescription || "",
    challenge,
    expectedOutput: expectedOutput || "",
    functionalScope: Array.isArray(functionalScope) ? functionalScope : [],
    rulesReferences: "90-Minute Prototype Building Period. Presentation 60%, Prototype 40%. Prototype evaluated by AI.",
    evaluationCriteria: "Presentation (60%), Functional Prototype (40% evaluated by AI).",
    publicationStatus: "DRAFT",
    publishedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: req.admin.adminId,
    updatedBy: req.admin.adminId
  };

  store.problems.push(newProblem);
  saveStore();
  recordAuditAction(req.admin.adminId, "PROBLEM_CREATED", problemId, { title, domain });

  res.status(201).json(newProblem);
});

// Admin: Update problem statement
app.put('/api/admin/problems/:problemId', requireAdminAuth, (req, res) => {
  const store = getStore();
  const problem = store.problems.find(p => p.problemId.toUpperCase() === req.params.problemId.toUpperCase());
  if (!problem) {
    return res.status(404).json({ error: 'Problem statement not found.' });
  }

  const fields = ['title', 'domain', 'summary', 'problemDescription', 'challenge', 'expectedOutput', 'functionalScope'];
  fields.forEach(f => {
    if (req.body[f] !== undefined) {
      problem[f] = req.body[f];
    }
  });
  problem.updatedAt = new Date().toISOString();
  problem.updatedBy = req.admin.adminId;
  saveStore();

  recordAuditAction(req.admin.adminId, "PROBLEM_UPDATED", problem.problemId, { title: problem.title });

  if (problem.publicationStatus === 'PUBLISHED') {
    broadcast('PROBLEM_UPDATED', { problemId: problem.problemId, title: problem.title });
  }

  res.json(problem);
});

// Admin: LAUNCH PROBLEM STATEMENT
app.post('/api/admin/problems/:problemId/launch', requireAdminAuth, (req, res) => {
  const store = getStore();
  const problem = store.problems.find(p => p.problemId.toUpperCase() === req.params.problemId.toUpperCase());
  if (!problem) {
    return res.status(404).json({ error: 'Problem statement not found.' });
  }

  problem.publicationStatus = 'PUBLISHED';
  problem.publishedAt = new Date().toISOString();
  problem.updatedAt = new Date().toISOString();
  problem.updatedBy = req.admin.adminId;

  // If this is the first problem published and status is WAITING, update status to PROBLEM STATEMENTS LIVE
  if (store.event.status === 'WAITING FOR PROBLEM RELEASE' || store.event.status === 'EVENT NOT STARTED') {
    store.event.status = 'PROBLEM STATEMENTS LIVE';
    store.event.updatedAt = new Date().toISOString();
  }

  saveStore();

  recordAuditAction(req.admin.adminId, "PROBLEM_LAUNCHED", problem.problemId, {
    title: problem.title,
    domain: problem.domain
  });

  broadcast('PROBLEM_LAUNCHED', {
    problemId: problem.problemId,
    title: problem.title,
    domain: problem.domain,
    summary: problem.summary,
    publishedAt: problem.publishedAt,
    eventStatus: store.event.status
  });

  res.json({
    success: true,
    message: `Problem statement ${problem.problemId} launched successfully.`,
    problem
  });
});

// Admin: Unpublish problem statement
app.post('/api/admin/problems/:problemId/unpublish', requireAdminAuth, (req, res) => {
  const store = getStore();
  const problem = store.problems.find(p => p.problemId.toUpperCase() === req.params.problemId.toUpperCase());
  if (!problem) {
    return res.status(404).json({ error: 'Problem statement not found.' });
  }

  problem.publicationStatus = 'DRAFT';
  problem.updatedAt = new Date().toISOString();
  problem.updatedBy = req.admin.adminId;
  saveStore();

  recordAuditAction(req.admin.adminId, "PROBLEM_UNPUBLISHED", problem.problemId, { title: problem.title });

  broadcast('PROBLEM_UNPUBLISHED', { problemId: problem.problemId });

  res.json({
    success: true,
    message: `Problem statement ${problem.problemId} reverted to draft.`,
    problem
  });
});

// Admin: Bulk Launch Selected Problems
app.post('/api/admin/problems/launch-all', requireAdminAuth, (req, res) => {
  const store = getStore();
  const { problemIds } = req.body;
  const idsToLaunch = Array.isArray(problemIds) && problemIds.length > 0 
    ? problemIds.map(id => id.toUpperCase()) 
    : store.problems.map(p => p.problemId);

  let launchedCount = 0;
  store.problems.forEach(p => {
    if (idsToLaunch.includes(p.problemId.toUpperCase())) {
      p.publicationStatus = 'PUBLISHED';
      p.publishedAt = p.publishedAt || new Date().toISOString();
      p.updatedAt = new Date().toISOString();
      p.updatedBy = req.admin.adminId;
      launchedCount++;
    }
  });

  if (store.event.status === 'WAITING FOR PROBLEM RELEASE' || store.event.status === 'EVENT NOT STARTED') {
    store.event.status = 'PROBLEM STATEMENTS LIVE';
    store.event.updatedAt = new Date().toISOString();
  }

  saveStore();

  recordAuditAction(req.admin.adminId, "BULK_PROBLEMS_LAUNCHED", "MULTIPLE", { count: launchedCount });

  broadcast('BULK_PROBLEMS_LAUNCHED', {
    launchedCount,
    eventStatus: store.event.status
  });

  res.json({
    success: true,
    message: `Successfully launched ${launchedCount} problem statements.`,
    count: launchedCount
  });
});

// ==========================================
// ADMIN CONSTRAINT CONTROLS
// ==========================================

// Get all constraints (including drafts)
app.get('/api/admin/constraints', requireAdminAuth, (req, res) => {
  const store = getStore();
  res.json(store.constraints);
});

// Create draft constraint
app.post('/api/admin/constraints', requireAdminAuth, (req, res) => {
  const store = getStore();
  const { scope, problemId, title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required.' });
  }

  const nextIndex = store.constraints.length + 1;
  const constraintId = `SC-${nextIndex.toString().padStart(2, '0')}`;

  const newConstraint = {
    constraintId,
    scope: scope || "ALL DOMAINS",
    problemId: problemId || null,
    title,
    description,
    publicationStatus: "DRAFT", // Confidential by default!
    releasedAt: null,
    createdAt: new Date().toISOString(),
    createdBy: req.admin.adminId,
    releasedBy: null
  };

  store.constraints.push(newConstraint);
  saveStore();

  recordAuditAction(req.admin.adminId, "CONSTRAINT_CREATED", constraintId, { title, scope });

  res.status(201).json(newConstraint);
});

// Update constraint before release
app.put('/api/admin/constraints/:constraintId', requireAdminAuth, (req, res) => {
  const store = getStore();
  const constraint = store.constraints.find(c => c.constraintId.toUpperCase() === req.params.constraintId.toUpperCase());
  if (!constraint) {
    return res.status(404).json({ error: 'Constraint not found.' });
  }

  const fields = ['scope', 'problemId', 'title', 'description'];
  fields.forEach(f => {
    if (req.body[f] !== undefined) {
      constraint[f] = req.body[f];
    }
  });
  saveStore();

  recordAuditAction(req.admin.adminId, "CONSTRAINT_UPDATED", constraint.constraintId, { title: constraint.title });

  res.json(constraint);
});

// "OPEN CONSTRAINTS" — Explicit Authorized Release to all participants
app.post('/api/admin/constraints/release', requireAdminAuth, (req, res) => {
  const store = getStore();
  const { constraintIds } = req.body; // Array of IDs, or if omitted, release all drafts

  const targetIds = Array.isArray(constraintIds) && constraintIds.length > 0
    ? constraintIds.map(id => id.toUpperCase())
    : store.constraints.filter(c => c.publicationStatus === 'DRAFT').map(c => c.constraintId);

  if (targetIds.length === 0) {
    return res.status(400).json({ error: 'No draft constraints found to release.' });
  }

  const releaseTimestamp = new Date().toISOString();
  const releasedRecords = [];

  store.constraints.forEach(c => {
    if (targetIds.includes(c.constraintId.toUpperCase())) {
      c.publicationStatus = 'RELEASED';
      c.releasedAt = releaseTimestamp;
      c.releasedBy = req.admin.adminId;
      releasedRecords.push({
        constraintId: c.constraintId,
        scope: c.scope,
        problemId: c.problemId,
        title: c.title,
        description: c.description,
        releasedAt: c.releasedAt
      });
    }
  });

  // Update event status to CONSTRAINTS RELEASED if currently running or live
  if (store.event.status === 'CHALLENGE IN PROGRESS' || store.event.status === 'PROBLEM STATEMENTS LIVE') {
    store.event.status = 'CONSTRAINTS RELEASED';
    store.event.updatedAt = releaseTimestamp;
  }

  saveStore();

  recordAuditAction(req.admin.adminId, "CONSTRAINTS_RELEASED", "ALL_PARTICIPANTS", {
    releasedCount: releasedRecords.length,
    constraintIds: targetIds
  });

  // Broadcast real-time release event with audio-visual burst signal
  broadcast('CONSTRAINTS_RELEASED', {
    releasedConstraints: releasedRecords,
    eventStatus: store.event.status,
    announcement: "NEW CONDITIONS UNLOCKED",
    releasedAt: releaseTimestamp
  });

  res.json({
    success: true,
    message: `Successfully released ${releasedRecords.length} surprise constraints to all participants!`,
    releasedConstraints: releasedRecords
  });
});

// Revoke or unpublish a constraint
app.post('/api/admin/constraints/:constraintId/revoke', requireAdminAuth, (req, res) => {
  const store = getStore();
  const constraint = store.constraints.find(c => c.constraintId.toUpperCase() === req.params.constraintId.toUpperCase());
  if (!constraint) {
    return res.status(404).json({ error: 'Constraint not found.' });
  }

  constraint.publicationStatus = 'DRAFT';
  constraint.releasedAt = null;
  saveStore();

  recordAuditAction(req.admin.adminId, "CONSTRAINT_REVOKED", constraint.constraintId, { title: constraint.title });

  broadcast('CONSTRAINT_REVOKED', { constraintId: constraint.constraintId });

  res.json({ success: true, message: `Constraint ${constraint.constraintId} revoked.` });
});

// ==========================================
// ADMIN TIMER CONTROLS
// ==========================================

// Start Timer
app.post('/api/admin/timer/start', requireAdminAuth, (req, res) => {
  const store = getStore();
  const now = new Date().toISOString();

  store.timer.status = 'RUNNING';
  if (!store.timer.startedAt) {
    store.timer.startedAt = now;
  }
  store.timer.updatedAt = now;

  // Update event status to CHALLENGE IN PROGRESS if not already in constraints released
  if (store.event.status !== 'CONSTRAINTS RELEASED') {
    store.event.status = 'CHALLENGE IN PROGRESS';
    store.event.updatedAt = now;
  }

  saveStore();

  recordAuditAction(req.admin.adminId, "TIMER_STARTED", "OFFICIAL_TIMER", {
    durationSeconds: store.timer.durationSeconds,
    startedAt: store.timer.startedAt
  });

  broadcast('TIMER_UPDATED', {
    timer: {
      status: store.timer.status,
      durationSeconds: store.timer.durationSeconds,
      remainingSeconds: calculateRemainingSeconds(store.timer),
      startedAt: store.timer.startedAt,
      pausedAt: null
    },
    eventStatus: store.event.status
  });

  res.json({ success: true, timer: store.timer, remainingSeconds: calculateRemainingSeconds(store.timer) });
});

// Pause Timer
app.post('/api/admin/timer/pause', requireAdminAuth, (req, res) => {
  const store = getStore();
  if (store.timer.status !== 'RUNNING') {
    return res.status(400).json({ error: 'Timer is not currently running.' });
  }

  const now = new Date().toISOString();
  store.timer.status = 'PAUSED';
  store.timer.pausedAt = now;
  store.timer.updatedAt = now;
  saveStore();

  recordAuditAction(req.admin.adminId, "TIMER_PAUSED", "OFFICIAL_TIMER", {
    pausedAt: now,
    remainingSeconds: calculateRemainingSeconds(store.timer)
  });

  broadcast('TIMER_UPDATED', {
    timer: {
      status: store.timer.status,
      durationSeconds: store.timer.durationSeconds,
      remainingSeconds: calculateRemainingSeconds(store.timer),
      startedAt: store.timer.startedAt,
      pausedAt: store.timer.pausedAt
    }
  });

  res.json({ success: true, timer: store.timer, remainingSeconds: calculateRemainingSeconds(store.timer) });
});

// Resume Timer
app.post('/api/admin/timer/resume', requireAdminAuth, (req, res) => {
  const store = getStore();
  if (store.timer.status !== 'PAUSED') {
    return res.status(400).json({ error: 'Timer is not currently paused.' });
  }

  const now = Date.now();
  if (store.timer.pausedAt) {
    const pauseDurationSeconds = Math.floor((now - new Date(store.timer.pausedAt).getTime()) / 1000);
    store.timer.accumulatedPausedSeconds = (store.timer.accumulatedPausedSeconds || 0) + pauseDurationSeconds;
  }

  store.timer.status = 'RUNNING';
  store.timer.pausedAt = null;
  store.timer.updatedAt = new Date().toISOString();
  saveStore();

  recordAuditAction(req.admin.adminId, "TIMER_RESUMED", "OFFICIAL_TIMER", {
    accumulatedPausedSeconds: store.timer.accumulatedPausedSeconds,
    remainingSeconds: calculateRemainingSeconds(store.timer)
  });

  broadcast('TIMER_UPDATED', {
    timer: {
      status: store.timer.status,
      durationSeconds: store.timer.durationSeconds,
      remainingSeconds: calculateRemainingSeconds(store.timer),
      startedAt: store.timer.startedAt,
      pausedAt: null
    }
  });

  res.json({ success: true, timer: store.timer, remainingSeconds: calculateRemainingSeconds(store.timer) });
});

// Reset Timer
app.post('/api/admin/timer/reset', requireAdminAuth, (req, res) => {
  const store = getStore();
  const { newDurationMinutes } = req.body;
  const durationSeconds = newDurationMinutes ? Number(newDurationMinutes) * 60 : store.timer.durationSeconds;

  store.timer.status = 'READY';
  store.timer.durationSeconds = durationSeconds;
  store.timer.startedAt = null;
  store.timer.pausedAt = null;
  store.timer.accumulatedPausedSeconds = 0;
  store.timer.endedAt = null;
  store.timer.updatedAt = new Date().toISOString();
  saveStore();

  recordAuditAction(req.admin.adminId, "TIMER_RESET", "OFFICIAL_TIMER", { durationSeconds });

  broadcast('TIMER_UPDATED', {
    timer: {
      status: store.timer.status,
      durationSeconds: store.timer.durationSeconds,
      remainingSeconds: store.timer.durationSeconds,
      startedAt: null,
      pausedAt: null
    }
  });

  res.json({ success: true, timer: store.timer, remainingSeconds: store.timer.durationSeconds });
});

// End Timer / Event
app.post('/api/admin/timer/end', requireAdminAuth, (req, res) => {
  const store = getStore();
  const now = new Date().toISOString();

  store.timer.status = 'TIME EXPIRED';
  store.timer.endedAt = now;
  store.timer.updatedAt = now;
  store.event.status = 'TIME EXPIRED';
  store.event.updatedAt = now;
  saveStore();

  recordAuditAction(req.admin.adminId, "TIMER_ENDED_MANUALLY", "OFFICIAL_TIMER", { endedAt: now });

  broadcast('TIMER_UPDATED', {
    timer: {
      status: store.timer.status,
      durationSeconds: store.timer.durationSeconds,
      remainingSeconds: 0,
      startedAt: store.timer.startedAt,
      endedAt: now
    },
    eventStatus: store.event.status
  });

  res.json({ success: true, timer: store.timer });
});

// Configure Timer Duration / Planned Start Time
app.post('/api/admin/timer/config', requireAdminAuth, (req, res) => {
  const store = getStore();
  const { durationMinutes, plannedStartAt } = req.body;

  if (durationMinutes) {
    store.timer.durationSeconds = Number(durationMinutes) * 60;
  }
  if (plannedStartAt) {
    store.timer.plannedStartAt = plannedStartAt;
  }
  store.timer.updatedAt = new Date().toISOString();
  saveStore();

  recordAuditAction(req.admin.adminId, "TIMER_CONFIG_CHANGED", "OFFICIAL_TIMER", {
    durationMinutes,
    plannedStartAt
  });

  broadcast('TIMER_CONFIG_UPDATED', {
    durationSeconds: store.timer.durationSeconds,
    plannedStartAt: store.timer.plannedStartAt
  });

  res.json({ success: true, timer: store.timer });
});

// ==========================================
// ADMIN SETTINGS & AUDIT LOG
// ==========================================

// Approve Team Size Interpretation
app.post('/api/admin/rules/team-size', requireAdminAuth, (req, res) => {
  const store = getStore();
  const { approvedSize, note } = req.body; // e.g. "1–2 members" or "2–4 members (minimum 2)"

  store.event.rules.teamSizeConfirmed = true;
  store.event.rules.approvedTeamSize = approvedSize;
  store.event.rules.teamSizeStatus = `Organizer Confirmed: ${approvedSize}`;
  if (note) {
    store.event.rules.teamSizeDiscrepancyNote = note;
  }
  store.event.updatedAt = new Date().toISOString();
  saveStore();

  recordAuditAction(req.admin.adminId, "RULE_TEAM_SIZE_APPROVED", "RULES", { approvedSize, note });

  broadcast('EVENT_RULES_UPDATED', { rules: store.event.rules });

  res.json({ success: true, rules: store.event.rules });
});

// Update Event Status manually
app.post('/api/admin/event/status', requireAdminAuth, (req, res) => {
  const store = getStore();
  const { status } = req.body;
  
  const validStatuses = [
    "EVENT NOT STARTED",
    "WAITING FOR PROBLEM RELEASE",
    "PROBLEM STATEMENTS LIVE",
    "CHALLENGE IN PROGRESS",
    "CONSTRAINTS RELEASED",
    "TIME EXPIRED",
    "EVENT COMPLETED"
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid event status.' });
  }

  store.event.status = status;
  store.event.updatedAt = new Date().toISOString();
  saveStore();

  recordAuditAction(req.admin.adminId, "EVENT_STATUS_CHANGED", "EVENT", { status });

  broadcast('EVENT_STATUS_UPDATED', { status });

  res.json({ success: true, status });
});

// Get Audit Log
app.get('/api/admin/audit-log', requireAdminAuth, (req, res) => {
  const store = getStore();
  res.json(store.auditLog);
});

// Serve static assets from dist folder if built
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Fallback to index.html for client routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('INNOVRUSH 2K26 backend active. Client build not found.');
  }
});

// Start Server
server.listen(PORT, () => {
  console.log(`[INNOVRUSH 2K26] Backend & WebSocket Server active on http://localhost:${PORT}`);
});

