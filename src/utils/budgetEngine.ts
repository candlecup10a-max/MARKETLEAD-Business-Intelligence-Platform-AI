import { BusinessType, CustomerDemand, BusinessMode, UrgencyLevel } from '../types';

export interface CostComponentBreakdown {
  laborAndSpecialists: number;
  technologyAndInfrastructure: number;
  complianceAndAssurance: number;
  pmAndContingency: number;
}

export interface BudgetFactorBreakdown {
  industrySector: string;
  sectorName: string;
  sectorCode: string;
  baseMedian: number;
  baseRange: [number, number];
  benchmarkHourlyRate: string;
  primaryCostDriver: string;
  modeMultiplier: number;
  urgencyMultiplier: number;
  deliverablesMultiplier: number;
  regionMultiplier: number;
  scaleMultiplier: number;
  compositeMultiplier: number;
  calculatedLow: number;
  calculatedHigh: number;
  calculatedMid: number;
  finalMedian: number;
  formattedRange: string;
  multipliers: {
    deliveryMode: { mode: string; multiplier: number };
    urgency: { level: string; multiplier: number };
    deliverableComplexity: { count: number; multiplier: number };
    regionalPPP: { region: string; multiplier: number };
    buyerScale: { tier: string; multiplier: number };
  };
  costComponents: CostComponentBreakdown;
  costBreakdown: {
    laborAmount: number;
    laborPercentage: number;
    techInfraAmount: number;
    techInfraPercentage: number;
    complianceQAAmount: number;
    complianceQAPercentage: number;
    pmContingencyAmount: number;
    pmContingencyPercentage: number;
  };
  unitEconomics: {
    hourlyRateBenchmark: string;
    estimatedLaborHours: number;
    estimatedHours: number;
    primaryCostDriver: string;
    riskMarginPercent: number;
    riskMargin: number;
  };
  recommendedTiers: {
    tier1Core: { name: string; price: string; percentage: string; description?: string };
    tier2Pro: { name: string; price: string; percentage: string; description?: string };
    tier3Enterprise: { name: string; price: string; percentage: string; description?: string };
  };
  formulaExplanation: string;
}

interface SectorProfile {
  name: string;
  code: string;
  keywords: string[];
  baseRange: [number, number];
  primaryCostDriver: string;
  hourlyRateBenchmark: string;
  typicalHourlyRate: number;
  costSplit: {
    labor: number;
    tech: number;
    compliance: number;
    pm: number;
  };
}

