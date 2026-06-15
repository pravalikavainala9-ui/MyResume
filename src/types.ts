export interface CoreProfile {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  github?: string; // GitHub profile link
  summary: string;
  skills: string; // Comma separated or free text
  experience: string; // Text representation of job history
  education: string; // Text representation of schools
  projects?: string; // Projects or extra sections
  interests?: string; // Optional user-defined hobbies and interests
}

export interface SavedProfile {
  id: string;
  name: string;
  profile: CoreProfile;
  lastUpdated: string;
}

export interface JobDescriptionRequest {
  companyName: string;
  roleTitle: string;
  jobDescriptionText: string;
  customKeywords?: string;
  additionalFocus?: string;
}

export interface TailoredInterviewPrep {
  question: string;
  talkingPoints: string;
}

export interface GeneratedTailoredResume {
  tailoredResumeMarkdown: string;
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  tailoredCoverLetter: string;
  interviewPrepQuestions: TailoredInterviewPrep[];
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  companyName: string;
  roleTitle: string;
  generatedData: GeneratedTailoredResume;
  requestPayload: {
    coreProfile: CoreProfile;
    jobRequest: JobDescriptionRequest;
  };
}
