# Data & AI Models Architecture Specification (MODEL.md)

This document provides a comprehensive technical specification of the data models, entity relationship diagrams, state machine transitions, protocol specifications, and AI reasoning pipelines powering the **MarketLead** platform.

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
```

---

## 2. Comprehensive Data Models Specification

### 2.1 `BusinessType`
Represents an industry vertical or commercial domain category used for targeted lead scraping and matching.

```typescript
export interface BusinessType {
  business_id: string;                                    // e.g. "BUS-0001"
  business_type_name: string;                             // e.g. "Enterprise Web Development"
  online_or_onsite: 'Online' | 'Onsite' | 'Hybrid';       // Operational mode
  place: string;                                          // Target market locale
  approximately_area: string;                             // Coverage radius or geographic scope
  popularity: 'Low' | 'Medium' | 'High' | 'Very High';    // Lead volume index
  isCustom?: boolean;                                     // True for user-created verticals
}
```

| Field | Type | Description |
| :--- | :--- | :--- |
| `business_id` | `string` | Unique identifier (e.g., `"BUS-0001"`, `"CUSTOM-1724921"`) |
| `business_type_name` | `string` | Human-readable name of the business category |
| `online_or_onsite` | `'Online' \| 'Onsite' \| 'Hybrid'` | Service delivery method |
| `place` | `string` | Primary market or default operational headquarters |
| `approximately_area` | `string` | Market coverage scope (e.g., "Global / Worldwide", "Regional (EMEA)") |
| `popularity` | `'Low' \| 'Medium' \| 'High' \| 'Very High'` | Commercial demand density indicator |
| `isCustom` | `boolean` (optional) | Indicates user-defined verticals stored locally |

---

### 2.2 `CompanyProfile`
Represents the vendor organization offering services to fulfill customer demands.

```typescript
export interface CompanyProfile {
  id: string;
  businessTypeId: string;
  businessTypeName: string;
  companyName: string;
  tagline: string;
  location: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  a2aAgentId: string;
  services: string[];
  pricingModel: string;
  valueProposition: string;
  bio: string;
  logoIcon?: string;
  createdDate: string;
}
```

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Profile unique identifier |
| `businessTypeId` | `string` | Associated `BusinessType` foreign key |
| `businessTypeName` | `string` | Denormalized vertical title |
| `companyName` | `string` | Corporate legal or operational trading name |
| `tagline` | `string` | High-impact commercial value proposition |
| `location` | `string` | Physical or registered jurisdiction |
| `website` | `string` | Corporate domain URL |
| `contactEmail` | `string` | Outreach sender email address |
| `contactPhone` | `string` | Direct contact number with international dialing code |
| `a2aAgentId` | `string` | Unique machine-to-machine identifier (e.g., `"A2A-VENDOR-770"`) |
| `services` | `string[]` | Array of core capabilities and delivery specializations |
| `pricingModel` | `string` | Standard billing structure (e.g., `"Milestone & Retainer"`) |
| `valueProposition` | `string` | Key commercial differentiation summary |
| `bio` | `string` | Executive organizational profile |
| `logoIcon` | `string` (optional) | Lucide icon identifier |
| `createdDate` | `string` | Profile initialization timestamp |

---

### 2.3 `CustomerDemand`
The primary lead object representing an active commercial procurement demand or RFP.

```typescript
export interface CustomerDemand {
  id: string;
  businessTypeId: string;
  businessTypeName: string;
  customerName: string;
  customerCompany: string;
  contactPerson: string;
  role: string;
  email: string;
  phone: string;
  a2aEndpoint: string;
  a2aAgentId: string;
  location: string;
  title: string;
  demandDescription: string;
  requiredDeliverables: string[];
  budgetRange: string;
  urgency: UrgencyLevel;
  publishedDate: string;
  source: string;
  sourceUrl?: string;
  status: DemandStatus;
  matchScore: number;
  matchReason: string;
  communicationLogs: MessageLog[];
  proposals: Proposal[];
  a2aLogs?: A2ANegotiationStep[];
}
```

#### Enums & Supporting Types:
- **`UrgencyLevel`**: `'Immediate (1-3 days)' | 'High (1-2 weeks)' | 'Medium (1 month)' | 'Flexible'`
- **`DemandStatus`**: `'New' | 'Contacted' | 'In Discussion' | 'Proposal Sent' | 'Won' | 'Archived'`

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique lead identifier (e.g., `"DEMAND-1724921-1"`) |
| `businessTypeId` | `string` | Associated `BusinessType` foreign key |
| `businessTypeName` | `string` | Matched industry domain |
| `customerName` | `string` | Contact name / buyer division |
| `customerCompany` | `string` | Target enterprise organization |
| `contactPerson` | `string` | Primary procurement decision maker |
| `role` | `string` | Buyer title (e.g., "VP Procurement", "Head of Operations") |
| `email` | `string` | Direct corporate email |
| `phone` | `string` | Direct phone with international dialing code |
| `a2aEndpoint` | `string` | URI for Buyer Agent A2A endpoint (e.g., `a2a://corp.network/v1/agent`) |
| `a2aAgentId` | `string` | Buyer Agent identifier (e.g., `"A2A-BUYER-8842"`) |
| `location` | `string` | Geographic location including country and ISO-2 code |
| `title` | `string` | Concise procurement demand title |
| `demandDescription` | `string` | Full specification, technical requirements, and context |
| `requiredDeliverables`| `string[]` | List of mandatory project deliverables |
| `budgetRange` | `string` | Stated budget allocation (e.g., `"$25,000 - $50,000"`) |
| `urgency` | `UrgencyLevel` | Delivery timeline requirement |
| `publishedDate` | `string` | Date published within the last 6 months (`YYYY-MM-DD`) |
| `source` | `string` | Signal source (e.g., `"Enterprise RFP Portal"`, `"LinkedIn Signal"`) |
| `status` | `DemandStatus` | Current commercial deal pipeline state |
| `matchScore` | `number` | Computed alignment score (0–100) |
| `matchReason` | `string` | Analytical explanation for capability synergy |
| `communicationLogs` | `MessageLog[]` | Outbound and inbound communication history |
| `proposals` | `Proposal[]` | Commercial proposals generated for this lead |
| `a2aLogs` | `A2ANegotiationStep[]` | Machine-to-machine protocol logs |

---

### 2.4 `Proposal` (3-Tier Statement of Work Model)
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
    recommended: boolean;
  }[];
  termsAndConditions: string;
  createdDate: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Under Review';
}
```

---

### 2.5 `A2ANegotiationStep` (Agent-to-Agent Protocol Model)
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

### 2.6 `AdminUser` (Role-Based Access Model)
Administrative identity and permission matrix for internal system management.

```typescript
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Lead Ops Manager' | 'Commercial Executive';
  avatarUrl?: string;
  lastLogin: string;
  permissions: string[];
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
| `/api/scrape-demands` | `gemini-3.7-flash` | Prompt-engineered with ISO-2 country grounding and past 6-month timeframe constraints. | Validated JSON array of `CustomerDemand` objects. |
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

1. **Proxy Layer (`src/services/apiService.ts`)**:
   - `safeFetchJson` validates HTTP status codes and `Content-Type: application/json` headers before parsing.
   - Transparent local generators ensure zero downtime even if network connectivity is interrupted.

2. **Workstation Cache (`localStorage`)**:
   - `marketlead_demands_cache`: Preserves scraped leads by `business_id`.
   - `marketlead_custom_business_types`: User-defined business verticals.
   - `marketlead_company_profiles`: Active company profiles and A2A identities.
   - `marketlead_admin_user`: Active administrator session and RBAC tokens.
