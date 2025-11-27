export interface HistoryResult {
  location: string;
  summary: string;
  facts: string[];
  sourceUrls?: string[];
}

export interface ContentPlan {
  contentType: string; // e.g., Webtoon, Audio Drama
  title: string;
  concept: string;
  storyline: string;
  empathyPoint: string;
  socialPostText: string;
  hashtags: string[];
}

export enum AppState {
  IDLE = 'IDLE',
  FETCHING_HISTORY = 'FETCHING_HISTORY',
  PLANNING_CONTENT = 'PLANNING_CONTENT',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface GeneratedPoster {
  imageUrl: string;
}
