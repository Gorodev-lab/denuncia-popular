
export enum Step {
  HOME = -1,
  LOCATION = 0,
  INFO = 1,
  EVIDENCE = 2,
  REVIEW = 3,
  SUCCESS = 4
}

export interface LocationData {
  lat: number;
  lng: number;
  address?: string;          // full formatted_address from Google
  estado?: string;           // administrative_area_level_1
  municipio?: string;        // administrative_area_level_2
  localidad?: string;        // locality
  colonia?: string;          // sublocality_level_1
}

export interface DenunciaDraft {
  isAnonymous: boolean;
  fullName: string;
  email: string;
  location: LocationData | null;
  description: string;
  category: string;
  evidenceFiles: File[];
  evidenceUrls?: string[];
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
