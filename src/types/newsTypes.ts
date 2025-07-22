export interface NewsItem {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  author: string;
} 