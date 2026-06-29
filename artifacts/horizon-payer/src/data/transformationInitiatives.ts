export type ValueCategory =
  | "Labor Productivity"
  | "Revenue / Margin Protection"
  | "Technology Cost Reduction"
  | "Risk & Compliance Reduction"
  | "Experience Improvement";

export type InitiativeStatus = "Active Discovery" | "MVP Design" | "Planned" | "In Delivery";
export type Complexity = "High" | "Medium-High" | "Medium" | "Low";

export interface Metric {
  label: string;
  value: string;
  note?: string;
}

export interface ValueLever {
  label: string;
  category: ValueCategory;
  lowM: number;
  highM: number;
}

export interface Phase {
  label: string;
  duration: string;
  deliverables: string[];
  outcome: string;
  decisionGate?: string;
}

export interface Persona {
  title: string;
  painToday: string;
  benefitTomorrow: string;
}

export interface Risk {
  risk: string;
  mitigation: string;
  level: "High" | "Medium" | "Low";
}

export interface AwsComponent {
  label: string;
  services: string[];
  icon: string;
}

export interface TransformationInitiative {
  id: string;
  title: string;
  shortDescription: string;
  storyline: string;
  purpose: string;
  businessPain: string[];
  annualValueLow: number;
  annualValueHigh: number;
  complexityScore: number;
  businessValueScore: number;
  speedToValueScore: number;
  complexity: Complexity;
  deliveryHorizon: string;
  firstMvp: string;
  status: InitiativeStatus;
  confidenceLevel: "High" | "Medium-High" | "Medium";
  currentStateMetrics: Metric[];
  targetStateMetrics: Metric[];
  valueLevers: ValueLever[];
  roiNote: string;
  howIbmHelps: string[];
  awsPattern: AwsComponent[];
  implementationRoadmap: Phase[];
  personas: Persona[];
  risks: Risk[];
  kpis: { category: string; items: string[] }[];
  primaryColor: string;
  accentColor: string;
  icon: string;
}