// 12 Granular Industry Sectors with Unit Economics
const SECTOR_PROFILES: SectorProfile[] = [
  {
    name: 'AI, Machine Learning & Intelligent Automation',
    code: 'AI_ML_AUTOMATION',
    keywords: ['ai', 'machine learning', 'llm', 'deep learning', 'neural', 'nlp', 'computer vision', 'rag', 'agentic', 'model training'],
    baseRange: [35000, 95000],
    primaryCostDriver: 'GPU Compute, Research Engineering & Model Fine-Tuning',
    hourlyRateBenchmark: '$175 - $260 / hr',
    typicalHourlyRate: 210,
    costSplit: { labor: 0.50, tech: 0.25, compliance: 0.12, pm: 0.13 }
  },
  {
    name: 'Enterprise Software, Cloud & Cybersecurity',
    code: 'ENTERPRISE_CLOUD_CYBER',
    keywords: ['software', 'cloud', 'aws', 'azure', 'kubernetes', 'devops', 'cyber', 'security', 'saas', 'api', 'soc2', 'zero-trust', 'penetration'],
    baseRange: [28000, 85000],
    primaryCostDriver: 'Senior Systems Architecture, Infrastructure & Security Audits',
    hourlyRateBenchmark: '$150 - $225 / hr',
    typicalHourlyRate: 185,
    costSplit: { labor: 0.52, tech: 0.22, compliance: 0.14, pm: 0.12 }
  },
  {
    name: 'Healthcare, MedTech & Clinical Systems',
    code: 'HEALTHCARE_MEDTECH',
    keywords: ['health', 'medical', 'hospital', 'clinic', 'biotech', 'pharma', 'hipaa', 'fda', 'patient', 'ehr', 'emr', 'diagnostic', 'telehealth'],
    baseRange: [45000, 140000],
    primaryCostDriver: 'Regulatory Compliance (HIPAA/FDA), Clinical Validation & Security',
    hourlyRateBenchmark: '$190 - $280 / hr',
    typicalHourlyRate: 235,
    costSplit: { labor: 0.42, tech: 0.18, compliance: 0.28, pm: 0.12 }
  },
  {
    name: 'Finance, FinTech, Banking & Legal Advisory',
    code: 'FINANCE_LEGAL_ADVISORY',
    keywords: ['finance', 'bank', 'fintech', 'accounting', 'tax', 'audit', 'legal', 'compliance', 'aml', 'kyc', 'pci-dss', 'wealth', 'insurance'],
    baseRange: [32000, 105000],
    primaryCostDriver: 'Partner/Senior Legal Counsel, Forensic Audit & Liability Mitigation',
    hourlyRateBenchmark: '$180 - $320 / hr',
    typicalHourlyRate: 250,
    costSplit: { labor: 0.58, tech: 0.12, compliance: 0.18, pm: 0.12 }
  },
  {
    name: 'Industrial, Manufacturing, Logistics & Supply Chain',
    code: 'INDUSTRIAL_SUPPLY_CHAIN',
    keywords: ['manufacturing', 'industrial', 'warehouse', 'logistics', 'freight', 'supply chain', 'scada', 'plc', 'iot', 'hardware', 'fleet'],
    baseRange: [38000, 125000],
    primaryCostDriver: 'Hardware Staging, Physical Field Integration & ERP/WMS Connectors',
    hourlyRateBenchmark: '$130 - $195 / hr',
    typicalHourlyRate: 160,
    costSplit: { labor: 0.45, tech: 0.28, compliance: 0.12, pm: 0.15 }
  },
  {
    name: 'Construction, Facilities, HVAC & Mechanical Trades',
    code: 'CONSTRUCTION_FACILITIES_TRADES',
    keywords: ['construction', 'facility', 'hvac', 'plumbing', 'electrical', 'building', 'contractor', 'renovation', 'roofing', 'architecture', 'onsite'],
    baseRange: [15000, 65000],
    primaryCostDriver: 'Physical Labor Crew Shifts, Materials (BOM) & Permit Clearances',
    hourlyRateBenchmark: '$95 - $155 / hr',
    typicalHourlyRate: 125,
    costSplit: { labor: 0.48, tech: 0.28, compliance: 0.12, pm: 0.12 }
  },
  {
    name: 'Creative, Branding, Content & Digital Marketing',
    code: 'CREATIVE_MARKETING_MEDIA',
    keywords: ['creative', 'design', 'brand', 'marketing', 'seo', 'social', 'video', 'content', 'advertising', 'ui/ux', 'media', 'copywriting', 'pr'],
    baseRange: [8000, 32000],
    primaryCostDriver: 'Creative Production Days, Multi-Channel Asset Volume & Revision Sprints',
    hourlyRateBenchmark: '$85 - $140 / hr',
    typicalHourlyRate: 110,
    costSplit: { labor: 0.65, tech: 0.15, compliance: 0.05, pm: 0.15 }
  },
  {
    name: 'Corporate Training, HR, Coaching & Education',
    code: 'HR_TRAINING_EDUCATION',
    keywords: ['training', 'hr', 'recruiting', 'staffing', 'education', 'learning', 'coaching', 'curriculum', 'lms', 'onboarding', 'workshops'],
    baseRange: [12000, 42000],
    primaryCostDriver: 'Seat/Cohort Volume, Executive Facilitator Time & Custom Content Modules',
    hourlyRateBenchmark: '$110 - $175 / hr',
    typicalHourlyRate: 140,
    costSplit: { labor: 0.60, tech: 0.15, compliance: 0.10, pm: 0.15 }
  },
  {
    name: 'Hospitality, Event Management, Food & Retail Ops',
    code: 'HOSPITALITY_RETAIL_EVENTS',
    keywords: ['hospitality', 'hotel', 'restaurant', 'food', 'retail', 'event', 'catering', 'store', 'pos', 'e-commerce', 'merchandising'],
    baseRange: [10000, 40000],
    primaryCostDriver: 'Venue Scale, POS Synchronization, Staging Crew & Seasonal Throughput',
    hourlyRateBenchmark: '$75 - $130 / hr',
    typicalHourlyRate: 100,
    costSplit: { labor: 0.50, tech: 0.25, compliance: 0.10, pm: 0.15 }
  },
  {
    name: 'Energy, CleanTech, Environmental & Utilities',
    code: 'ENERGY_CLEANTECH_UTILITIES',
    keywords: ['solar', 'energy', 'cleantech', 'environmental', 'utilities', 'sustainability', 'carbon', 'grid', 'waste', 'water', 'renewable'],
    baseRange: [30000, 110000],
    primaryCostDriver: 'Statutory Environmental Audits, Sensor Hardware & Grid Interconnects',
    hourlyRateBenchmark: '$140 - $210 / hr',
    typicalHourlyRate: 175,
    costSplit: { labor: 0.44, tech: 0.26, compliance: 0.18, pm: 0.12 }
  },
  {
    name: 'Localized Commercial & Consumer Services',
    code: 'LOCAL_COMMERCIAL_SERVICES',
    keywords: ['local', 'cleaning', 'maintenance', 'inspection', 'landscaping', 'security guard', 'repair', 'courier', 'residential'],
    baseRange: [4000, 18000],
    primaryCostDriver: 'Truck-Roll Dispatch, Field Technician Hours & Fast Callout Readiness',
    hourlyRateBenchmark: '$65 - $115 / hr',
    typicalHourlyRate: 85,
    costSplit: { labor: 0.65, tech: 0.15, compliance: 0.08, pm: 0.12 }
  },
  {
    name: 'General Enterprise & Professional B2B Services',
    code: 'GENERAL_ENTERPRISE_B2B',
    keywords: [],
    baseRange: [20000, 55000],
    primaryCostDriver: 'Dedicated Account Management, Milestone Execution & SLA Assurance',
    hourlyRateBenchmark: '$125 - $185 / hr',
    typicalHourlyRate: 155,
    costSplit: { labor: 0.55, tech: 0.18, compliance: 0.12, pm: 0.15 }
  }
];

