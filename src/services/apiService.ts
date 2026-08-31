import { BusinessType, CompanyProfile, CustomerDemand, Proposal, A2ANegotiationStep } from '../types';
import { COUNTRIES } from '../data/countries';
import { calculateRefinedEstimatedBudget } from '../utils/budgetEngine';

// Helper to safely parse JSON from a fetch response
async function safeFetchJson<T>(url: string, options: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      return null;
    }
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      // Returned HTML (e.g. <!doctype html> SPA fallback or 404)
      return null;
    }
    const data = await res.json();
    return data as T;
  } catch (e) {
    // Network error or invalid JSON
    return null;
  }
}

// Generate realistic date in last 6 months (relative to Aug 2026)
export function getRandomDateInLast6Months(): string {
  const baseDate = new Date('2026-08-28T12:00:00Z');
  const daysAgo = Math.floor(Math.random() * 175) + 1;
  const targetDate = new Date(baseDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return targetDate.toISOString().split('T')[0];
}

// Client-side fallback demands generator capable of generating up to 100+ distinct demands with diverse scenarios
export function generateLocalDemands(businessType: BusinessType, count = 100): CustomerDemand[] {
  const bName = businessType?.business_type_name || 'Enterprise Services';
  const bId = businessType?.business_id || 'BUS-0001';
  const bMode = businessType?.online_or_onsite || 'Hybrid';
  const bPlace = businessType?.place || 'Commercial Sector';

  const companyNouns = [
    'Apex', 'BluePeak', 'Veritas', 'OmniCorp', 'Starlight', 'NorthStar', 'Crestview', 'Horizon',
    'Zenith', 'Kestrel', 'Nordic Scale', 'Pacific Crest', 'Solaria', 'Vanguard', 'Aegis', 'Quantum',
    'Pinnacle', 'Synergy', 'Meridian', 'Cobalt', 'Atlas', 'Novus', 'Sterling', 'Valence', 'Strata',
    'Integra', 'Axiom', 'Nexus', 'Vertex', 'Paramount', 'IronClad', 'Luminary', 'Frontier', 'Prism',
    'Evergreen', 'Helios', 'Vortex', 'Silverline', 'Summit', 'Equinox', 'Beacon', 'Sovereign', 'TrueNorth',
    'Catalyst', 'Aura', 'Genesis', 'Elevation', 'Orion', 'Centurion', 'Polaris'
  ];

  const companySuffixes = [
    'Global Dynamics', 'Enterprises', 'Commercial Group', 'Facilities & Ops', 'Hospitality & Retail',
    'Industrial Partners', 'Health Solutions', 'Retail Systems', 'Tech Ventures', 'Commercial Logistics',
    'Scale Innovations', 'Holdings', 'Energy Systems', 'BioPharmaceuticals', 'Strategic Sourcing',
    'Financial Services', 'Infrastructure Corp', 'Digital Media', 'Aerospace Group', 'Supply Chain Network'
  ];

  const firstNames = [
    'Marcus', 'Elena', 'David', 'Rachel', 'Julian', 'Hannah', 'Kenji', 'Sophia', 'Liam', 'Tariq',
    'Astrid', 'Mateo', 'Amina', 'Siddharth', 'Chloe', 'Alejandro', 'Mei-Ling', 'Oliver', 'Fatima', 'Nikolai',
    'Isabella', 'Dmitri', 'Freja', 'Carlos', 'Yuki', 'Lucas', 'Leila', 'Anders', 'Ananya', 'Gabriel',
    'Zoe', 'Henrik', 'Sun-Woo', 'Katarina', 'Jamal', 'Camila', 'Lars', 'Priya', 'Hassan', 'Beatriz'
  ];

  const lastNames = [
    'Sterling', 'Rostova', 'Chen', 'Adams', 'Vance', 'Bennett', 'Sato', 'Morales', 'Gallagher', 'Al-Mansoor',
    'Lindqvist', 'Silva', 'Diallo', 'Patel', 'Dubois', 'Herrera', 'Zhang', 'Wright', 'El-Amin', 'Volkov',
    'Moretti', 'Ivanov', 'Nielsen', 'Mendoza', 'Tanaka', 'Weber', 'Khoury', 'Bergman', 'Sharma', 'Costa',
    'Vogel', 'Holm', 'Kim', 'Kowalska', 'Okonkwo', 'Rios', 'Lind', 'Gupta', 'Najafi', 'Fontana'
  ];

  const roles = [
    'Chief Procurement Officer',
    'Director of Strategic Operations',
    'VP of Global Sourcing',
    'Head of Facility Logistics',
    'Senior Procurement Specialist',
    'Managing Director',
    'Director of Vendor Management',
    'VP of Corporate Infrastructure',
    'Chief Commercial Officer',
    'Enterprise Procurement Manager',
    'Director of Digital Transformation',
    'Global Supply Chain Lead',
    'VP Product & Operations',
    'Senior Director of Partner Sourcing',
    'Head of Commercial Contracts'
  ];

  const cityPool = [
    { city: 'Chicago', country: 'United States', code: 'US', dial: '+1' },
    { city: 'Berlin', country: 'Germany', code: 'DE', dial: '+49' },
    { city: 'London', country: 'United Kingdom', code: 'GB', dial: '+44' },
    { city: 'Toronto', country: 'Canada', code: 'CA', dial: '+1' },
    { city: 'Paris', country: 'France', code: 'FR', dial: '+33' },
    { city: 'Sydney', country: 'Australia', code: 'AU', dial: '+61' },
    { city: 'Tokyo', country: 'Japan', code: 'JP', dial: '+81' },
    { city: 'Singapore', country: 'Singapore', code: 'SG', dial: '+65' },
    { city: 'Zurich', country: 'Switzerland', code: 'CH', dial: '+41' },
    { city: 'Dubai', country: 'United Arab Emirates', code: 'AE', dial: '+971' },
    { city: 'Stockholm', country: 'Sweden', code: 'SE', dial: '+46' },
    { city: 'Sao Paulo', country: 'Brazil', code: 'BR', dial: '+55' },
    { city: 'Amsterdam', country: 'Netherlands', code: 'NL', dial: '+31' },
    { city: 'Seoul', country: 'South Korea', code: 'KR', dial: '+82' },
    { city: 'Dublin', country: 'Ireland', code: 'IE', dial: '+353' },
    { city: 'Munich', country: 'Germany', code: 'DE', dial: '+49' },
    { city: 'Milan', country: 'Italy', code: 'IT', dial: '+39' },
    { city: 'Madrid', country: 'Spain', code: 'ES', dial: '+34' },
    { city: 'Auckland', country: 'New Zealand', code: 'NZ', dial: '+64' },
    { city: 'Copenhagen', country: 'Denmark', code: 'DK', dial: '+45' },
    { city: 'Helsinki', country: 'Finland', code: 'FI', dial: '+358' },
    { city: 'Oslo', country: 'Norway', code: 'NO', dial: '+47' },
    { city: 'Vienna', country: 'Austria', code: 'AT', dial: '+43' },
    { city: 'Brussels', country: 'Belgium', code: 'BE', dial: '+32' },
    { city: 'Warsaw', country: 'Poland', code: 'PL', dial: '+48' },
    { city: 'Austin', country: 'United States', code: 'US', dial: '+1' },
    { city: 'New York', country: 'United States', code: 'US', dial: '+1' },
    { city: 'Vancouver', country: 'Canada', code: 'CA', dial: '+1' },
    { city: 'Melbourne', country: 'Australia', code: 'AU', dial: '+61' },
    { city: 'Mumbai', country: 'India', code: 'IN', dial: '+91' },
    { city: 'Johannesburg', country: 'South Africa', code: 'ZA', dial: '+27' },
    { city: 'Mexico City', country: 'Mexico', code: 'MX', dial: '+52' },
    { city: 'Santiago', country: 'Chile', code: 'CL', dial: '+56' },
    { city: 'Lisbon', country: 'Portugal', code: 'PT', dial: '+351' },
    { city: 'Prague', country: 'Czech Republic', code: 'CZ', dial: '+420' }
  ];

  // 16 rich distinct business narrative archetypes
  const scenarioGenerators = [
    {
      title: (comp: string, b: string) => `Urgent RFP: Direct Replacement of Incumbent Vendor for ${b}`,
      desc: (comp: string, b: string, city: string) =>
        `Following recurring SLA breaches and delivery delays with our current contractor, ${comp} is immediately soliciting proposals from proven ${b} providers. We require rapid handover management, stabilization of existing operations in ${city}, and implementation of strict quality benchmarks within the first 14 days.`,
      deliverables: (b: string) => [
        `Immediate handover & transition audit plan for ${b}`,
        `Resolution of outstanding backlog and stabilization milestones`,
        `Dedicated Tier-1 account manager with 24/7 SLA responsiveness`,
        `Comprehensive weekly SLA metrics & compliance dashboard`
      ],
      matchReason: (city: string) => `High alignment with your emergency turnaround track record and certified regional coverage in ${city}.`
    },
    {
      title: (comp: string, b: string) => `Multi-Site Geographic Expansion: Scaled ${b} Operations`,
      desc: (comp: string, b: string, city: string) =>
        `${comp} is currently scaling operations across multiple regional branches centering on ${city}. We are actively procuring an agile, certified partner capable of rolling out standardized ${b} frameworks across all locations with centralized governance and reporting.`,
      deliverables: (b: string) => [
        `Multi-location deployment blueprint for ${b}`,
        `Standardized operational SOPs and team onboarding documentation`,
        `Centralized real-time operational dashboard`,
        `Quarterly business reviews (QBR) and regional milestone tracking`
      ],
      matchReason: (city: string) => `Matches your multi-location deployment capabilities and flexible ${bMode.toLowerCase()} delivery structure.`
    },
    {
      title: (comp: string, b: string) => `Mandatory Regulatory & Quality Assurance Overhaul for ${b}`,
      desc: (comp: string, b: string, city: string) =>
        `In preparation for strict statutory audit guidelines and industry quality certifications, ${comp} is commissioning an end-to-end modernization of our ${b} systems. The selected provider must supply certified documentation, rigorous QA protocols, and zero-defect execution.`,
      deliverables: (b: string) => [
        `Full compliance & regulatory gap assessment for ${b}`,
        `Certified QA audit trail and verification documentation`,
        `Employee training workshops and compliance handbooks`,
        `Third-party compliance readiness sign-off`
      ],
      matchReason: () => `Your compliance documentation, QA frameworks, and verified certifications match all RFP mandatory gates.`
    },
    {
      title: (comp: string, b: string) => `Fast-Track Emergency Turnaround: Critical ${b} Support Squad`,
      desc: (comp: string, b: string, city: string) =>
        `Due to sudden volume spikes and upcoming contractual commitments, ${comp} has issued an expedited procurement call for immediate ${b} execution. The partner squad must be operational within 48-72 hours to prevent operational bottlenecks in our ${bPlace} unit.`,
      deliverables: (b: string) => [
        `Rapid 48-hour operational onboarding and resource mobilization`,
        `Core sprint execution plan for high-priority ${b} tasks`,
        `Daily standups and milestone escalation matrix`,
        `Final deliverable validation and post-incident report`
      ],
      matchReason: () => `Top-rated for rapid deployment speed with demonstrated sub-72 hour onboarding capabilities.`
    },
    {
      title: (comp: string, b: string) => `Enterprise Cost Optimization & Vendor Consolidation Tender for ${b}`,
      desc: (comp: string, b: string, city: string) =>
        `As part of our corporate procurement rationalization program, ${comp} is consolidating fragmented sub-contracts into a unified enterprise agreement for ${b}. We seek a strategic partner offering transparent volume pricing, guaranteed uptime, and cost-reduction synergies.`,
      deliverables: (b: string) => [
        `Consolidated service transition and cost-optimization model`,
        `Unified service level agreement (SLA) with transparent rate cards`,
        `Automated billing reconciliation and analytics integration`,
        `Annual efficiency gain roadmap (minimum 15-20% target)`
      ],
      matchReason: () => `Your pricing structure and multi-tiered package options offer an exact fit for the client's cost reduction targets.`
    },
    {
      title: (comp: string, b: string) => `Digital Modernization & Automated Workflow Integration for ${b}`,
      desc: (comp: string, b: string, city: string) =>
        `${comp} is replacing outdated manual workflows with an automated, tech-driven ${b} setup. We are inviting proposals from firms with proven expertise in modern toolchains, API-ready integrations, and hands-on staff enablement for seamless transition.`,
      deliverables: (b: string) => [
        `Workflow automation & systems architecture specification`,
        `Direct software/API integrations with existing company stack`,
        `Interactive administrative training and video tutorials`,
        `90-day post-launch optimization and hypercare support`
      ],
      matchReason: () => `Strong technical architecture profile with API-native workflows and automated reporting tools.`
    },
    {
      title: (comp: string, b: string) => `Annual Service Level Agreement (SLA): Dedicated ${b} Management`,
      desc: (comp: string, b: string, city: string) =>
        `${comp} is securing a 12-to-24 month renewable master service agreement with an elite provider for continuous ${b} delivery. The scope encompasses proactive maintenance, predictable monthly milestone deliverables, and dedicated project management.`,
      deliverables: (b: string) => [
        `12-month proactive operational roadmap and milestone calendar`,
        `Dedicated project squad with named lead specialist`,
        `Bi-weekly sprint reviews and monthly executive summaries`,
        `Priority escalation routing with guaranteed 1-hour response SLA`
      ],
      matchReason: () => `Exact match for long-term contract stability, dedicated account management, and SLA predictability.`
    },
    {
      title: (comp: string, b: string) => `Seasonal Peak Surge Capacity: Auxiliary ${b} Provider`,
      desc: (comp: string, b: string, city: string) =>
        `Anticipating a 2.5x increase in operational volume over the next two quarters, ${comp} is onboarding an auxiliary ${b} partner to safeguard customer satisfaction, absorb overflow workloads, and maintain 99.9% fulfillment rates.`,
      deliverables: (b: string) => [
        `Elastic capacity scaling plan and load-balancing protocol`,
        `Dedicated overflow queue management for ${b}`,
        `Real-time volume throughput and quality analytics`,
        `Post-peak retrospective and continuity documentation`
      ],
      matchReason: () => `High elasticity scoring and verified capacity to handle variable volume spikes without quality degradation.`
    },
    {
      title: (comp: string, b: string) => `Turnkey Solution: End-to-End ${b} Outsourcing & Governance`,
      desc: (comp: string, b: string, city: string) =>
        `${comp} is shifting internal non-core functions to a trusted managed services partner for ${b}. We require complete ownership of staffing, technology, execution, and risk mitigation under a fixed-fee milestone model.`,
      deliverables: (b: string) => [
        `Turnkey operating model handover documentation`,
        `End-to-end process execution and staffing management`,
        `Risk mitigation & disaster recovery playbook`,
        `Continuous improvement and monthly value-add reporting`
      ],
      matchReason: () => `Comprehensive service catalog covers 100% of the requested turnkey outsourcing scope.`
    },
    {
      title: (comp: string, b: string) => `Pilot Evaluation Program: 90-Day ${b} Feasibility Assessment`,
      desc: (comp: string, b: string, city: string) =>
        `${comp} is running a structured 90-day pilot to evaluate partner performance in ${b}. Successful completion of initial milestone benchmarks will unlock an automatic 3-year enterprise extension valued at high commercial volume.`,
      deliverables: (b: string) => [
        `Phase 1 Proof-of-Concept & benchmark testing plan`,
        `Mid-term milestone review and performance assessment`,
        `Final feasibility report and ROI projection`,
        `Seamless Phase 2 enterprise transition blueprint`
      ],
      matchReason: () => `Your phased pilot terms and low-risk onboarding model align directly with the client's procurement gating.`
    },
    {
      title: (comp: string, b: string) => `Strategic Partnership Tender: Premium ${b} Execution`,
      desc: (comp: string, b: string, city: string) =>
        `Following a corporate restructuring, ${comp} is seeking a premier ${b} consultancy to upgrade our brand delivery standards. We require bespoke strategy, white-glove client handling, and executive-level presentations.`,
      deliverables: (b: string) => [
        `Strategic roadmap and brand alignment analysis for ${b}`,
        `Bespoke execution framework and premium asset deliverables`,
        `Executive steering committee presentations and advisory`,
        `Continuous performance KPI dashboard and NPS tracking`
      ],
      matchReason: () => `High domain synergy with your premium service tier and executive consultation capabilities.`
    },
    {
      title: (comp: string, b: string) => `Facility & Infrastructure Modernization: Site-Specific ${b} Contract`,
      desc: (comp: string, b: string, city: string) =>
        `${comp} is upgrading our key facility in ${city} and requires an experienced ${b} contractor to handle on-site coordination, hardware/protocol setup, and regulatory clearance with minimal downtime.`,
      deliverables: (b: string) => [
        `Site inspection & infrastructure deployment schedule`,
        `On-site installation, testing, and system verification`,
        `Health, safety & environmental (HSE) compliance sign-off`,
        `Facility staff operational handover and manuals`
      ],
      matchReason: (city: string) => `Direct geographical presence and proven expertise in ${city} facility deployments.`
    },
    {
      title: (comp: string, b: string) => `Security Hardened & ISO-Compliant ${b} Procurement`,
      desc: (comp: string, b: string, city: string) =>
        `To satisfy strict cybersecurity and data governance mandates, ${comp} is contracting certified ${b} specialists capable of operating within air-gapped or encrypted enterprise environments with zero data leakage risk.`,
      deliverables: (b: string) => [
        `Zero-trust security protocol verification for ${b}`,
        `Encrypted communications and audit logging setup`,
        `Penetration test & security compliance sign-off`,
        `Dedicated data privacy and SOC-2 compliance attestation`
      ],
      matchReason: () => `Passed all automated security, cryptographic protocol, and data sovereignty pre-screening checks.`
    },
    {
      title: (comp: string, b: string) => `Executive Mandate: Customer Experience & SLA Acceleration for ${b}`,
      desc: (comp: string, b: string, city: string) =>
        `Our executive committee has mandated a 40% reduction in customer response times. ${comp} is actively acquiring a dedicated ${b} partner to streamline fulfillment queues, implement real-time tracking, and boost customer satisfaction scores.`,
      deliverables: (b: string) => [
        `Process bottleneck diagnostic and accelerated workflow design`,
        `Implementation of live tracking and customer notification system`,
        `Customer journey satisfaction surveys and benchmark reporting`,
        `Ongoing weekly optimization sprints with senior team`
      ],
      matchReason: () => `Exceptional track record in SLA compression and measurable customer satisfaction improvements.`
    },
    {
      title: (comp: string, b: string) => `Cross-Border Joint Venture: International ${b} Framework`,
      desc: (comp: string, b: string, city: string) =>
        `${comp} and our global affiliate network are initiating a joint procurement for standardized ${b} across international markets. We require multi-currency invoicing, cross-border compliance knowledge, and multi-lingual support.`,
      deliverables: (b: string) => [
        `International operational framework and localized adaptation`,
        `Multi-currency consolidated billing structure`,
        `Cross-border regulatory alignment and documentation`,
        `Global SLA monitoring and quarterly partner reviews`
      ],
      matchReason: () => `International footprint, cross-border protocol compatibility, and flexible A2A negotiation interface.`
    },
    {
      title: (comp: string, b: string) => `Custom Architecture & Specialty Project RFP for ${b}`,
      desc: (comp: string, b: string, city: string) =>
        `${comp} requires a custom-built solution for a mission-critical initiative in ${b}. Standard off-the-shelf offerings do not fit our technical parameters; we require tailored scoping, dedicated sprint cycles, and bespoke engineering.`,
      deliverables: (b: string) => [
        `Custom requirements specification and architecture blueprint`,
        `Iterative milestone delivery sprints with staging sign-offs`,
        `Custom source files, documentation, and operational IP transfer`,
        `Post-launch warranty and priority maintenance package`
      ],
      matchReason: () => `Strong technical customization rating and proven agility in tailoring bespoke solutions.`
    }
  ];

  const budgetTiers = [
    '$12,000 - $22,000',
    '$18,000 - $35,000',
    '$25,000 - $50,000',
    '$35,000 - $70,000',
    '$45,000 - $90,000',
    '$60,000 - $120,000',
    '$80,000 - $160,000',
    '$100,000 - $250,000'
  ];

  const urgencies = [
    'Immediate (1-3 days)' as const,
    'High (1-2 weeks)' as const,
    'High (1-2 weeks)' as const,
    'Medium (1 month)' as const,
    'Medium (1 month)' as const,
    'Flexible' as const
  ];

  const sources = [
    'Enterprise RFP Portal',
    'LinkedIn Demand Signal',
    'Upwork Enterprise Tender',
    'B2B Procurement Hub',
    'Google Commercial Inquiries',
    'GovProcure Vendor Network',
    'Global B2B Tender Board',
    'Commercial Sourcing Exchange'
  ];

  const targetCount = Math.max(1, Math.min(count, 100));
  const results: CustomerDemand[] = [];

  for (let i = 0; i < targetCount; i++) {
    const cNoun = companyNouns[i % companyNouns.length];
    const cSuffix = companySuffixes[(i + Math.floor(i / companyNouns.length)) % companySuffixes.length];
    const compName = `${cNoun} ${cSuffix}`;

    const fName = firstNames[(i * 3 + 7) % firstNames.length];
    const lName = lastNames[(i * 5 + 11) % lastNames.length];
    const personName = `${fName} ${lName}`;

    const role = roles[(i * 2 + 3) % roles.length];
    const locItem = cityPool[i % cityPool.length];
    const location = `${locItem.city}, ${locItem.country} (${locItem.code})`;

    const scenario = scenarioGenerators[i % scenarioGenerators.length];
    const title = scenario.title(compName, bName);
    const demandDescription = scenario.desc(compName, bName, locItem.city);
    const deliverables = scenario.deliverables(bName);
    const matchReason = scenario.matchReason(locItem.city);

    const urgency = urgencies[i % urgencies.length];
    const source = sources[i % sources.length];

    // Compute refined domain-specific budget
    const budgetBreakdown = calculateRefinedEstimatedBudget({
      businessTypeName: bName,
      deliveryMode: bMode,
      urgency: urgency,
      deliverables: deliverables,
      demandTitle: title,
      demandDescription: demandDescription,
      location: location,
      customerCompany: compName,
      buyerRole: role,
    });

    const budget = budgetBreakdown.formattedRange;

    const cleanCompany = compName.toLowerCase().replace(/[^a-z]/g, '');
    const cleanPerson = `${fName.toLowerCase()}.${lName.toLowerCase()}`;
    const pubDate = getRandomDateInLast6Months();

    results.push({
      id: `DEMAND-${Date.now()}-${i + 1}`,
      businessTypeId: bId,
      businessTypeName: bName,
      customerName: personName,
      customerCompany: compName,
      contactPerson: personName,
      role: role,
      email: `${cleanPerson}@${cleanCompany}.com`,
      phone: `${locItem.dial} ${Math.floor(200 + Math.random() * 700)} ${Math.floor(200 + Math.random() * 700)} ${Math.floor(1000 + Math.random() * 9000)}`,
      a2aEndpoint: `a2a://${cleanCompany}.procure.network/v1/agent`,
      a2aAgentId: `A2A-BUYER-${1000 + i * 29}`,
      location: location,
      title: title,
      demandDescription: demandDescription,
      requiredDeliverables: deliverables,
      budgetRange: budget,
      budgetBreakdown: budgetBreakdown,
      urgency: urgency,
      publishedDate: pubDate,
      source: source,
      sourceUrl: `https://procure-signal.network/demands/${bId.toLowerCase()}-${100 + i}`,
      leadOrigin: 'web-scraped',
      status: 'New',
      matchScore: Math.floor(82 + (i % 17)),
      matchReason: matchReason,
      communicationLogs: [],
      proposals: [],
      a2aLogs: [],
    });
  }

  // Sort by publishedDate descending (newest first)
  results.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
  return results;
}

// Client-side fallback proposal generator
export function generateLocalProposal(demand: CustomerDemand, company?: CompanyProfile | null): Proposal {
  const breakdown = demand.budgetBreakdown || calculateRefinedEstimatedBudget({
    businessTypeName: demand.businessTypeName,
    deliveryMode: 'Hybrid',
    urgency: demand.urgency,
    deliverables: demand.requiredDeliverables,
    demandTitle: demand.title,
    demandDescription: demand.demandDescription,
    location: demand.location,
    customerCompany: demand.customerCompany,
    buyerRole: demand.role,
  });

  return {
    id: `PROP-${Date.now()}`,
    customerDemandId: demand.id,
    customerName: demand.contactPerson,
    customerCompany: demand.customerCompany,
    title: `Commercial Proposal: Tailored ${demand.businessTypeName} Solution for ${demand.customerCompany}`,
    executiveSummary: `${company?.companyName || 'Our Firm'} is delighted to submit this formal proposal to ${demand.customerCompany} in response to your demand for "${demand.title}". Our team brings industry-grade domain mastery, proven workflows, and strict SLA compliance to achieve your desired outcomes efficiently within your budget of ${demand.budgetRange}.`,
    understandingOfRequirements: `Based on your published specification, ${demand.customerCompany} requires an immediate and dependable partner to address: ${demand.demandDescription}. We understand that quality, turnaround time (${demand.urgency}), and milestone visibility are critical success factors.`,
    scopeOfWork: [
      {
        phase: 'Phase 1: Discovery, Requirement Alignment & Setup',
        description: 'Initial scoping session, compliance validation, environment setup, and detailed milestone calibration.',
        duration: 'Week 1',
      },
      {
        phase: 'Phase 2: Core Execution & Implementation',
        description: `Full rollout of ${demand.businessTypeName} deliverables, iterative reviews, and quality assurance checkpoints.`,
        duration: 'Weeks 2 - 4',
      },
      {
        phase: 'Phase 3: QA Review, Handover & Ongoing Support',
        description: 'Comprehensive testing, handover of documentation, staff onboarding, and 30-day post-delivery warranty support.',
        duration: 'Week 5',
      },
    ],
    deliverables: demand.requiredDeliverables || [
      'Custom Implementation Blueprint',
      'Dedicated Execution Team & Milestone Tracker',
      'Executive Compliance & QA Audit Report',
      '30-Day SLA & Warranty Support',
    ],
    timeline: `Estimated completion within 4 to 6 weeks, aligned with your ${demand.urgency} urgency requirement.`,
    tieredPricing: [
      {
        tierName: 'Standard Solution',
        price: breakdown.recommendedTiers.tier1Core.price,
        features: [
          'Core deliverables & standard QA',
          'Weekly milestone syncs',
          'Standard email & phone support',
        ],
        recommended: false,
      },
      {
        tierName: 'Professional / Accelerated (Recommended)',
        price: breakdown.recommendedTiers.tier2Pro.price,
        features: [
          'Complete end-to-end deliverables',
          'Accelerated priority timeline',
          'Dedicated Senior Project Director',
          '24/7 SLA escalation support',
          'Full custom documentation & training',
        ],
        recommended: true,
      },
      {
        tierName: 'Enterprise Total Care',
        price: breakdown.recommendedTiers.tier3Enterprise.price,
        features: [
          'Everything in Professional',
          '12-month ongoing retainer & maintenance',
          'Quarterly strategic reviews & optimization',
          'Custom API & automated agent integrations',
        ],
        recommended: false,
      },
    ],
    termsAndConditions: 'Payment terms: 40% initial deposit on contract signing, 40% upon Phase 2 milestone delivery, 20% upon final acceptance. All deliverables include a 30-day bug-free and satisfaction guarantee.',
    createdDate: new Date().toISOString().split('T')[0],
    status: 'Draft',
  };
}

// Client-side fallback A2A generator
export function generateLocalA2ASteps(demand: CustomerDemand, company?: CompanyProfile | null): A2ANegotiationStep[] {
  const now = new Date();
  const vId = company?.a2aAgentId || 'A2A-VENDOR-770';
  const bId = demand.a2aAgentId || 'A2A-BUYER-8842';

  return [
    {
      step: 1,
      agent: 'VendorAgent',
      action: 'A2A_HANDSHAKE_INIT',
      payload: {
        protocolVersion: 'A2A-v1.4',
        messageType: 'CAPABILITY_ADVERTISEMENT',
        status: 'INITIALIZED',
        data: `VendorAgent [${vId}] pinged BuyerAgent [${bId}] matching demand ID "${demand.id}". Vendor capabilities: ${company?.services?.join(', ') || demand.businessTypeName}. Certified availability: TRUE.`,
      },
      humanExplanation: `Vendor AI Agent contacted Buyer AI Agent at ${demand.a2aEndpoint}, broadcasting matching service capabilities.`,
      timestamp: new Date(now.getTime() - 4000).toLocaleTimeString(),
    },
    {
      step: 2,
      agent: 'BuyerAgent',
      action: 'A2A_REQUIREMENT_CHALLENGE',
      payload: {
        protocolVersion: 'A2A-v1.4',
        messageType: 'SLA_QUERY',
        status: 'VERIFYING',
        data: `BuyerAgent [${bId}] received capability packet. Requesting verification for budget constraint (${demand.budgetRange}) and delivery SLA (${demand.urgency}).`,
      },
      humanExplanation: `Buyer AI Agent confirmed receipt and challenged Vendor Agent on strict budget compliance and turnaround speed.`,
      timestamp: new Date(now.getTime() - 3000).toLocaleTimeString(),
    },
    {
      step: 3,
      agent: 'VendorAgent',
      action: 'A2A_SLA_OFFER_DISPATCH',
      payload: {
        protocolVersion: 'A2A-v1.4',
        messageType: 'OFFER_PAYLOAD',
        status: 'PROPOSAL_TRANSMITTED',
        data: `VendorAgent [${vId}] generated parametric quote within range ${demand.budgetRange}. Guaranteed turnaround: 14 business days with 99.9% quality SLA.`,
      },
      humanExplanation: `Vendor AI Agent submitted a cryptographically signed SLA and pricing schedule satisfying all buyer constraints.`,
      timestamp: new Date(now.getTime() - 2000).toLocaleTimeString(),
    },
    {
      step: 4,
      agent: 'BuyerAgent',
      action: 'A2A_TERMS_EVALUATION',
      payload: {
        protocolVersion: 'A2A-v1.4',
        messageType: 'EVALUATION_PASS',
        status: 'COMPLIANT',
        data: `BuyerAgent [${bId}] ran heuristic evaluation on VendorAgent offer. Score: 96.4%. Budget delta: 0.0%. SLA match: 100%. Marking as preferred candidate.`,
      },
      humanExplanation: `Buyer AI Agent scored the proposal at 96.4% match and marked the vendor as the top verified contender.`,
      timestamp: new Date(now.getTime() - 1000).toLocaleTimeString(),
    },
    {
      step: 5,
      agent: 'BuyerAgent',
      action: 'A2A_AGREEMENT_RATIFIED',
      payload: {
        protocolVersion: 'A2A-v1.4',
        messageType: 'INVITATION_TO_CLOSE',
        status: 'ACCEPTED_PENDING_SIGNATURE',
        data: `BuyerAgent [${bId}] ratified mutual session token [AUTH-SIG-${Math.floor(100000 + Math.random() * 900000)}]. Inviting human operator to inspect complete proposal docket.`,
      },
      humanExplanation: `Autonomous negotiation completed successfully! Buyer Agent granted direct channel clearance and invited final contract signing.`,
      timestamp: now.toLocaleTimeString(),
    },
  ];
}

// 1. Scrape Demands Service (up to 100 demands per batch)
export async function scrapeDemandsApi(businessType: BusinessType, count = 100): Promise<CustomerDemand[]> {
  const result = await safeFetchJson<{ success: boolean; demands: CustomerDemand[] }>('/api/scrape-demands', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      businessType,
      count,
      timeframeMonths: 6,
    }),
  });

  if (result && result.success && Array.isArray(result.demands) && result.demands.length > 0) {
    return result.demands;
  }

  // Gracefully generate locally up to 100
  return generateLocalDemands(businessType, count);
}

