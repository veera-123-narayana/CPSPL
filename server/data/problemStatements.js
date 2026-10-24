/**
 * INNOVRUSH 2K26 — Authoritative Problem Statements Source
 * Sourced directly from event documentation.
 * Exactly 12 problem statements (4 per domain). PS-13 / PS-14 intentionally omitted as per specification.
 */

export const initialProblemStatements = [
  // ==========================================
  // DOMAIN 1: AI / MACHINE LEARNING
  // ==========================================
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
    publicationStatus: "PUBLISHED", // Admin launches this during the live event
    publishedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin@innovrush.nbkrist.org",
    updatedBy: "admin@innovrush.nbkrist.org"
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
    publicationStatus: "PUBLISHED",
    publishedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin@innovrush.nbkrist.org",
    updatedBy: "admin@innovrush.nbkrist.org"
  },
  {
    problemId: "PS-03",
    title: "AI-Powered Campus Support Assistant",
    domain: "AI / MACHINE LEARNING",
    summary: "Institutional conversational intelligence providing verified answers to student queries using institutional FAQs/documents while autonomously flagging unanswered questions.",
    problemDescription: "College administrative departments receive repetitive queries regarding academic regulations, examination schedules, fee structures, and campus services. This assistant grounds responses strictly in official college documentation and flags unaddressed or ambiguous questions for human staff review.",
    challenge: "Construct a grounded conversational assistant that accurately retrieves and articulates answers from institutional knowledge bases while logging fallback/unanswered queries for continuous knowledge base enrichment.",
    expectedOutput: "An interactive support interface that answers campus-related inquiries with high precision, cites institutional reference points, and maintains an administrative queue of unresolved queries.",
    functionalScope: [
      "Document-grounded question answering for campus regulations and services",
      "Strict hallucination guardrails preventing false campus information",
      "Automated logging and classification of unanswered or ambiguous questions",
      "Escalation workflow for administrative desk resolution"
    ],
    rulesReferences: "90-Minute Prototype Building Period. Presentation 60%, Prototype 40%. Prototype evaluated by AI.",
    evaluationCriteria: "Presentation (60%), Functional Prototype (40% evaluated by AI).",
    publicationStatus: "PUBLISHED",
    publishedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin@innovrush.nbkrist.org",
    updatedBy: "admin@innovrush.nbkrist.org"
  },
  {
    problemId: "PS-04",
    title: "Intelligent Phishing & Scam Detection",
    domain: "AI / MACHINE LEARNING",
    summary: "Cybersecurity classification engine evaluating suspicious URLs, communication payloads, and text snippets to detect malicious intent and alert users with risk indicators.",
    problemDescription: "Cyber threats, deceptive campus phishing emails, and predatory job scam messages increasingly target students and faculty. This solution inspects communication payloads, analyzes linguistic and structural anomalies, assesses domain legitimacy, and outputs real-time safety warnings.",
    challenge: "Build a machine-learning-driven classification pipeline that classifies URLs and text messages as legitimate or phishing, pinpointing specific suspicious signals such as spoofed domains or urgency tactics.",
    expectedOutput: "A real-time inspection tool that accepts message bodies or hyperlinks, provides instant classification (Safe, Suspicious, Malicious), and displays explicit risk factors explaining why the target was flagged.",
    functionalScope: [
      "Feature extraction for lexical patterns, URL redirects, and deceptive phrasing",
      "Probability score and risk categorization",
      "Clear risk indicators (e.g., mismatched TLD, urgent credential requests)",
      "User-friendly warning recommendations and safety tips"
    ],
    rulesReferences: "90-Minute Prototype Building Period. Presentation 60%, Prototype 40%. Prototype evaluated by AI.",
    evaluationCriteria: "Presentation (60%), Functional Prototype (40% evaluated by AI).",
    publicationStatus: "PUBLISHED",
    publishedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin@innovrush.nbkrist.org",
    updatedBy: "admin@innovrush.nbkrist.org"
  },

  // ==========================================
  // DOMAIN 2: DATA ANALYTICS
  // ==========================================
  {
    problemId: "PS-05",
    title: "Student Performance & Placement Analytics",
    domain: "DATA ANALYTICS",
    summary: "Comprehensive analytical dashboard visualizing department-wise academic indicators, placement trajectories, competency metrics, and multi-year institutional trends.",
    problemDescription: "Higher education leaders require holistic analytics to correlate undergraduate academic performance with final placement outcomes. This system aggregates academic evaluations, training completion metrics, and recruitment data into insightful department-level dashboards.",
    challenge: "Design and implement an analytical intelligence suite that computes essential KPIs, uncovers correlations between academic coursework and hiring success, and identifies student cohort strengths and weaknesses.",
    expectedOutput: "An interactive analytics dashboard showcasing key performance indicators, department-wise comparative charts, CGPA-to-placement conversion rates, and historical placement trend lines.",
    functionalScope: [
      "Department-wise performance aggregation and benchmark comparison",
      "Placement success metrics against CGPA bands and skill certifications",
      "Multi-year hiring volume and salary distribution visual indicators",
      "Exportable summary views for departmental review meetings"
    ],
    rulesReferences: "90-Minute Prototype Building Period. Presentation 60%, Prototype 40%. Prototype evaluated by AI.",
    evaluationCriteria: "Presentation (60%), Functional Prototype (40% evaluated by AI).",
    publicationStatus: "PUBLISHED",
    publishedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin@innovrush.nbkrist.org",
    updatedBy: "admin@innovrush.nbkrist.org"
  },
  {
    problemId: "PS-06",
    title: "Campus Resource Utilization Analytics",
    domain: "DATA ANALYTICS",
    summary: "Spatial and operational resource telemetry analyzing classroom, laboratory, and facility occupancy patterns to highlight underused facilities and optimize scheduling.",
    problemDescription: "Managing extensive physical infrastructure across engineering campuses requires continuous visibility into room and lab utilization. This analytics tool processes timetable, facility booking, and attendance data to reveal peak occupancy hours and identify underutilized campus spaces.",
    challenge: "Create a telemetry and analytics engine that models campus facility utilization over time, detects spatial bottlenecks during peak periods, and formulates automated reallocation suggestions.",
    expectedOutput: "A visual dashboard featuring occupancy heatmaps, time-series capacity utilization metrics, a list of underused infrastructure, and data-driven recommendations for scheduling optimization.",
    functionalScope: [
      "Classroom and laboratory capacity vs. actual attendance tracking",
      "Peak demand hour identification and facility saturation mapping",
      "Underutilized infrastructure index and cost-saving opportunities",
      "Scheduling optimization insights for administrative coordinators"
    ],
    rulesReferences: "90-Minute Prototype Building Period. Presentation 60%, Prototype 40%. Prototype evaluated by AI.",
    evaluationCriteria: "Presentation (60%), Functional Prototype (40% evaluated by AI).",
    publicationStatus: "PUBLISHED",
    publishedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin@innovrush.nbkrist.org",
    updatedBy: "admin@innovrush.nbkrist.org"
  },
  {
    problemId: "PS-07",
    title: "Smart Waste Analytics",
    domain: "DATA ANALYTICS",
    summary: "Ecological data analysis tracking campus waste volume, waste categorization, geographical hotspots, and time-based generation trends with reduction strategies.",
    problemDescription: "Achieving green campus benchmarks requires granular visibility into solid, food, and e-waste generation. This platform collects waste disposal logs across various campus zones (canteens, hostels, academic blocks) to identify disposal surges and guide sustainability interventions.",
    challenge: "Build a waste stream analytics platform that processes spatial and temporal waste metrics, identifies primary waste generation zones, and models the impact of targeted reduction initiatives.",
    expectedOutput: "A responsive environmental dashboard visualizing total waste volume by category (organic, plastic, paper, e-waste), zone-wise intensity maps, daily generation cycles, and measurable reduction suggestions.",
    functionalScope: [
      "Waste generation telemetry classified by category, location, and timestamp",
      "Temporal trend analysis showing peak generation hours and seasonal variance",
      "Hotspot mapping across dining halls, residential blocks, and academic facilities",
      "Actionable waste mitigation and resource diversion recommendations"
    ],
    rulesReferences: "90-Minute Prototype Building Period. Presentation 60%, Prototype 40%. Prototype evaluated by AI.",
    evaluationCriteria: "Presentation (60%), Functional Prototype (40% evaluated by AI).",
    publicationStatus: "PUBLISHED",
    publishedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin@innovrush.nbkrist.org",
    updatedBy: "admin@innovrush.nbkrist.org"
  },
  {
    problemId: "PS-08",
    title: "Placement Trend & Skill Gap Analyzer",
    domain: "DATA ANALYTICS",
    summary: "Labor market intelligence suite analyzing industry hiring patterns, compensation ranges, recruiter preferences, and technical skill supply-demand discrepancies.",
    problemDescription: "To ensure student employability, institutional training programs must adapt dynamically to evolving industry demands. This system evaluates historical placement records, corporate hiring requirements, and student skill profiles to uncover emerging hiring trends and pressing skill deficits.",
    challenge: "Develop an industry trend and curriculum gap analytical system that evaluates recruiting records, maps corporate compensation trends, and pinpoints where student competencies diverge from market demand.",
    expectedOutput: "An analytical platform delivering recruiter hiring distributions, compensation tier analysis, top in-demand technical competencies, and an actionable skill deficiency matrix.",
    functionalScope: [
      "Recruiter participation, offer volume, and sector-wise hiring trends",
      "Salary compensation breakdowns across engineering specializations",
      "Competency demand mapping versus current student skill inventories",
      "Targeted training intervention roadmap for career development cells"
    ],
    rulesReferences: "90-Minute Prototype Building Period. Presentation 60%, Prototype 40%. Prototype evaluated by AI.",
    evaluationCriteria: "Presentation (60%), Functional Prototype (40% evaluated by AI).",
    publicationStatus: "PUBLISHED",
    publishedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin@innovrush.nbkrist.org",
    updatedBy: "admin@innovrush.nbkrist.org"
  },

  // ==========================================
  // DOMAIN 3: WEB DEVELOPMENT
  // ==========================================
  {
    problemId: "PS-09",
    title: "Unified Smart Campus Platform",
    domain: "WEB DEVELOPMENT",
    summary: "Centralized responsive digital portal providing role-tailored student and faculty interfaces for notices, academic schedules, administrative workflows, and campus amenities.",
    problemDescription: "Campuses frequently suffer from fragmented portals for attendance, notices, grade books, and hall bookings. This platform unifies all vital academic and institutional operations into a single cohesive, high-performance web experience with dedicated roles for students and faculty.",
    challenge: "Architect a modern, unified web application featuring role-based dashboards, authenticated notice broadcasts, real-time timetable updates, and streamlined access to campus services.",
    expectedOutput: "A responsive, accessible web portal providing instant context switching between student and faculty views, an interactive announcements feed with search/filters, and intuitive service request modules.",
    functionalScope: [
      "Role-tailored navigation and dashboards for students and faculty members",
      "Official institutional notice board with category filters and prioritization",
      "Academic schedule visualization and timetable management",
      "Integrated quick links for campus services and student support"
    ],
    rulesReferences: "90-Minute Prototype Building Period. Presentation 60%, Prototype 40%. Prototype evaluated by AI.",
    evaluationCriteria: "Presentation (60%), Functional Prototype (40% evaluated by AI).",
    publicationStatus: "PUBLISHED",
    publishedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin@innovrush.nbkrist.org",
    updatedBy: "admin@innovrush.nbkrist.org"
  },
  {
    problemId: "PS-10",
    title: "Student Opportunities Hub",
    domain: "WEB DEVELOPMENT",
    summary: "Opportunity aggregation and lifecycle management portal tracking internships, hackathons, research grants, eligibility parameters, deadlines, and application status.",
    problemDescription: "Students constantly miss out on competitive hackathons, industry internships, and scholarships due to unorganized announcements scattered across social media and email threads. This hub categorizes verified opportunities, allows deadline tracking, and manages application statuses in one place.",
    challenge: "Design and implement a responsive opportunity portal that provides robust search, filtering by eligibility and category, personal bookmarks, and an interactive application pipeline tracker.",
    expectedOutput: "A web application featuring an opportunities feed with live countdowns to deadlines, detailed opportunity specification views, bookmarked opportunities, and stage-by-stage application tracking (Applied, Shortlisted, Interview, Accepted).",
    functionalScope: [
      "Directory of internships, scholarships, and hackathons with verified criteria",
      "Filtering by technical discipline, eligibility year, stipend, and deadlines",
      "User bookmarks and custom notification alerts for approaching cut-offs",
      "Interactive personal application tracker with status updating"
    ],
    rulesReferences: "90-Minute Prototype Building Period. Presentation 60%, Prototype 40%. Prototype evaluated by AI.",
    evaluationCriteria: "Presentation (60%), Functional Prototype (40% evaluated by AI).",
    publicationStatus: "PUBLISHED",
    publishedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin@innovrush.nbkrist.org",
    updatedBy: "admin@innovrush.nbkrist.org"
  },
  {
    problemId: "PS-11",
    title: "Campus Helpdesk & Complaint Management",
    domain: "WEB DEVELOPMENT",
    summary: "End-to-end ticketing and dispute resolution system with grievance filing, automated priority tagging, department routing, progress tracking, and resolution auditing.",
    problemDescription: "Efficient campus administration requires transparent tracking of infrastructure grievances (hostel maintenance, laboratory equipment repair, Wi-Fi connectivity, sanitation). This system delivers a structured ticketing pipeline connecting students with maintenance officers.",
    challenge: "Construct a robust issue reporting and management system supporting ticket generation with attachment uploads, priority categorization, department-based assignment, and real-time status progression.",
    expectedOutput: "A full-featured ticketing web portal enabling students to log grievances and monitor their resolution progress in real time, paired with an administrative interface for staff assignment and status updates.",
    functionalScope: [
      "User grievance submission with category selection, description, and urgency",
      "Automated ticket routing to relevant campus departments",
      "Visual status lifecycle: Submitted -> In Progress -> Under Review -> Resolved",
      "Departmental resolution notes, feedback ratings, and escalation tracking"
    ],
    rulesReferences: "90-Minute Prototype Building Period. Presentation 60%, Prototype 40%. Prototype evaluated by AI.",
    evaluationCriteria: "Presentation (60%), Functional Prototype (40% evaluated by AI).",
    publicationStatus: "PUBLISHED",
    publishedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin@innovrush.nbkrist.org",
    updatedBy: "admin@innovrush.nbkrist.org"
  },
  {
    problemId: "PS-12",
    title: "Campus Lost & Found",
    domain: "WEB DEVELOPMENT",
    summary: "Community-driven property recovery platform featuring categorized item reporting, timestamped locations, search indexing, potential match suggestions, and verification workflow.",
    problemDescription: "Lost identity cards, calculators, electronics, and keys are frequently misplaced across campus grounds with no streamlined return mechanism. This platform enables swift reporting of lost or discovered items, matches candidates using descriptive tags and locations, and facilitates safe item returns.",
    challenge: "Build a community web application that manages lost and found listings, indexes items by category/date/location, detects potential matches between lost and found logs, and secures ownership claim verification.",
    expectedOutput: "A responsive recovery portal showcasing active item feeds, search and tag filtering, report filing forms for lost and found items, match suggestion badges, and a secure claiming workflow.",
    functionalScope: [
      "Structured report logging for both lost and found belongings",
      "Granular filtering by item category, campus location, and incident date",
      "Algorithmic candidate match indicator comparing lost descriptions with found items",
      "Secure claim verification procedure and recovery status lifecycle"
    ],
    rulesReferences: "90-Minute Prototype Building Period. Presentation 60%, Prototype 40%. Prototype evaluated by AI.",
    evaluationCriteria: "Presentation (60%), Functional Prototype (40% evaluated by AI).",
    publicationStatus: "PUBLISHED",
    publishedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin@innovrush.nbkrist.org",
    updatedBy: "admin@innovrush.nbkrist.org"
  }
];
