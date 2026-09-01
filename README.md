# MarketLead — Autonomous B2B Lead Intelligence, Web Scraper & A2A Negotiation Suite

MarketLead is an enterprise-grade commercial lead intelligence, procurement demand scraper, and automated client acquisition platform. It combines real-time RFP web scraping across **249 ISO 3166-1 countries and territories**, automated intent & authenticity verification, multi-channel outreach (Email, WhatsApp, Live Procurement Chat), Agent-to-Agent (A2A) autonomous protocol negotiations, algorithmic unit economics budget modeling, and **Gemini 3.7 Flash** powered commercial proposal generation with deep reasoning.

---

## 🌟 Key Features & Architecture

### 1. 🛡️ Authentication Gateway & Role-Based Access Control (RBAC)
- **Mandatory Login Gateway**: Complete application-level security locking all workspace modules behind an encrypted authentication gateway until authorized credentials are provided.
- **Role Permissions Hierarchy**:
  - 👑 **Super Admin**: Full root system scraper access, agent orchestration, database export, user management, and proposal approval.
  - ⚡ **Lead Ops Manager**: Web scraper cluster execution, country filter management, lead enrichment, and outreach queue.
  - 💼 **Commercial Executive**: Commercial proposal vault, direct client negotiation, won deals tracking, and executive analytics.
  - 🔬 **Scraper Specialist**: Targeted crawling, keyword tuning, dataset curation, and lead verification.
  - 👁️ **Read-Only Auditor**: Compliance inspection, proposal audit docket, and activity logs.
- **Pre-Configured Instant Switchers**: One-click demo administrative profiles for rapid operational testing.

### 2. 🔍 High-Capacity Lead Scraper Engine (Up to 100 Demands)
- **High-Throughput Batch Crawling**: Scrapes and synthesizes up to **100 high-intent customer demands** per industry vertical in a single scan, with quick batch presets (100 Max, 50, 25, 10).
- **Timeframe Scraper Engine**: Crawls procurement requests and RFP signals published within the **last 6 months** (customizable to 6M, 3M, 30D).
- **249 ISO 3166-1 Countries & Territories**: Global geographic filtering with national flags, ISO-2 codes, and international telephone dialing codes.
- **Match Scoring Engine**: Calculates automated capability alignment scores (0–100%) by comparing customer specifications with your registered company profile and service catalog.
- **Dynamic View Pagination**: Easily browse large lead sets with configurable page sizes (6, 12, 25, 50, 100 All) and responsive windowed pagination.
- **Industry Vertical Library**: 50+ pre-seeded enterprise verticals plus full support for custom user-created business types and CSV dataset imports/exports.

### 3. 🔬 AI Lead Authenticity & Intent Verifier
- **Buying Intent vs. Seller Pitch Detection**: Classifies leads into explicit intent categories (*Commercial RFP / Project Hiring*, *Urgent Service Need*, *Vendor Replacement*, *Pricing & Feasibility*, *Self-Promotion / Vendor Selling*, *Spam / Irrelevant Content*).
- **Signal Extraction**: Surfaces positive buying indicators, commercial risk factors, required services, budget levels, and urgency timelines.
- **Real RFP & Social Post Ingest**: Ingest raw RFP documents, tenders, or unstructured social posts and transform them into structured, scored demand records.

### 4. 📐 Algorithmic Budget Factor Engine
- **Unit Economics Model**: Calculates mathematical cost breakdowns and pricing envelopes based on:
  - Base industry sector medians and hourly benchmarks
  - Delivery mode multiplier (*Online*, *Onsite*, *Hybrid*)
  - SLA urgency multiplier (*Immediate*, *High*, *Medium*, *Flexible*)
  - Deliverable complexity index
  - Regional Purchasing Power Parity (PPP) index
  - Buyer organization scale factor
- **Cost Component Allocation**: Allocates budgets across Labor & Specialists, Technology & Infrastructure, Compliance & QA, and PM & Contingency.

### 5. 🤖 Autonomous A2A (Agent-to-Agent) Negotiation Hub
- **M2M Protocol Simulation**: Executes simulated 5-step JSON-RPC encrypted machine-to-machine protocol negotiations between the Vendor AI Agent (`A2A-VENDOR-xxx`) and Buyer AI Agent (`A2A-BUYER-xxx`).
- **Cryptographic & Parametric Agreements**: Automated SLA challenge verification, budget constraint matching, parametric quote dispatch, and mutual authorization signature token issuance (`AUTH-SIG-xxxxxx`).

### 6. 📄 Automated Commercial Proposal Vault
- **3-Tier Pricing Schedules**: Instant generation of structured pricing tiers (*Standard*, *Professional / Accelerated*, and *Enterprise Total Care*).
- **Statement of Work (SOW)**: Phased scope of work breakdown, mandatory project deliverables, delivery timelines, SLA guarantees, and payment milestones.
- **Export & Management**: Full review docket, status tracking (*Draft*, *Sent*, *Under Review*, *Accepted*), clipboard export, and print-ready contract layout.

