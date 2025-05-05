export interface IBook {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  discountPercentage?: number;
  coverImage: string;
  rating: number;
  reviewCount: number;
  genres: string[];
  publicationDate: string;
  pages: number;
  language: string;
  isbn: string;
  publisher: string;
  hasPreview: boolean;
  hasAudioSample: boolean;
  audioSample?: string;
  previewText?: string;
}

export interface IBookPreview {
  id: string;
  title: string;
  author: string;
  previewText: string;
  previewImageUrl: string;
}

export interface IAudioSample {
  id: string;
  bookId: string;
  title: string;
  duration: number;
  url: string;
  useSpeechSynthesis?: boolean;
  textToRead?: string;
}

export interface IBookReview {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  date: string;
  containsSpoilers: boolean;
  likes: number;
  dislikes: number;
} 