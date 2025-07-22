import React from 'react';
import { List, Typography, DatePicker, Button } from 'antd';
import { observer } from 'mobx-react-lite';
import { newsUIStore } from '../stores/newsUIStore';
import type { NewsItem } from '../types/newsTypes';
import dayjs from 'dayjs';

interface NewsListProps {
  news: NewsItem[];
  isAdmin: boolean;
  onSelect: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const { RangePicker } = DatePicker;

const NewsList: React.FC<NewsListProps> = observer(({ news, isAdmin, onSelect, onEdit, onDelete }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <RangePicker
          value={newsUIStore.dateRange}
          onChange={range => newsUIStore.setDateRange(range as [dayjs.Dayjs, dayjs.Dayjs] | null)}
          format="DD.MM.YYYY"
        />
        {isAdmin && (
          <Button type="primary" onClick={() => newsUIStore.setFormOpen(true)}>
            Добавить новость
          </Button>
        )}
      </div>
      <List
        itemLayout="vertical"
        dataSource={news}
        renderItem={item => (
          <List.Item
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="cursor-pointer hover:bg-gray-50 rounded transition"
            actions={isAdmin ? [
              <Button size="small" onClick={e => { e.stopPropagation(); onEdit(item.id); }}>Редактировать</Button>,
              <Button size="small" danger onClick={e => { e.stopPropagation(); onDelete(item.id); }}>Удалить</Button>
            ] : undefined}
          >
            <List.Item.Meta
              title={<span className="font-semibold">{item.title}</span>}
              description={<span className="text-xs text-gray-500">{dayjs(item.createdAt).format('DD.MM.YYYY')} — {item.author}</span>}
            />
            <Typography.Paragraph ellipsis={{ rows: 2, expandable: false }}>
              {item.content}
            </Typography.Paragraph>
          </List.Item>
        )}
      />
    </div>
  );
});

export default NewsList; 