export const TRANSFORMATION_INITIATIVES: TransformationInitiative[] = [
  {
    id: "ups",
    title: "UPS Modernization",
    shortDescription: "Modernize Horizon's payment operations from a legacy batch platform to a resilient, always-available cloud-native payment services platform on AWS.",
    storyline: "From batch-heavy payment operations to a resilient, always-available, cloud-native payment services platform.",
    purpose: "Modernize Horizon's Universal Payment System into a cloud-native AWS platform that improves payment processing availability, accelerates troubleshooting, strengthens claim and payment visibility, reduces paper dependency, and creates a scalable foundation for provider and subscriber payment operations.",
    businessPain: [
      "High operational cost from legacy batch processing and platform complexity",
      "Online screens unavailable during long batch windows (~10 hours daily)",
      "File-based processing creates troubleshooting delays and limited traceability",
      "Limited end-to-end balancing and claim/payment tracking visibility",
      "Heavy document and print dependency (60K+ pages daily)",
      "Limited agility for new payment methods, reporting needs, and operational controls",
    ],
    annualValueLow: 8,
    annualValueHigh: 14,
    complexityScore: 9,
    businessValueScore: 8,
    speedToValueScore: 5,
    complexity: "High",
    deliveryHorizon: "18–24 months",
    firstMvp: "Payment observability and reconciliation services",
    status: "Active Discovery",
    confidenceLevel: "Medium-High",
    currentStateMetrics: [
      { label: "Daily Claims Processed", value: "500K" },
      { label: "Daily Payment Value", value: "$90M" },
      { label: "Daily Staged / Delayed Payments", value: "$13M" },
      { label: "EFT Payment Share", value: "90–95%" },
      { label: "Daily Printed Pages", value: "60K" },
      { label: "Reports Generated", value: "150+" },
      { label: "Batch Window Duration", value: "~10 hrs" },
      { label: "Concurrent Users", value: "50" },
      { label: "Online Screens", value: "130+" },
      { label: "Batch Jobs", value: "~300" },
    ],
    targetStateMetrics: [
      { label: "Batch Window", value: "2–4 hrs (near real-time)", note: "Target: event-driven processing" },
      { label: "Business Availability", value: "Toward 24/7 access" },
      { label: "Print Reduction", value: "40–70%" },
      { label: "Issue Resolution Time", value: "−30–50%" },
      { label: "Payment Traceability", value: "Full end-to-end audit trail" },
      { label: "Reconciliation Accuracy", value: "Automated & real-time" },
      { label: "Cloud Scalability", value: "AWS-native, elastic" },
      { label: "Compliance Readiness", value: "Improved audit controls" },
    ],
    valueLevers: [
      { label: "Run Cost Optimization", category: "Technology Cost Reduction", lowM: 2, highM: 4 },
      { label: "Batch Processing Reduction", category: "Technology Cost Reduction", lowM: 1, highM: 2 },
      { label: "Print & Document Reduction", category: "Technology Cost Reduction", lowM: 1, highM: 2 },
      { label: "Payment Exception Resolution", category: "Labor Productivity", lowM: 1.5, highM: 2.5 },
      { label: "Reconciliation Rework Reduction", category: "Labor Productivity", lowM: 1, highM: 1.5 },
      { label: "Compliance & Audit Risk", category: "Risk & Compliance Reduction", lowM: 0.5, highM: 1 },
      { label: "Provider / Subscriber Experience", category: "Experience Improvement", lowM: 1, highM: 1 },
    ],
    roiNote: "All financial values are directional business case estimates.",
    howIbmHelps: [
      "Define the modernization roadmap and migration wave strategy",
      "Extract, document, and validate payment business rules",
      "Design AWS-native payment services and event-driven architecture",
      "Create the migration and coexistence plan (no big-bang cutover)",
      "Manage delivery governance and program risk",
      "Modernize operational processes and reporting",
      "Automate testing, reconciliation, and cutover validation",
      "Stabilize production and provide hypercare support",
    ],
    awsPattern: [
      { label: "Event-Driven Orchestration", services: ["AWS Step Functions", "Amazon EventBridge"], icon: "⚡" },
      { label: "Payment Services", services: ["AWS Lambda", "Containerized microservices"], icon: "💳" },
      { label: "Secure Data Layer", services: ["Amazon S3", "Amazon RDS / Aurora"], icon: "🗄️" },
      { label: "Observability", services: ["Amazon CloudWatch", "Distributed tracing"], icon: "📊" },
      { label: "Security & Compliance", services: ["AWS IAM", "AWS KMS", "Audit logging"], icon: "🔒" },
      { label: "DevSecOps", services: ["CI/CD pipeline", "Automated testing"], icon: "🔄" },
    ],
    implementationRoadmap: [
      {
        label: "Phase 1 — Discover & Design",
        duration: "0–3 months",
        deliverables: [
          "Business rule discovery and documentation",
          "Payment flow mapping and interface inventory",
          "Target AWS architecture design",
          "Business case validation",
          "Migration wave plan",
        ],
        outcome: "Validated modernization blueprint and prioritized migration backlog",
        decisionGate: "Executive sponsor approval of target architecture and funding commitment",
      },
      {
        label: "Phase 2 — Build Foundation",
        duration: "3–9 months",
        deliverables: [
          "Build AWS payment services foundation",
          "Create payment reconciliation and observability layer",
          "Build coexistence integrations",
          "Prioritize high-value payment workflows",
        ],
        outcome: "Production-ready payment observability and first modernized services live",
      },
      {
        label: "Phase 3 — Incremental Migration",
        duration: "9–18 months",
        deliverables: [
          "Migrate payment functions incrementally",
          "Modernize reporting and document generation",
          "Automate testing and reconciliation",
          "Begin production pilots with selected payment types",
        ],
        outcome: "Measurable reduction in batch window and print volume; improved traceability",
        decisionGate: "Go/no-go on accelerated migration scope for Phase 4",
      },
      {
        label: "Phase 4 — Scale & Cutover",
        duration: "18–24 months",
        deliverables: [
          "Scale migration across remaining payment functions",
          "Reduce legacy platform dependency",
          "Full cutover and hypercare",
          "Operational handover to Horizon teams",
        ],
        outcome: "Cloud-native payment platform live; legacy dependency eliminated",
      },
    ],
    personas: [
      { title: "Payment Operations Analyst", painToday: "Manual exception research across fragmented screens during limited online windows", benefitTomorrow: "Real-time payment dashboards with end-to-end traceability and automated exception alerts" },
      { title: "Provider Payment Team", painToday: "High inquiry volume due to payment delays and limited status visibility", benefitTomorrow: "Self-service payment status, faster EFT processing, reduced provider friction" },
      { title: "Finance Reconciliation Team", painToday: "Manual reconciliation across batch files with limited audit trail", benefitTomorrow: "Automated reconciliation, real-time balancing, clean audit evidence" },
      { title: "Claims Operations Leader", painToday: "Claim-to-payment cycle delayed by batch processing windows", benefitTomorrow: "Faster claim-to-payment cycle with improved visibility across the payment chain" },
      { title: "IT Operations Leader", painToday: "Complex legacy platform with high support burden and limited scalability", benefitTomorrow: "Cloud-native platform with modern observability, elastic scale, and reduced operational risk" },
      { title: "Compliance / Audit Stakeholder", painToday: "Limited auditability and manual evidence collection", benefitTomorrow: "Automated audit logs, policy controls, and compliance reporting" },
    ],
    risks: [
      { risk: "Business rule complexity in legacy platform", mitigation: "Deep discovery phase with structured rule extraction and validation", level: "High" },
      { risk: "Coexistence complexity during phased migration", mitigation: "Strangler-fig pattern with clear interface boundaries; no big-bang cutover", level: "High" },
      { risk: "Data quality and reconciliation gaps", mitigation: "Automated reconciliation tooling and dual-run validation before cutover", level: "Medium" },
      { risk: "Change adoption across payment operations teams", mitigation: "Embedded change management; Horizon team training and co-delivery model", level: "Medium" },
      { risk: "Integration dependencies with claims and enrollment systems", mitigation: "API-first integration strategy; phased cutover to limit blast radius", level: "Medium" },
      { risk: "Funding continuity across 24-month programme", mitigation: "Value-gated phases; early MVP delivers measurable savings to fund subsequent waves", level: "Medium" },
    ],
    kpis: [
      { category: "Operational", items: ["Batch window duration", "Payment exception volume", "Payment issue resolution time", "Reconciliation accuracy", "System availability"] },
      { category: "Financial", items: ["Cost per payment transaction", "Print and postage spend", "Reconciliation rework cost", "Operations FTE productivity"] },
      { category: "Experience", items: ["Provider payment inquiry volume", "Payment status self-service rate", "Provider satisfaction score"] },
      { category: "Risk & Compliance", items: ["Audit finding count", "Payment control exceptions", "Regulatory reporting cycle time"] },
    ],
    primaryColor: "#1e40af",
    accentColor: "#dbeafe",
    icon: "💳",
  },

  {
    id: "q2c",
    title: "Quote-to-Card",
    shortDescription: "Reimagine Horizon's Large Group quoting process to improve sales productivity, underwriting collaboration, quote turnaround, and enrollment handoff quality.",
    storyline: "From fragmented large-group quoting to a faster, cleaner, collaborative sales-to-enrollment experience.",
    purpose: "Reimagine Horizon's Large Group Quote-to-Card process to improve sales productivity, underwriting collaboration, data quality, quote turnaround, enrollment handoff, and customer experience.",
    businessPain: [
      "Large Group process is siloed and built on outdated tools",
      "Sales and underwriting teams work across fragmented systems and manual communications",
      "Every group must be created as an account, adding unnecessary complexity",
      "Limited versioning makes it hard to know which quote or enrollment record is current",
      "Manual handoffs increase risk, rework, cycle time, and customer friction",
      "Teams cannot leverage modern workflow and CRM capabilities",
    ],
    annualValueLow: 5,
    annualValueHigh: 9,
    complexityScore: 5,
    businessValueScore: 6,
    speedToValueScore: 8,
    complexity: "Medium",
    deliveryHorizon: "9–12 months",
    firstMvp: "Large Group quote workflow and version control",
    status: "MVP Design",
    confidenceLevel: "Medium",
    currentStateMetrics: [
      { label: "Quote Cycle Time", value: "10–15 business days" },
      { label: "Manual Touchpoints per Quote", value: "15–25" },
      { label: "Rework Rate", value: "15–25%" },
      { label: "Sales / UW Productivity Leakage", value: "20–30%" },
      { label: "Data Quality Issue Rate", value: "8–12%" },
      { label: "Quote Version Clarity", value: "Low — no system of record" },
    ],
    targetStateMetrics: [
      { label: "Quote Cycle Time", value: "5–8 business days" },
      { label: "Manual Touchpoint Reduction", value: "35–50%" },
      { label: "Rework Reduction", value: "30–45%" },
      { label: "Data Quality Improvement", value: "40–60%" },
      { label: "Win-Rate Improvement", value: "+1–3 percentage points" },
      { label: "Broker / Employer Satisfaction", value: "Materially improved" },
    ],
    valueLevers: [
      { label: "Sales Productivity", category: "Labor Productivity", lowM: 1.5, highM: 2.5 },
      { label: "Underwriting Productivity", category: "Labor Productivity", lowM: 1, highM: 2 },
      { label: "Quote Rework Reduction", category: "Labor Productivity", lowM: 0.5, highM: 1 },
      { label: "Win Rate Improvement", category: "Revenue / Margin Protection", lowM: 1, highM: 2 },
      { label: "Enrollment Handoff Quality", category: "Risk & Compliance Reduction", lowM: 0.5, highM: 1 },
      { label: "Broker / Employer Experience", category: "Experience Improvement", lowM: 0.5, highM: 0.5 },
    ],
    roiNote: "All financial values are directional business case estimates.",
    howIbmHelps: [
      "Co-create the future-state Quote-to-Card experience with Horizon stakeholders",
      "Define personas and moments that matter across broker, employer, sales, and underwriting",
      "Map current and target process journeys and identify capability gaps",
      "Create a value tree and prioritize epics and features",
      "Define the implementation roadmap and agile delivery model",
      "Guide adoption across sales, underwriting, operations, and technology teams",
      "Design AWS-native integration layer connecting CRM, quoting, and enrollment",
    ],
    awsPattern: [
      { label: "API-First Integration", services: ["AWS API Gateway", "RESTful APIs"], icon: "🔗" },
      { label: "Workflow Orchestration", services: ["AWS Step Functions", "Quote approval flows"], icon: "⚡" },
      { label: "Event-Driven Updates", services: ["Amazon EventBridge", "Quote status events"], icon: "📡" },
      { label: "Document Services", services: ["Amazon S3", "Cloud-native generation"], icon: "📄" },
      { label: "Analytics & Insights", services: ["Quote funnel dashboards", "Win/loss analytics"], icon: "📊" },
      { label: "Downstream Integration", services: ["Enrollment systems", "Billing platforms"], icon: "🔄" },
    ],
    implementationRoadmap: [
      {
        label: "Phase 1 — Co-Design",
        duration: "0–6 weeks",
        deliverables: [
          "Co-create future-state vision with stakeholders",
          "Stakeholder interviews and process observation",
          "Define personas: broker, employer, sales rep, underwriter",
          "Map pain points and moments that matter",
          "Define value framework and high-level roadmap",
        ],
        outcome: "Aligned future-state vision and prioritized backlog ready for MVP build",
        decisionGate: "Horizon stakeholder sign-off on future-state target and MVP scope",
      },
      {
        label: "Phase 2 — MVP Design",
        duration: "2–4 months",
        deliverables: [
          "Build MVP backlog and target process model",
          "Prototype key workflows and data model",
          "Create integration strategy",
          "Confirm adoption and change management plan",
        ],
        outcome: "MVP prototype validated; integration design approved",
      },
      {
        label: "Phase 3 — Pilot Delivery",
        duration: "4–9 months",
        deliverables: [
          "Deliver MVP for selected Large Group segment",
          "Implement workflow automation for quote and approval",
          "Launch dashboards and quote pipeline metrics",
          "Pilot with sales and underwriting teams",
        ],
        outcome: "Measurable reduction in cycle time and rework; initial win-rate data emerging",
      },
      {
        label: "Phase 4 — Scale",
        duration: "9–12 months",
        deliverables: [
          "Scale to broader Large Group operations",
          "Optimize quote-to-enrollment handoff",
          "Add advanced analytics and continuous improvement loop",
        ],
        outcome: "Full Large Group quote-to-card process on modernized platform",
        decisionGate: "Performance review against KPIs; decision on expansion to other segments",
      },
    ],
    personas: [
      { title: "Sales Representative", painToday: "Manual coordination with underwriting across emails and spreadsheets; version confusion", benefitTomorrow: "Unified quote workspace with real-time collaboration, version control, and status tracking" },
      { title: "Underwriter", painToday: "Reactive requests, limited data quality, manual back-and-forth with sales", benefitTomorrow: "Structured digital handoffs, cleaner data, and configurable approval workflows" },
      { title: "Broker", painToday: "Slow response times and limited visibility into quote progress", benefitTomorrow: "Faster turnaround, proactive status updates, and a better experience throughout" },
      { title: "Employer Group Administrator", painToday: "Friction during enrollment setup and limited clarity on quote terms", benefitTomorrow: "Cleaner onboarding experience with fewer errors and faster activation" },
      { title: "Enrollment Operations Analyst", painToday: "High defect rate on enrollment handoffs from quoting process", benefitTomorrow: "Structured handoffs with validated data, reducing enrollment rework by 30–45%" },
    ],
    risks: [
      { risk: "CRM and enrollment system integration complexity", mitigation: "API-first integration layer isolates changes; phased integration approach", level: "Medium" },
      { risk: "Change adoption across sales and underwriting teams", mitigation: "Embedded change management; co-design model builds early ownership", level: "Medium" },
      { risk: "Data model and account structure complexity", mitigation: "Data model workshop in Phase 1; phased migration approach", level: "Medium" },
      { risk: "Win-rate attribution and ROI validation", mitigation: "Clear KPI baseline established before MVP; controlled pilot to measure impact", level: "Low" },
    ],
    kpis: [
      { category: "Operational", items: ["Quote turnaround time", "Quote rework rate", "Manual touches per quote", "Quote-to-enrollment defect rate"] },
      { category: "Financial", items: ["Sales team productivity", "Underwriting productivity", "Cost per quote", "Win rate by segment"] },
      { category: "Experience", items: ["Broker satisfaction score", "Employer satisfaction score", "Sales team experience score"] },
      { category: "Risk & Compliance", items: ["Data quality issue rate", "Version control compliance", "Enrollment error rate from quoting"] },
    ],
    primaryColor: "#0f766e",
    accentColor: "#ccfbf1",
    icon: "📋",
  },

  {
    id: "dfd",
    title: "Digital Front Door",
    shortDescription: "Create a unified enrollment intake gateway that shifts quality checks left, reduces member activation time from 4 days to same-day, and eliminates cascading processing failures.",
    storyline: "From delayed enrollment processing to a real-time digital intake and validation gateway.",
    purpose: "Create a unified Digital Front Door for enrollment intake, validation, identity mastering, exception handling, partner visibility, and downstream publication. Shift quality checks left, reduce rework, accelerate member activation, and create a better experience for members, providers, trading partners, and internal operations.",
    businessPain: [
      "Enrollment intake is fragmented across EDI, Excel, portals, APIs, and file drops",
      "Validation is inconsistent and often happens late — downstream systems catch errors",
      "Identity mastering occurs downstream, creating rework and timing delays",
      "Current process is batch-anchored around a 7 PM processing gate",
      "A happy path still takes ~48 hours; a single failure adds 24 hours; cascading failures stretch to 5 days",
      "Limited observability across intake, validation, mastering, and downstream publication",
      "Delays impact newborn coverage, prior authorization readiness, member letters, and compliance",
    ],
    annualValueLow: 16,
    annualValueHigh: 26,
    complexityScore: 7,
    businessValueScore: 10,
    speedToValueScore: 8,
    complexity: "Medium-High",
    deliveryHorizon: "12–18 months",
    firstMvp: "Enrollment intake, validation, and command center",
    status: "Active Discovery",
    confidenceLevel: "High",
    currentStateMetrics: [
      { label: "Total Members", value: "1.67M" },
      { label: "Annual E&E Transactions", value: "2.03M" },
      { label: "E&E FTE Count", value: "435" },
      { label: "Annual Labor Cost", value: "$33M" },
      { label: "Manual Exception Rate", value: "1.3%" },
      { label: "Auto-Ingestion Rate", value: "80%" },
      { label: "Enrollment Error Rate", value: "4.1%" },
      { label: "Member Activation Time", value: "4 days" },
      { label: "PA Publication Latency", value: "2.2 days avg" },
      { label: "Happy Path Newborn Enrollment", value: "48 hours" },
      { label: "Worst-Case Cascading Failure", value: "119 hours" },
    ],
    targetStateMetrics: [
      { label: "Auto-Ingestion Rate", value: "96%" },
      { label: "Exception Rate", value: "0.25–0.5%" },
      { label: "Enrollment Error Rate", value: "1.5%" },
      { label: "Member Activation Time", value: "Same day (priority cases)" },
      { label: "PA Publication Latency", value: "0.5 days" },
      { label: "Error Detection Time", value: "5 minutes (vs. 13.5 hours)" },
      { label: "Redeployable Capacity", value: "Up to 124 FTEs" },
      { label: "Manual Error Correction", value: "−40–60%" },
      { label: "Shift-Left Processing", value: "4.5–12 hrs for priority cases" },
    ],
    valueLevers: [
      { label: "Labor Optimization (FTE Redeployment)", category: "Labor Productivity", lowM: 7, highM: 12 },
      { label: "Member Retention Margin Protected", category: "Revenue / Margin Protection", lowM: 3, highM: 5 },
      { label: "Prior Auth Efficiency", category: "Labor Productivity", lowM: 2, highM: 3 },
      { label: "Reduced Manual Exception Handling", category: "Labor Productivity", lowM: 1.5, highM: 2.5 },
      { label: "Call Center Volume Reduction", category: "Experience Improvement", lowM: 1, highM: 2 },
      { label: "Compliance Risk Reduction", category: "Risk & Compliance Reduction", lowM: 1, highM: 1.5 },
      { label: "Provider / Member Friction Reduction", category: "Experience Improvement", lowM: 0.5, highM: 0.5 },
    ],
    roiNote: "All financial values are directional business case estimates.",
    howIbmHelps: [
      "Design and deliver the Digital Front Door operating model",
      "Define intake and validation standards across all enrollment channels",
      "Establish partner onboarding, SLA framework, and sandbox processes",
      "Design AWS-native event-driven architecture for real-time intake and validation",
      "Build the enrollment command center experience with operational dashboards",
      "Implement exception triage and remediation workflows",
      "Create delivery governance and change adoption programme",
      "Scale the platform across all enrollment channels and trading partners",
    ],
    awsPattern: [
      { label: "Multi-Channel Intake", services: ["AWS API Gateway", "Secure file transfer (S3)", "Portal upload"], icon: "📥" },
      { label: "Validation & Normalization", services: ["AWS Lambda", "Containerized validation services"], icon: "✅" },
      { label: "Event-Driven Processing", services: ["Amazon EventBridge", "AWS Step Functions"], icon: "⚡" },
      { label: "Operational Data", services: ["Amazon RDS / Aurora", "Amazon DynamoDB (status tracking)"], icon: "🗄️" },
      { label: "Search & Visibility", services: ["Amazon OpenSearch", "Operational command center"], icon: "🔍" },
      { label: "Security & Compliance", services: ["AWS KMS", "AWS IAM", "HIPAA-aligned audit logging"], icon: "🔒" },
    ],
    implementationRoadmap: [
      {
        label: "Phase 1 — Validate & Design",
        duration: "0–8 weeks",
        deliverables: [
          "Validate priority use cases and intake channels",
          "Define target operating model",
          "Build clickable prototype",
          "Define MVP backlog and value case",
        ],
        outcome: "Validated priority use cases and approved MVP scope",
        decisionGate: "Business and IT sign-off on MVP scope and intake channel prioritization",
      },
      {
        label: "Phase 2 — Build Foundation",
        duration: "2–4 months",
        deliverables: [
          "Build Digital Front Door intake foundation",
          "Implement pre-validation and structural validation",
          "Create partner status visibility dashboard",
          "Build enrollment command center MVP",
          "Pilot selected enrollment channel",
        ],
        outcome: "First channel live with real-time validation and partner visibility",
      },
      {
        label: "Phase 3 — Expand Capabilities",
        duration: "4–9 months",
        deliverables: [
          "Add eligibility checks and identity matching",
          "Build exception triage and remediation workflows",
          "Integrate downstream publication status",
          "Expand to additional enrollment channels",
        ],
        outcome: "Measurable reduction in exception rate, activation time, and PA latency",
        decisionGate: "Performance review; decision on accelerated channel expansion",
      },
      {
        label: "Phase 4 — Scale",
        duration: "9–18 months",
        deliverables: [
          "Scale to full enrollment ecosystem",
          "Add advanced observability and anomaly detection",
          "Expand partner onboarding automation",
          "Optimize prior authorization and downstream readiness",
        ],
        outcome: "96% auto-ingestion, same-day member activation, and up to 124 FTEs redeployed",
      },
    ],
    personas: [
      { title: "Enrollment Administrator", painToday: "High manual exception volume; limited visibility into where failures occur", benefitTomorrow: "Real-time exception dashboards, automated triage, and measurable reduction in manual touches" },
      { title: "Trading Partner", painToday: "Limited feedback on submission status; slow error notifications", benefitTomorrow: "Self-service status portal, sub-5-minute error detection, and structured SLA framework" },
      { title: "Prior Auth Reviewer", painToday: "Eligibility not available for 2+ days post-enrollment; delays clinical decisions", benefitTomorrow: "Same-day eligibility publication for priority cases; PA latency cut to 0.5 days" },
      { title: "Call Center Representative", painToday: "High call volume from members whose coverage isn't showing after enrollment", benefitTomorrow: "Same-day or next-day activation reduces enrollment-related call volume significantly" },
      { title: "Operations Leader", painToday: "No consolidated view across intake, validation, mastering, and downstream", benefitTomorrow: "Enrollment command center with end-to-end visibility and SLA tracking" },
      { title: "Compliance Stakeholder", painToday: "Newborn and SEP coverage delays create regulatory exposure", benefitTomorrow: "Priority lanes for compliance-sensitive enrollments; audit trail for all transactions" },
    ],
    risks: [
      { risk: "Integration complexity with downstream systems (claims, PA, enrollment)", mitigation: "API-first design; phased integration with coexistence period", level: "High" },
      { risk: "Trading partner readiness and API adoption", mitigation: "Structured partner onboarding programme with sandbox environment", level: "High" },
      { risk: "Change adoption across E&E operations teams (435 FTEs)", mitigation: "Embedded change management; FTE redeployment strategy developed upfront", level: "High" },
      { risk: "Data quality in legacy enrollment records", mitigation: "Data profiling in Phase 1; validation rules designed to incrementally improve quality", level: "Medium" },
      { risk: "Compliance approval for new intake architecture", mitigation: "Compliance and CISO engaged from Phase 1 design; HIPAA controls built in", level: "Medium" },
      { risk: "Batch dependency on 7 PM processing gate", mitigation: "Phased shift to event-driven; batch gate retained until coexistence proven", level: "Medium" },
    ],
    kpis: [
      { category: "Operational", items: ["Time-to-good", "Member activation time", "Error detection time", "Auto-ingestion rate", "Exception rate", "Manual touches per transaction"] },
      { category: "Financial", items: ["E&E FTE productivity", "Cost per enrollment transaction", "Call center volume (enrollment-related)", "Rework cost"] },
      { category: "Experience", items: ["Partner SLA adherence", "Member coverage activation satisfaction", "Call center first-contact resolution for enrollment"] },
      { category: "Risk & Compliance", items: ["Newborn coverage activation time", "Prior auth publication latency", "Downstream ACK/NACK rate", "Regulatory notice timeliness"] },
    ],
    primaryColor: "#6d28d9",
    accentColor: "#ede9fe",
    icon: "🚪",
  },

  {
    id: "docmod",
    title: "Document Modernization",
    shortDescription: "Modernize Horizon's payer document ecosystem to reduce print dependency, improve communication accuracy, and create a reusable AWS-native document services foundation.",
    storyline: "From paper-heavy, fragmented communications to intelligent, digital-first payer document operations.",
    purpose: "Modernize Horizon's payer document ecosystem to reduce print and mail dependency, improve member and provider communication accuracy, increase digital adoption, accelerate document generation, strengthen compliance controls, and create a reusable AWS-native document services foundation.",
    businessPain: [
      "High print and mail cost across 60K+ pages per day from payment operations alone",
      "Fragmented document templates and business rules across 100+ enterprise document types",
      "Slow document generation and approval cycles — same day to multiple days",
      "Risk of inconsistent or outdated language across member and regulatory communications",
      "Limited visibility into document status and delivery confirmation",
      "Paper dependency creates delays for members and providers receiving critical communications",
      "Manual quality checks increase cost and compliance risk",
      "Document archives are difficult to search, retrieve, and operationalize",
    ],
    annualValueLow: 9,
    annualValueHigh: 15,
    complexityScore: 6,
    businessValueScore: 8,
    speedToValueScore: 7,
    complexity: "Medium",
    deliveryHorizon: "12–18 months",
    firstMvp: "High-volume EOB / EOP and PA letter modernization",
    status: "Planned",
    confidenceLevel: "Medium-High",
    currentStateMetrics: [
      { label: "Daily Printed Pages (Payment)", value: "60K+" },
      { label: "Enterprise Document Types", value: "100+" },
      { label: "Print/Mail Dependency", value: "High" },
      { label: "Manual Document QA", value: "High dependency" },
      { label: "Document Generation Cycle", value: "Same day to multi-day" },
      { label: "Member/Provider Status Visibility", value: "Limited" },
      { label: "Template Standardization", value: "Low to medium" },
      { label: "Digital Delivery Adoption", value: "Inconsistent by type" },
    ],
    targetStateMetrics: [
      { label: "Print Volume Reduction", value: "40–70%" },
      { label: "Document Generation Cycle", value: "−50–80% faster" },
      { label: "Manual QA Reduction", value: "30–50%" },
      { label: "Template Rationalization", value: "25–40% reduction" },
      { label: "Digital Delivery Adoption", value: "+20–35 percentage points" },
      { label: "Document Inquiry Reduction", value: "15–25%" },
      { label: "Compliance Audit Readiness", value: "High — automated evidence" },
      { label: "Search & Retrieval Time", value: "−60–80%" },
    ],
    valueLevers: [
      { label: "Print & Postage Cost Reduction", category: "Technology Cost Reduction", lowM: 3, highM: 5 },
      { label: "Reduced Call Center Inquiries", category: "Experience Improvement", lowM: 1.5, highM: 2.5 },
      { label: "Manual QA Effort Reduction", category: "Labor Productivity", lowM: 1.5, highM: 2.5 },
      { label: "Faster Member / Provider Communications", category: "Experience Improvement", lowM: 1, highM: 2 },
      { label: "Compliance & Audit Risk", category: "Risk & Compliance Reduction", lowM: 1, highM: 1.5 },
      { label: "Template Rationalization", category: "Technology Cost Reduction", lowM: 1, highM: 1.5 },
    ],
    roiNote: "All financial values are directional business case estimates.",
    howIbmHelps: [
      "Assess the full document landscape and rationalize templates",
      "Define digital-first communication journeys for members and providers",
      "Design a payer document services architecture on AWS",
      "Modernize document generation workflows and template governance",
      "Improve document compliance controls and regulatory review processes",
      "Automate testing, quality checks, and audit evidence",
      "Manage change adoption across business, operations, legal, and compliance teams",
    ],
    awsPattern: [
      { label: "Document Services Layer", services: ["Central API for generation, retrieval, delivery"], icon: "📄" },
      { label: "Secure Storage & Archive", services: ["Amazon S3", "Versioning and retention controls"], icon: "🗄️" },
      { label: "Search & Retrieval", services: ["Amazon OpenSearch", "Metadata-driven search"], icon: "🔍" },
      { label: "Event-Driven Generation", services: ["Amazon EventBridge", "AWS Step Functions"], icon: "⚡" },
      { label: "Digital Delivery", services: ["Preference management API", "Member & provider portals"], icon: "📱" },
      { label: "Audit & Compliance", services: ["Audit logging", "Encryption (AWS KMS)", "Role-based access (IAM)"], icon: "🔒" },
    ],
    implementationRoadmap: [
      {
        label: "Phase 1 — Assess & Prioritize",
        duration: "0–8 weeks",
        deliverables: [
          "Inventory high-volume document types and top print/mail cost drivers",
          "Assess template duplication and compliance-critical communications",
          "Map current document generation workflows",
          "Define future-state document operating model",
          "Build directional business case",
        ],
        outcome: "Prioritized document modernization backlog with clear ROI ranking",
        decisionGate: "Horizon sign-off on priority document types and MVP scope",
      },
      {
        label: "Phase 2 — Build MVP",
        duration: "2–4 months",
        deliverables: [
          "Build document services foundation on AWS",
          "Prioritize EOBs, EOPs, PA letters, ID cards, and enrollment letters",
          "Create template governance and approval workflows",
          "Implement digital delivery preference model",
          "Build audit and delivery status tracking",
        ],
        outcome: "First high-volume document types modernized; digital delivery live",
      },
      {
        label: "Phase 3 — Migrate & Integrate",
        duration: "4–9 months",
        deliverables: [
          "Migrate high-volume document workflows",
          "Integrate member portal, provider portal, and operational systems",
          "Add search and retrieval capabilities",
          "Add delivery status dashboards",
          "Reduce duplicate templates",
        ],
        outcome: "Measurable reduction in print volume and document inquiry calls",
        decisionGate: "Performance review; decision on scope for Phase 4 expansion",
      },
      {
        label: "Phase 4 — Scale & Optimize",
        duration: "9–18 months",
        deliverables: [
          "Scale across remaining document types and channels",
          "Retire redundant document processes",
          "Optimize digital adoption by member and provider segment",
          "Improve compliance reporting and servicing analytics",
        ],
        outcome: "40–70% print reduction achieved; digital-first document operations live",
      },
    ],
    personas: [
      { title: "Member", painToday: "Receives paper EOBs, PA letters, and ID cards with delays; limited digital options", benefitTomorrow: "Digital-first delivery with status visibility; faster receipt and easier access to documents" },
      { title: "Provider", painToday: "Paper-based EOP and PA correspondence creates administrative burden", benefitTomorrow: "Digital delivery with self-service retrieval and faster correspondence cycles" },
      { title: "Claims Operations Analyst", painToday: "Manual document QA and exception handling for EOBs and claims correspondence", benefitTomorrow: "Automated QA, exception alerting, and streamlined document review workflows" },
      { title: "Prior Auth Reviewer", painToday: "Paper PA letters create delays in member notification and provider response", benefitTomorrow: "Digital PA letter generation integrated with PA workflow; faster turnaround" },
      { title: "Compliance Reviewer", painToday: "Manual evidence collection for regulatory communications; limited audit trail", benefitTomorrow: "Automated compliance controls, audit logging, and regulatory notice tracking" },
      { title: "Document Operations Team", painToday: "Managing 100+ document templates with fragmented tooling and low standardization", benefitTomorrow: "Centralized template governance, version control, and 25–40% template reduction" },
    ],
    risks: [
      { risk: "Template and business rule complexity across 100+ document types", mitigation: "Phased approach prioritizing high-volume types; template rationalization before migration", level: "High" },
      { risk: "Legal and compliance approval for template changes", mitigation: "Legal and compliance engaged from Phase 1; formal review process established upfront", level: "High" },
      { risk: "Integration with claims, enrollment, PA, and payment systems", mitigation: "API-first integration layer; phased integration starting with highest-volume integrations", level: "Medium" },
      { risk: "Member digital adoption rates", mitigation: "Segmented digital adoption strategy; incentive design for digital enrollment", level: "Medium" },
      { risk: "Data privacy and HIPAA compliance for document storage and delivery", mitigation: "HIPAA-aligned architecture from Day 1; encryption, IAM, and audit logging built in", level: "Medium" },
    ],
    kpis: [
      { category: "Operational", items: ["Printed pages per day", "Document generation cycle time", "Manual QA effort", "Template count", "Document defect rate"] },
      { category: "Financial", items: ["Print and mail cost", "Digital delivery cost per document", "QA labor cost", "Document-related call handling cost"] },
      { category: "Experience", items: ["Digital delivery adoption rate", "Member / provider document satisfaction", "Document-related call volume", "Document retrieval time"] },
      { category: "Risk & Compliance", items: ["Regulatory notice accuracy rate", "Compliance audit finding count", "Document retention compliance", "Audit evidence retrieval time"] },
    ],
    primaryColor: "#b45309",
    accentColor: "#fef3c7",
    icon: "📑",
  },
];

