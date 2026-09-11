export type ModelId = 'gemini' | 'chatgpt' | 'claude' | 'perplexity';

export interface ModelProfile {
  id: ModelId;
  name: string;
  creator: string;
  badge: string;
  role: string;
  color: string;
  bgLight: string;
  borderColor: string;
  textColor: string;
  avatarBg: string;
  personaSummary: string;
  coreStrength: string;
}

export type DeliberationDepth = 'quick' | 'thorough' | 'deep';
export type DeliberationTone = 'balanced' | 'rigorous' | 'adversarial' | 'creative';

export interface DeliberationMessage {
  id: string;
  round: number;
  roundName: string;
  modelId: ModelId;
  timestamp: number;
  content: string;
  keyTakeaway: string;
  critiqueTargets?: ModelId[];
  sentiment?: 'agree' | 'disagree' | 'nuanced' | 'constructive';
}

export interface DebatedPoint {
  topic: string;
  stances: {
    modelId: ModelId;
    stance: string;
  }[];
  resolution: string;
}

export interface ModelContribution {
  modelId: ModelId;
  contribution: string;
}

export interface ConsensusReport {
  verdict: string;
  confidenceScore: number;
  executiveSummary: string;
  consensusPoints: string[];
  debatedPoints: DebatedPoint[];
  actionableRecommendations: string[];
  risksAndCaveats: string[];
  modelContributions: ModelContribution[];
  fullMarkdownAnswer: string;
}

export interface DeliberationSession {
  id: string;
  query: string;
  depth: DeliberationDepth;
  tone: DeliberationTone;
  createdAt: number;
  status: 'idle' | 'running' | 'completed' | 'error';
  currentStage: string;
  currentActiveModel?: ModelId | 'synthesizer';
  progressPercentage: number;
  messages: DeliberationMessage[];
  report?: ConsensusReport;
  error?: string;
}

export interface StreamEvent {
  type: 'status' | 'message' | 'report' | 'error' | 'done';
  stage?: string;
  activeModel?: ModelId | 'synthesizer';
  progress?: number;
  message?: DeliberationMessage;
  report?: ConsensusReport;
  error?: string;
}
