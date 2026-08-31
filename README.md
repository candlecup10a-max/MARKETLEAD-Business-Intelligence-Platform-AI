# MarketLead — Autonomous B2B Lead Intelligence, Web Scraper & A2A Negotiation Suite

MarketLead is an intelligent enterprise lead intelligence and commercial engagement platform. It combines real-time RFP web scraping across **249 ISO 3166-1 countries and territories**, Agent-to-Agent (A2A) autonomous protocol negotiations, multi-channel direct outreach (Email, WhatsApp, Live Chat), and **Gemini 3.7 Flash** powered commercial proposal generation with deep reasoning.

---

## 🌟 Key Features & Capabilities

### 1. 🔍 Recent Customer Demand Web Scraper
- **High-Capacity Batch Scraper (Up to 100 Demands)**: Scrapes and loads up to **100 high-intent customer demands** per industry vertical in a single scan, with quick batch selector presets (100 Max, 50, 25, 10).
- **Timeframe Scraper Engine**: Crawls and surfaces procurement requests, RFP signals, and buyer demand published within the **last 6 months** (customizable to 6M, 3M, 30D).
- **249 Countries & Territories ISO 3166-1 Coverage**: Search, filter, and match leads by geographic location, national flag, ISO code, and international telephone dialing code.
- **Match Scoring Engine**: Calculates automated capability alignment scores (0–100%) by comparing customer specifications with your registered company profile and service catalog.
- **Dynamic View Pagination**: Easily browse large lead sets with configurable page size (6, 12, 25, 50, 100 All) and responsive windowed pagination.
- **Industry Vertical Library**: 50+ pre-seeded enterprise verticals plus full support for custom user-created business types and CSV dataset imports.

### 2. 🤖 Autonomous A2A (Agent-to-Agent) Negotiation Hub
- **M2M Protocol Simulation**: Executes simulated 5-step JSON-RPC encrypted machine-to-machine protocol negotiations between the Vendor AI Agent (`A2A-VENDOR-xxx`) and Buyer AI Agent (`A2A-BUYER-xxx`).
- **Cryptographic & Parametric Agreements**: Automated SLA challenge verification, budget constraint matching, parametric quote dispatch, and mutual authorization signature token issuance (`AUTH-SIG-xxxxxx`).

### 3. 📄 Automated Commercial Proposal Vault
- **3-Tier Pricing Schedules**: Instant generation of structured pricing tiers (*Standard*, *Professional / Accelerated*, and *Enterprise Total Care*).
- **Statement of Work (SOW)**: Phased scope of work breakdown, mandatory project deliverables, delivery timelines, SLA guarantees, and payment milestones.
- **Export & Management**: Full review docket, status tracking (*Draft*, *Sent*, *Under Review*, *Accepted*), clipboard export, and print-ready contract layout.

### 4. 💬 Multi-Channel Customer Outreach & Live Chat
- **AI Outreach Drafter**: One-click generation of personalized outreach copy for **Email** and **WhatsApp** with customizable tone (*Professional*, *Direct*, *Consultative*, *Urgent*).
- **Interactive Buyer Chat**: Dynamic AI-simulated conversational agent acting as the enterprise procurement decision maker for real-time qualification.

### 5. 🛡️ Dedicated Admin Management Portal
- **Direct Credentials Gateway**: Dedicated internal administrative login with encrypted password authentication (*zero third-party OAuth or tracking dependencies*).
- **Role-Based Access Control (RBAC)**:
  - 👑 **Super Admin**: Full root system scraper access, agent orchestration, database export, user management, and proposal approval.
  - ⚡ **Lead Ops Manager**: Web scraper cluster execution, country filter management, lead enrichment, and outreach queue.
  - 💼 **Commercial Executive**: Commercial proposal vault, direct client negotiation, won deals tracking, and executive analytics.
- **Telemetry & Infrastructure Monitor**: Live cluster health, 249 ISO regions status, and session management.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite |
| **Styling & UI** | Tailwind CSS v4, Motion, Lucide Icons, Canvas Confetti |
| **Backend & API** | Node.js, Express, tsx, esbuild |
| **AI Reasoning Core** | `@google/genai` TypeScript SDK (Gemini 3.7 Flash with `ThinkingLevel.HIGH`) |
| **Global Dataset** | ISO 3166-1 (249 countries, flags, ISO-2 codes, international dialing codes) |
| **Persistence** | Resilient API proxy layer + Local browser state fallback cache |

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
| `POST` | `/api/scrape-demands` | Scrapes or generates verified procurement leads for a target business type and country filter. |
| `POST` | `/api/generate-proposal` | Uses Gemini 3.7 Flash with deep thinking to generate a complete 3-tier commercial proposal SOW. |
| `POST` | `/api/customer-chat` | Simulates real-time interactive qualification chat with the buyer's procurement officer. |
| `POST` | `/api/a2a-negotiation` | Executes a 5-step machine-to-machine A2A autonomous negotiation protocol. |
| `POST` | `/api/generate-message-draft` | Generates tailored outreach drafts for Email or WhatsApp. |

---

## 📁 Repository Structure

```
├── src/
│   ├── components/
│   │   ├── AdminPage.tsx             # Dedicated internal admin portal & login
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
│   │   └── apiService.ts             # Resilient API client with fallback execution
│   ├── types.ts                      # Core TypeScript domain models
│   ├── App.tsx                       # Master application container
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
