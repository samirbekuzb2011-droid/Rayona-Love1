export type PhotoCategory = 'Все' | 'Прогулки' | 'Утро' | 'Вечер' | 'Нежность';

export interface PhotoComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface PhotoMemory {
  id: string;
  title: string;
  caption: string;
  category: Exclude<PhotoCategory, 'Все'>;
  dateLabel: string;
  imageUrl: string;
  aspectRatio?: 'wide' | 'square' | 'portrait';
  isUserUploaded?: boolean;
  comments: PhotoComment[];
  createdAt: number;
}

export interface VoiceMessage {
  id: string;
  title: string;
  note: string;
  durationSec: number;
  audioUrl: string;
  dateLabel: string;
  createdAt: number;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  durationSec: number;
  isBuiltIn?: boolean;
  builtInPreset?: 'piano' | 'ambient';
  audioUrl?: string;
  createdAt: number;
}

export interface LoveLetterProfile {
  recipientName: string;
  senderName: string;
  kicker: string;
  headline: string;
  leadQuote: string;
  letterBody: string;
  startDate: string; // YYYY-MM-DD
}
