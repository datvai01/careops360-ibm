import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import {
  Bot, ChevronDown, ChevronUp, CheckCircle2, ShieldCheck,
  Users, TrendingUp, Zap, ArrowRight, Clock, Target,
  AlertTriangle, Star, BarChart2, Activity, Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as SliderPrimitive from "@radix-ui/react-slider";

const IBM_BLUE = "#0f62fe";
const NAVY = "#001050";

const RAMP_DATA = [
  { month: "Month 1", productivity: 3 },
  { month: "Month 2", productivity: 7 },
  { month: "Month 3", productivity: 12 },
  { month: "Month 4", productivity: 18 },
  { month: "Month 5", productivity: 24 },
  { month: "Month 6", productivity: 30 },
];

const AGENT_BAR_DATA = [
  { name: "Incident Triage", value: 25 },
  { name: "Problem Mgmt", value: 12 },
  { name: "QE Test", value: 25 },
  { name: "Modernization", value: 30 },
  { name: "Release Ready", value: 30 },
  { name: "Claims Process", value: 20 },
  { name: "Prior Auth", value: 18 },
  { name: "Member Service", value: 15 },
  { name: "Provider Data", value: 20 },
  { name: "Knowledge/Runbook", value: 20 },
];

const PILLAR_COLORS: Record<string, string> = {
  Operations: "bg-blue-100 text-blue-800 border-blue-200",
  "QE / Modernization": "bg-purple-100 text-purple-800 border-purple-200",
  Modernization: "bg-violet-100 text-violet-800 border-violet-200",
  Transformation: "bg-amber-100 text-amber-800 border-amber-200",
  "Business Operations": "bg-green-100 text-green-800 border-green-200",
};

const AGENTS = [
  {
    name: "Incident Triage Agent",
    pillar: "Operations",
    persona: "L2 Support Analyst, Ops Lead",
    description: "Reviews alerts, tickets, application logs, runbooks, known errors, CMDB records, and historical resolutions to recommend likely root cause and next-best action.",
    inputs: "AIOps alerts, ServiceNow/Jira tickets, application logs, CMDB, runbooks, known error database, prior incident resolutions.",
    outputs: "Triage summary, likely root cause, recommended fix, confidence score, escalation path, similar historical incidents, draft ticket update.",
    kpis: "MTTR reduction, triage effort reduction, first-touch resolution improvement, ticket aging reduction, escalation quality.",
    productivity: "20% to 30%",
    month: "Month 2 build, Month 3 pilot",
    approval: "Yes",
    autonomy: "Level 2 initially → Level 3 by Month 6",
    before: "Analysts manually review alerts, logs, tickets, runbooks, and prior incidents.",
    after: "Agent creates a triage summary, recommends root cause, and suggests next-best action for analyst approval.",
    horizon: "Horizon's managed services environment has high-volume operational work. IBM already understands many of the applications and recurring support patterns, making this a fast-value agent.",
    careops: "CareOps360 can show incident patterns, aging, risk, agent recommendations, and value captured from reduced triage effort.",
  },
  {
    name: "Problem Management Agent",
    pillar: "Operations",
    persona: "Service Manager, Problem Manager, Ops Lead",
    description: "Detects recurring incidents, groups patterns by root cause, identifies problem candidates, and recommends permanent fixes or backlog items.",
    inputs: "Incident history, recurring defects, application ownership data, known errors, service performance data, change history.",
    outputs: "Problem candidate list, recurrence analysis, impact summary, suspected root cause, preventive action recommendation, backlog candidate.",
    kpis: "Repeat incident reduction, problem backlog quality, avoided tickets, recurring issue aging, permanent fix conversion.",
    productivity: "10% to 15%",
    month: "Month 4",
    approval: "Yes",
    autonomy: "Level 2 initially → Level 3 by Month 6",
    before: "Service managers manually identify repeat issues through ticket review and status meetings.",
    after: "Agent highlights recurring patterns and drafts problem candidates for review.",
    horizon: "Reducing repeat incidents directly supports operational stability and frees capacity for modernization work.",
    careops: "CareOps360 can show recurring issue themes, problem candidates, avoided ticket estimates, and modernization backlog linkage.",
  },
  {
    name: "QE Test Agent",
    pillar: "QE / Modernization",
    persona: "Test Lead, QA Analyst, Product Owner",
    description: "Generates test cases, regression packs, traceability mapping, and defect summaries from requirements, user stories, prior test cases, and release scope.",
    inputs: "Requirements, user stories, acceptance criteria, existing test cases, defects, regression history, release scope, application documentation.",
    outputs: "Test scenarios, test cases, regression pack recommendations, traceability matrix, defect summary, coverage gaps.",
    kpis: "Test case creation effort reduction, regression coverage, defect leakage reduction, test cycle acceleration, traceability completeness.",
    productivity: "20% to 30%",
    month: "Month 2 build, Month 3 pilot",
    approval: "Yes",
    autonomy: "Level 2 initially → Level 3 by Month 6",
    before: "Test teams manually create test scenarios and traceability documents.",
    after: "Agent drafts test cases, maps coverage, and recommends regression scope for test lead approval.",
    horizon: "Horizon has a large QE scope. This agent creates measurable productivity in a high-effort delivery area and supports modernization velocity.",
    careops: "CareOps360 can display QE productivity, coverage gaps, defect risk, and regression readiness across pods or projects.",
  },
  {
    name: "Modernization Assessment Agent",
    pillar: "Modernization",
    persona: "Application Owner, Architect, Modernization Lead",
    description: "Assesses application complexity, technical debt, cloud readiness, API dependencies, incident history, and modernization pathway.",
    inputs: "Application inventory, CMDB, code metadata, technology stack, interface inventory, incident history, infrastructure data, security findings.",
    outputs: "Modernization score, complexity score, cloud readiness assessment, risk profile, recommended disposition, migration wave recommendation.",
    kpis: "Assessment cycle time, modernization backlog quality, application disposition accuracy, planning acceleration, technical debt visibility.",
    productivity: "25% to 35%",
    month: "Month 5",
    approval: "Yes",
    autonomy: "Level 2 initially → Level 3 by Month 6",
    before: "Architects manually collect application data and build modernization assessments.",
    after: "Agent creates a structured assessment and recommended modernization path for architect review.",
    horizon: "This connects operational pain points to modernization priorities and supports the move toward product-aligned pods.",
    careops: "CareOps360 can show modernization readiness, technical debt hotspots, value potential, and wave recommendations.",
  },
  {
    name: "Release Readiness Agent",
    pillar: "Transformation",
    persona: "Release Manager, Product Owner, PMO, Delivery Lead",
    description: "Summarizes release status, open risks, defects, test readiness, change dependencies, deployment readiness, and go/no-go recommendations.",
    inputs: "Release plan, defects, test status, change requests, dependency tracker, deployment checklist, risk log, environment readiness.",
    outputs: "Release readiness score, executive summary, risk actions, dependency summary, go/no-go recommendation, draft release briefing.",
    kpis: "Readiness reporting effort, release risk visibility, late issue reduction, governance cycle time, decision quality.",
    productivity: "25% to 35%",
    month: "Month 5",
    approval: "Yes",
    autonomy: "Level 2 initially → Level 3 by Month 6",
    before: "Release managers manually consolidate status across testing, defects, dependencies, and change readiness.",
    after: "Agent creates a release readiness summary and highlights go/no-go risks.",
    horizon: "Horizon's transformation requires better cross-team visibility and faster release decisioning.",
    careops: "CareOps360 can display release readiness scores, open blockers, decision needs, and risk-based release recommendations.",
  },
  {
    name: "Claims Process Agent",
    pillar: "Business Operations",
    persona: "Claims Operations Lead, Business Analyst, Process Owner",
    description: "Reviews claims exception queues, aging claims, denial patterns, adjustment requests, manual rework, and process bottlenecks to recommend next-best action, routing, and backlog candidates.",
    inputs: "Claims exception queues, aging reports, denial codes, adjustment history, business rules, process SOPs, prior resolution notes.",
    outputs: "Claims exception summary, denial pattern analysis, recommended action, routing recommendation, backlog candidate, productivity impact estimate.",
    kpis: "Claims exception handling effort, aging claim reduction, denial rework reduction, manual touchpoint reduction, business backlog quality.",
    productivity: "15% to 25%",
    month: "Month 2 build, Month 3 pilot",
    approval: "Yes",
    autonomy: "Level 2 initially → Level 3 by Month 6",
    before: "Claims teams manually review exceptions, aging, denial patterns, and rework drivers.",
    after: "Agent groups similar exceptions, recommends routing, and identifies recurring backlog candidates.",
    horizon: "This shows Horizon that IBM's AI strategy is not limited to IT. It directly supports payer business operations and measurable productivity.",
    careops: "CareOps360 can show claims exception trends, aging hotspots, manual rework drivers, and recurring business process pain points.",
  },
  {
    name: "Prior Authorization Agent",
    pillar: "Business Operations",
    persona: "Prior Authorization Operations Lead, Clinical Operations Analyst, Intake Specialist",
    description: "Supports prior authorization intake and review readiness by checking for missing information, summarizing request status, identifying routing needs, and recommending next steps based on policy and operational rules.",
    inputs: "PA intake records, clinical documentation checklist, policy rules, member eligibility, provider information, status history, SOPs.",
    outputs: "Intake completeness score, missing information summary, routing recommendation, status summary, next-best action.",
    kpis: "Intake review effort, incomplete request rate, cycle time, manual routing effort, status inquiry effort.",
    productivity: "15% to 20%",
    month: "Month 2 build, Month 3 pilot",
    approval: "Yes",
    autonomy: "Level 2 initially → Level 3 by Month 6",
    before: "PA operations manually inspect intake information, missing documentation, status, and routing.",
    after: "Agent checks completeness, flags missing information, and recommends next-best action.",
    horizon: "Prior authorization is a high-visibility payer process where cycle time and operational effort matter.",
    careops: "CareOps360 can show PA intake quality, cycle time trends, missing information drivers, and queue productivity.",
  },
  {
    name: "Member Service Agent",
    pillar: "Business Operations",
    persona: "Contact Center Lead, Member Service Representative, Member Operations Lead",
    description: "Summarizes member interaction history, identifies repeat contact drivers, suggests next-best action, and creates concise case summaries for faster member issue resolution.",
    inputs: "Member service cases, call notes, benefit information, claim status, authorization status, prior interactions, SOPs.",
    outputs: "Member issue summary, repeat contact reason, recommended next action, escalation guidance, case summary.",
    kpis: "Average handle time, repeat contact rate, case summarization effort, first-contact resolution support, escalation quality.",
    productivity: "10% to 20%",
    month: "Month 4",
    approval: "Yes",
    autonomy: "Level 2 initially → Level 3 by Month 6",
    before: "Representatives manually review member history, claim status, authorization status, and prior contact notes.",
    after: "Agent summarizes the issue and recommends next-best action.",
    horizon: "Better member service support improves productivity and member experience while identifying systemic issues.",
    careops: "CareOps360 can show repeat contact drivers, member issue themes, escalation patterns, and process improvement candidates.",
  },
  {
    name: "Provider Data Agent",
    pillar: "Business Operations",
    persona: "Provider Operations Lead, Data Steward, Network Operations Analyst",
    description: "Reviews provider roster updates, duplicate records, missing data, network status mismatches, and data quality exceptions to recommend corrections and create steward worklists.",
    inputs: "Provider roster files, provider master data, network status data, credentialing data, directory records, exception reports, data quality rules.",
    outputs: "Provider data exception list, duplicate detection, missing data summary, correction recommendation, steward worklist, downstream impact summary.",
    kpis: "Manual provider data review effort, roster processing time, provider directory accuracy, duplicate reduction, downstream issue reduction.",
    productivity: "15% to 25%",
    month: "Month 4",
    approval: "Yes",
    autonomy: "Level 2 initially → Level 3 by Month 6",
    before: "Data stewards manually review rosters, exceptions, mismatches, and duplicates.",
    after: "Agent identifies exceptions, recommends corrections, and creates steward worklists.",
    horizon: "Provider data quality affects claims, member service, provider experience, and compliance-sensitive operations.",
    careops: "CareOps360 can show provider data quality trends, exception worklists, downstream impact, and productivity value.",
  },
  {
    name: "Knowledge / Runbook Agent",
    pillar: "Operations",
    persona: "Support Analyst, New Joiner, Pod Member",
    description: "Answers operational questions using Horizon-specific runbooks, prior tickets, SOPs, known errors, and application knowledge.",
    inputs: "Runbooks, SOPs, prior tickets, known errors, knowledge articles, application documentation.",
    outputs: "Step-by-step guidance, source references, escalation guidance, confidence level, related tickets.",
    kpis: "Analyst onboarding time, knowledge reuse, ticket resolution time, escalation reduction, support consistency.",
    productivity: "15% to 25%",
    month: "Month 3",
    approval: "Yes",
    autonomy: "Level 1 initially → Level 2 by Month 6",
    before: "Analysts search across multiple documents, tickets, and SME channels.",
    after: "Agent provides contextual answers with source references and escalation guidance.",
    horizon: "This preserves institutional knowledge and supports product / pod-based delivery by making knowledge easier to reuse.",
    careops: "CareOps360 can become the front door for operational knowledge, recommendations, runbooks, and guided resolution.",
  },
];

const PERSONAS = [
  {
    name: "L2 Support Analyst",
    role: "Tier 2 IT operations support — first responder for escalated alerts and incidents",
    pain: ["Too much manual log and ticket review", "Limited time to search prior fixes", "High dependency on SME knowledge"],
    agents: ["Incident Triage Agent", "Knowledge / Runbook Agent"],
    saved: "2–4 hours per week per analyst",
    value: "Faster triage, better first-touch resolution, less escalation",
    question: "What is the likely cause of this alert and what was done last time?",
    score: 5,
  },
  {
    name: "Ops Lead",
    role: "Operations leadership — prioritizes tickets, monitors health, drives recurring issue reduction",
    pain: ["Too many tickets to prioritize manually", "Limited visibility into recurring incidents", "Manual status consolidation"],
    agents: ["Incident Triage Agent", "Problem Management Agent", "Knowledge / Runbook Agent"],
    saved: "4–6 hours per week",
    value: "Better prioritization, faster root-cause analysis, reduced repeat issues",
    question: "Which incidents this week are likely related and need problem management?",
    score: 5,
  },
  {
    name: "Service Manager",
    role: "Accountable for service quality, SLA, and recurring issue reduction",
    pain: ["Manual problem identification", "Reactive recurring incident management", "Slow service reporting"],
    agents: ["Problem Management Agent", "Incident Triage Agent"],
    saved: "3–5 hours per week",
    value: "Reduced recurring tickets and better preventive action planning",
    question: "Which incidents should be converted into problem records?",
    score: 4,
  },
  {
    name: "Test Lead",
    role: "QE leadership — owns test planning, regression, traceability, and defect quality",
    pain: ["Manual test case writing", "Regression scope decisions take time", "Traceability is effort-heavy"],
    agents: ["QE Test Agent"],
    saved: "5–8 hours per week",
    value: "Faster test planning, improved coverage, better traceability",
    question: "Generate test scenarios and regression recommendations for this user story.",
    score: 5,
  },
  {
    name: "Application Owner",
    role: "Accountable for application performance, modernization strategy, and technical debt",
    pain: ["Modernization planning requires manual discovery", "Technical debt data is fragmented", "Business pain points not linked to app strategy"],
    agents: ["Modernization Assessment Agent", "Problem Management Agent"],
    saved: "4–7 hours per week",
    value: "Faster modernization intake and better prioritization",
    question: "What is the modernization readiness score for this application?",
    score: 4,
  },
  {
    name: "Release Manager",
    role: "Governs release readiness, dependency tracking, and go/no-go decisions",
    pain: ["Manual release readiness reporting", "Dependencies spread across teams", "Defect and test status consolidation is time-consuming"],
    agents: ["Release Readiness Agent", "QE Test Agent"],
    saved: "4–6 hours per week",
    value: "Faster release governance and improved risk visibility",
    question: "Summarize release readiness and identify go/no-go risks.",
    score: 4,
  },
  {
    name: "Claims Operations Lead",
    role: "Leads claims exception management, denial reduction, and process improvement",
    pain: ["Claims exceptions require manual review", "Aging claims and denial patterns hard to group", "Process issues not linked to technology backlog"],
    agents: ["Claims Process Agent"],
    saved: "5–8 hours per week",
    value: "Reduced claims exception effort and better backlog quality",
    question: "Group these claims exceptions by likely root cause and recommended action.",
    score: 5,
  },
  {
    name: "Prior Authorization Operations Lead",
    role: "Manages PA intake, review readiness, and clinical operations workflow",
    pain: ["Intake completeness review is manual", "Missing information creates delays", "Routing decisions depend on tribal knowledge"],
    agents: ["Prior Authorization Agent"],
    saved: "4–6 hours per week",
    value: "Faster intake review and improved cycle time visibility",
    question: "What information is missing from this PA request and where should it be routed?",
    score: 5,
  },
  {
    name: "Provider Data Steward",
    role: "Maintains provider roster accuracy, data quality, and downstream integrity",
    pain: ["Manual roster review", "Duplicate and mismatch detection is time-consuming", "Downstream impact not always visible"],
    agents: ["Provider Data Agent"],
    saved: "4–6 hours per week",
    value: "Improved provider data quality and reduced downstream issues",
    question: "Identify provider data mismatches and recommend steward actions.",
    score: 4,
  },
  {
    name: "Transformation Office Lead",
    role: "Oversees IBM-Horizon transformation, product/pod evolution, and value delivery",
    pain: ["Transformation progress manually consolidated", "Value tracking is inconsistent", "Product / pod transition requires better visibility"],
    agents: ["Release Readiness Agent", "Modernization Assessment Agent", "Business Process Agents"],
    saved: "4–8 hours per week",
    value: "Better executive visibility and measurable transformation outcomes",
    question: "Which agents are producing measurable productivity this month?",
    score: 5,
  },
];

const WORKFLOWS = [
  {
    title: "AIOps Incident Triage",
    description: "Agent reviews AIOps alert, correlates ticket history, checks logs and runbooks, and recommends resolution.",
    persona: "L2 Support Analyst / Ops Lead",
    input: "AIOps alert, logs, CMDB, runbooks, similar tickets",
    steps: [
      "Alert received from AIOps",
      "Agent checks logs, CMDB, runbook, and similar tickets",
      "Agent identifies likely root cause",
      "Agent recommends resolution and confidence score",
      "Human analyst approves or escalates",
      "Agent updates ticket and knowledge base",
    ],
    output: "Likely root cause: database connection pool saturation. Similar issue occurred 3 times in the last 60 days. Recommended action: restart connection pool service, validate downstream batch queue, and monitor for 30 minutes. Confidence: 82%.",
    productivity: "20–30% triage effort reduction",
    careops: "Update operations health, incident trend, recurring issue risk, and value captured.",
  },
  {
    title: "QE Test Generation",
    description: "Agent converts requirements and user stories into test scenarios, regression recommendations, and traceability.",
    persona: "Test Lead / QA Analyst",
    input: "Requirements, stories, existing test cases, defects, release scope",
    steps: [
      "Requirement or user story selected",
      "Agent reviews prior test cases and defects",
      "Agent generates test scenarios",
      "Agent maps traceability",
      "Test lead reviews and approves",
      "Agent publishes test pack",
    ],
    output: "Generated 14 test scenarios, including 5 positive, 4 negative, 3 regression, and 2 integration scenarios. Found coverage gap for eligibility exception handling.",
    productivity: "20–30% testing productivity improvement",
    careops: "Update QE readiness, coverage gap view, defect risk, and testing productivity dashboard.",
  },
  {
    title: "Claims Exception Workflow",
    description: "Agent reviews claims exceptions, groups patterns, recommends actions, and identifies recurring backlog candidates.",
    persona: "Claims Operations Lead",
    input: "Claims exception queue, aging report, denial codes, adjustment history, SOPs",
    steps: [
      "Claims exception queue selected",
      "Agent reviews denial codes, aging, adjustment history, and SOPs",
      "Agent groups similar exceptions by likely root cause",
      "Agent recommends next-best action or routing",
      "Claims lead approves recommendation",
      "Agent updates worklist and creates backlog candidate if recurring",
    ],
    output: "42 exceptions are related to coordination of benefits mismatch. 18 are aged over 15 days. Recommended action: route to COB review queue and create backlog item for upstream eligibility validation rule.",
    productivity: "15–25% claims exception analysis effort reduction",
    careops: "Update claims exception trend, aging hotspot, business process risk, and modernization backlog candidate.",
  },
  {
    title: "Prior Authorization Workflow",
    description: "Agent checks PA request completeness, missing documentation, routing logic, and next-best action.",
    persona: "Prior Authorization Operations Lead",
    input: "PA intake record, clinical documentation checklist, policy rules, eligibility, provider data",
    steps: [
      "PA request received",
      "Agent checks required documents, eligibility, provider data, and policy rules",
      "Agent identifies missing information",
      "Agent recommends routing and next-best action",
      "PA operations user validates",
      "Agent updates status summary and work queue",
    ],
    output: "PA request is 78% complete. Missing: clinical notes and diagnosis code confirmation. Recommended routing: pending information queue. Suggested outbound note drafted.",
    productivity: "15–20% intake review effort reduction",
    careops: "Update PA cycle time trend, incomplete request drivers, queue productivity, and SLA risk.",
  },
  {
    title: "Member Service Workflow",
    description: "Agent summarizes member issue, prior interactions, claim or authorization status, and recommends next-best action.",
    persona: "Member Service Representative / Contact Center Lead",
    input: "Member case, call notes, benefits, claim status, authorization status, prior contacts",
    steps: [
      "Member case selected",
      "Agent reviews prior contacts, claim status, authorization status, and benefit context",
      "Agent summarizes member issue",
      "Agent recommends next-best action",
      "Service representative validates response",
      "Agent creates case note and flags repeat contact driver",
    ],
    output: "Member has contacted 3 times regarding claim status. Root issue appears to be pending provider documentation. Recommended action: explain status, provide expected next step, and route documentation request to provider operations.",
    productivity: "10–20% case summarization and handling support improvement",
    careops: "Update repeat contact drivers, member issue themes, escalation risk, and process improvement candidates.",
  },
  {
    title: "Provider Data Workflow",
    description: "Agent identifies provider data gaps, duplicate records, roster exceptions, and downstream impact.",
    persona: "Provider Data Steward",
    input: "Provider roster, provider master data, directory records, credentialing data, exception reports",
    steps: [
      "Provider roster or exception file received",
      "Agent checks provider master data, directory records, network status, and credentialing data",
      "Agent identifies duplicates, missing data, and mismatches",
      "Agent recommends corrections",
      "Data steward approves updates",
      "Agent creates worklist and downstream impact summary",
    ],
    output: "Found 27 provider records with network status mismatch and 11 probable duplicates. Recommended steward review for high-volume providers first due to downstream claims and member directory impact.",
    productivity: "15–25% manual provider data review reduction",
    careops: "Update provider data quality score, exception worklist, downstream impact, and productivity value.",
  },
  {
    title: "Modernization Assessment",
    description: "Agent assesses application readiness, technical debt, operational pain, and modernization pathway.",
    persona: "Application Owner / Architect",
    input: "Application inventory, incident history, technology stack, interfaces, infrastructure data, security findings",
    steps: [
      "Application selected",
      "Agent reviews app inventory, incidents, technology stack, interfaces, and risk data",
      "Agent calculates complexity and modernization readiness score",
      "Agent recommends disposition",
      "Architect reviews",
      "Modernization wave plan updated",
    ],
    output: "Application modernization readiness: Medium. Complexity score: 68/100. Recommended path: refactor targeted services and remediate API dependencies before cloud migration. High incident volume supports prioritization in Wave 2.",
    productivity: "25–35% assessment cycle time reduction",
    careops: "Update application modernization score, technical debt hotspot, migration wave recommendation, and value case.",
  },
  {
    title: "Release Readiness",
    description: "Agent reviews test status, open defects, dependencies, change readiness, and release risks.",
    persona: "Release Manager / PMO",
    input: "Release plan, defects, test status, change requests, dependency tracker, deployment checklist, risk log",
    steps: [
      "Release data collected",
      "Agent checks defects, dependencies, testing, change readiness, and deployment checklist",
      "Agent calculates readiness score",
      "Agent drafts executive summary",
      "Release manager approves",
      "Dashboard / briefing updated",
    ],
    output: "Release readiness score: 74/100. Key risks: 3 open severity defects, incomplete regression signoff, and one unresolved dependency. Recommendation: conditional go with defect closure by Thursday.",
    productivity: "25–35% readiness reporting effort reduction",
    careops: "Update release readiness dashboard, open blockers, go/no-go risk, and executive action list.",
  },
];

const ROADMAP = [
  {
    month: "Month 1",
    title: "Foundation & Baseline",
    theme: "Establish agent foundation, data readiness, and measurable baseline.",
    activities: [
      "Confirm pilot areas across IT operations, QE, claims, and prior authorization",
      "Baseline ticket volume, claims exception effort, PA intake effort, QE effort, and release reporting effort",
      "Confirm approved data sources and access",
      "Establish AI governance and PHI/PII guardrails",
      "Define productivity measurement model",
      "Finalize first-wave agent backlog",
      "Align with Horizon product / pod transition roadmap",
    ],
    agents: "None in production — agent designs finalized",
    measurement: "Baseline current effort, cycle time, volume, and quality metrics",
    deliverables: ["Agent backlog", "Baseline productivity dashboard", "Governance model", "Data access plan", "First-wave agent designs"],
    careops: "Create the Autonomous Agents page, baseline dashboard, and mock productivity tracking structure.",
    color: "border-l-slate-400",
    dotColor: "bg-slate-400",
  },
  {
    month: "Month 2",
    title: "Assisted Agent Build",
    theme: "Build first-wave agents as copilots with human review.",
    activities: [
      "Build Incident Triage Agent",
      "Build QE Test Agent",
      "Build Claims Process Agent",
      "Build Prior Authorization Agent",
      "Validate agent outputs with Horizon SMEs",
      "Configure prompt templates",
      "Define approval workflow",
      "Prepare sandbox demos",
    ],
    agents: "Incident Triage Agent, QE Test Agent, Claims Process Agent, Prior Authorization Agent",
    measurement: "Measure accuracy, usefulness, user feedback, time saved in controlled scenarios",
    deliverables: ["Working first-wave agents", "Prompt library", "SME validation results", "Initial demo environment"],
    careops: "Display first-wave agent status, pilot workflow readiness, and validation feedback.",
    color: "border-l-blue-400",
    dotColor: "bg-blue-400",
  },
  {
    month: "Month 3",
    title: "Pilot Deployment",
    theme: "Deploy agents into selected real workflows and start value tracking.",
    activities: [
      "Deploy first-wave agents into selected support, QE, claims, and PA workflows",
      "Capture user feedback",
      "Tune prompts and business rules",
      "Track adoption and productivity",
      "Start weekly value reporting",
      "Create repeatable onboarding materials",
    ],
    agents: "Knowledge / Runbook Agent",
    measurement: "Measure time saved, adoption rate, human approval rate, rework, and cycle time",
    deliverables: ["Pilot performance report", "Value tracking dashboard", "User feedback summary", "Updated prompt and rules library"],
    careops: "Show weekly value, adoption, agent output quality, and human approval metrics.",
    color: "border-l-indigo-400",
    dotColor: "bg-indigo-400",
  },
  {
    month: "Month 4",
    title: "Business Process Expansion",
    theme: "Expand from IT and QE pilots into broader business process productivity.",
    activities: [
      "Add Provider Data Agent",
      "Add Member Service Agent",
      "Connect recurring process issues to modernization backlog",
      "Expand claims and PA workflows",
      "Introduce confidence scoring",
      "Introduce structured human approval workflow",
      "Start cross-agent insights",
    ],
    agents: "Provider Data Agent, Member Service Agent, Problem Management Agent",
    measurement: "Measure claims exception effort, PA cycle time, provider data review effort, repeat contact drivers, and repeat incident trends",
    deliverables: ["Business process agent pilots", "Confidence scoring model", "Approval workflow", "Process-to-modernization backlog linkage"],
    careops: "Show business process productivity, recurring issue themes, and modernization backlog candidates.",
    color: "border-l-violet-400",
    dotColor: "bg-violet-400",
  },
  {
    month: "Month 5",
    title: "Modernization & Release Integration",
    theme: "Use agents to connect operations, business pain points, modernization, and release governance.",
    activities: [
      "Add Modernization Assessment Agent",
      "Add Release Readiness Agent",
      "Link business process pain points to application modernization priorities",
      "Expand QE automation",
      "Build release readiness dashboard",
      "Start productivity reporting by persona and process",
      "Prepare scale model for product / pod-based teams",
    ],
    agents: "Modernization Assessment Agent, Release Readiness Agent",
    measurement: "Measure modernization assessment cycle time, release reporting effort, defect readiness, and portfolio visibility",
    deliverables: ["Modernization assessment output", "Release readiness scorecard", "Persona productivity report", "Product / pod agent adoption model"],
    careops: "Display modernization readiness, release readiness, app risk, and pod-level productivity.",
    color: "border-l-amber-400",
    dotColor: "bg-amber-400",
  },
  {
    month: "Month 6",
    title: "Governed Autonomy",
    theme: "Move from assisted agents to governed autonomy within approved guardrails.",
    activities: [
      "Enable autonomous updates within approved guardrails",
      "Auto-generate worklist summaries",
      "Auto-create draft backlog candidates",
      "Auto-create draft problem records",
      "Auto-update knowledge base after approval",
      "Enable multi-agent orchestration patterns",
      "Finalize scale roadmap across product / pod model",
      "Publish final value case",
    ],
    agents: "All first-wave and second-wave agents operational in controlled workflows",
    measurement: "Measure productivity gain, adoption, ROI, cycle time improvement, quality improvement, and governance compliance",
    deliverables: ["6-month value realization report", "Governed autonomy playbook", "Scale roadmap", "Agent operating model", "Final ROI case", "Product / pod alignment plan"],
    careops: "Show final agent value scorecard, scale roadmap, pod adoption view, and executive decision dashboard.",
    color: "border-l-green-500",
    dotColor: "bg-green-500",
  },
];

const APPROVAL_MATRIX = [
  { action: "Ticket summary", draft: "Yes", recommend: "Yes", human: "No for draft", execute: "Yes within guardrails" },
  { action: "Production change", draft: "Yes", recommend: "Yes", human: "Yes", execute: "No" },
  { action: "Claims action", draft: "Yes", recommend: "Yes", human: "Yes", execute: "No initially" },
  { action: "PA routing", draft: "Yes", recommend: "Yes", human: "Yes", execute: "Yes only after approval" },
  { action: "Provider data correction", draft: "Yes", recommend: "Yes", human: "Yes", execute: "No initially" },
  { action: "Test case generation", draft: "Yes", recommend: "Yes", human: "Yes", execute: "Yes after approval" },
  { action: "Release go/no-go", draft: "Yes", recommend: "Yes", human: "Yes", execute: "No" },
  { action: "Modernization recommendation", draft: "Yes", recommend: "Yes", human: "Yes", execute: "No" },
  { action: "Knowledge article update", draft: "Yes", recommend: "Yes", human: "Yes", execute: "Yes after approval" },
];

const MATURITY_LEVELS = [
  { level: 1, label: "AI-Assisted Search & Summarization", desc: "Agent helps users find information, summarize content, and reduce manual reading effort." },
  { level: 2, label: "Recommendation Agent", desc: "Agent recommends next-best action with source references and confidence score." },
  { level: 3, label: "Execute with Approval", desc: "Agent drafts updates or actions and executes only after human approval." },
  { level: 4, label: "Autonomous within Guardrails", desc: "Agent executes low-risk actions automatically within pre-approved rules." },
  { level: 5, label: "Multi-Agent Orchestration", desc: "Multiple agents coordinate across operations, QE, business processes, modernization, and governance." },
];

const CONTROLS = [
  { label: "Access Control", icon: ShieldCheck },
  { label: "Data Masking", icon: ShieldCheck },
  { label: "PHI/PII Protection", icon: ShieldCheck },
  { label: "Audit Logs", icon: Activity },
  { label: "Confidence Thresholds", icon: Target },
  { label: "Prompt Governance", icon: Cpu },
  { label: "Model Monitoring", icon: BarChart2 },
  { label: "Exception Handling", icon: AlertTriangle },
  { label: "Human Approval Workflow", icon: Users },
  { label: "Source Lineage", icon: Bot },
  { label: "Performance Scorecards", icon: TrendingUp },
  { label: "Security Review", icon: ShieldCheck },
];

const RISKS = [
  {
    risk: "Poor data quality limits agent accuracy",
    mitigation: "Start with bounded workflows, use IBM's existing operational knowledge, create confidence scoring, and apply human review.",
  },
  {
    risk: "Users do not trust agent recommendations",
    mitigation: "Show source references, confidence score, similar past cases, and feedback loop.",
  },
  {
    risk: "Agents create compliance concern",
    mitigation: "Apply PHI/PII controls, audit logs, role-based access, and human approval for sensitive actions.",
  },
  {
    risk: "Agent value is not measurable",
    mitigation: "Define baseline in month 1 and track productivity, cycle time, quality, and adoption weekly.",
  },
  {
    risk: "Project-funded model limits adoption",
    mitigation: "Start with project pilots, then scale through product / pod model as a shared productivity capability.",
  },
  {
    risk: "Too many tools create complexity",
    mitigation: "Use Horizon-approved AI tools, IBM reusable assets, AIOps, BOB, AWS where appropriate, and a common agent governance pattern.",
  },
];

const FIRST_WAVE = [
  {
    name: "Incident Triage Agent",
    why: "Uses existing operational data and IBM support knowledge.",
    data: "AIOps alerts, tickets, runbooks, logs, known errors.",
    persona: "L2 analysts, Ops Leads, Service Managers.",
    productivity: "20–30%",
    outcome: "Reduced triage effort and improved incident resolution consistency.",
    careops: "Track incident productivity, recurring issues, and operational risk.",
    color: "border-blue-500",
    headerBg: "bg-blue-50",
    badge: "bg-blue-100 text-blue-800",
  },
  {
    name: "QE Test Agent",
    why: "Targets high-effort QE activities and supports modernization delivery.",
    data: "Requirements, test cases, defects, release scope.",
    persona: "Test Leads, QA Analysts, Product Owners.",
    productivity: "20–30%",
    outcome: "Faster test case generation, better regression planning, improved traceability.",
    careops: "Track QE productivity, coverage gaps, and release readiness.",
    color: "border-purple-500",
    headerBg: "bg-purple-50",
    badge: "bg-purple-100 text-purple-800",
  },
  {
    name: "Claims Process Agent",
    why: "Shows direct business operations value beyond IT automation.",
    data: "Claims exceptions, denial codes, aging reports, SOPs.",
    persona: "Claims Ops Leads, Business Analysts, Process Owners.",
    productivity: "15–25%",
    outcome: "Reduced claims exception analysis effort and better backlog candidates.",
    careops: "Track claims exception trends, aging hotspots, and business process value.",
    color: "border-green-500",
    headerBg: "bg-green-50",
    badge: "bg-green-100 text-green-800",
  },
  {
    name: "Prior Authorization Agent",
    why: "Targets a high-visibility payer process with measurable cycle time and intake effort.",
    data: "PA intake records, documentation checklists, policy rules, eligibility data.",
    persona: "PA Ops Leads, Intake Specialists, Clinical Ops Analysts.",
    productivity: "15–20%",
    outcome: "Faster intake review, fewer incomplete submissions, better routing.",
    careops: "Track PA cycle time, incomplete request drivers, and queue productivity.",
    color: "border-amber-500",
    headerBg: "bg-amber-50",
    badge: "bg-amber-100 text-amber-800",
  },
];

const SCALE_STEPS = [
  "Deploy first-wave agents into controlled workflows.",
  "Measure adoption, productivity, cycle time, quality, and user trust in CareOps360.",
  "Add Provider Data, Member Service, Problem Management, Modernization, and Release Readiness agents.",
  "Connect agents through governed orchestration patterns.",
  "Align agent adoption to Horizon's product / pod operating model.",
  "Scale agent productivity as a managed transformation capability.",
];

function ScoreStars({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={cn("w-3.5 h-3.5", i <= score ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200")} />
      ))}
    </div>
  );
}

