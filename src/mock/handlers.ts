import { http, HttpResponse } from "msw";
import { userMock } from './user';
import { worklogs } from './worklogs';
import { news } from './news';
import type { Worklog } from '../types/worklogTypes';
import type { NewsItem } from '../types/newsTypes';

let currentUser = { ...userMock };
let currentWorklogs = [...worklogs];
let currentNews: NewsItem[] = [...news];

export const handlers = [
  // Мок ошибки
  // http.post("/api/login", async ({ request }) => {
  //   const { email, password } = await request.json() as { email: string; password: string };
  //   if (email === "test@example.com" && password === "password123") {
  //     return HttpResponse.json({ token: "mocked-jwt-token" });
  //   }
  //   return HttpResponse.json(
  //     { message: "Неверный email или пароль" },
  //     { status: 401 }
  //   );
  // }),

  // Новый мок для успешной авторизации
  http.post("/api/login", async ({ request }) => {
    const { email, password } = await request.json() as { email: string; password: string };
    
    // Проверяем, что поля не пустые
    if (!email || !password) {
      return HttpResponse.json(
        { message: "Email и пароль обязательны" },
        { status: 400 }
      );
    }

    // Всегда возвращаем успешную авторизацию
    return HttpResponse.json({ 
      token: "mocked-jwt-token-success",
      user: {
        id: 1,
        fullName: 'Иван Иванов',
        position: 'Frontend Developer',
        department: 'Разработка',
        email: 'ivan.ivanov@example.com',
        workStartDate: new Date('2021-03-15'),
        phone: '+7 999 123-45-67',
        avatarUrl: '',
        isAdmin: true,
      }
    });
  }),
  http.get('/api/user/:id', ({  }) => {
    return HttpResponse.json({ ...currentUser, workStartDate: currentUser.workStartDate.toISOString() }, { status: 200 });
  }),
  http.put('/api/user/:id', async ({ request }) => {
    const body = await request.json();
    const update = typeof body === 'object' && body !== null ? body : {};
    currentUser = Object.assign({}, currentUser, update);
    return HttpResponse.json({ ...currentUser, workStartDate: currentUser.workStartDate.toISOString() }, { status: 200 });
  }),
  http.get('/api/worklogs', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const updatedFrom = url.searchParams.get('updatedFrom');
    const updatedTo = url.searchParams.get('updatedTo');
    let filtered = currentWorklogs;
    if (userId) filtered = filtered.filter(w => w.userId === Number(userId));
    if (updatedFrom) filtered = filtered.filter(w => w.date >= new Date(updatedFrom));
    if (updatedTo) filtered = filtered.filter(w => w.date <= new Date(updatedTo));
    return HttpResponse.json(filtered);
  }),
  http.post('/api/worklogs', async ({ request }) => {
    const body = await request.json();
    if (typeof body !== 'object' || body === null) {
      return HttpResponse.json({ message: 'Некорректные данные' }, { status: 400 });
    }
    const newWorklog = {
      ...body,
      id: currentWorklogs.length ? Math.max(...currentWorklogs.map(w => w.id)) + 1 : 1,
      date: body.date ? new Date(body.date) : new Date(),
    };
    currentWorklogs.push(newWorklog);
    return HttpResponse.json(newWorklog);
  }),
  http.put('/api/worklogs/:id', async ({ params, request }) => {
    const id = Number(params.id);
    const body = await request.json();
    if (typeof body !== 'object' || body === null) {
      return HttpResponse.json({ message: 'Некорректные данные' }, { status: 400 });
    }
    let updated: Worklog | null = null;
    currentWorklogs = currentWorklogs.map(w => {
      if (w.id === id) {
        updated = { ...w, ...body, date: body.date ? new Date(body.date) : w.date } as Worklog;
        return updated;
      }
      return w;
    });
    if (updated) {
      return HttpResponse.json(updated);
    }
    return HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
  http.delete('/api/worklogs/:id', ({ params }) => {
    const id = Number(params.id);
    const idx = currentWorklogs.findIndex(w => w.id === id);
    if (idx !== -1) {
      currentWorklogs.splice(idx, 1);
      return HttpResponse.json({});
    }
    return HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
  // --- NEWS API ---
  http.get('/api/news', ({ request }) => {
    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    let filtered = currentNews;
    if (from) filtered = filtered.filter(n => n.createdAt >= new Date(from));
    if (to) filtered = filtered.filter(n => n.createdAt <= new Date(to));
    // Сортировка по дате (новые сверху)
    filtered = filtered.slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return HttpResponse.json(filtered);
  }),
  http.get('/api/news/:id', ({ params }) => {
    const id = Number(params.id);
    const item = currentNews.find(n => n.id === id);
    if (item) return HttpResponse.json(item);
    return HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
  http.post('/api/news', async ({ request }) => {
    const body = await request.json();
    if (typeof body !== 'object' || body === null) {
      return HttpResponse.json({ message: 'Некорректные данные' }, { status: 400 });
    }
    const newItem: NewsItem = {
      ...body,
      id: currentNews.length ? Math.max(...currentNews.map(n => n.id)) + 1 : 1,
      createdAt: new Date(),
    };
    currentNews.unshift(newItem);
    return HttpResponse.json(newItem);
  }),
  http.put('/api/news/:id', async ({ params, request }) => {
    const id = Number(params.id);
    const body = await request.json();
    let updated: NewsItem | null = null;
    currentNews = currentNews.map(n => {
      if (n.id === id) {
        updated = { ...n, ...body, updatedAt: new Date() };
        return updated;
      }
      return n;
    });
    if (updated) return HttpResponse.json(updated);
    return HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
  http.delete('/api/news/:id', ({ params }) => {
    const id = Number(params.id);
    const idx = currentNews.findIndex(n => n.id === id);
    if (idx !== -1) {
      currentNews.splice(idx, 1);
      return HttpResponse.json({});
    }
    return HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
  http.post('/api/upload-avatar', async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return HttpResponse.json({ message: 'Файл не загружен' }, { status: 400 });
    }

    // Притворимся, что загрузка успешна и возвращаем URL
    const fakeUrl = `/uploads/${file.name}`;
    currentUser.avatarUrl = fakeUrl;

    return HttpResponse.json({ avatarUrl: fakeUrl }, { status: 200 });
  }),
]; 