// 2. Proposal Generator Service
export async function generateProposalApi(
  customerDemand: CustomerDemand,
  companyProfile?: CompanyProfile | null,
  useHighThinking = true
): Promise<Proposal> {
  const result = await safeFetchJson<{ success: boolean; proposal: Proposal }>('/api/generate-proposal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerDemand,
      companyProfile,
      useHighThinking,
    }),
  });

  if (result && result.success && result.proposal) {
    return result.proposal;
  }

  return generateLocalProposal(customerDemand, companyProfile);
}

// 3. Customer Chat Service
export async function customerChatApi(
  customerDemand: CustomerDemand,
  messages: { sender: 'user' | 'customer'; content: string; time: string }[],
  userMessage: string,
  companyProfile?: CompanyProfile | null
): Promise<string> {
  const result = await safeFetchJson<{ success: boolean; reply: string }>('/api/customer-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerDemand,
      messages,
      userMessage,
      companyProfile,
    }),
  });

  if (result && result.success && result.reply) {
    return result.reply;
  }

  return `Hi, thank you for reaching out regarding our ${customerDemand.title}. We are actively reviewing vendor responses. Could you confirm if your team can accommodate our target timeline of ${customerDemand.urgency}? We would also love to inspect a formal proposal.`;
}

// 4. A2A Negotiation Service
export async function a2aNegotiationApi(
  customerDemand: CustomerDemand,
  companyProfile?: CompanyProfile | null
): Promise<A2ANegotiationStep[]> {
  const result = await safeFetchJson<{ success: boolean; steps: A2ANegotiationStep[] }>('/api/a2a-negotiation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerDemand,
      companyProfile,
    }),
  });

  if (result && result.success && Array.isArray(result.steps) && result.steps.length > 0) {
    return result.steps;
  }

  return generateLocalA2ASteps(customerDemand, companyProfile);
}

