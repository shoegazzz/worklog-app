import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Typography, message } from 'antd';
import { companyInfo } from '../data/companyInfo';
import { newsUIStore } from '../stores/newsUIStore';
import { userStore } from '../stores/userStore';
import { getNews, getNewsById, createNews, updateNews, deleteNews } from '../api/newsApi';
import NewsList from '../components/NewsList';
import NewsModal from '../components/NewsModal';
import NewsForm from '../components/NewsForm';
import type { NewsItem } from '../types/newsTypes';

const NewsPage: React.FC = observer(() => {
  const queryClient = useQueryClient();
  const isAdmin = !!userStore.user?.isAdmin;

  // Получение новостей с фильтрацией по дате
  const from = newsUIStore.dateRange?.[0]?.toISOString();
  const to = newsUIStore.dateRange?.[1]?.toISOString();
  const { data: news = [], isLoading, isError } = useQuery<NewsItem[]>({
    queryKey: ['news', from, to],
    queryFn: () => getNews({ from, to }),
  });

  // Получение выбранной новости
  const { data: selectedNews } = useQuery<NewsItem | null>({
    queryKey: newsUIStore.selectedNewsId ? ['news', newsUIStore.selectedNewsId] : [],
    queryFn: () => newsUIStore.selectedNewsId ? getNewsById(newsUIStore.selectedNewsId) : Promise.resolve(null),
    enabled: !!newsUIStore.selectedNewsId,
  });

  // Мутации для админа
  const createMutation = useMutation({
    mutationFn: createNews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      message.success('Новость добавлена');
      newsUIStore.setFormOpen(false);
    },
    onError: () => message.error('Ошибка при добавлении новости'),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: Partial<NewsItem> }) => updateNews(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      message.success('Новость обновлена');
      newsUIStore.setFormOpen(false);
    },
    onError: () => message.error('Ошибка при обновлении новости'),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteNews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      message.success('Новость удалена');
    },
    onError: () => message.error('Ошибка при удалении новости'),
  });

  // Обработчики
  const handleSelect = useCallback((id: number) => {
    newsUIStore.setSelectedNewsId(id);
    newsUIStore.setModalOpen(true);
  }, []);
  const handleModalClose = useCallback(() => {
    newsUIStore.setModalOpen(false);
    newsUIStore.setSelectedNewsId(null);
  }, []);
  const handleEdit = useCallback((id: number) => {
    newsUIStore.setFormOpen(true, id);
  }, []);
  const handleDelete = useCallback((id: number) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);
  const handleFormSubmit = useCallback((values: { title: string; content: string }) => {
    if (newsUIStore.editingNewsId) {
      updateMutation.mutate({ id: newsUIStore.editingNewsId, values });
    } else {
      createMutation.mutate({ ...values, author: userStore.user?.fullName || 'Админ' });
    }
  }, [createMutation, updateMutation]);
  const handleFormCancel = useCallback(() => {
    newsUIStore.setFormOpen(false);
  }, []);

  // Начальные значения для формы редактирования
  const editingNews = news.find(n => n.id === newsUIStore.editingNewsId);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow mt-8">
      <Card className="mb-8" title="О компании">
        <Typography.Title level={4}>{companyInfo.name}</Typography.Title>
        <Typography.Paragraph>{companyInfo.description}</Typography.Paragraph>
        <div className="mb-2"><b>Юридический адрес:</b> {companyInfo.legalAddress}</div>
        <div className="mb-2"><b>Фактический адрес:</b> {companyInfo.actualAddress}</div>
        <div className="mb-2"><b>Телефон:</b> {companyInfo.phone}</div>
        <div className="mb-2"><b>Email:</b> {companyInfo.email}</div>
      </Card>
      <Card title="Новости" loading={isLoading}>
        {isError ? (
          <Typography.Text type="danger">Ошибка загрузки новостей</Typography.Text>
        ) : (
          <NewsList
            news={news}
            isAdmin={isAdmin}
            onSelect={handleSelect}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </Card>
      <NewsModal
        news={selectedNews || null}
        open={newsUIStore.isModalOpen}
        onClose={handleModalClose}
      />
      {isAdmin && (
        <NewsForm
          open={newsUIStore.isFormOpen}
          onCancel={handleFormCancel}
          onSubmit={handleFormSubmit}
          initialValues={editingNews}
        />
      )}
    </div>
  );
});

export default NewsPage; 