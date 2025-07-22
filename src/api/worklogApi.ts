import type { Worklog } from '../types/worklogTypes';

export async function getAllWorklogs(params?: { updatedFrom?: string, updatedTo?: string }): Promise<Worklog[]> {
  let url = '/api/worklogs';
  const query: string[] = [];
  if (params?.updatedFrom) query.push(`updatedFrom=${encodeURIComponent(params.updatedFrom)}`);
  if (params?.updatedTo) query.push(`updatedTo=${encodeURIComponent(params.updatedTo)}`);
  if (query.length) url += '?' + query.join('&');
  const res = await fetch(url);
  if (!res.ok) throw new Error('Ошибка загрузки смен');
  const data = await res.json();
  return data.map((w: any) => ({ ...w, date: new Date(w.date) }));
}

export async function getWorklogsByUser(userId: number, updatedFrom?: string, updatedTo?: string): Promise<Worklog[]> {
  let url = `/api/worklogs?userId=${userId}`;
  if (updatedFrom) url += `&updatedFrom=${encodeURIComponent(updatedFrom)}`;
  if (updatedTo) url += `&updatedTo=${encodeURIComponent(updatedTo)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Ошибка загрузки смен пользователя');
  const data = await res.json();
  return data.map((w: any) => ({ ...w, date: new Date(w.date) }));
}

export async function createWorklog(payload: Omit<Worklog, 'id'>): Promise<Worklog> {
  const res = await fetch('/api/worklogs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Ошибка создания смены');
  const data = await res.json();
  return { ...data, date: new Date(data.date) };
}

export async function updateWorklog(id: number, payload: Partial<Worklog>): Promise<Worklog> {
  const res = await fetch(`/api/worklogs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Ошибка обновления смены');
  const data = await res.json();
  return { ...data, date: new Date(data.date) };
}

export async function deleteWorklog(id: number): Promise<void> {
  const res = await fetch(`/api/worklogs/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Ошибка удаления смены');
} 