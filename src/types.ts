export type BusinessMode = 'Online' | 'Onsite' | 'Hybrid';
export type PopularityLevel = 'Low' | 'Medium' | 'High' | 'Very High';

export interface BusinessType {
  business_id: string;
  business_type_name: string;
  online_or_onsite: BusinessMode;
  place: string;
  approximately_area: string;
  popularity: PopularityLevel;
  isCustom?: boolean;
}

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
  logoIcon: string;
  createdDate: string;
}

export type UrgencyLevel = 'Immediate (1-3 days)' | 'High (1-2 weeks)' | 'Medium (1 month)' | 'Flexible';
export type DemandStatus = 'New' | 'Contacted' | 'In Discussion' | 'Proposal Sent' | 'Won' | 'Archived';

export interface MessageLog {
  id: string;
  channel: 'email' | 'whatsapp' | 'a2a' | 'direct_chat';
  direction: 'outgoing' | 'incoming';
  sender: string;
  recipient: string;
  subject?: string;
  content: string;
  timestamp: string;
}

export interface A2ANegotiationStep {
  step: number;
  agent: 'VendorAgent' | 'BuyerAgent';
  action: string;
  payload: Record<string, any>;
  humanExplanation: string;
  timestamp: string;
}

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

export interface BudgetFactorBreakdown {
  industrySector: string;
  sectorName?: string;
  sectorCode?: string;
  baseMedian: number;
  baseRange?: [number, number];
  benchmarkHourlyRate?: string;
  primaryCostDriver?: string;
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
  multipliers?: {
    deliveryMode: { mode: string; multiplier: number };
    urgency: { level: string; multiplier: number };
    deliverableComplexity: { count: number; multiplier: number };
    regionalPPP: { region: string; multiplier: number };
    buyerScale: { tier: string; multiplier: number };
  };
  costComponents: {
    laborAndSpecialists: number;
    technologyAndInfrastructure: number;
    complianceAndAssurance: number;
    pmAndContingency: number;
  };
  costBreakdown?: {
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
    estimatedHours?: number;
    primaryCostDriver: string;
    riskMarginPercent: number;
    riskMargin?: number;
  };
  recommendedTiers: {
    tier1Core: { name: string; price: string; percentage: string; description?: string };
    tier2Pro: { name: string; price: string; percentage: string; description?: string };
    tier3Enterprise: { name: string; price: string; percentage: string; description?: string };
  };
  formulaExplanation?: string;
}

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
  budgetBreakdown?: BudgetFactorBreakdown;
  urgency: UrgencyLevel;
  publishedDate: string; // ISO string or YYYY-MM-DD
  source: string; // e.g. 'Enterprise RFP Portal', 'LinkedIn Demands', 'Upwork Enterprise'
  sourceUrl?: string;
  leadOrigin?: 'web-scraped' | 'user-imported';
  status: DemandStatus;
  matchScore: number; // 0-100
  matchReason: string;
  communicationLogs: MessageLog[];
  proposals: Proposal[];
  a2aLogs?: A2ANegotiationStep[];
}

export interface ScraperStats {
  totalFound: number;
  lastScrapedAt: string | null;
  activeBusinessTypeName: string;
  dateRangeMonths: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Lead Ops Manager' | 'Commercial Executive';
  avatarUrl?: string;
  lastLogin: string;
  permissions: string[];
}