// Identify most accurate sector from business type and demand metadata
export function identifySector(businessName: string, demandTitle?: string, description?: string): SectorProfile {
  const combinedText = `${businessName || ''} ${demandTitle || ''} ${description || ''}`.toLowerCase();

  for (const sector of SECTOR_PROFILES) {
    if (sector.keywords.length === 0) continue;
    const match = sector.keywords.some(kw => combinedText.includes(kw));
    if (match) {
      return sector;
    }
  }

  return SECTOR_PROFILES[SECTOR_PROFILES.length - 1]; // Fallback to General B2B
}

// Calculate delivery mode multiplier (Online vs Hybrid vs Onsite)
export function calculateModeMultiplier(mode?: BusinessMode, sectorCode?: string): number {
  switch (mode) {
    case 'Online':
      return 1.00;
    case 'Hybrid':
      return 1.20;
    case 'Onsite':
      // Physical trades, construction, industrial have higher onsite mobilization expenses
      if (sectorCode === 'CONSTRUCTION_FACILITIES_TRADES' || sectorCode === 'INDUSTRIAL_SUPPLY_CHAIN') {
        return 1.55;
      }
      return 1.40;
    default:
      return 1.15;
  }
}

// Calculate urgency factor
export function calculateUrgencyMultiplier(urgency?: UrgencyLevel): number {
  switch (urgency) {
    case 'Immediate (1-3 days)':
      return 1.50; // Rush mobilization + overtime + emergency resource lock
    case 'High (1-2 weeks)':
      return 1.25; // Priority sprint queue
    case 'Medium (1 month)':
      return 1.00; // Standard baseline scheduling
    case 'Flexible':
      return 0.90; // Off-peak discount
    default:
      return 1.00;
  }
}

