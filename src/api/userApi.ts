import type { User, UpdateProfilePayload } from '../types/userTypes';

export async function getUser(id: number): Promise<User> {
  const res = await fetch(`/api/user/${id}`);
  if (!res.ok) throw new Error('Ошибка загрузки профиля');
  const data = await res.json();
  // workStartDate может прийти строкой, преобразуем в Date
  return { ...data, workStartDate: new Date(data.workStartDate) };
}

export async function updateUser(id: number, payload: UpdateProfilePayload): Promise<User> {
  const res = await fetch(`/api/user/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Ошибка обновления профиля');
  const data = await res.json();
  return { ...data, workStartDate: new Date(data.workStartDate) };
} 