export const PORTFOLIO_SUMMARY = {
  totalValueLow: 38,
  totalValueHigh: 64,
  productivityRange: "20–45%",
  cycleTimeReduction: "40–90%",
  memberProviderImpact: "High",
  awsAlignment: "100%",
  deliveryHorizon: "6–24 months",
};

export const WAVE_ROADMAP = [
  {
    wave: "Wave 1",
    period: "0–6 months",
    items: [
      "Quote-to-Card: future-state design and MVP",
      "Digital Front Door: MVP intake and command center",
      "Document Modernization: assessment and MVP design",
      "UPS Modernization: discovery and roadmap",
    ],
  },
  {
    wave: "Wave 2",
    period: "6–12 months",
    items: [
      "Quote-to-Card: scale to broader Large Group",
      "Digital Front Door: channel expansion",
      "Document Modernization: services MVP live",
      "UPS Modernization: first modernization workstream",
    ],
  },
  {
    wave: "Wave 3",
    period: "12–18 months",
    items: [
      "Digital Front Door: full scale and optimization",
      "Document Modernization: high-volume migration",
      "UPS Modernization: incremental payment migration",
    ],
  },
  {
    wave: "Wave 4",
    period: "18–24 months",
    items: [
      "UPS Modernization: scale and cutover",
      "Enterprise optimization across all four initiatives",
    ],
  },
];

export const DECISIONS_NEEDED = [
  "Confirm executive sponsor for each of the four initiatives",
  "Confirm priority sequencing and funding wave allocation",
  "Approve MVP scope for the first 90 days across active initiatives",
  "Confirm business SMEs and product owners for each initiative pod",
  "Approve AWS-native target architecture principles",
  "Confirm transformation governance cadence (steering committee, QBRs)",
  "Confirm value tracking baseline and KPI ownership",
];
