import React from 'react';
import { Modal, Typography } from 'antd';
import type { NewsItem } from '../types/newsTypes';
import dayjs from 'dayjs';

interface NewsModalProps {
  news: NewsItem | null;
  open: boolean;
  onClose: () => void;
}

const NewsModal: React.FC<NewsModalProps> = ({ news, open, onClose }) => {
  return (
    <Modal open={open} onCancel={onClose} onOk={onClose} footer={null} title={news?.title}>
      {news && (
        <>
          <div className="mb-2 text-xs text-gray-500">
            {dayjs(news.createdAt).format('DD.MM.YYYY HH:mm')} — {news.author}
          </div>
          <Typography.Paragraph>{news.content}</Typography.Paragraph>
        </>
      )}
    </Modal>
  );
};

export default NewsModal; 