export interface AttachedFile {
  name: string;
  mimeType: string;
  data: string; // base64
  preview?: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  image?: string; // للصور المولدة بواسطة الذكاء الاصطناعي
  files?: AttachedFile[]; // للملفات المرفقة من قبل المستخدم
  isEdited?: boolean;
  originalText?: string;
  locationError?: boolean;
  locationRetryCount?: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  author: string;
  content: string;
  source: string;
  image?: string;
}

export type TabType = 'radio2' | 'articles' | 'schedule';

export enum StreamStatus {
  STOPPED = 'STOPPED',
  BUFFERING = 'BUFFERING',
  PLAYING = 'PLAYING',
  ERROR = 'ERROR'
}