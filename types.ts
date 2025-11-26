
export enum Step {
  LOCATION = 0,
  INFO = 1,
  EVIDENCE = 2,
  REVIEW = 3,
  SUCCESS = 4
}

export interface LocationData {
  lat: number;
  lng: number;
  address?: string;
}

export interface DenunciaDraft {
  isAnonymous: boolean;
  fullName: string;
  email: string;
  location: LocationData | null;
  description: string;
  category: string;
  evidenceFiles: File[];
  aiAnalysis?: AIAnalysisResult;
  // Market Research Data
  age?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  occupation?: string;
  referralSource?: 'SOCIAL_MEDIA' | 'FRIEND' | 'AD' | 'OTHER';
}

export interface AIAnalysisResult {
  competency: 'MUNICIPAL' | 'ESTATAL' | 'FEDERAL' | 'UNKNOWN';
  legalBasis: string;
  summary: string;
}