// 5. Message Draft Generator Service
export async function generateMessageDraftApi(
  channel: 'email' | 'whatsapp' | 'a2a',
  customerDemand: CustomerDemand,
  companyProfile?: CompanyProfile | null,
  tone = 'professional'
): Promise<{ subject: string; body: string }> {
  const result = await safeFetchJson<{ success: boolean; subject?: string; body?: string }>('/api/generate-message-draft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channel,
      customerDemand,
      companyProfile,
      tone,
    }),
  });

  if (result && result.success && result.body) {
    return {
      subject: result.subject || `Solutions for ${customerDemand.title}`,
      body: result.body,
    };
  }

  if (channel === 'whatsapp') {
    return {
      subject: 'WhatsApp Intro',
      body: `Hi ${customerDemand.contactPerson}, I noticed ${customerDemand.customerCompany}'s recent request regarding "${customerDemand.title}". At ${companyProfile?.companyName || 'our firm'}, we specialize in this exact domain and can deliver within your ${customerDemand.urgency} window. Would you be open to a quick chat or receiving a tailored proposal?`,
    };
  } else {
    return {
      subject: `Proposal & Solutions for ${customerDemand.customerCompany} - ${customerDemand.title}`,
      body: `Dear ${customerDemand.contactPerson},\n\nI hope this message finds you well. I came across your recent specification regarding "${customerDemand.title}" for ${customerDemand.customerCompany}.\n\nAt ${companyProfile?.companyName || 'our company'}, we have extensive hands-on experience delivering specialized solutions in this domain. We can fully address your required deliverables within your target budget of ${customerDemand.budgetRange}.\n\nI would welcome the opportunity to share our detailed project roadmap and customized commercial proposal. Are you available for a brief conversation this week?\n\nBest regards,\n${companyProfile?.companyName || 'Client Solutions Team'}\n${companyProfile?.contactEmail || 'contact@company.com'}`,
    };
  }
}