// Calculate deliverable scope density multiplier
export function calculateDeliverablesMultiplier(deliverables?: string[], description?: string): number {
  const list = deliverables || [];
  const count = list.length;
  let multiplier = 1.0;

  // Base on deliverable count (typical project has 3-4 deliverables)
  if (count <= 2) multiplier = 0.85;
  else if (count === 3) multiplier = 1.00;
  else if (count === 4) multiplier = 1.15;
  else if (count >= 5) multiplier = 1.30;

  // Add weight for high-complexity enterprise keywords
  const text = `${list.join(' ')} ${description || ''}`.toLowerCase();
  if (text.includes('soc2') || text.includes('hipaa') || text.includes('iso') || text.includes('audit')) {
    multiplier += 0.12;
  }
  if (text.includes('24/7') || text.includes('sla') || text.includes('turnkey') || text.includes('multi-site') || text.includes('multi-location')) {
    multiplier += 0.10;
  }
  if (text.includes('migration') || text.includes('restructuring') || text.includes('disaster recovery') || text.includes('custom api')) {
    multiplier += 0.08;
  }

  return Number(multiplier.toFixed(2));
}

// Calculate regional Purchasing Power Parity (PPP) index
export function calculateRegionMultiplier(location?: string): number {
  if (!location) return 1.0;
  const loc = location.toLowerCase();

  // Tier 1 High-Cost Financial & Tech Hubs (1.15x - 1.25x)
  if (
    loc.includes('united states') || loc.includes('(us)') ||
    loc.includes('switzerland') || loc.includes('(ch)') || loc.includes('zurich') ||
    loc.includes('united kingdom') || loc.includes('(gb)') || loc.includes('london') ||
    loc.includes('singapore') || loc.includes('(sg)') ||
    loc.includes('norway') || loc.includes('denmark') || loc.includes('sweden')
  ) {
    return 1.20;
  }

  // Tier 2 Western Europe, Canada, Australia, Japan (1.05x - 1.10x)
  if (
    loc.includes('germany') || loc.includes('(de)') ||
    loc.includes('canada') || loc.includes('(ca)') ||
    loc.includes('australia') || loc.includes('(au)') ||
    loc.includes('japan') || loc.includes('(jp)') ||
    loc.includes('france') || loc.includes('(fr)') ||
    loc.includes('netherlands') || loc.includes('(nl)') ||
    loc.includes('austria') || loc.includes('ireland')
  ) {
    return 1.08;
  }

  // Tier 3 Standard Global Baseline (1.0x)
  if (
    loc.includes('spain') || loc.includes('italy') || loc.includes('south korea') ||
    loc.includes('portugal') || loc.includes('czech') || loc.includes('poland') ||
    loc.includes('united arab emirates') || loc.includes('dubai')
  ) {
    return 1.00;
  }

  // Emerging Market Parity (0.80x - 0.90x)
  if (
    loc.includes('india') || loc.includes('brazil') || loc.includes('mexico') ||
    loc.includes('chile') || loc.includes('south africa') || loc.includes('vietnam')
  ) {
    return 0.85;
  }

  return 1.0;
}

