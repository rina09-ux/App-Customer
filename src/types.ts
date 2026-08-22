export type NavigationSection = 
  // MARKETPLACE
  | 'marketplace'
  // DASHBOARD
  | 'overview' 
  | 'action-center'
  | 'analytics'
  | 'notifications'
  // SECURITY (NusaSec Secure)
  | 'assets-cloud'
  | 'risk-exposure'
  | 'attack-paths'
  | 'identity'
  | 'security'
  // TRUST (NusaSec Trust)
  | 'compliance'
  | 'evidence'
  | 'regulatory'
  | 'reports'
  // DATA INTELLIGENCE
  | 'data-explorer'
  // QUANTUM (NusaSec Quantum)
  | 'pqc-readiness'
  | 'migration-center'
  // DEVELOPER
  | 'pqc-api'
  | 'pqc-sdk'
  | 'github-connect'
  // BILLING
  | 'billing'
  // ACCOUNT
  | 'organization'
  | 'settings'
  | 'members'
  | 'projects'
  | 'integrations'
  | 'profile'
  | 'preference'
  | 'passwords'
  | 'api'
  | 'team-goodwriter'
  | 'team-invoicer';

export type BillingCycle = 'monthly' | 'annually';

export interface PlanFeature {
  id: string;
  name: string;
  included: boolean;
}

export interface PlanTier {
  id: string;
  name: string;
  subtitle: string;
  badge?: string;
  badgeType?: 'popular' | 'valuable' | 'discount';
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  isCurrent?: boolean;
  buttonLabel: string;
  buttonVariant: 'outline' | 'primary';
}

export interface AddOnItem {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  monthlyPrice: number;
  annualPrice: number;
  iconType: 'ai-rainbow' | 'assistant-dark';
  isAdded?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'SOC Admin' | 'SecOps Engineer' | 'Security Analyst' | 'Compliance Auditor' | 'Admin' | 'Member' | 'Editor' | 'Viewer';
  avatar: string;
  status: 'active' | 'invited';
  mfaVerified?: boolean;
  clearanceLevel?: string;
}

export interface InvoiceItem {
  id: string;
  date: string;
  amount: string;
  plan: string;
  status: 'Paid' | 'Pending';
  downloadUrl: string;
}

// NusaSec Core Contract Types
export interface CloudConnection {
  accountId: string;
  provider: string;
  accountRef: string;
  name: string;
  credentialMode: string;
  identityStatus: 'VALIDATED' | 'PENDING' | 'ERROR';
  lastValidatedAt: string;
  regionCount: number;
  assetCount: number;
}

export interface CloudAsset {
  id: string;
  scanId: string;
  provider: string;
  assetType: string;
  externalId: string;
  name: string;
  region: string;
  riskScore: number;
  sensitivity: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  status: 'PROTECTED' | 'AT_RISK' | 'CRITICAL';
}

export interface ActionItem {
  id: string;
  title: string;
  category: 'SECURITY' | 'COMPLIANCE' | 'QUANTUM' | 'IDENTITY';
  priority: 'P0 - CRITICAL' | 'P1 - HIGH' | 'P2 - MEDIUM' | 'P3 - LOW';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE';
  owner: string;
  source: string;
  sourceId: string;
  dueAt: string;
  recommendedAction: string;
  blocker?: string;
}

export interface RiskFinding {
  id: string;
  cve?: string;
  title: string;
  cvss: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  asset: string;
  provider: string;
  exposureVector: string;
  status: 'OPEN' | 'IN_REMEDIATION' | 'RESOLVED' | 'EXCEPTION_APPROVED';
  businessCriticality: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  remediationPlan: string;
  detectedAt: string;
}

export interface ComplianceFramework {
  id: string;
  code: string;
  name: string;
  jurisdiction: string;
  totalRules: number;
  passedRules: number;
  failedRules: number;
  unknownRules: number;
  complianceScore: number;
  evidenceCoverage: number;
  status: 'COMPLIANT' | 'NEEDS_ATTENTION' | 'NON_COMPLIANT';
  lastAudit: string;
}

export interface EvidenceRecord {
  id: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  sha256: string;
  kind: 'security_report' | 'soc2_attestation' | 'pen_test' | 'policy_document' | 'pqc_benchmark';
  status: 'VERIFIED' | 'REGISTERED' | 'EXPIRED';
  uploadedBy: string;
  createdAt: string;
  freshness: 'FRESH' | 'AGING' | 'EXPIRED';
}

export interface PqcAsset {
  id: string;
  name: string;
  currentAlgorithm: string;
  algorithmType: 'KEM' | 'SIGNATURE' | 'SYMMETRIC' | 'ASYMMETRIC';
  targetAlgorithm: string;
  quantumVulnerability: 'HIGH_RISK' | 'MEDIUM_RISK' | 'QUANTUM_SAFE';
  migrationPhase: 'DISCOVERED' | 'PLANNED' | 'SIMULATED' | 'MIGRATED';
  cbomRef: string;
  workload: string;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  environment: 'PRODUCTION' | 'STAGING' | 'SANDBOX';
  scopes: string[];
  lastUsed: string;
  createdAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'REVOKED';
}
