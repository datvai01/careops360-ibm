import { useState, useMemo } from "react";
import { X, ChevronRight, AlertTriangle, CheckCircle2, Clock, Activity, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type InitiativeType = "Upgrade" | "Ticket Reduction" | "Transformation";
type Status = "Active" | "Planned" | "Completed" | "At Risk";
type Priority = "High" | "Medium" | "Low";

interface Initiative {
  id: number;
  portfolio: string;
  product: string;
  application: string;
  initiativeType: InitiativeType;
  description: string;
  expectedOutcome: string;
  technology: string;
  currentVersion: string;
  upgradeVersion: string;
  workNumber: string;
  serviceCategory: string;
  startDate: string;
  endDate: string;
  status: Status;
  priority: Priority;
  notes: string;
}

const INITIATIVES: Initiative[] = [
  { id: 1, portfolio: "IT Infrastructure", product: "IBM ODM", application: "Process Automation Platform", initiativeType: "Upgrade", description: "IBM ODM upgrade from 8.9 to 9.2 for rules engine modernization", expectedOutcome: "40% improvement in rules processing speed; enhanced AI-assisted decision support", technology: "IBM ODM", currentVersion: "8.9", upgradeVersion: "9.2", workNumber: "WO-1001", serviceCategory: "Platform Upgrade", startDate: "2026-01-15", endDate: "2026-04-30", status: "Active", priority: "High", notes: "Phase 1 complete; UAT in progress. IBM delivery team engaged." },
  { id: 2, portfolio: "Enrollment & Eligibility", product: "WAM SSO", application: "WAM SSO Cloud Application", initiativeType: "Upgrade", description: "Angular framework upgrade from v12 to v17 for WAM SSO cloud application", expectedOutcome: "Enhanced security posture, improved performance, and modern UI component library", technology: "Angular", currentVersion: "12", upgradeVersion: "17", workNumber: "WO-1002", serviceCategory: "Application Modernization", startDate: "2026-02-01", endDate: "2026-05-31", status: "Active", priority: "High", notes: "Frontend components 60% migrated. SSO integration testing underway." },
  { id: 3, portfolio: "IT Infrastructure", product: "Internal Cloud Applications", application: "Multiple Cloud-Hosted Apps", initiativeType: "Upgrade", description: "Angular upgrade from v12 to v17 across 8 internal cloud-hosted applications", expectedOutcome: "Standardized framework version across portfolio; eliminated CVE-2022-25869 vulnerability class", technology: "Angular", currentVersion: "12", upgradeVersion: "17", workNumber: "WO-1003", serviceCategory: "Application Modernization", startDate: "2026-01-01", endDate: "2026-03-31", status: "Completed", priority: "Medium", notes: "All 8 applications successfully upgraded and deployed to production." },
  { id: 4, portfolio: "Finance & Billing", product: "Fee Schedule Repository", application: "Fee Schedule Repository", initiativeType: "Upgrade", description: ".NET framework upgrade from 4.8 to .NET 8.0 for fee schedule management system", expectedOutcome: "Improved processing performance, cross-platform support, LTS lifecycle through 2026", technology: ".NET", currentVersion: "4.8", upgradeVersion: "8.0", workNumber: "WO-1004", serviceCategory: "Platform Upgrade", startDate: "2026-04-01", endDate: "2026-07-31", status: "Planned", priority: "High", notes: "Architecture review completed. Development resources confirmed for Q2." },
  { id: 5, portfolio: "Finance & Billing", product: "GroupFee", application: "GroupFee Application", initiativeType: "Upgrade", description: ".NET framework upgrade from 4.8 to .NET 8.0 for group fee management", expectedOutcome: "Reduced maintenance cost; improved stability and application performance", technology: ".NET", currentVersion: "4.8", upgradeVersion: "8.0", workNumber: "WO-1005", serviceCategory: "Platform Upgrade", startDate: "2026-05-01", endDate: "2026-08-31", status: "Planned", priority: "Medium", notes: "Sequenced after Fee Schedule Repository completion. Shared codebase components to be reused." },
  { id: 6, portfolio: "IT Infrastructure", product: "NAR Platform", application: "NAR Windows Platform", initiativeType: "Upgrade", description: "NAR Windows Server platform upgrade from 2012 R2 to Windows Server 2022", expectedOutcome: "Extended support lifecycle, improved security posture, and modern hardware support", technology: "Windows Server", currentVersion: "2012 R2", upgradeVersion: "2022", workNumber: "WO-1006", serviceCategory: "Infrastructure", startDate: "2026-01-01", endDate: "2026-02-28", status: "Completed", priority: "High", notes: "Migration complete. Post-cutover monitoring closed with no critical incidents." },
  { id: 7, portfolio: "Clinical Management", product: "CareRadius", application: "CareRadius Angular Frontend", initiativeType: "Upgrade", description: "CareRadius Angular framework upgrade from v11 to v17 across all clinical management modules", expectedOutcome: "Modern UI components, improved page load performance, enhanced maintainability for IBM team", technology: "Angular", currentVersion: "11", upgradeVersion: "17", workNumber: "WO-1007", serviceCategory: "Application Modernization", startDate: "2026-03-01", endDate: "2026-06-30", status: "Active", priority: "High", notes: "Module-by-module migration. Clinical workflows (intake, auth, care plan) migrated. Billing pending." },
  { id: 8, portfolio: "Clinical Management", product: "CareRadius", application: "CareRadius VB Legacy System", initiativeType: "Upgrade", description: "CareRadius Visual Basic 6 modernization to .NET 8 using IBM-led transformation methodology", expectedOutcome: "Elimination of VB6 runtime dependency; 60% reduction in legacy-related incident tickets", technology: "Visual Basic → .NET", currentVersion: "VB6", upgradeVersion: ".NET 8", workNumber: "WO-1008", serviceCategory: "Application Modernization", startDate: "2026-04-01", endDate: "2026-09-30", status: "Planned", priority: "High", notes: "Code analysis complete. 142K LOC identified. IBM Transformation Workbench tooling licensed." },
  { id: 9, portfolio: "Clinical Management", product: "CareRadius", application: "CareRadius SAP BO Reporting", initiativeType: "Upgrade", description: "SAP BusinessObjects upgrade from 4.2 to 4.3 for CareRadius clinical reporting layer", expectedOutcome: "Improved report performance, new visualization capabilities, renewed vendor support", technology: "SAP BusinessObjects", currentVersion: "4.2", upgradeVersion: "4.3", workNumber: "WO-1009", serviceCategory: "Platform Upgrade", startDate: "2026-02-15", endDate: "2026-05-15", status: "Active", priority: "Medium", notes: "Crystal Reports migration 70% complete. Universe migration in progress." },
  { id: 10, portfolio: "Member Services", product: "Communication Services", application: "Communication Services Portal", initiativeType: "Upgrade", description: "Angular 12 to 17 upgrade for member communication and notification services portal", expectedOutcome: "Enhanced member notification capabilities, improved mobile responsiveness", technology: "Angular", currentVersion: "12", upgradeVersion: "17", workNumber: "WO-1010", serviceCategory: "Application Modernization", startDate: "2026-03-15", endDate: "2026-06-15", status: "Active", priority: "Medium", notes: "50% of components migrated. SMS and email notification modules complete." },
  { id: 11, portfolio: "IT Infrastructure", product: "Doc Portal", application: "Document Management Portal", initiativeType: "Upgrade", description: "Doc Portal Angular framework upgrade from v13 to v17", expectedOutcome: "Modern document management, improved search and retrieval performance by 30%", technology: "Angular", currentVersion: "13", upgradeVersion: "17", workNumber: "WO-1011", serviceCategory: "Application Modernization", startDate: "2026-05-01", endDate: "2026-08-01", status: "Planned", priority: "Medium", notes: "Dependency mapping and component inventory complete." },
  { id: 12, portfolio: "IT Infrastructure", product: "Horizon ECM", application: "Horizon ECM Platform", initiativeType: "Upgrade", description: "Horizon ECM Angular upgrade from v12 to v17 for enterprise content management", expectedOutcome: "Improved content workflow capabilities, modern security standards compliance", technology: "Angular", currentVersion: "12", upgradeVersion: "17", workNumber: "WO-1012", serviceCategory: "Application Modernization", startDate: "2026-06-01", endDate: "2026-09-30", status: "Planned", priority: "Medium", notes: "ECM team engaged. Scope and resource plan finalized." },
  { id: 13, portfolio: "Analytics & Reporting", product: "Cognos BI", application: "Cognos Business Intelligence Platform", initiativeType: "Upgrade", description: "IBM Cognos Business Intelligence platform upgrade from 11.1 to 12.0", expectedOutcome: "Enhanced analytics, AI-assisted insights, improved cloud connectivity and dashboard performance", technology: "IBM Cognos", currentVersion: "11.1", upgradeVersion: "12.0", workNumber: "WO-1013", serviceCategory: "Platform Upgrade", startDate: "2026-01-01", endDate: "2026-03-15", status: "Completed", priority: "High", notes: "Production upgrade complete. End-user training delivered to 240 report consumers." },
  { id: 14, portfolio: "Analytics & Reporting", product: "Tableau", application: "Tableau Analytics Platform", initiativeType: "Upgrade", description: "Tableau platform upgrade from 2022.3 to 2024.1 for enhanced data visualization", expectedOutcome: "New visualization types, Pulse AI analytics integration, improved extract performance", technology: "Tableau", currentVersion: "2022.3", upgradeVersion: "2024.1", workNumber: "WO-1014", serviceCategory: "Platform Upgrade", startDate: "2026-01-15", endDate: "2026-03-31", status: "Completed", priority: "Medium", notes: "Live in production. Pulse AI feature rollout in progress for executive dashboards." },
  { id: 15, portfolio: "Enrollment & Eligibility", product: "Membership System", application: "New Membership System", initiativeType: "Upgrade", description: "New Membership System technology modernization from legacy COBOL/mainframe to cloud-native microservices architecture", expectedOutcome: "50% reduction in processing time; real-time eligibility verification; 99.99% availability SLA", technology: "COBOL → Cloud Native", currentVersion: "Legacy Mainframe", upgradeVersion: "Cloud Microservices", workNumber: "WO-1015", serviceCategory: "Application Modernization", startDate: "2026-01-01", endDate: "2026-12-31", status: "Active", priority: "High", notes: "Phase 1 of 4 complete. Enrollment service APIs live. Claims integration Phase 2 underway." },
  { id: 16, portfolio: "Analytics & Reporting", product: "MPD Mainframe Extracts", application: "MPD Data Extract Pipeline", initiativeType: "Upgrade", description: "MPD Mainframe Extracts modernization from COBOL batch processing to modern ETL pipelines", expectedOutcome: "Near real-time data availability; reduced batch windows from 6hrs to 45min; improved data quality", technology: "COBOL → Apache Airflow", currentVersion: "COBOL Batch", upgradeVersion: "Modern ETL", workNumber: "WO-1016", serviceCategory: "Data & Analytics", startDate: "2026-04-01", endDate: "2026-08-31", status: "Planned", priority: "Medium", notes: "Data flow analysis and lineage documentation complete. Airflow environment provisioned." },
  { id: 17, portfolio: "Enrollment & Eligibility", product: "Route Code Eligibility", application: "Route Code Eligibility System", initiativeType: "Upgrade", description: "Route Code Eligibility system upgrade from legacy file-based routing to API-driven architecture", expectedOutcome: "Real-time eligibility routing; reduced manual intervention; improved partner connectivity", technology: "Legacy → REST API", currentVersion: "Legacy File-Based", upgradeVersion: "REST API", workNumber: "WO-1017", serviceCategory: "Application Modernization", startDate: "2026-07-01", endDate: "2026-10-31", status: "Planned", priority: "Medium", notes: "API design phase scheduled. Partner integration catalog in progress." },
  { id: 18, portfolio: "Enrollment & Eligibility", product: "EDI Eligibility Data Store", application: "EDI Eligibility Data Store", initiativeType: "Upgrade", description: "EDI Eligibility Data Store upgrade to support X12 278 prior authorization transaction alongside X12 270", expectedOutcome: "Expanded trading partner support; reduced eligibility disputes by 25%", technology: "EDI X12", currentVersion: "270 Only", upgradeVersion: "270 + 278", workNumber: "WO-1018", serviceCategory: "Data & Analytics", startDate: "2026-07-15", endDate: "2026-11-30", status: "Planned", priority: "Low", notes: "Regulatory compliance review pending. Trading partner communication plan to be drafted." },
  { id: 19, portfolio: "Enrollment & Eligibility", product: "Consumer Data Management", application: "Consumer Data Management Portal", initiativeType: "Upgrade", description: "Consumer Data Management portal Angular upgrade from v11 to v17", expectedOutcome: "Improved consumer-facing self-service capabilities, modern accessibility standards (WCAG 2.1)", technology: "Angular", currentVersion: "11", upgradeVersion: "17", workNumber: "WO-1019", serviceCategory: "Application Modernization", startDate: "2026-08-01", endDate: "2026-11-30", status: "Planned", priority: "Low", notes: "Queued for H2 2026. UX design refresh to be included." },
  { id: 20, portfolio: "Enrollment & Eligibility", product: "Personal Representative Mgmt", application: "Horizon Personal Representative Management System", initiativeType: "Upgrade", description: ".NET 4.7 to .NET 8.0 upgrade for Personal Representative management system", expectedOutcome: "Long-term platform support through 2029; improved performance; security compliance", technology: ".NET", currentVersion: "4.7", upgradeVersion: "8.0", workNumber: "WO-1020", serviceCategory: "Platform Upgrade", startDate: "2026-09-01", endDate: "2026-12-15", status: "Planned", priority: "Low", notes: "Scope assessment complete. Queued for Q4 development sprint." },
  { id: 21, portfolio: "Enrollment & Eligibility", product: "NASCO", application: "NASCO Enrollment and Claims Platform", initiativeType: "Upgrade", description: "NASCO platform upgrade from version 14 to 16 for enrollment and claims processing", expectedOutcome: "Enhanced NASCO feature set; improved SLA compliance for eligibility transactions; HIPAA 2024 alignment", technology: "NASCO", currentVersion: "14", upgradeVersion: "16", workNumber: "WO-1021", serviceCategory: "Platform Upgrade", startDate: "2026-05-01", endDate: "2026-09-30", status: "Planned", priority: "High", notes: "Vendor coordination in progress. NASCO technical review scheduled for April." },
  { id: 22, portfolio: "Finance & Billing", product: "Legacy Finance Platform", application: "Finance Core Systems", initiativeType: "Upgrade", description: "Legacy Finance platform upgrade from .NET 3.5 to .NET 8.0 across 5 financial management modules", expectedOutcome: "Elimination of unsupported .NET 3.5 runtime; 35% improvement in financial processing throughput", technology: ".NET", currentVersion: "3.5", upgradeVersion: "8.0", workNumber: "WO-1022", serviceCategory: "Platform Upgrade", startDate: "2026-06-01", endDate: "2026-10-31", status: "Planned", priority: "High", notes: "Impact assessment underway. Finance and IBM teams aligned on modernization approach." },
  { id: 23, portfolio: "Finance & Billing", product: "Universal Payment System", application: "Universal Payment System (UPS)", initiativeType: "Upgrade", description: "Universal Payment System upgrade from 2.1 to 3.0 with PCI DSS 4.0 compliance enhancements", expectedOutcome: "PCI DSS 4.0 compliance; improved payment processing reliability and audit trail", technology: "UPS Platform", currentVersion: "2.1", upgradeVersion: "3.0", workNumber: "WO-1023", serviceCategory: "Platform Upgrade", startDate: "2026-02-01", endDate: "2026-05-31", status: "Active", priority: "High", notes: "PCI DSS gap assessment complete. Tokenization enhancements in development." },
  { id: 24, portfolio: "IT Infrastructure", product: "Image Plus", application: "Image Plus Document Imaging", initiativeType: "Upgrade", description: "Image Plus document imaging platform upgrade from version 7 to 9", expectedOutcome: "Improved document processing speed; enhanced OCR accuracy; vendor support renewal", technology: "Image Plus", currentVersion: "7", upgradeVersion: "9", workNumber: "WO-1024", serviceCategory: "Infrastructure", startDate: "2026-03-01", endDate: "2026-05-31", status: "Active", priority: "Medium", notes: "Integration testing phase. OCR model training on Horizon-specific document types complete." },
  { id: 25, portfolio: "Finance & Billing", product: "Financial Reporting Suite", application: "Chargeback / EDW / SPS / MHP / Worker Comp", initiativeType: "Upgrade", description: "Coordinated upgrade of Chargeback, EDW, SPS, MHP, and Worker Comp systems across .NET, jQuery, and SQL Server", expectedOutcome: "Unified technology stack; reduced cross-system integration risk; 20% lower maintenance cost", technology: ".NET / jQuery / SQL Server", currentVersion: "Mixed Versions", upgradeVersion: "Standardized Stack", workNumber: "WO-1025", serviceCategory: "Platform Upgrade", startDate: "2026-08-01", endDate: "2026-12-31", status: "Planned", priority: "High", notes: "Program charter approved. Multi-team coordination plan finalized." },
  { id: 26, portfolio: "Enrollment & Eligibility", product: "IDR System", application: "Identity Resolution System", initiativeType: "Ticket Reduction", description: "Automation of IDR update process for SSN randomization edge cases to eliminate manual review queue", expectedOutcome: "Reduction of ~120 monthly tickets; 100% automation of SSN randomization case updates", technology: "IBM RPA", currentVersion: "-", upgradeVersion: "-", workNumber: "WO-2001", serviceCategory: "Automation", startDate: "2026-01-15", endDate: "2026-03-15", status: "Completed", priority: "High", notes: "Automation live since March 15. Ticket volume reduced 94% in first 30-day window." },
  { id: 27, portfolio: "Enrollment & Eligibility", product: "HMU", application: "Health Management Utility", initiativeType: "Ticket Reduction", description: "Enhance HMU design to ensure accurate snapshot timestamp recording for member health records", expectedOutcome: "Elimination of ~85 monthly data discrepancy tickets related to timestamp inaccuracies", technology: "Java / Spring Boot", currentVersion: "-", upgradeVersion: "-", workNumber: "WO-2002", serviceCategory: "Quality Improvement", startDate: "2026-02-01", endDate: "2026-04-30", status: "Active", priority: "Medium", notes: "Design changes complete. UAT running with enrollment operations team." },
  { id: 28, portfolio: "Finance & Billing", product: "Billing Portal", application: "Billing Analyst Workbench", initiativeType: "Ticket Reduction", description: "Self-service solution enabling billing analysts to perform standard premium adjustments without IT ticket submission", expectedOutcome: "~200 monthly tickets reduced; 2-day SLA improvement for billing resolution", technology: "React / Node.js", currentVersion: "-", upgradeVersion: "-", workNumber: "WO-2003", serviceCategory: "Operational Efficiency", startDate: "2026-02-15", endDate: "2026-05-31", status: "Active", priority: "High", notes: "Phase 1 self-service features live. 35 billing analysts onboarded." },
  { id: 29, portfolio: "Analytics & Reporting", product: "Data Load Pipeline", application: "ETL Data Load System", initiativeType: "Ticket Reduction", description: "Reduce data load anomalies through improved validation rules, reconciliation alerts, and root cause monitoring dashboards", expectedOutcome: "60% reduction in data load anomaly tickets across 12 reporting systems", technology: "Python / Apache Airflow", currentVersion: "-", upgradeVersion: "-", workNumber: "WO-2004", serviceCategory: "Data & Analytics", startDate: "2026-01-01", endDate: "2026-03-31", status: "Completed", priority: "High", notes: "Validation framework deployed. Monitoring dashboards live in Grafana." },
  { id: 30, portfolio: "Claims Processing", product: "Claims Audit Engine", application: "Claims Comparison Engine", initiativeType: "Ticket Reduction", description: "Automate comparison of claims, EOB, and EOP data to detect discrepancies before manual audit escalation", expectedOutcome: "~150 monthly audit exception tickets eliminated through automated daily reconciliation", technology: "IBM RPA / Python", currentVersion: "-", upgradeVersion: "-", workNumber: "WO-2005", serviceCategory: "Automation", startDate: "2026-01-15", endDate: "2026-04-15", status: "Active", priority: "High", notes: "Reconciliation engine in production pilot with claims operations. Accuracy rate 97.2%." },
  { id: 31, portfolio: "IT Infrastructure", product: "API Management", application: "API Gateway Platform", initiativeType: "Ticket Reduction", description: "API coverage cleanup: consolidate redundant endpoints, improve documentation, and implement health monitoring", expectedOutcome: "~75 monthly API support tickets reduced; improved developer self-service", technology: "API Gateway / OpenAPI", currentVersion: "-", upgradeVersion: "-", workNumber: "WO-2006", serviceCategory: "Quality Improvement", startDate: "2026-03-01", endDate: "2026-06-30", status: "Active", priority: "Low", notes: "API inventory complete. 340 endpoints catalogued. Documentation portal in build." },
  { id: 32, portfolio: "IT Infrastructure", product: "File Processing Service", application: "Multi-File Merge Service", initiativeType: "Ticket Reduction", description: "Automate multi-file checking and merge process for batch integrations to eliminate manual validation handling", expectedOutcome: "~60 monthly operations tickets eliminated; 4-hour reduction in batch processing window", technology: "Python / Shell", currentVersion: "-", upgradeVersion: "-", workNumber: "WO-2007", serviceCategory: "Automation", startDate: "2026-02-01", endDate: "2026-03-31", status: "Completed", priority: "Medium", notes: "Automation deployed to production. Handling 2,400 file merges daily without incidents." },
  { id: 33, portfolio: "Member Services", product: "Broker Sales Portal", application: "Broker Sales Portal", initiativeType: "Ticket Reduction", description: "Sales portal enhancement for subgroup billing and eligibility edge case scenarios", expectedOutcome: "~90 monthly portal support tickets reduced for complex subgroup configurations", technology: "Angular / Java", currentVersion: "-", upgradeVersion: "-", workNumber: "WO-2008", serviceCategory: "Operational Efficiency", startDate: "2026-04-01", endDate: "2026-07-31", status: "Planned", priority: "Medium", notes: "Requirements gathered from 12 sales operations stakeholders. Design complete." },
  { id: 34, portfolio: "Enrollment & Eligibility", product: "Member Enrollment System", application: "Online Enrollment Portal", initiativeType: "Ticket Reduction", description: "Real-time address validation at point of enrollment entry using USPS Address API", expectedOutcome: "~110 monthly enrollment error tickets reduced; 15% improvement in clean enrollment submissions", technology: "USPS API / React", currentVersion: "-", upgradeVersion: "-", workNumber: "WO-2009", serviceCategory: "Quality Improvement", startDate: "2026-04-15", endDate: "2026-07-15", status: "Planned", priority: "High", notes: "USPS API integration contract reviewed. Development kick-off scheduled April 15." },
  { id: 35, portfolio: "IT Infrastructure", product: "ChatOps Platform", application: "BOE / SSIS / XACT Monitoring", initiativeType: "Ticket Reduction", description: "ChatOps integration for BOE, SSIS, and XACT incident reporting and automated triage", expectedOutcome: "~130 monthly operational incident tickets consolidated; MTTR reduced by 40%", technology: "Slack / PagerDuty", currentVersion: "-", upgradeVersion: "-", workNumber: "WO-2010", serviceCategory: "Automation", startDate: "2026-05-01", endDate: "2026-07-31", status: "Planned", priority: "Medium", notes: "Tool selection finalized. IBM AMS team to lead implementation." },
  { id: 36, portfolio: "Claims Processing", product: "Authorization Integration", application: "Prior Authorization Platform", initiativeType: "Ticket Reduction", description: "Cross-system collaboration with integrating partners to prevent upstream authorization processing errors", expectedOutcome: "~95 monthly authorization error tickets prevented through partner validation improvements", technology: "SOAP / REST APIs", currentVersion: "-", upgradeVersion: "-", workNumber: "WO-2011", serviceCategory: "Quality Improvement", startDate: "2026-03-01", endDate: "2026-06-30", status: "Active", priority: "High", notes: "Root cause analysis complete with 3 partner systems. Code changes in 2 systems deployed." },
  { id: 37, portfolio: "Enrollment & Eligibility", product: "Member Data Hub", application: "Member Master Record System", initiativeType: "Ticket Reduction", description: "Cross-system master data governance collaboration to reduce member data discrepancy incidents at source systems", expectedOutcome: "~180 monthly member discrepancy tickets reduced through MDM-level governance", technology: "MDM Platform", currentVersion: "-", upgradeVersion: "-", workNumber: "WO-2012", serviceCategory: "Quality Improvement", startDate: "2026-02-01", endDate: "2026-05-31", status: "At Risk", priority: "High", notes: "At Risk: downstream system coordination delayed 3 weeks due to source system freeze. Recovery plan in place." },
  { id: 38, portfolio: "Claims Processing", product: "MPV Processing", application: "Multi-Plan Verification System", initiativeType: "Ticket Reduction", description: "Automate reprocessing of failed MPV records to eliminate manual IT intervention and requeue tickets", expectedOutcome: "~70 monthly reprocessing tickets eliminated; 78% reduction achieved in pilot", technology: "Python / SQL Server", currentVersion: "-", upgradeVersion: "-", workNumber: "WO-2013", serviceCategory: "Automation", startDate: "2026-01-01", endDate: "2026-02-28", status: "Completed", priority: "Medium", notes: "Auto-retry logic deployed to production. Monitoring shows 78% ticket reduction sustained." },
  { id: 39, portfolio: "Member Services", product: "Survey Platform", application: "Member Satisfaction Survey System", initiativeType: "Ticket Reduction", description: "Enhanced structured logging to proactively detect and resolve survey delivery and completion failures", expectedOutcome: "~45 monthly survey issue tickets resolved proactively through monitoring alerts", technology: "ELK Stack (Elasticsearch / Kibana)", currentVersion: "-", upgradeVersion: "-", workNumber: "WO-2014", serviceCategory: "Quality Improvement", startDate: "2026-05-01", endDate: "2026-07-31", status: "Planned", priority: "Low", notes: "Logging requirements defined. ELK dashboard templates designed." },
  { id: 40, portfolio: "Enrollment & Eligibility", product: "Membership Workflow Engine", application: "Member Data Update System", initiativeType: "Ticket Reduction", description: "Queue optimization and priority-based scheduling for database update requests in membership workflows", expectedOutcome: "~65 monthly database update delay tickets eliminated through queue management improvements", technology: "Java / Apache Kafka", currentVersion: "-", upgradeVersion: "-", workNumber: "WO-2015", serviceCategory: "Operational Efficiency", startDate: "2026-04-01", endDate: "2026-06-30", status: "Planned", priority: "Medium", notes: "Architecture design complete. Kafka topic design reviewed with platform team." },
  { id: 41, portfolio: "Member Services", product: "IVR Platform", application: "CPL IVR Configuration System", initiativeType: "Ticket Reduction", description: "Automate loading of CPL (Coverage and Plan List) data into IVR system configuration", expectedOutcome: "~55 monthly IVR configuration tickets eliminated; real-time plan data in IVR", technology: "IVR / Python", currentVersion: "-", upgradeVersion: "-", workNumber: "WO-2016", serviceCategory: "Automation", startDate: "2026-06-01", endDate: "2026-08-31", status: "Planned", priority: "Medium", notes: "IVR vendor API documentation received. Integration design underway." },
  { id: 42, portfolio: "Finance & Billing", product: "Premium Rating Engine", application: "Premium Rating System", initiativeType: "Ticket Reduction", description: "Vendor coordination to implement upstream validation improvements reducing rate-member mismatch incidents", expectedOutcome: "~80 monthly rating mismatch tickets reduced through vendor data quality enhancements", technology: "Rating Engine APIs", currentVersion: "-", upgradeVersion: "-", workNumber: "WO-2017", serviceCategory: "Operational Efficiency", startDate: "2026-03-01", endDate: "2026-06-30", status: "At Risk", priority: "High", notes: "At Risk: Vendor response to technical requirements delayed 3 weeks. Escalation to vendor account team initiated." },
  { id: 43, portfolio: "Claims Processing", product: "Claims Adjudication", application: "Claims Processing System", initiativeType: "Ticket Reduction", description: "Structured training program for tier-1 support to reduce unnecessary claims processing escalation tickets", expectedOutcome: "~100 monthly escalation tickets reduced through knowledge transfer; 20% improvement in first-call resolution", technology: "LMS / Training Platform", currentVersion: "-", upgradeVersion: "-", workNumber: "WO-2018", serviceCategory: "Operational Efficiency", startDate: "2026-01-15", endDate: "2026-03-15", status: "Completed", priority: "Low", notes: "3 training cohorts completed. 85 support staff certified. Knowledge base articles published." },
  { id: 44, portfolio: "Member Services", product: "Broker Management Portal", application: "Broker Self-Service Portal", initiativeType: "Ticket Reduction", description: "Enhanced broker portal screens for policy and enrollment updates to reduce manual IBM AMS team intervention", expectedOutcome: "~90 monthly manual broker update tickets eliminated through broker self-service portal enhancements", technology: "Angular / Java", currentVersion: "-", upgradeVersion: "-", workNumber: "WO-2019", serviceCategory: "Automation", startDate: "2026-07-01", endDate: "2026-10-31", status: "Planned", priority: "Medium", notes: "UX design complete. Developer resources allocated for Q3." },
  { id: 45, portfolio: "Finance & Billing", product: "SHBS-UPS", application: "SHBS-UPS MS Access System", initiativeType: "Transformation", description: "SHBS-UPS modernization from MS Access 2016 to cloud-hosted web application with multi-user support and audit trails", expectedOutcome: "Elimination of MS Access dependency; multi-user concurrent access; full audit trail compliance", technology: "MS Access → React / Node.js", currentVersion: "MS Access 2016", upgradeVersion: "Cloud Web Application", workNumber: "WO-3001", serviceCategory: "Application Modernization", startDate: "2026-09-01", endDate: "2026-12-31", status: "Planned", priority: "Medium", notes: "Requirements gathering and process documentation scheduled for Q3 kickoff." },
];

const PORTFOLIOS = ["All", "IT Infrastructure", "Enrollment & Eligibility", "Claims Processing", "Finance & Billing", "Member Services", "Clinical Management", "Analytics & Reporting"];
const TYPES: (InitiativeType | "All")[] = ["All", "Upgrade", "Ticket Reduction", "Transformation"];
const STATUSES: (Status | "All")[] = ["All", "Active", "Planned", "Completed", "At Risk"];
const PRIORITIES: (Priority | "All")[] = ["All", "High", "Medium", "Low"];
const CATEGORIES = ["All", "Application Modernization", "Automation", "Quality Improvement", "Platform Upgrade", "Operational Efficiency", "Infrastructure", "Data & Analytics"];
const QUARTERS = ["All", "Q1", "Q2", "Q3", "Q4"];

const TYPE_COLORS: Record<InitiativeType, string> = {
  "Upgrade": "bg-blue-500",
  "Ticket Reduction": "bg-emerald-500",
  "Transformation": "bg-purple-500",
};
const TYPE_TEXT_COLORS: Record<InitiativeType, string> = {
  "Upgrade": "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950 dark:border-blue-800",
  "Ticket Reduction": "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950 dark:border-emerald-800",
  "Transformation": "text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-300 dark:bg-purple-950 dark:border-purple-800",
};
const STATUS_COLORS: Record<Status, string> = {
  "Active": "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950 dark:border-blue-800",
  "Planned": "text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700",
  "Completed": "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950 dark:border-emerald-800",
  "At Risk": "text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950 dark:border-red-800",
};
const PRIORITY_COLORS: Record<Priority, string> = {
  "High": "text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950 dark:border-red-800",
  "Medium": "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950 dark:border-amber-800",
  "Low": "text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700",
};

const YEAR_START = new Date("2026-01-01").getTime();
const YEAR_END = new Date("2026-12-31").getTime();
const YEAR_MS = YEAR_END - YEAR_START;

function getBarStyle(startDate: string, endDate: string) {
  const s = Math.max(new Date(startDate).getTime(), YEAR_START);
  const e = Math.min(new Date(endDate).getTime(), YEAR_END);
  const left = ((s - YEAR_START) / YEAR_MS) * 100;
  const width = Math.max(((e - s) / YEAR_MS) * 100, 1.5);
  return { left: `${left.toFixed(2)}%`, width: `${width.toFixed(2)}%` };
}

function getQuarterForDate(dateStr: string): string {
  const m = new Date(dateStr).getMonth() + 1;
  if (m <= 3) return "Q1";
  if (m <= 6) return "Q2";
  if (m <= 9) return "Q3";
  return "Q4";
}

function initiativeInQuarter(init: Initiative, quarter: string): boolean {
  if (quarter === "All") return true;
  const qStart: Record<string, Date> = { Q1: new Date("2026-01-01"), Q2: new Date("2026-04-01"), Q3: new Date("2026-07-01"), Q4: new Date("2026-10-01") };
  const qEnd: Record<string, Date> = { Q1: new Date("2026-03-31"), Q2: new Date("2026-06-30"), Q3: new Date("2026-09-30"), Q4: new Date("2026-12-31") };
  const s = new Date(init.startDate);
  const e = new Date(init.endDate);
  return s <= qEnd[quarter] && e >= qStart[quarter];
}

function SmallBadge({ label, className }: { label: string; className: string }) {
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border", className)}>{label}</span>;
}

function SelectFilter({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="text-sm rounded-md border border-border bg-background px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function DetailPanel({ initiative, onClose }: { initiative: Initiative; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
      <div
        className="relative w-full max-w-lg bg-background border-l border-border shadow-2xl flex flex-col h-full overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-border sticky top-0 bg-background z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-muted-foreground">{initiative.workNumber}</span>
              <SmallBadge label={initiative.initiativeType} className={TYPE_TEXT_COLORS[initiative.initiativeType]} />
            </div>
            <h2 className="text-base font-semibold leading-snug">{initiative.application}</h2>
            <p className="text-sm text-muted-foreground">{initiative.product} · {initiative.portfolio}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors ml-4 flex-shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 flex-1">
          <div className="flex gap-2 flex-wrap">
            <SmallBadge label={initiative.status} className={STATUS_COLORS[initiative.status]} />
            <SmallBadge label={`Priority: ${initiative.priority}`} className={PRIORITY_COLORS[initiative.priority]} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Description</p>
            <p className="text-sm leading-relaxed">{initiative.description}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Expected Outcome</p>
            <p className="text-sm leading-relaxed">{initiative.expectedOutcome}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              ["Service Category", initiative.serviceCategory],
              ["Technology", initiative.technology],
              ["Current Version", initiative.currentVersion || "—"],
              ["Upgrade Version", initiative.upgradeVersion || "—"],
              ["Start Date", initiative.startDate],
              ["End Date", initiative.endDate],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-xs text-muted-foreground mb-0.5">{k}</p>
                <p className="font-medium">{v}</p>
              </div>
            ))}
          </div>

          {initiative.notes && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-amber-900 dark:text-amber-200">{initiative.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GanttChart({ initiatives, onSelect }: { initiatives: Initiative[]; onSelect: (i: Initiative) => void }) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const quarters = [
    { label: "Q1 · Jan – Mar", left: "0%", width: "25%" },
    { label: "Q2 · Apr – Jun", left: "25%", width: "25%" },
    { label: "Q3 · Jul – Sep", left: "50%", width: "25%" },
    { label: "Q4 · Oct – Dec", left: "75%", width: "25%" },
  ];

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: 800 }}>
        {/* Quarter header */}
        <div className="relative flex border-b border-border mb-1">
          {quarters.map((q, i) => (
            <div key={q.label} className={cn("flex-1 text-center text-xs font-medium py-2 text-muted-foreground", i < 3 && "border-r border-border")}>
              {q.label}
            </div>
          ))}
        </div>

        {/* Gantt rows */}
        <div className="space-y-1">
          {initiatives.map(init => {
            const bar = getBarStyle(init.startDate, init.endDate);
            const isHovered = hoveredId === init.id;
            return (
              <div
                key={init.id}
                className="relative h-9 flex items-center cursor-pointer group"
                onClick={() => onSelect(init)}
                onMouseEnter={() => setHoveredId(init.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Quarter grid lines */}
                {[25, 50, 75].map(pct => (
                  <div key={pct} className="absolute top-0 bottom-0 border-l border-border/40" style={{ left: `${pct}%` }} />
                ))}

                {/* Bar */}
                <div
                  className={cn(
                    "absolute rounded-md h-6 transition-all duration-150 flex items-center px-2 overflow-hidden",
                    TYPE_COLORS[init.initiativeType],
                    isHovered ? "opacity-100 shadow-md ring-2 ring-white/30" : "opacity-75",
                    init.status === "Completed" && "opacity-50",
                    init.status === "At Risk" && "ring-2 ring-red-400"
                  )}
                  style={{ left: bar.left, width: bar.width }}
                >
                  <span className="text-white text-xs font-medium truncate whitespace-nowrap">{init.workNumber}</span>
                </div>

                {/* Hover tooltip */}
                {isHovered && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-20 pointer-events-none">
                    <div className="bg-popover border border-border rounded-lg shadow-xl p-3 w-72 text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-muted-foreground">{init.workNumber}</span>
                        <SmallBadge label={init.initiativeType} className={TYPE_TEXT_COLORS[init.initiativeType]} />
                      </div>
                      <p className="font-semibold text-xs mb-1">{init.application}</p>
                      <p className="text-xs text-muted-foreground mb-2">{init.description.slice(0, 100)}…</p>
                      <div className="flex gap-1.5 flex-wrap">
                        <SmallBadge label={init.status} className={STATUS_COLORS[init.status]} />
                        <SmallBadge label={init.priority} className={PRIORITY_COLORS[init.priority]} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">{init.startDate} → {init.endDate}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 pt-4 mt-2 border-t border-border">
          {(Object.entries(TYPE_COLORS) as [InitiativeType, string][]).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={cn("w-3 h-3 rounded-sm", color)} />
              <span className="text-xs text-muted-foreground">{type}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 ml-4">
            <div className="w-3 h-3 rounded-sm bg-slate-400 ring-2 ring-red-400" />
            <span className="text-xs text-muted-foreground">At Risk</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function InitiativesTable({ initiatives, onSelect }: { initiatives: Initiative[]; onSelect: (i: Initiative) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {["Work #", "Portfolio", "Application", "Type", "Technology", "Dates", "Status", "Priority", ""].map(h => (
              <th key={h} className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground py-2.5 px-3 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {initiatives.map((init, i) => (
            <tr
              key={init.id}
              onClick={() => onSelect(init)}
              className={cn("border-b border-border/50 cursor-pointer hover:bg-muted/50 transition-colors", i % 2 === 0 ? "" : "bg-muted/20")}
            >
              <td className="py-2.5 px-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{init.workNumber}</td>
              <td className="py-2.5 px-3 whitespace-nowrap max-w-[140px] truncate">{init.portfolio}</td>
              <td className="py-2.5 px-3 max-w-[180px]">
                <div className="font-medium truncate">{init.application}</div>
                <div className="text-xs text-muted-foreground truncate">{init.product}</div>
              </td>
              <td className="py-2.5 px-3 whitespace-nowrap">
                <SmallBadge label={init.initiativeType} className={TYPE_TEXT_COLORS[init.initiativeType]} />
              </td>
              <td className="py-2.5 px-3 text-xs text-muted-foreground whitespace-nowrap max-w-[120px] truncate">{init.technology}</td>
              <td className="py-2.5 px-3 text-xs text-muted-foreground whitespace-nowrap">
                <div>{init.startDate}</div>
                <div>{init.endDate}</div>
              </td>
              <td className="py-2.5 px-3 whitespace-nowrap">
                <SmallBadge label={init.status} className={STATUS_COLORS[init.status]} />
              </td>
              <td className="py-2.5 px-3 whitespace-nowrap">
                <SmallBadge label={init.priority} className={PRIORITY_COLORS[init.priority]} />
              </td>
              <td className="py-2.5 px-3">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {initiatives.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">No initiatives match the selected filters.</div>
      )}
    </div>
  );
}

export default function DigitalRoadmap() {
  const [portfolio, setPortfolio] = useState("All");
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [category, setCategory] = useState("All");
  const [quarter, setQuarter] = useState("All");
  const [view, setView] = useState<"timeline" | "table">("timeline");
  const [selected, setSelected] = useState<Initiative | null>(null);

  const filtered = useMemo(() => {
    return INITIATIVES.filter(i =>
      (portfolio === "All" || i.portfolio === portfolio) &&
      (type === "All" || i.initiativeType === type) &&
      (status === "All" || i.status === status) &&
      (priority === "All" || i.priority === priority) &&
      (category === "All" || i.serviceCategory === category) &&
      initiativeInQuarter(i, quarter)
    );
  }, [portfolio, type, status, priority, category, quarter]);

  const summary = useMemo(() => ({
    total: filtered.length,
    active: filtered.filter(i => i.status === "Active").length,
    planned: filtered.filter(i => i.status === "Planned").length,
    completed: filtered.filter(i => i.status === "Completed").length,
    atRisk: filtered.filter(i => i.status === "At Risk").length,
    highPriority: filtered.filter(i => i.priority === "High").length,
  }), [filtered]);

  function clearFilters() {
    setPortfolio("All"); setType("All"); setStatus("All");
    setPriority("All"); setCategory("All"); setQuarter("All");
  }

  const hasFilters = [portfolio, type, status, priority, category, quarter].some(v => v !== "All");

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Digital Roadmap</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Horizon + IBM · CY2026 · Upgrades, Ticket Reduction &amp; Transformation Initiatives
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1 italic">
          Disclaimer: This dashboard contains representative initiative data derived from planning materials for demonstration and prototype purposes only. It should not be interpreted as a final approved delivery plan, production commitment, or live operational record.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total", value: summary.total, icon: <BarChart3 className="h-4 w-4 text-slate-500" />, cls: "" },
          { label: "Active", value: summary.active, icon: <Activity className="h-4 w-4 text-blue-500" />, cls: "text-blue-700 dark:text-blue-400" },
          { label: "Planned", value: summary.planned, icon: <Clock className="h-4 w-4 text-slate-400" />, cls: "" },
          { label: "Completed", value: summary.completed, icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />, cls: "text-emerald-700 dark:text-emerald-400" },
          { label: "At Risk", value: summary.atRisk, icon: <AlertTriangle className="h-4 w-4 text-red-500" />, cls: "text-red-700 dark:text-red-400" },
          { label: "High Priority", value: summary.highPriority, icon: <AlertTriangle className="h-4 w-4 text-amber-500" />, cls: "text-amber-700 dark:text-amber-400" },
        ].map(card => (
          <Card key={card.label} className="py-3">
            <CardContent className="px-4 py-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{card.label}</span>
                {card.icon}
              </div>
              <p className={cn("text-2xl font-bold", card.cls)}>{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <SelectFilter label="Portfolio" value={portfolio} options={PORTFOLIOS} onChange={setPortfolio} />
            <SelectFilter label="Initiative Type" value={type} options={TYPES} onChange={setType} />
            <SelectFilter label="Status" value={status} options={STATUSES} onChange={setStatus} />
            <SelectFilter label="Priority" value={priority} options={PRIORITIES} onChange={setPriority} />
            <SelectFilter label="Service Category" value={category} options={CATEGORIES} onChange={setCategory} />
            <SelectFilter label="Quarter" value={quarter} options={QUARTERS} onChange={setQuarter} />
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline self-end pb-1.5"
              >
                Clear filters
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View toggle + content */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {filtered.length} Initiative{filtered.length !== 1 ? "s" : ""}
              {hasFilters && <span className="text-sm font-normal text-muted-foreground ml-2">(filtered)</span>}
            </CardTitle>
            <div className="flex rounded-lg border border-border overflow-hidden text-sm">
              {(["timeline", "table"] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    "px-4 py-1.5 capitalize transition-colors",
                    view === v ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {view === "timeline" ? (
            <GanttChart initiatives={filtered} onSelect={setSelected} />
          ) : (
            <InitiativesTable initiatives={filtered} onSelect={setSelected} />
          )}
        </CardContent>
      </Card>

      {/* IBM disclaimer footer */}
      <p className="text-xs text-muted-foreground/60 text-center pb-2">
        © 2026 IBM Corporation. All rights reserved. IBM and the IBM logo are trademarks of IBM Corporation, registered in many jurisdictions worldwide.
      </p>

      {/* Detail panel */}
      {selected && <DetailPanel initiative={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
