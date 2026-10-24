import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialProblemStatements } from './problemStatements.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

// Initial event state
const initialData = {
  event: {
    eventId: "INNOVRUSH-2K26",
    name: "INNOVRUSH 2K26",
    tagline: "Cinematic Problem Statement Launch Platform",
    institution: "N.B.K.R. Institute of Science & Technology (Autonomous)",
    association: "NEXUSVERSE 2K26",
    eventDate: "29 OCT 2026",
    eventTime: "9:00 AM",
    contactEmail: "nexusverse@nbkrist.org",
    instagram: "nexusverse_ieee",
    coordinators: [
      { role: "Event Co-ordinator", name: "P. Veera Narayana", phone: "9848635931" },
      { role: "Event Co-ordinator", name: "N. Snehalatha", phone: "7674010261" },
      { role: "Event Co-ordinator", name: "M. Lekhasree", phone: "9347178378" }
    ],
    status: "WAITING FOR PROBLEM RELEASE",
    rules: {
      buildTimeMinutes: 90,
      teamSizeDiscrepancy: true,
      teamSizeConfirmed: false,
      teamSizeStatus: "Awaiting organizer confirmation",
      teamSizeDiscrepancyNote: "Source document notes 1–2 members in Section A and 2–4 members (minimum 2) in Section B. Please confirm official interpretation in Admin settings.",
      approvedTeamSize: null, // Admin can set to "1–2 members" or "2–4 members (minimum 2)"
      evaluation: {
        presentationWeight: 60,
        prototypeWeight: 40,
        prototypeEvaluator: "Evaluated by AI",
        additionalCriteriaNote: "Not specified in the event document."
      }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  timer: {
    status: "WAITING", // WAITING | READY | RUNNING | PAUSED | RESUMING | TIME EXPIRED | COMPLETED
    durationSeconds: 5400, // 90 minutes
    plannedStartAt: "2026-10-29T09:00:00.000Z",
    startedAt: null,
    pausedAt: null,
    accumulatedPausedSeconds: 0,
    endedAt: null,
    updatedAt: new Date().toISOString()
  },
  problems: initialProblemStatements,
  constraints: [
    {
      constraintId: "SC-01",
      scope: "ALL DOMAINS",
      problemId: null,
      title: "Resilient Offline Fallback Layer",
      description: "Prototypes must incorporate local caching or mock fallback data to maintain operational integrity in the event of upstream network timeouts or simulated API disconnections.",
      publicationStatus: "DRAFT", // Must NOT be visible to participants before release
      releasedAt: null,
      createdAt: new Date().toISOString(),
      createdBy: "admin@innovrush.nbkrist.org",
      releasedBy: null
    },
    {
      constraintId: "SC-02",
      scope: "AI / MACHINE LEARNING",
      problemId: "PS-01",
      title: "Sub-Second Inference Latency Guardrail",
      description: "The early warning assessment engine must return normalized risk levels and causal explanation breakdowns within 1.5 seconds per cohort query batch.",
      publicationStatus: "DRAFT",
      releasedAt: null,
      createdAt: new Date().toISOString(),
      createdBy: "admin@innovrush.nbkrist.org",
      releasedBy: null
    },
    {
      constraintId: "SC-03",
      scope: "WEB DEVELOPMENT",
      problemId: "PS-09",
      title: "Keyboard-First Accessibility Protocol",
      description: "All primary portal interactions (notice filtering, schedule switching, service requests) must be fully navigable via keyboard with distinct focus rings and zero mouse reliance.",
      publicationStatus: "DRAFT",
      releasedAt: null,
      createdAt: new Date().toISOString(),
      createdBy: "admin@innovrush.nbkrist.org",
      releasedBy: null
    }
  ],
  auditLog: [
    {
      actionId: "act-init-01",
      administratorId: "system",
      actionType: "SYSTEM_INITIALIZED",
      targetId: "INNOVRUSH-2K26",
      timestamp: new Date().toISOString(),
      safeMetadata: { note: "Platform initialized with 12 draft problem statements and 3 draft constraints." }
    }
  ]
};

// In-memory data store with file persistence
let store = null;

export function getStore() {
  if (!store) {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        store = JSON.parse(raw);
      } catch (err) {
        console.error("Error reading db.json, falling back to initial data:", err);
        store = JSON.parse(JSON.stringify(initialData));
        saveStore();
      }
    } else {
      store = JSON.parse(JSON.stringify(initialData));
      saveStore();
    }
  }
  return store;
}

export function saveStore() {
  if (store) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
    } catch (err) {
      console.error("Error saving db.json:", err);
    }
  }
}

// Calculate authoritative remaining seconds
export function calculateRemainingSeconds(timer) {
  if (!timer) return 0;
  if (timer.status === "WAITING" || timer.status === "READY") {
    return timer.durationSeconds;
  }
  if (timer.status === "TIME EXPIRED" || timer.status === "COMPLETED") {
    return 0;
  }
  
  const now = Date.now();
  const startTime = new Date(timer.startedAt).getTime();
  let totalPausedMs = (timer.accumulatedPausedSeconds || 0) * 1000;
  
  if (timer.status === "PAUSED" && timer.pausedAt) {
    totalPausedMs += (now - new Date(timer.pausedAt).getTime());
  }
  
  const elapsedRunningMs = Math.max(0, now - startTime - totalPausedMs);
  const elapsedSeconds = Math.floor(elapsedRunningMs / 1000);
  const remaining = Math.max(0, timer.durationSeconds - elapsedSeconds);
  
  // Auto-expire check
  if (remaining === 0 && timer.status === "RUNNING") {
    timer.status = "TIME EXPIRED";
    timer.endedAt = new Date().toISOString();
    timer.updatedAt = new Date().toISOString();
    saveStore();
  }
  
  return remaining;
}

// Record an administrative audit action
export function recordAuditAction(adminId, actionType, targetId, safeMetadata = {}) {
  const s = getStore();
  const entry = {
    actionId: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    administratorId: adminId || "admin@innovrush.nbkrist.org",
    actionType,
    targetId: targetId || "GLOBAL",
    timestamp: new Date().toISOString(),
    safeMetadata // No sensitive passwords, unreleased secrets, or tokens!
  };
  s.auditLog.unshift(entry);
  if (s.auditLog.length > 200) {
    s.auditLog.pop(); // Keep manageable
  }
  saveStore();
  return entry;
}
