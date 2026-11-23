import {
  LoveLetterProfile,
  MusicTrack,
  PhotoComment,
  PhotoMemory,
  VoiceMessage,
} from '../types';

import imgHappy from '../assets/images/happy.jpg';
import imgHeart from '../assets/images/heart.jpg';
import imgHair from '../assets/images/hair.jpg';
import imgLove from '../assets/images/love.jpg';
import imgKind from '../assets/images/kind.jpg';
import imgBeautiful from '../assets/images/beautiful.jpg';
import imgHappyBirthday from '../assets/images/happy_birthday.jpg';
import imgKid from '../assets/images/kid.jpg';

const DB_NAME = 'love_archive_db';
const DB_VERSION = 1;

const STORE_PROFILE = 'profile';
const STORE_PHOTOS = 'photos';
const STORE_VOICES = 'voices';
const STORE_TRACKS = 'tracks';

export const DEFAULT_PROFILE: LoveLetterProfile = {
  recipientName: 'Района',
  senderName: 'Твой навсегда',
  kicker: 'Личный архив чувств',
  headline: 'Каждое мгновение рядом с тобой — моя самая любимая история',
  leadQuote:
    'Я собрал здесь наши фотографии, маленькие заметки и голос, чтобы ты всегда помнила, как сильно я тебя люблю — даже в самые обычные дни, описывать мою любовь к тебе словами невозможно.',
  letterBody:
    'Родная моя Района,\n\nИногда слова кажутся слишком тихими по сравнению с тем, что я чувствую, когда смотрю на тебя. Ты умеешь превращать самый обычный день в праздник просто тем, что смеёшься рядом и даришь мне свою улыбку.\n\nМне хотелось создать место, которое принадлежит только нам. Сюда я добавил твои любимые фотографии и тёплые слова, чтобы ты всегда знала, как сильно ты мне дорога.\n\nСпасибо тебе за тепло, нежность и свет, который ты приносишь в каждый мой день. Я люблю тебя больше, чем вчера, и чуть меньше, чем завтра.',
  startDate: '2026-10-14',
};

export const INITIAL_PHOTOS: PhotoMemory[] = [
  {
    id: 'seed-1',
    title: 'я тебя люблю моя Района ❤️',
    caption: 'Ты моё солнышко, моя звёздочка и моё вдохновение каждый день.',
    category: 'Нежность',
    dateLabel: '24 июля',
    imageUrl: imgHappy,
    aspectRatio: 'wide',
    comments: [
      {
        id: 'c-1',
        author: 'Я',
        text: 'Самый особенный день и самая любимая девочка ❤️',
        createdAt: '23 ноября',
      },
    ],
    createdAt: 1730000008000,
  },
  {
    id: 'seed-2',
    title: 'моя милашка',
    caption: 'Самая очаровательная и любимая улыбка на свете.',
    category: 'Нежность',
    dateLabel: '23 ноября',
    imageUrl: imgHeart,
    aspectRatio: 'square',
    comments: [],
    createdAt: 1730000007000,
  },
  {
    id: 'seed-3',
    title: 'ее любимое занятие 😂',
    caption: 'Даже в самые обычные моменты рядом с тобой всегда весело и тепло.',
    category: 'Прогулки',
    dateLabel: '23 ноября',
    imageUrl: imgHair,
    aspectRatio: 'square',
    comments: [],
    createdAt: 1730000006000,
  },
  {
    id: 'seed-4',
    title: 'ты моя самая нежная звездочка',
    caption: 'Твой взгляд и твоя нежность делают меня самым счастливым.',
    category: 'Нежность',
    dateLabel: '23 ноября',
    imageUrl: imgLove,
    aspectRatio: 'square',
    comments: [],
    createdAt: 1730000005000,
  },
  {
    id: 'seed-5',
    title: 'красавица',
    caption: 'Невозможно оторвать взгляд, ты прекрасна в каждом кадре.',
    category: 'Вечер',
    dateLabel: '23 ноября',
    imageUrl: imgKind,
    aspectRatio: 'square',
    comments: [],
    createdAt: 1730000004000,
  },
  {
    id: 'seed-6',
    title: 'самая красивая девушка',
    caption: 'Моя гордость, моё счастье и моя самая любимая история.',
    category: 'Прогулки',
    dateLabel: '23 ноября',
    imageUrl: imgBeautiful,
    aspectRatio: 'portrait',
    comments: [],
    createdAt: 1730000003000,
  },
  {
    id: 'seed-7',
    title: 'Счастливые моменты',
    caption: 'Каждый день с тобой — как маленький праздник.',
    category: 'Утро',
    dateLabel: '23 ноября',
    imageUrl: imgHappyBirthday,
    aspectRatio: 'portrait',
    comments: [],
    createdAt: 1730000002000,
  },
  {
    id: 'seed-8',
    title: 'Нежность в каждом взгляде',
    caption: 'Храню в сердце каждую секунду, проведённую рядом с тобой.',
    category: 'Нежность',
    dateLabel: '23 ноября',
    imageUrl: imgKid,
    aspectRatio: 'portrait',
    comments: [],
    createdAt: 1730000001000,
  },
];

