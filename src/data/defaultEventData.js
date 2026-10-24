/**
 * INNOVRUSH 2K26 — Client Fallback Data for Static GitHub Pages Deployment
 * Provides seamless event data when the Node backend is not actively running.
 */

export const defaultEventData = {
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
  domainCounts: {
    aiMl: 4,
    dataAnalytics: 4,
    webDevelopment: 4
  },
  rules: {
    buildTimeMinutes: 90,
    teamSizeDiscrepancy: true,
    teamSizeConfirmed: false,
    teamSizeStatus: "Awaiting organizer confirmation",
    teamSizeDiscrepancyNote: "Source document notes 1–2 members in Section A and 2–4 members (minimum 2) in Section B. Please confirm official interpretation in Admin settings.",
    approvedTeamSize: "2–4 members (minimum 2)",
    evaluation: {
      presentationWeight: 60,
      prototypeWeight: 40,
      prototypeEvaluator: "Evaluated by AI",
      additionalCriteriaNote: "Prototype evaluated live by AI scoring engine."
    }
  }
};

export const defaultTimerData = {
  status: "WAITING",
  durationSeconds: 5400,
  remainingSeconds: 5400,
  plannedStartAt: "2026-10-29T09:00:00.000Z",
  startedAt: null
};

export const defaultProblems = [
  {
    problemId: "PS-01",
    title: "AI-Based Student Early Warning System",
    domain: "AI / MACHINE LEARNING",
    summary: "Academic risk prediction system utilizing attendance records, test marks, and assignment indicators to forecast student risk levels with explanations and actionable intervention recommendations.",
    problemDescription: "Educational institutions require proactive identification of students who may be at risk of academic failure or dropping out. An AI-based early warning system evaluates key longitudinal student data points including continuous attendance records, internal exam marks, and submission timelines for assignments to detect early patterns of academic distress.",
    challenge: "Design and implement an intelligent predictive system that evaluates academic indicators, quantifies risk probabilities, provides clear interpretability/explanations for flagged risk factors, and recommends specific academic interventions.",
    expectedOutput: "A functional AI risk assessment engine and dashboard that ingests student academic and attendance indicators, computes normalized risk scores (Low, Moderate, High), highlights root contributing factors for each student, and generates structured intervention guidance for faculty mentors.",
    functionalScope: [
      "Multi-metric risk scoring using attendance, test scores, and assignment completion velocity",
      "Risk explanation breakdown detailing specific drop-off triggers",
      "Actionable recommendations and remediation plans for at-risk cohorts",
      "Student and mentor view showing risk trajectory over time"
    ],
    rulesReferences: "90-Minute Prototype Building Period. Presentation 60%, Prototype 40%. Prototype evaluated by AI.",
    evaluationCriteria: "Presentation (60%), Functional Prototype (40% evaluated by AI).",
    publicationStatus: "PUBLISHED"
  },
  {
    problemId: "PS-02",
    title: "AI-Powered Resume & Job Matching System",
    domain: "AI / MACHINE LEARNING",
    summary: "Intelligent career alignment engine analyzing candidate resumes against job descriptions to compute compatibility scores, highlight matched proficiencies, and pinpoint skill gaps.",
    problemDescription: "Recruiters and students often struggle with manual alignment of technical proficiencies against detailed job specifications. This system performs semantic parsing and contextual extraction on candidate resumes and target job roles to calculate accurate match ratings and highlight missing prerequisites.",
    challenge: "Develop an AI parsing and semantic scoring module that ingests resume texts and job descriptions, extracts competencies, benchmarks alignment, and provides detailed skill gap diagnostics.",
    expectedOutput: "A functional matching engine generating percentage compatibility ratings, itemized breakdown of matching technical and non-technical skills, and actionable recommendations for missing requirements.",
    functionalScope: [
      "Resume and job description text parsing and entity extraction",
      "Contextual skill matching and weighted compatibility scoring",
      "Identification of missing prerequisites and curriculum gaps",
      "Personalized skill enhancement suggestions based on industry demand"
    ],
    rulesReferences: "90-Minute Prototype Building Period. Presentation 60%, Prototype 40%. Prototype evaluated by AI.",
    evaluationCriteria: "Presentation (60%), Functional Prototype (40% evaluated by AI).",
    publicationStatus: "PUBLISHED"
  },
  {
    problemId: "PS-03",
    title: "AI-Powered Campus Support Assistant",
    domain: "AI / MACHINE LEARNING",
    summary: "Conversational intelligence agent delivering multi-modal support across institutional schedules, examination protocols, fee deadlines, and hostel facility queries.",
    problemDescription: "Campus administration desks experience overwhelming repetitive query volumes regarding curriculum timetables, hall ticket eligibility, library hours, and departmental notices.",
    challenge: "Construct a natural language understanding assistant that ingests structured and semi-structured campus policy docs, resolves inquiries in real time, and escalates complex edge cases.",
    expectedOutput: "A conversational bot UI backed by an intent classifier or retrieval engine capable of answering institutional FAQs accurately and maintaining session dialogue context.",
    functionalScope: [
      "Dynamic FAQ parsing across academic and campus services",
      "Intent-based response dispatching with citation sources",
      "Escalation ticket creation for unresolved queries",
      "Multi-device conversational widget interface"
    ],
    rulesReferences: "90-Minute Prototype Building Period. Presentation 60%, Prototype 40%. Prototype evaluated by AI.",
    evaluationCriteria: "Presentation (60%), Functional Prototype (40% evaluated by AI).",
    publicationStatus: "PUBLISHED"
  },
  {
    problemId: "PS-04",
    title: "Automated Code Review & Security Scanner",
    domain: "AI / MACHINE LEARNING",
    summary: "Static analysis and vulnerability detection assistant scanning submitted source code for anti-patterns, security exploits, and code quality regressions.",
    problemDescription: "Development workflows frequently suffer from unvetted code merges containing insecure patterns, SQL injection vectors, and hardcoded secrets.",
    challenge: "Build a code analysis tool that parses code snippets, flags OWASP vulnerability risks, and suggests optimized refactored alternatives.",
    expectedOutput: "A developer dashboard analyzing code inputs, providing confidence-rated vulnerability alerts, and generating line-by-line remediation diffs.",
    functionalScope: [
      "Static code linting and security vulnerability scanning",
      "OWASP top-10 security flaw detection",
      "Automated code remediation suggestion generation",
      "Code quality scoring matrix"
    ],
    rulesReferences: "90-Minute Prototype Building Period. Presentation 60%, Prototype 40%. Prototype evaluated by AI.",
    evaluationCriteria: "Presentation (60%), Functional Prototype (40% evaluated by AI).",
    publicationStatus: "PUBLISHED"
  },
  {
    problemId: "PS-05",
    title: "Zero-Trust API Gateway & Rate Sentinel",
    domain: "CYBERSECURITY / SYSTEMS",
    summary: "Hardened microservice proxy applying dynamic token verification, anomaly-based rate limiting, and automated threat mitigation.",
    problemDescription: "Modern distributed APIs face aggressive automated credential stuffing, bot scraping, and DDoS attempts requiring low-latency zero-trust authorization.",
    challenge: "Develop an API gateway layer enforcing strict JWT inspection, per-client sliding window rate throttling, and automated IP banishing on malicious payload patterns.",
    expectedOutput: "A functional proxy engine that monitors incoming request velocity, validates authentication tokens, and blocks abusive clients with telemetry metrics.",
    functionalScope: [
      "Cryptographic JWT verification and role enforcement",
      "Sliding-window IP and token rate limiting",
      "Suspicious payload sanitization and threat blocking",
      "Real-time gateway request telemetry dashboard"
    ],
    rulesReferences: "90-Minute Prototype Building Period. Presentation 60%, Prototype 40%. Prototype evaluated by AI.",
    evaluationCriteria: "Presentation (60%), Functional Prototype (40% evaluated by AI).",
    publicationStatus: "PUBLISHED"
  },
  {
    problemId: "PS-06",
    title: "Decentralized Credential Verification Protocol",
    domain: "WEB3 / CLOUD / IOT",
    summary: "Tamper-proof academic diploma and achievement verification network utilizing verifiable credentials and cryptographic proofs.",
    problemDescription: "Fraudulent academic certificates and unverified paper degrees represent a persistent challenge for hiring authorities and university registrars.",
    challenge: "Implement a digital credential issuance and instant public verification platform that binds verifiable certificates to cryptographic hashes.",
    expectedOutput: "A verification portal where institutions issue signed digital credentials and employers verify authenticity via QR or hash lookup without third-party fees.",
    functionalScope: [
      "Cryptographically signed certificate generation",
      "Instant public QR verification without database vulnerability",
      "Revocation registry and tamper-detection indicators",
      "Exportable credential metadata conforming to open standards"
    ],
    rulesReferences: "90-Minute Prototype Building Period. Presentation 60%, Prototype 40%. Prototype evaluated by AI.",
    evaluationCriteria: "Presentation (60%), Functional Prototype (40% evaluated by AI).",
    publicationStatus: "PUBLISHED"
  }
];
