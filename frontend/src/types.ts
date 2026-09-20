export interface KeywordMatch {
  name: string;
  category: 'technical' | 'soft' | 'domain' | 'tools';
  found: boolean;
  frequency?: number;
  importance: 'high' | 'medium' | 'low';
}

export interface BulletRewrite {
  id: string;
  original: string;
  improved: string;
  scoreBefore: number;
  scoreAfter: number;
  critique: string;
  improvementsApplied: string[];
}

export interface SectionHealth {
  section: string;
  status: 'excellent' | 'warning' | 'critical';
  score: number;
  findings: string[];
  recommendation: string;
}

export interface SuggestedJobRole {
  title: string;
  matchScore: number;
  reason: string;
  suitableSkills: string[];
}

export interface RecommendedSkill {
  skill: string;
  category: string;
  importance: 'high' | 'medium' | 'low';
  reason: string;
  forRoles: string[];
}

export interface RecommendationsBlock {
  suggestedRoles: SuggestedJobRole[];
  recommendedSkills: RecommendedSkill[];
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  candidateName: string;
  targetRole: string;
  targetCompany?: string;
  overallScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  verdict: string;
  metrics: {
    atsScore: number;
    keywordMatch: number;
    impactQuantification: number;
    readabilityScore: number;
    brevityScore: number;
  };
  recruiterImpression: {
    firstGlanceSummary: string;
    estimatedReadTimeSeconds: number;
    topStrengths: string[];
    criticalRedFlags: string[];
  };
  keywords: {
    matched: KeywordMatch[];
    missing: KeywordMatch[];
    matchPercentage: number;
  };
  bulletPoints: BulletRewrite[];
  sectionAudits: SectionHealth[];
  recommendations?: RecommendationsBlock;
  rawResumeText: string;
  rawJobDescription: string;
}

export interface SampleProfile {
  id: string;
  role: string;
  company: string;
  experienceLevel: string;
  resumeText: string;
  jobDescription: string;
}

export interface FastApiConfig {
  baseUrl: string;
  endpointPath: string;
  apiKey?: string;
  useCustomBackend: boolean;
}