export const BUILTIN_TRACKS: MusicTrack[] = [
  {
    id: 'builtin-piano',
    title: 'Вечерний свет (Фортепиано)',
    artist: 'Тёплая импровизация',
    durationSec: 180,
    isBuiltIn: true,
    builtInPreset: 'piano',
    createdAt: 1700000000000,
  },
  {
    id: 'builtin-ambient',
    title: 'Тишина вдвоём (Эмбиент)',
    artist: 'Мягкие гармонии',
    durationSec: 210,
    isBuiltIn: true,
    builtInPreset: 'ambient',
    createdAt: 1700000001000,
  },
];

interface StoredPhotoRecord {
  id: string;
  title: string;
  caption: string;
  category: Exclude<PhotoMemory['category'], never>;
  dateLabel: string;
  imageUrl?: string;
  imageBlob?: Blob;
  aspectRatio?: 'wide' | 'square' | 'portrait';
  isUserUploaded?: boolean;
  comments: PhotoComment[];
  createdAt: number;
}

interface StoredVoiceRecord {
  id: string;
  title: string;
  note: string;
  durationSec: number;
  audioBlob: Blob;
  dateLabel: string;
  createdAt: number;
}

interface StoredTrackRecord {
  id: string;
  title: string;
  artist: string;
  durationSec: number;
  audioBlob: Blob;
  createdAt: number;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_PROFILE)) {
        db.createObjectStore(STORE_PROFILE);
      }
      if (!db.objectStoreNames.contains(STORE_PHOTOS)) {
        db.createObjectStore(STORE_PHOTOS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_VOICES)) {
        db.createObjectStore(STORE_VOICES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_TRACKS)) {
        db.createObjectStore(STORE_TRACKS, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadProfile(): Promise<LoveLetterProfile> {
  try {
    const db = await openDatabase();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE_PROFILE, 'readonly');
      const store = tx.objectStore(STORE_PROFILE);
      const req = store.get('main');
      req.onsuccess = () => resolve(req.result ?? DEFAULT_PROFILE);
      req.onerror = () => resolve(DEFAULT_PROFILE);
    });
  } catch {
    return DEFAULT_PROFILE;
  }
}

export async function saveProfile(profile: LoveLetterProfile): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_PROFILE, 'readwrite');
    tx.objectStore(STORE_PROFILE).put(profile, 'main');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadPhotos(): Promise<PhotoMemory[]> {
  try {
    const db = await openDatabase();
    const records: StoredPhotoRecord[] = await new Promise((resolve) => {
      const tx = db.transaction(STORE_PHOTOS, 'readonly');
      const req = tx.objectStore(STORE_PHOTOS).getAll();
      req.onsuccess = () => resolve(req.result ?? []);
      req.onerror = () => resolve([]);
    });

    if (records.length === 0) {
      // Seed initial curated photos once
      const tx = db.transaction(STORE_PHOTOS, 'readwrite');
      const store = tx.objectStore(STORE_PHOTOS);
      for (const seed of INITIAL_PHOTOS) {
        store.put(seed);
      }
      return INITIAL_PHOTOS;
    }

    return records
      .map((rec) => ({
        id: rec.id,
        title: rec.title,
        caption: rec.caption,
        category: rec.category,
        dateLabel: rec.dateLabel,
        imageUrl: rec.imageBlob ? URL.createObjectURL(rec.imageBlob) : rec.imageUrl ?? '',
        aspectRatio: rec.aspectRatio,
        isUserUploaded: rec.isUserUploaded,
        comments: rec.comments ?? [],
        createdAt: rec.createdAt,
      }))
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return INITIAL_PHOTOS;
  }
}

