import type { NewsItem } from '../types/newsTypes';

export async function getNews(params?: { from?: string, to?: string }): Promise<NewsItem[]> {
  let url = '/api/news';
  const query: string[] = [];
  if (params?.from) query.push(`from=${encodeURIComponent(params.from)}`);
  if (params?.to) query.push(`to=${encodeURIComponent(params.to)}`);
  if (query.length) url += '?' + query.join('&');
  const res = await fetch(url);
  if (!res.ok) throw new Error('Ошибка загрузки новостей');
  const data = await res.json();
  return data.map((n: any) => ({ ...n, createdAt: new Date(n.createdAt), updatedAt: n.updatedAt ? new Date(n.updatedAt) : undefined }));
}

export async function getNewsById(id: number): Promise<NewsItem> {
  const res = await fetch(`/api/news/${id}`);
  if (!res.ok) throw new Error('Ошибка загрузки новости');
  const data = await res.json();
  return { ...data, createdAt: new Date(data.createdAt), updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined };
}

export async function createNews(payload: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<NewsItem> {
  const res = await fetch('/api/news', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Ошибка создания новости');
  const data = await res.json();
  return { ...data, createdAt: new Date(data.createdAt), updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined };
}

export async function updateNews(id: number, payload: Partial<NewsItem>): Promise<NewsItem> {
  const res = await fetch(`/api/news/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Ошибка обновления новости');
  const data = await res.json();
  return { ...data, createdAt: new Date(data.createdAt), updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined };
}

export async function deleteNews(id: number): Promise<void> {
  const res = await fetch(`/api/news/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Ошибка удаления новости');
} 