function AgentCard({ agent }: { agent: typeof AGENTS[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:border-blue-200 transition-all">
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: IBM_BLUE }}>
            <Bot className="w-4.5 h-4.5 text-white w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{agent.name}</p>
            <p className="text-xs text-slate-500">{agent.persona}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={cn("text-xs border", PILLAR_COLORS[agent.pillar] ?? "bg-slate-100 text-slate-700")}>{agent.pillar}</Badge>
          <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5">{agent.productivity}</span>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-100 px-5 py-5 space-y-5 bg-white">
          <p className="text-sm text-slate-700 leading-relaxed">{agent.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Key Inputs</p>
              <p className="text-xs text-slate-600 leading-relaxed">{agent.inputs}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Outputs</p>
              <p className="text-xs text-slate-600 leading-relaxed">{agent.outputs}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">KPIs</p>
              <p className="text-xs text-slate-600 leading-relaxed">{agent.kpis}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Implementation</p>
              <p className="text-xs text-slate-600">{agent.month}</p>
              <p className="text-xs text-slate-600 mt-1">Autonomy: {agent.autonomy}</p>
              <p className="text-xs text-slate-600 mt-1">Human Approval: <span className="font-semibold text-slate-800">{agent.approval}</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-red-50 border border-red-100 rounded-lg p-3">
              <p className="text-xs font-semibold text-red-700 mb-1">Before</p>
              <p className="text-xs text-red-800 leading-relaxed">{agent.before}</p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-lg p-3">
              <p className="text-xs font-semibold text-green-700 mb-1">After</p>
              <p className="text-xs text-green-800 leading-relaxed">{agent.after}</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <p className="text-xs font-semibold text-blue-700 mb-1">Why this matters for Horizon</p>
            <p className="text-xs text-blue-900 leading-relaxed">{agent.horizon}</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-slate-600 mb-1">CareOps360 Connection</p>
            <p className="text-xs text-slate-700 leading-relaxed">{agent.careops}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function PersonaCard({ p }: { p: typeof PERSONAS[0] }) {
  return (
    <Card className="border border-slate-200 hover:border-blue-200 transition-colors">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-slate-800">{p.name}</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">{p.role}</p>
          </div>
          <ScoreStars score={p.score} />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Pain Points</p>
          <ul className="space-y-1">
            {p.pain.map(pt => (
              <li key={pt} className="flex items-start gap-1.5 text-xs text-slate-600">
                <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>{pt}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Agents That Help</p>
          <div className="flex flex-wrap gap-1.5">
            {p.agents.map(a => (
              <span key={a} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5">{a}</span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-green-50 rounded-lg p-2.5">
            <p className="text-xs font-semibold text-green-700 mb-0.5">Time Saved</p>
            <p className="text-xs text-green-800">{p.saved}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-2.5">
            <p className="text-xs font-semibold text-blue-700 mb-0.5">Value Created</p>
            <p className="text-xs text-blue-800">{p.value}</p>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
          <p className="text-xs font-semibold text-slate-500 mb-0.5">Example Question</p>
          <p className="text-xs text-slate-700 italic">"{p.question}"</p>
        </div>
      </CardContent>
    </Card>
  );
}

const fmt$ = (v: number) => v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(2)}M` : v >= 1_000 ? `$${(v / 1_000).toFixed(0)}K` : `$${v}`;

const SCENARIOS = {
  Conservative: { ftes: 100, cost: 130000, gain: 12, adoption: 50, impl: 1200000 },
  Expected: { ftes: 150, cost: 140000, gain: 20, adoption: 60, impl: 1200000 },
  Transformational: { ftes: 300, cost: 150000, gain: 30, adoption: 75, impl: 2000000 },
};

function ROISimulator() {
  const [ftes, setFtes] = useState(150);
  const [cost, setCost] = useState(140000);
  const [gain, setGain] = useState(20);
  const [adoption, setAdoption] = useState(60);
  const [impl, setImpl] = useState(1200000);

  const gross = ftes * cost * (gain / 100);
  const realized = gross * (adoption / 100);
  const net = realized - impl;
  const roi = (net / impl) * 100;
  const monthly = realized / 12;
  const payback = impl / monthly;

  const chartData = [
    { name: "Implementation Cost", value: impl },
    { name: "Realized Annual Value", value: Math.round(realized) },
    { name: "Net Annual Value", value: Math.round(net) },
  ];

  const applyScenario = (s: keyof typeof SCENARIOS) => {
    const sc = SCENARIOS[s];
    setFtes(sc.ftes); setCost(sc.cost); setGain(sc.gain); setAdoption(sc.adoption); setImpl(sc.impl);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(Object.keys(SCENARIOS) as (keyof typeof SCENARIOS)[]).map(s => (
          <Button key={s} size="sm" variant="outline" onClick={() => applyScenario(s)}
            className="text-xs border-slate-300 hover:border-blue-400 hover:text-blue-700"
          >{s}</Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          {[
            { label: "FTEs Impacted", val: ftes, set: setFtes, min: 25, max: 1000, step: 25, fmt: (v: number) => v.toString() },
            { label: "Avg. Annual Cost per FTE", val: cost, set: setCost, min: 80000, max: 220000, step: 10000, fmt: fmt$ },
            { label: "Productivity Gain", val: gain, set: setGain, min: 5, max: 40, step: 1, fmt: (v: number) => `${v}%` },
            { label: "Adoption Factor", val: adoption, set: setAdoption, min: 20, max: 100, step: 5, fmt: (v: number) => `${v}%` },
            { label: "Implementation Cost", val: impl, set: setImpl, min: 250000, max: 5000000, step: 50000, fmt: fmt$ },
          ].map(({ label, val, set, min, max, step, fmt }) => (
            <div key={label}>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-700 font-medium">{label}</span>
                <span className="text-sm font-bold" style={{ color: IBM_BLUE }}>{fmt(val)}</span>
              </div>
              <SliderPrimitive.Root
                min={min} max={max} step={step} value={[val]}
                onValueChange={([v]) => set(v)}
                className="relative flex items-center select-none touch-none w-full h-5"
              >
                <SliderPrimitive.Track className="bg-slate-200 relative grow rounded-full h-1.5">
                  <SliderPrimitive.Range className="absolute rounded-full h-full" style={{ background: IBM_BLUE }} />
                </SliderPrimitive.Track>
                <SliderPrimitive.Thumb className="block w-4 h-4 bg-white border-2 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-offset-2" style={{ borderColor: IBM_BLUE }} />
              </SliderPrimitive.Root>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {[
            { label: "Gross Annual Productivity Value", value: gross, color: "text-slate-800" },
            { label: "Realized Annual Value", value: realized, color: "text-green-700" },
            { label: "Net Annual Value", value: net, color: net >= 0 ? "text-green-700" : "text-red-600" },
            { label: "ROI", value: null, display: `${roi.toFixed(0)}%`, color: roi >= 0 ? "text-green-700" : "text-red-600" },
            { label: "Payback Period", value: null, display: `${payback.toFixed(1)} months`, color: "text-blue-700" },
          ].map(({ label, value, display, color }) => (
            <div key={label} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
              <span className="text-sm text-slate-600">{label}</span>
              <span className={cn("text-sm font-bold", color)}>{display ?? fmt$(Math.round(value!))}</span>
            </div>
          ))}

          <div className="mt-4" style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8" }} />
                <YAxis tickFormatter={v => `$${(v / 1_000_000).toFixed(1)}M`} tick={{ fontSize: 9, fill: "#94a3b8" }} />
                <Tooltip formatter={(v: number) => fmt$(v)} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <rect key={i} fill={i === 0 ? "#94a3b8" : i === 1 ? IBM_BLUE : "#24a148"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3 leading-relaxed">
          <strong>Note:</strong> These are directional business case estimates. IBM recommends using Horizon's actual ticket volume, delivery metrics, QE effort, claims exception effort, prior authorization effort, provider data review effort, release governance effort, and modernization assessment effort to finalize the committed value case.
        </p>
        <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3 leading-relaxed">
          <strong>Measurement approach:</strong> Productivity should be measured as capacity creation, cycle time improvement, rework reduction, and reduction in manual analysis effort — not only as labor reduction.
        </p>
        <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3 leading-relaxed">
          <strong>CareOps360:</strong> Once implemented, CareOps360 can track agent productivity by workflow, persona, pod, application, and business process.
        </p>
      </div>
    </div>
  );
}

export default function AutonomousAgents() {
  const [activeTab, setActiveTab] = useState("executive");
  const [selectedWorkflow, setSelectedWorkflow] = useState(0);

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: IBM_BLUE }}>
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Autonomous Agents</h1>
            <p className="text-sm text-slate-500">6-Month Path to Measurable Productivity through Governed Autonomous Agents</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto">
          <TabsList className="flex w-max gap-1 bg-slate-100 p-1 rounded-lg">
            {[
              { value: "executive", label: "Executive Summary" },
              { value: "catalog", label: "Agent Catalog" },
              { value: "personas", label: "Personas" },
              { value: "workflow", label: "Workflow Simulator" },
              { value: "roi", label: "ROI Simulator" },
              { value: "roadmap", label: "6-Month Roadmap" },
              { value: "governance", label: "Governance & Guardrails" },
              { value: "firstwave", label: "IBM First-Wave" },
            ].map(t => (
              <TabsTrigger key={t.value} value={t.value} className="text-xs whitespace-nowrap px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:font-semibold">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* ── Tab 1: Executive Summary ── */}
        <TabsContent value="executive" className="space-y-6 mt-6">
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="px-6 py-5" style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0d47a1 100%)` }}>
              <div className="flex flex-wrap gap-2 mb-3">
                {["Governed AI", "6-Month Implementation Path", "Productivity-Focused"].map(b => (
                  <span key={b} className="text-xs bg-white/20 text-white border border-white/30 rounded-full px-3 py-0.5">{b}</span>
                ))}
              </div>
              <h2 className="text-lg font-bold text-white mb-1">Autonomous Agents for Horizon</h2>
              <p className="text-sm text-blue-200 font-medium mb-2">Extending CareOps360 from governance visibility to intelligent productivity execution</p>
              <p className="text-sm text-blue-100 leading-relaxed max-w-3xl">
                IBM will help Horizon deploy a practical portfolio of autonomous agents that improve IT operations, QE delivery, modernization planning, release readiness, and payer business operations. The first 6 months will focus on measurable productivity, governed adoption, human approval workflows, and scalable agent patterns that support Horizon's product / pod evolution.
              </p>
            </div>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Agents Proposed", value: "10", desc: "Across IT, QE, modernization, release, and business ops" },
              { label: "6-Month Productivity", value: "25–30%", desc: "Realistic productivity improvement in selected workflows" },
              { label: "Business Process", value: "15–25%", desc: "Claims, prior auth, member service, and provider data" },
              { label: "IT Operations", value: "20–30%", desc: "Triage, problem mgmt, knowledge reuse, runbook acceleration" },
              { label: "QE Productivity", value: "20–30%", desc: "Test generation, regression, traceability, defect summarization" },
              { label: "First 90-Day Pilots", value: "4", desc: "Incident triage, QE test, claims process, prior authorization" },
            ].map(m => (
              <Card key={m.label} className="border border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-500 mb-1 leading-tight">{m.label}</p>
                  <p className="text-2xl font-bold text-slate-900" style={{ color: IBM_BLUE }}>{m.value}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-tight">{m.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Productivity Ramp Over 6 Months</CardTitle>
                <CardDescription className="text-xs">Expected productivity improvement as agents move from assisted workflows to governed autonomy.</CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={RAMP_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                      <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: "#94a3b8" }} domain={[0, 35]} />
                      <Tooltip formatter={(v: number) => [`${v}%`, "Productivity"]} />
                      <Line type="monotone" dataKey="productivity" stroke={IBM_BLUE} strokeWidth={2.5} dot={{ fill: IBM_BLUE, r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Productivity by Agent</CardTitle>
                <CardDescription className="text-xs">Midpoint productivity improvement across all 10 proposed agents.</CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={AGENT_BAR_DATA} layout="vertical" margin={{ left: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fontSize: 9, fill: "#94a3b8" }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} width={80} />
                      <Tooltip formatter={(v: number) => [`${v}%`, "Productivity"]} />
                      <Bar dataKey="value" fill={IBM_BLUE} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-blue-100 bg-blue-50 shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm font-semibold text-blue-900 mb-2">Why this belongs inside CareOps360</p>
                <p className="text-sm text-blue-800 leading-relaxed">
                  CareOps360 already gives Horizon visibility into portfolio, operations, and governance health. The Autonomous Agents module extends that capability from visibility to action by recommending next-best actions, surfacing productivity opportunities, creating worklists, drafting summaries, and linking recurring business and technology pain points to modernization priorities.
                </p>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm font-semibold text-slate-800 mb-2">IBM's Recommendation for Horizon</p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Start with agents where IBM already has operational context and Horizon has high-volume manual effort. The first 90 days should prove value in Incident Triage, QE Test Generation, Claims Process Support, and Prior Authorization Intake. By month 6, Horizon should have a governed agent operating model, production-ready agent patterns, productivity measurement, human approval workflows, and a scale roadmap aligned to the product / pod transformation.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 2: Agent Catalog ── */}
        <TabsContent value="catalog" className="space-y-3 mt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-slate-800">10 Proposed Agents</h2>
            <p className="text-xs text-slate-500">Click any agent to expand details</p>
          </div>
          {AGENTS.map(a => <AgentCard key={a.name} agent={a} />)}
        </TabsContent>

        {/* ── Tab 3: Personas ── */}
        <TabsContent value="personas" className="mt-6">
          <h2 className="text-base font-bold text-slate-800 mb-4">Personas & Agent Value</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {PERSONAS.map(p => <PersonaCard key={p.name} p={p} />)}
          </div>
        </TabsContent>

        {/* ── Tab 4: Workflow Simulator ── */}
        <TabsContent value="workflow" className="mt-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-3">Workflow Simulator</h2>
            <div className="flex flex-wrap gap-2">
              {WORKFLOWS.map((w, i) => (
                <button key={i} onClick={() => setSelectedWorkflow(i)}
                  className={cn(
                    "text-xs rounded-full px-3 py-1.5 border font-medium transition-all",
                    selectedWorkflow === i
                      ? "border-blue-500 text-white"
                      : "border-slate-200 text-slate-600 hover:border-blue-300"
                  )}
                  style={selectedWorkflow === i ? { background: IBM_BLUE } : {}}
                >
                  {w.title}
                </button>
              ))}
            </div>
          </div>

          {(() => {
            const wf = WORKFLOWS[selectedWorkflow];
            return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-1 space-y-3">
                  <Card className="border border-slate-200 shadow-sm">
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Workflow</p>
                        <p className="text-sm font-bold text-slate-800">{wf.title}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Description</p>
                        <p className="text-xs text-slate-700 leading-relaxed">{wf.description}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Persona</p>
                        <p className="text-xs text-slate-700">{wf.persona}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Input Data</p>
                        <p className="text-xs text-slate-700">{wf.input}</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-2.5">
                        <p className="text-xs font-semibold text-green-700 mb-0.5">Expected Productivity</p>
                        <p className="text-xs text-green-800">{wf.productivity}</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                        <p className="text-xs font-semibold text-slate-600 mb-0.5">CareOps360 Integration</p>
                        <p className="text-xs text-slate-700">{wf.careops}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-2 space-y-3">
                  <Card className="border border-slate-200 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Agent Process Steps</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="space-y-2">
                        {wf.steps.map((step, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white" style={{ background: i === 4 ? "#24a148" : IBM_BLUE }}>
                              {i + 1}
                            </div>
                            <div className="flex-1 flex items-start gap-2">
                              <p className={cn("text-xs text-slate-700 py-1.5 leading-snug", i === 4 && "font-semibold text-green-800")}>
                                {i === 4 && <span className="inline-flex items-center gap-1 mr-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-600" />Human Approval: </span>}
                                {step}
                              </p>
                            </div>
                            {i < wf.steps.length - 1 && (
                              <div className="absolute ml-3 mt-7 w-px h-3 bg-slate-200" />
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-blue-100 bg-blue-50 shadow-sm">
                    <CardContent className="p-4">
                      <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5" /> Sample Agent Output
                      </p>
                      <p className="text-sm text-blue-900 leading-relaxed font-mono bg-white border border-blue-200 rounded-lg p-3">
                        "{wf.output}"
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })()}
        </TabsContent>

        {/* ── Tab 5: ROI Simulator ── */}
        <TabsContent value="roi" className="mt-6">
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">ROI Simulator</CardTitle>
              <CardDescription>Adjust the inputs or select a scenario to model the business case for autonomous agents at Horizon.</CardDescription>
            </CardHeader>
            <CardContent>
              <ROISimulator />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 6: 6-Month Roadmap ── */}
        <TabsContent value="roadmap" className="mt-6 space-y-4">
          <h2 className="text-base font-bold text-slate-800">6-Month Agent Implementation Roadmap</h2>
          <div className="space-y-4">
            {ROADMAP.map((m, i) => (
              <div key={i} className={cn("border-l-4 pl-5 pb-2", m.color)}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn("w-3 h-3 rounded-full flex-shrink-0 -ml-[26px]", m.dotColor)} />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{m.month}</span>
                  <span className="text-sm font-bold text-slate-800">{m.title}</span>
                </div>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">{m.theme}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Key Activities</p>
                    <ul className="space-y-1">
                      {m.activities.map(a => (
                        <li key={a} className="text-xs text-slate-600 flex items-start gap-1.5">
                          <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />{a}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Agents Introduced</p>
                    <p className="text-xs text-slate-700">{m.agents}</p>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 mt-3">Value Measurement</p>
                    <p className="text-xs text-slate-700">{m.measurement}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Deliverables</p>
                    <ul className="space-y-1">
                      {m.deliverables.map(d => (
                        <li key={d} className="text-xs text-slate-600 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />{d}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">CareOps360 Integration</p>
                    <p className="text-xs text-slate-700 leading-relaxed">{m.careops}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ── Tab 7: Governance & Guardrails ── */}
        <TabsContent value="governance" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-blue-600" />Governance Principles</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ol className="space-y-2">
                  {[
                    "Human-in-the-loop for critical decisions",
                    "Auditability by design",
                    "PHI/PII protection",
                    "Confidence-based routing",
                    "Role-based access control",
                    "Explainable recommendations",
                    "Source traceability",
                    "Approved model and tool usage",
                    "Safe escalation paths",
                    "Continuous monitoring and tuning",
                  ].map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: IBM_BLUE }}>{i + 1}</span>
                      {p}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-600" />Agent Maturity Model</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                {MATURITY_LEVELS.map(l => (
                  <div key={l.level} className="flex items-start gap-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: IBM_BLUE }}>
                      L{l.level}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{l.label}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{l.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Human Approval Matrix</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Action Type</TableHead>
                    <TableHead className="text-xs">Agent Can Draft</TableHead>
                    <TableHead className="text-xs">Agent Can Recommend</TableHead>
                    <TableHead className="text-xs">Human Approval Required</TableHead>
                    <TableHead className="text-xs">Agent Can Execute</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {APPROVAL_MATRIX.map(row => (
                    <TableRow key={row.action}>
                      <TableCell className="text-xs font-medium text-slate-800">{row.action}</TableCell>
                      <TableCell className="text-xs text-green-700">{row.draft}</TableCell>
                      <TableCell className="text-xs text-green-700">{row.recommend}</TableCell>
                      <TableCell className="text-xs text-amber-700">{row.human}</TableCell>
                      <TableCell className="text-xs text-slate-700">{row.execute}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3">Required Controls</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {CONTROLS.map(c => (
                <div key={c.label} className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-lg p-3 hover:border-blue-200 transition-colors">
                  <c.icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-xs font-medium text-slate-700">{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" />Horizon-Specific Risks & Mitigations</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs w-1/2">Risk</TableHead>
                    <TableHead className="text-xs">Mitigation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {RISKS.map(r => (
                    <TableRow key={r.risk}>
                      <TableCell className="text-xs text-red-700 font-medium align-top">{r.risk}</TableCell>
                      <TableCell className="text-xs text-slate-700 align-top">{r.mitigation}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 8: IBM First-Wave Recommendation ── */}
        <TabsContent value="firstwave" className="mt-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-1">IBM Recommended First 4 Agents for Horizon</h2>
            <p className="text-sm text-slate-600">These four agents create the fastest measurable value by combining IBM's incumbent operational knowledge with high-volume business and technology workflows.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FIRST_WAVE.map((fw, i) => (
              <Card key={i} className={cn("border-2 shadow-sm", fw.color)}>
                <div className={cn("px-5 py-3 rounded-t-lg", fw.headerBg)}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: IBM_BLUE }}>
                      {i + 1}
                    </div>
                    <p className="text-sm font-bold text-slate-800">{fw.name}</p>
                  </div>
                </div>
                <CardContent className="p-5 space-y-3">
                  {[
                    { label: "Why First", value: fw.why },
                    { label: "Data Readiness", value: fw.data },
                    { label: "Persona Impact", value: fw.persona },
                    { label: "Expected Productivity", value: fw.productivity },
                    { label: "90-Day Outcome", value: fw.outcome },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
                      <p className="text-xs text-slate-700">{value}</p>
                    </div>
                  ))}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 mt-2">
                    <p className="text-xs font-semibold text-slate-500 mb-0.5">CareOps360 Role</p>
                    <p className="text-xs text-slate-700">{fw.careops}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border border-blue-100 bg-blue-50 shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-blue-900 mb-2">Summary</p>
              <p className="text-sm text-blue-800 leading-relaxed">
                These four agents create the fastest measurable value for Horizon because they combine IBM's incumbent operational knowledge with high-volume business and technology workflows. They create visible productivity across IT operations, QE, claims operations, and prior authorization within the first 90 days.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">How IBM Scales from First-Wave Agents to Enterprise Agent Orchestration</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="space-y-3">
                {SCALE_STEPS.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: IBM_BLUE }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 pt-1.5">
                      <p className="text-sm text-slate-700">{step}</p>
                    </div>
                    {i < SCALE_STEPS.length - 1 && (
                      <div className="w-px h-4 bg-blue-200 ml-4 mt-8 absolute" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
