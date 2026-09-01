# Data & AI Models Architecture Specification (MODEL.md)

This document provides a comprehensive technical specification of the data models, entity relationship diagrams, state machine transitions, protocol specifications, algorithmic pricing models, and AI reasoning pipelines powering the **MarketLead** platform.

---

## 1. Domain Entity Relationship Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                              BusinessType                              │
│         (Industry vertical, operational model, locale coverage)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ 1 : 1
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                             CompanyProfile                             │
│     (Vendor identity, services catalog, pricing model, A2A Agent ID)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ 1 : N
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                             CustomerDemand                             │
│     (Scraped buyer RFP, budget, SLA urgency, 249 ISO country code)     │
└───────────────┬───────────────────┬───────────────────┬────────────────┘
                │                   │                   │
          1 : N │             1 : N │             1 : N │
                ▼                   ▼                   ▼
      ┌──────────────────┐  ┌──────────────┐  ┌───────────────────┐
      │    MessageLog    │  │   Proposal   │  │ A2ANegotiationStep│
      │ (Email/WhatsApp) │  │ (3-Tier SOW) │  │  (M2M JSON-RPC)   │
      └──────────────────┘  └──────────────┘  └───────────────────┘
                │
                ▼
      ┌──────────────────┐
      │  BudgetBreakdown │
      │(Algorithmic PPP) │
      └──────────────────┘
```

---

## 2. Comprehensive Data Models Specification

### 2.1 `BusinessType`
Represents an industry vertical or commercial domain category used for targeted lead scraping and matching.

```typescript
export type BusinessMode = 'Online' | 'Onsite' | 'Hybrid';
export type PopularityLevel = 'Low' | 'Medium' | 'High' | 'Very High';

export interface BusinessType {
  business_id: string;                                    // e.g. "BUS-0001"
  business_type_name: string;                             // e.g. "Enterprise Web Development"
  online_or_onsite: BusinessMode;                         // Service delivery method
  place: string;                                          // Target market locale
  approximately_area: string;                             // Geographic coverage scope
  popularity: PopularityLevel;                            // Demand density indicator
  isCustom?: boolean;                                     // Indicates user-defined verticals
}
```

---

### 2.2 `CompanyProfile`
Represents the vendor organization offering services to fulfill customer demands.

```typescript
export interface CompanyProfile {
  id: string;                                             // Unique profile identifier
  businessTypeId: string;                                 // Associated BusinessType ID
  businessTypeName: string;                               // Associated business category name
  companyName: string;                                    // Vendor corporate trading name
  tagline: string;                                        // High-impact commercial value proposition
  location: string;                                       // Physical or registered jurisdiction
  website: string;                                        // Corporate domain URL
  contactEmail: string;                                   // Outreach sender email address
  contactPhone: string;                                   // Contact phone with international dialing code
  a2aAgentId: string;                                     // M2M identifier (e.g., "A2A-VENDOR-770")
  services: string[];                                     // Array of capabilities and specializations
  pricingModel: string;                                   // Standard billing structure
  valueProposition: string;                               // Commercial differentiation summary
  bio: string;                                            // Executive organizational profile
  logoIcon: string;                                       // Lucide icon identifier
  createdDate: string;                                    // Initialization timestamp
}
```

---

### 2.3 `CustomerDemand`
The primary lead object representing an active commercial procurement demand or RFP.

```typescript
export type UrgencyLevel = 'Immediate (1-3 days)' | 'High (1-2 weeks)' | 'Medium (1 month)' | 'Flexible';
export type DemandStatus = 'New' | 'Contacted' | 'In Discussion' | 'Proposal Sent' | 'Won' | 'Archived';