// Calculate corporate buyer scale factor
export function calculateBuyerScaleMultiplier(companyName?: string, role?: string): number {
  const name = (companyName || '').toLowerCase();
  const r = (role || '').toLowerCase();

  if (
    name.includes('global') || name.includes('corp') || name.includes('enterprises') ||
    name.includes('holdings') || name.includes('dynamics') || name.includes('technologies') ||
    r.includes('chief') || r.includes('vp') || r.includes('global')
  ) {
    return 1.25; // Enterprise conglomerate
  }

  if (name.includes('group') || name.includes('partners') || name.includes('systems') || r.includes('director')) {
    return 1.10; // Mid-market
  }

  return 0.95; // Small business / standard
}

// Format currency smoothly into clean ranges
export function formatCurrency(amount: number): string {
  // Round to nearest 500 or 1000 for realistic commercial formatting
  let rounded = amount;
  if (amount >= 50000) {
    rounded = Math.round(amount / 5000) * 5000;
  } else if (amount >= 15000) {
    rounded = Math.round(amount / 1000) * 1000;
  } else {
    rounded = Math.round(amount / 500) * 500;
  }
  return `$${rounded.toLocaleString('en-US')}`;
}

// Master refined calculation function
export function calculateRefinedEstimatedBudget(params: {
  businessTypeName: string;
  deliveryMode?: BusinessMode;
  urgency?: UrgencyLevel;
  deliverables?: string[];
  demandTitle?: string;
  demandDescription?: string;
  location?: string;
  customerCompany?: string;
  buyerRole?: string;
}): BudgetFactorBreakdown {
  const {
    businessTypeName,
    deliveryMode = 'Hybrid',
    urgency = 'High (1-2 weeks)',
    deliverables = [],
    demandTitle = '',
    demandDescription = '',
    location = '',
    customerCompany = '',
    buyerRole = ''
  } = params;

  // 1. Sector Profile & Unit Economics
  const sector = identifySector(businessTypeName, demandTitle, demandDescription);
  const [minBase, maxBase] = sector.baseRange;
  const baseMedian = Math.round((minBase + maxBase) / 2);

  // 2. Individual Multipliers
  const modeMult = calculateModeMultiplier(deliveryMode, sector.code);
  const urgencyMult = calculateUrgencyMultiplier(urgency);
  const delivMult = calculateDeliverablesMultiplier(deliverables, demandDescription);
  const regionMult = calculateRegionMultiplier(location);
  const scaleMult = calculateBuyerScaleMultiplier(customerCompany, buyerRole);

  // 3. Composite Multiplier
  const compositeMultiplier = Number((modeMult * urgencyMult * delivMult * regionMult * scaleMult).toFixed(3));

  // 4. Raw & Range Calculations
  const calculatedMidRaw = baseMedian * compositeMultiplier;
  const spreadPercent = 0.22; // +/- 22% commercial spread
  const calculatedLowRaw = calculatedMidRaw * (1 - spreadPercent);
  const calculatedHighRaw = calculatedMidRaw * (1 + spreadPercent);

  // Rounding for commercial polish
  const calculatedMid = Math.round(calculatedMidRaw / 1000) * 1000;
  const calculatedLow = Math.round(calculatedLowRaw / 1000) * 1000;
  const calculatedHigh = Math.round(calculatedHighRaw / 1000) * 1000;

  // 5. Cost Component Allocations
  const laborAndSpecialists = Math.round(calculatedMid * sector.costSplit.labor);
  const technologyAndInfrastructure = Math.round(calculatedMid * sector.costSplit.tech);
  const complianceAndAssurance = Math.round(calculatedMid * sector.costSplit.compliance);
  const pmAndContingency = Math.round(calculatedMid * sector.costSplit.pm);

  // 6. Labor Hours estimation based on benchmark
  const estimatedLaborHours = Math.max(20, Math.round(laborAndSpecialists / sector.typicalHourlyRate));

  // 7. Recommended 3-Tier Proposal Pricing
  const tier1Price = Math.round((calculatedMid * 0.70) / 500) * 500;
  const tier2Price = calculatedMid;
  const tier3Price = Math.round((calculatedMid * 1.45) / 1000) * 1000;

  const formattedRange = `${formatCurrency(calculatedLow)} - ${formatCurrency(calculatedHigh)}`;

  const formulaExplanation = `Estimated Budget = Base Median ($${baseMedian.toLocaleString()}) × Mode Multiplier (${modeMult.toFixed(2)}x) × Urgency Multiplier (${urgencyMult.toFixed(2)}x) × Scope Density (${delivMult.toFixed(2)}x) × Regional PPP (${regionMult.toFixed(2)}x) × Buyer Scale (${scaleMult.toFixed(2)}x) = $${calculatedMid.toLocaleString()} (±${Math.round(spreadPercent * 100)}% commercial variance range)`;

  const laborPercentage = Math.round(sector.costSplit.labor * 100);
  const techInfraPercentage = Math.round(sector.costSplit.tech * 100);
  const complianceQAPercentage = Math.round(sector.costSplit.compliance * 100);
  const pmContingencyPercentage = Math.round(sector.costSplit.pm * 100);

  const regionName = location ? location.split('(')[0].trim() : 'Global Baseline';
  const buyerTierName = scaleMult >= 1.2 ? 'Enterprise Tier' : scaleMult >= 1.05 ? 'Mid-Market' : 'Standard Tier';

  return {
    industrySector: sector.name,
    sectorName: sector.name,
    sectorCode: sector.code,
    baseMedian,
    baseRange: sector.baseRange,
    benchmarkHourlyRate: sector.hourlyRateBenchmark,
    primaryCostDriver: sector.primaryCostDriver,
    modeMultiplier: modeMult,
    urgencyMultiplier: urgencyMult,
    deliverablesMultiplier: delivMult,
    regionMultiplier: regionMult,
    scaleMultiplier: scaleMult,
    compositeMultiplier,
    calculatedLow,
    calculatedHigh,
    calculatedMid,
    finalMedian: calculatedMid,
    formattedRange,
    multipliers: {
      deliveryMode: { mode: deliveryMode, multiplier: modeMult },
      urgency: { level: urgency, multiplier: urgencyMult },
      deliverableComplexity: { count: deliverables.length || 3, multiplier: delivMult },
      regionalPPP: { region: regionName, multiplier: regionMult },
      buyerScale: { tier: buyerTierName, multiplier: scaleMult },
    },
    costComponents: {
      laborAndSpecialists,
      technologyAndInfrastructure,
      complianceAndAssurance,
      pmAndContingency
    },
    costBreakdown: {
      laborAmount: laborAndSpecialists,
      laborPercentage,
      techInfraAmount: technologyAndInfrastructure,
      techInfraPercentage,
      complianceQAAmount: complianceAndAssurance,
      complianceQAPercentage,
      pmContingencyAmount: pmAndContingency,
      pmContingencyPercentage,
    },
    unitEconomics: {
      hourlyRateBenchmark: sector.hourlyRateBenchmark,
      estimatedLaborHours,
      estimatedHours: estimatedLaborHours,
      primaryCostDriver: sector.primaryCostDriver,
      riskMarginPercent: pmContingencyPercentage,
      riskMargin: sector.costSplit.pm,
    },
    recommendedTiers: {
      tier1Core: {
        name: 'Tier 1: Core / Essential MVP',
        price: formatCurrency(tier1Price),
        percentage: '70% of Baseline',
        description: 'Covers primary scope deliverables with standard turnaround and QA verification.'
      },
      tier2Pro: {
        name: 'Tier 2: Professional (Recommended)',
        price: formatCurrency(tier2Price),
        percentage: '100% of Calculated Estimate',
        description: 'Complete turn-key scope, dedicated project management, priority SLA, and extended support.'
      },
      tier3Enterprise: {
        name: 'Tier 3: Enterprise & SLA Assurance',
        price: `${formatCurrency(tier3Price)}+`,
        percentage: '145% Comprehensive',
        description: 'Full white-glove coverage, custom integrations, executive oversight, and 12-month assurance retainer.'
      }
    },
    formulaExplanation
  };
}