### 7. 💬 Multi-Channel Customer Outreach & Live Chat
- **AI Outreach Drafter**: One-click generation of personalized outreach copy for **Email** and **WhatsApp** with customizable tone (*Professional*, *Direct*, *Consultative*, *Urgent*).
- **Interactive Buyer Chat**: Dynamic AI-simulated conversational agent acting as the enterprise procurement decision maker for real-time qualification.

### 8. ☁️ Dual-Persistence & Cloud Synchronization
- **Firebase Firestore Cloud Persistence**: Stores and synchronizes demands, company profiles, custom business types, and administrator accounts in real-time.
- **Zero-Downtime Local Cache**: Transparent fallback to local browser cache when offline or transitioning networks.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite |
| **Styling & UI** | Tailwind CSS v4, Motion, Lucide Icons, Canvas Confetti |
| **Backend & API** | Node.js, Express, tsx, esbuild |
| **AI Reasoning Core** | `@google/genai` TypeScript SDK (Gemini 3.7 Flash with `ThinkingLevel.HIGH`) |
| **Global Dataset** | ISO 3166-1 (249 countries, flags, ISO-2 codes, international dialing codes) |
| **Cloud Persistence** | Firebase Firestore + LocalStorage resilient caching |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Node 20+
- npm, pnpm, or bun

### 1. Installation
Clone the repository and install all dependencies:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (based on `.env.example`):
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Start Development Server
Run the unified Express backend and Vite development server:
```bash
npm run dev
```
Open your browser at **http://localhost:3000**.

### 4. Production Build & Start
Compile the static React bundle and build the self-contained Express server:
```bash
npm run build
npm run start
```

---

## 🔑 Preset Demo Administrator Accounts

You can test the **Admin Portal** immediately using any of the built-in demo administrator profiles:

| Role | Email | Password | Authorized Capabilities |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@marketlead.io` | `admin123` | Full Scraper Access, A2A Agent Orchestration, DB Export, Proposal Approval, User Management |
| **Lead Ops Manager** | `ops@marketlead.io` | `leadops2026` | Web Scraper Execution, Country Filter Management, Demand Enrichment, Outreach Queue |
| **Commercial Executive** | `exec@marketlead.io` | `execmarket` | Proposal Vault, Direct Client Negotiation, Won Deals Tracking, Executive Analytics |

---

## 📡 API Endpoints Specification

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/scrape-demands` | Scrapes or generates verified procurement leads for a target business type, country filter, and timeframe. |
| `POST` | `/api/parse-real-rfp` | Ingests and parses unstructured client RFP/tender documents into structured demand models. |
| `POST` | `/api/check-post-demand` | Evaluates raw web/social posts to classify buying intent vs seller promotion vs spam. |
| `POST` | `/api/verify-scraped-demand` | Audits a scraped demand for commercial authenticity and feasibility. |
| `POST` | `/api/generate-proposal` | Uses Gemini 3.7 Flash with deep thinking to generate a complete 3-tier commercial proposal SOW. |
| `POST` | `/api/customer-chat` | Simulates real-time interactive qualification chat with the buyer's procurement officer. |
| `POST` | `/api/a2a-negotiation` | Executes a 5-step machine-to-machine A2A autonomous negotiation protocol. |
| `POST` | `/api/generate-message-draft` | Generates tailored outreach drafts for Email or WhatsApp channels. |

---

## 📁 Repository Structure

```
├── src/
│   ├── components/
│   │   ├── AdminPage.tsx             # Authentication gateway, RBAC portal & telemetry
│   │   ├── CompanyPage.tsx           # Company profile & service catalog editor
│   │   ├── ConversationsHub.tsx      # Multi-channel outreach & chat center
│   │   ├── CountryDropdown.tsx       # 249-country ISO selection dropdown
│   │   ├── DemandDetailModal.tsx     # Lead inspection, drafts & A2A runner
│   │   ├── MarketLeadLogo.tsx        # Brand SVG logo mark
│   │   ├── Navbar.tsx                # Header with status pills & navigation
│   │   ├── ProposalsVault.tsx        # Commercial proposals repository
│   │   └── ScraperDashboard.tsx      # Main scraper & demand feeds
│   ├── data/
│   │   ├── countries.ts              # 249 ISO countries, flags & phone codes
│   │   └── defaultBusinessTypes.ts   # 50+ pre-seeded enterprise categories
│   ├── services/
│   │   ├── apiService.ts             # Resilient API client with fallback execution
│   │   └── firebaseSync.ts           # Firebase Firestore synchronization layer
│   ├── utils/
│   │   └── budgetEngine.ts           # Algorithmic budget & unit economics calculator
│   ├── types.ts                      # Core TypeScript domain models
│   ├── App.tsx                       # Master application container & router
│   ├── main.tsx                      # Vite React entry point
│   └── index.css                     # Tailwind CSS entry
├── server.ts                         # Express server with Gemini 3.7 AI endpoints
├── Model.md                          # Comprehensive data model & architecture guide
├── package.json
└── README.md
```

---

## 📄 License
MIT License. Developed for enterprise B2B customer acquisition and autonomous agent orchestration.