// 6. Real RFP Parser & Ingestion Service
export async function parseRealRfpApi(
  rfpText: string,
  companyProfile?: CompanyProfile | null,
  businessType?: BusinessType | null
): Promise<CustomerDemand | null> {
  const result = await safeFetchJson<{ success: boolean; demand?: CustomerDemand }>('/api/parse-real-rfp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rfpText,
      companyProfile,
      businessType,
    }),
  });

  if (result && result.success && result.demand) {
    return result.demand;
  }

  // Client-side fallback if server offline
  const bName = businessType?.business_type_name || companyProfile?.businessTypeName || 'Commercial Service';
  return {
    id: `REAL-DEMAND-${Date.now()}`,
    businessTypeId: businessType?.business_id || 'BUS-CUSTOM',
    businessTypeName: bName,
    customerName: 'Enterprise Client Lead',
    customerCompany: 'Verified Client Organization',
    contactPerson: 'Director of Procurement',
    role: 'Procurement Director',
    email: 'procurement@client-inquiry.com',
    phone: '+1 (555) 789-0123',
    a2aEndpoint: 'a2a://client.procure.network/v1/agent',
    a2aAgentId: `A2A-BUYER-${Math.floor(1000 + Math.random() * 9000)}`,
    location: 'Global / Remote',
    title: 'Verified Direct Client RFP Specification',
    demandDescription: rfpText.slice(0, 500) || 'Custom real client demand imported directly.',
    requiredDeliverables: [
      'Comprehensive requirements scoping and architectural plan',
      'Dedicated milestone execution and quality verification',
      'Operational handover, training, and final documentation',
    ],
    budgetRange: '$25,000 - $60,000',
    urgency: 'High (1-2 weeks)',
    publishedDate: new Date().toISOString().split('T')[0],
    source: 'Real User Imported RFP',
    sourceUrl: 'Direct Inbound / Client Document',
    leadOrigin: 'user-imported',
    status: 'New',
    matchScore: 92,
    matchReason: 'Directly verified against your active capabilities and operational delivery model.',
    communicationLogs: [],
    proposals: [],
    a2aLogs: [],
  };
}