export async function saveNewPhoto(
  photo: Omit<PhotoMemory, 'imageUrl'> & { imageBlob: Blob }
): Promise<PhotoMemory> {
  const db = await openDatabase();
  const record: StoredPhotoRecord = {
    id: photo.id,
    title: photo.title,
    caption: photo.caption,
    category: photo.category,
    dateLabel: photo.dateLabel,
    imageBlob: photo.imageBlob,
    aspectRatio: photo.aspectRatio ?? 'square',
    isUserUploaded: true,
    comments: photo.comments,
    createdAt: photo.createdAt,
  };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_PHOTOS, 'readwrite');
    tx.objectStore(STORE_PHOTOS).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  return {
    ...photo,
    imageUrl: URL.createObjectURL(photo.imageBlob),
    isUserUploaded: true,
  };
}

export async function updatePhotoInDb(
  id: string,
  updater: (existing: StoredPhotoRecord) => StoredPhotoRecord
): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_PHOTOS, 'readwrite');
    const store = tx.objectStore(STORE_PHOTOS);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      if (getReq.result) {
        store.put(updater(getReq.result));
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deletePhotoFromDb(id: string): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_PHOTOS, 'readwrite');
    tx.objectStore(STORE_PHOTOS).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadVoices(): Promise<VoiceMessage[]> {
  try {
    const db = await openDatabase();
    const records: StoredVoiceRecord[] = await new Promise((resolve) => {
      const tx = db.transaction(STORE_VOICES, 'readonly');
      const req = tx.objectStore(STORE_VOICES).getAll();
      req.onsuccess = () => resolve(req.result ?? []);
      req.onerror = () => resolve([]);
    });

    return records
      .map((rec) => ({
        id: rec.id,
        title: rec.title,
        note: rec.note,
        durationSec: rec.durationSec,
        audioUrl: URL.createObjectURL(rec.audioBlob),
        dateLabel: rec.dateLabel,
        createdAt: rec.createdAt,
      }))
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export async function saveVoiceToDb(
  voice: Omit<VoiceMessage, 'audioUrl'> & { audioBlob: Blob }
): Promise<VoiceMessage> {
  const db = await openDatabase();
  const record: StoredVoiceRecord = {
    id: voice.id,
    title: voice.title,
    note: voice.note,
    durationSec: voice.durationSec,
    audioBlob: voice.audioBlob,
    dateLabel: voice.dateLabel,
    createdAt: voice.createdAt,
  };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_VOICES, 'readwrite');
    tx.objectStore(STORE_VOICES).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  return {
    ...voice,
    audioUrl: URL.createObjectURL(voice.audioBlob),
  };
}

export async function deleteVoiceFromDb(id: string): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_VOICES, 'readwrite');
    tx.objectStore(STORE_VOICES).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadTracks(): Promise<MusicTrack[]> {
  try {
    const db = await openDatabase();
    const records: StoredTrackRecord[] = await new Promise((resolve) => {
      const tx = db.transaction(STORE_TRACKS, 'readonly');
      const req = tx.objectStore(STORE_TRACKS).getAll();
      req.onsuccess = () => resolve(req.result ?? []);
      req.onerror = () => resolve([]);
    });

    const userTracks: MusicTrack[] = records
      .map((rec) => ({
        id: rec.id,
        title: rec.title,
        artist: rec.artist,
        durationSec: rec.durationSec,
        isBuiltIn: false,
        audioUrl: URL.createObjectURL(rec.audioBlob),
        createdAt: rec.createdAt,
      }))
      .sort((a, b) => b.createdAt - a.createdAt);

    return [...userTracks, ...BUILTIN_TRACKS];
  } catch {
    return BUILTIN_TRACKS;
  }
}

export async function saveTrackToDb(
  track: Omit<MusicTrack, 'audioUrl'> & { audioBlob: Blob }
): Promise<MusicTrack> {
  const db = await openDatabase();
  const record: StoredTrackRecord = {
    id: track.id,
    title: track.title,
    artist: track.artist,
    durationSec: track.durationSec,
    audioBlob: track.audioBlob,
    createdAt: track.createdAt,
  };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_TRACKS, 'readwrite');
    tx.objectStore(STORE_TRACKS).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  return {
    ...track,
    audioUrl: URL.createObjectURL(track.audioBlob),
    isBuiltIn: false,
  };
}

export async function deleteTrackFromDb(id: string): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_TRACKS, 'readwrite');
    tx.objectStore(STORE_TRACKS).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