export interface CustomerDemand {
  id: string;                                             // Unique lead identifier
  businessTypeId: string;                                 // Associated BusinessType ID
  businessTypeName: string;                               // Matched industry domain
  customerName: string;                                   // Contact name / division
  customerCompany: string;                                // Target enterprise organization
  contactPerson: string;                                  // Primary procurement decision maker
  role: string;                                           // Buyer title (e.g., "VP Procurement")
  email: string;                                          // Direct corporate email
  phone: string;                                          // Phone with international dialing code
  a2aEndpoint: string;                                    // URI for Buyer Agent A2A endpoint
  a2aAgentId: string;                                     // Buyer Agent identifier (e.g., "A2A-BUYER-8842")
  location: string;                                       // Geographic location & ISO country code
  title: string;                                          // Concise procurement demand title
  demandDescription: string;                              // Full specification and technical requirements
  requiredDeliverables: string[];                         // List of mandatory deliverables
  budgetRange: string;                                    // Stated or computed budget allocation
  budgetBreakdown?: BudgetFactorBreakdown;                // Algorithmic unit economics breakdown
  urgency: UrgencyLevel;                                  // Delivery timeline requirement
  publishedDate: string;                                  // Date published within last 6 months (YYYY-MM-DD)
  source: string;                                         // Signal source (e.g., "Enterprise RFP Portal")
  sourceUrl?: string;                                     // Source URL if available
  leadOrigin?: 'web-scraped' | 'user-imported';          // Lead provenance indicator
  status: DemandStatus;                                   // Current commercial deal pipeline state
  matchScore: number;                                     // Alignment score (0–100)
  matchReason: string;                                    // Analytical capability synergy explanation
  communicationLogs: MessageLog[];                        // History of outbound and inbound messages
  proposals: Proposal[];                                  // Commercial proposals generated for this lead
  a2aLogs?: A2ANegotiationStep[];                         // Machine-to-machine protocol logs
  isVerifiedReal?: boolean;                               // Authenticity audit flag
  verifiedAt?: string;                                    // Authenticity verification timestamp
  verificationResult?: PostDemandCheckResult;             // Deep intent & signal classification result
}
```

---

### 2.4 `BudgetFactorBreakdown` (Algorithmic Unit Economics Model)
Calculates structured cost breakdowns and pricing envelopes based on multi-variable commercial weighting.

```typescript
export interface BudgetFactorBreakdown {
  industrySector: string;
  baseMedian: number;
  modeMultiplier: number;
  urgencyMultiplier: number;
  deliverablesMultiplier: number;
  regionMultiplier: number;
  scaleMultiplier: number;
  compositeMultiplier: number;
  calculatedLow?: number;
  calculatedHigh?: number;
  calculatedMid?: number;
  finalMedian?: number;
  formattedRange?: string;
  costComponents: {
    laborAndSpecialists: number;
    technologyAndInfrastructure: number;
    complianceAndAssurance: number;
    pmAndContingency: number;
  };
  unitEconomics: {
    hourlyRateBenchmark: string;
    estimatedLaborHours: number;
    primaryCostDriver: string;
    riskMarginPercent: number;
  };
  recommendedTiers: {
    tier1Core: { name: string; price: string; percentage: string; description?: string };
    tier2Pro: { name: string; price: string; percentage: string; description?: string };
    tier3Enterprise: { name: string; price: string; percentage: string; description?: string };
  };
  formulaExplanation?: string;
}
```

#### Multiplier Formula:
$$\text{Composite Multiplier} = M_{\text{delivery}} \times M_{\text{urgency}} \times M_{\text{deliverables}} \times M_{\text{region}} \times M_{\text{scale}}$$
$$\text{Final Budget} = \text{Base Median} \times \text{Composite Multiplier}$$

---

### 2.5 `PostDemandCheckResult` (Intent & Signal Verification Model)

```typescript
export type DemandIntentClassification =
  | 'Commercial RFP / Project Hiring'
  | 'Urgent Service Need'
  | 'Vendor Replacement / Switch'
  | 'Pricing & Feasibility Inquiry'
  | 'General Discussion / Advice (No Commercial Demand)'
  | 'Self-Promotion / Vendor Selling (No Buyer Demand)'
  | 'Spam / Irrelevant Content';

