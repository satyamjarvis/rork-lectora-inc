export interface ArticleImage {
  url: string;
  alt?: string;
  caption?: string;
}

export interface ArticleReference {
  text: string;
  url: string;
}

export interface Highlight {
  id: string;
  text: string;
  color: string;
  createdAt: string;
}

export interface Note {
  id: string;
  text: string;
  createdAt: string;
}

export interface Article {
  id: string;
  url: string;
  title: string;
  excerpt: string;
  content: string;
  domain: string;
  imageUrl?: string;
  images?: ArticleImage[];
  references?: ArticleReference[];
  readingTime: number;
  savedAt: string;
  bookmarked: boolean;
  archived: boolean;
  folderId?: string;
  highlights?: Highlight[];
  notes?: Note[];
  tags?: string[];
  isVideo?: boolean;
  videoId?: string;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: string;
}

export type SortOption = "date" | "length" | "title" | "shuffle";