export interface PostDemandCheckResult {
  hasDemand: boolean;
  demandConfidenceScore: number;                           // 0 to 100
  intentClassification: DemandIntentClassification;
  demandSummary: string;
  detectedSignals: {
    positiveBuyingSignals: string[];
    riskOrNegativeSignals: string[];
  };
  keyEntities: {
    targetAudienceOrNiche: string;
    estimatedBudgetLevel: string;
    urgencyTimeline: string;
    requiredServices: string[];
    potentialCustomerName?: string;
    potentialCustomerCompany?: string;
    inferredLocation?: string;
    contactChannelFound?: string;
  };
  businessAlignment: {
    targetBusinessTypeName: string;
    fitScore: number;
    fitRationale: string;
  };
  extractedDemand?: CustomerDemand;
}
```

---

### 2.6 `Proposal` (3-Tier Statement of Work Model)
Structured commercial proposal docket with phased milestones, scope of work, and tiered pricing.

```typescript
export interface Proposal {
  id: string;
  customerDemandId: string;
  customerName: string;
  customerCompany: string;
  title: string;
  executiveSummary: string;
  understandingOfRequirements: string;
  scopeOfWork: {
    phase: string;
    description: string;
    duration: string;
  }[];
  deliverables: string[];
  timeline: string;
  tieredPricing: {
    tierName: string;
    price: string;
    features: string[];
    recommended?: boolean;
  }[];
  termsAndConditions: string;
  createdDate: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Under Review';
}
```

---

### 2.7 `A2ANegotiationStep` (Agent-to-Agent Protocol Model)
Represents a single step in the 5-phase machine-to-machine autonomous negotiation sequence.

```typescript
export interface A2ANegotiationStep {
  step: number;
  agent: 'VendorAgent' | 'BuyerAgent';
  action: string;
  payload: Record<string, any>;
  humanExplanation: string;
  timestamp: string;
}
```

#### Protocol State Machine Steps:
1. **`A2A_HANDSHAKE_INIT`**: Vendor Agent advertises matching service capabilities and certified availability.
2. **`A2A_REQUIREMENT_CHALLENGE`**: Buyer Agent challenges budget constraint and delivery turnaround speed.
3. **`A2A_SLA_OFFER_DISPATCH`**: Vendor Agent transmits a signed SLA schedule and parametric pricing envelope.
4. **`A2A_TERMS_EVALUATION`**: Buyer Agent runs heuristic scoring (budget delta, SLA match) and ranks vendor as preferred.
5. **`A2A_AGREEMENT_RATIFIED`**: Mutual authorization signature token (`AUTH-SIG-xxxxxx`) ratified, inviting human operators to execute contract.

---

### 2.8 `AdminUser` (Role-Based Access Model)
Administrative identity and permission matrix for internal system management.

```typescript
export type AdminUserRole = 'Super Admin' | 'Lead Ops Manager' | 'Commercial Executive' | 'Scraper Specialist' | 'Read-Only Auditor';
export type UserAccountStatus = 'Active' | 'Deactivated' | 'Pending Approval';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  status?: UserAccountStatus;
  avatarUrl?: string;
  lastLogin: string;
  dateAdded?: string;
  department?: string;
  permissions: string[];
  allowedModules?: string[];
  accessLevel?: 'Full Root Access' | 'Restricted Operational' | 'Commercial Only' | 'View Only';
}
```

---

## 3. AI Reasoning Engine Architecture

The platform uses **Gemini 3.7 Flash** via the official `@google/genai` TypeScript SDK with structured schema generation and native thinking reasoning:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Gemini 3.7 Flash Engine                         │
│                      Model: models/gemini-3.7-flash                    │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
       ┌──────────────────────────┐    ┌──────────────────────────┐
       │   Structured JSON Mode   │    │  ThinkingLevel (HIGH)    │
       │ (Lead Scraper, Message   │    │  (Commercial SOW Multi-  │
       │  Drafts, A2A Protocol)   │    │   Tier Proposal Planner) │
       └──────────────────────────┘    └──────────────────────────┘
```

### 3.1 AI Service Endpoints & Configurations

| Endpoint | Target Model | Configuration Details | Output Format |
| :--- | :--- | :--- | :--- |
| `/api/scrape-demands` | `gemini-3.7-flash` | Prompt-engineered with ISO-2 country grounding and past 6-month timeframe constraints. Supports batch capacity up to **100 customer demands** per vertical. | Validated JSON array of up to 100 `CustomerDemand` objects. |
| `/api/parse-real-rfp` | `gemini-3.7-flash` | Structured ingestion of real enterprise tender documents and requirements. | Structured `CustomerDemand` entity. |
| `/api/check-post-demand` | `gemini-3.7-flash` | Intent analysis classifying buyer procurement vs seller pitch vs spam. | `PostDemandCheckResult` object. |
| `/api/verify-scraped-demand` | `gemini-3.7-flash` | Deep commercial authenticity and feasibility audit. | Detailed validation and confidence scoring. |
| `/api/generate-proposal` | `gemini-3.7-flash` | `thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }` for deep commercial scoping. | Comprehensive 3-tier `Proposal` with executive summary and phased SOW. |
| `/api/customer-chat` | `gemini-3.7-flash` | System role playing as the buyer's procurement director with memory of chat history. | Contextual text response. |
| `/api/a2a-negotiation` | `gemini-3.7-flash` | Protocol simulation outputting structured JSON-RPC packets with machine metadata. | 5-step array of `A2ANegotiationStep` objects. |
| `/api/generate-message-draft` | `gemini-3.7-flash` | Tone-calibrated template generator for Email and WhatsApp channels. | JSON object with `{ subject, body }`. |

---

## 4. State Machines & Lead Conversion Lifecycle

```
 [ NEW ] 
    │ (Email / WhatsApp draft dispatched)
    ▼
 [ CONTACTED ] 
    │ (Buyer replies or interactive chat begins)
    ▼
 [ IN DISCUSSION ] 
    │ (A2A protocol agreement OR proposal generated)
    ▼
 [ PROPOSAL SENT ] 
    ├──► [ WON ] (Client ratifies agreement / proposal accepted)
    └──► [ ARCHIVED ] (Deal expired or requirements changed)
```

---

## 5. Resilience & Storage Architecture

1. **Dual-Persistence Layer (`src/services/firebaseSync.ts`)**:
   - **Firestore Collections**: `demands`, `companyProfiles`, `customBusinessTypes`, `adminUsers`.
   - **Real-Time Sync**: Instant bidirectional synchronization with live connection status.
2. **Workstation Cache (`localStorage`)**:
   - `marketlead_demands_cache`: Preserves scraped leads by `business_id`.
   - `marketlead_custom_business_types`: User-defined business verticals.
   - `marketlead_company_profiles`: Active company profiles and A2A identities.
   - `marketlead_admin_user`: Active administrator session and RBAC tokens.
