import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Badge, Select, DatePicker, Spin, Empty, Table } from 'antd';
import { worklogStore } from '../stores/worklogStore';
import { userStore } from '../stores/userStore';
import { getWorklogsByUser, getAllWorklogs } from '../api/worklogApi';
import type { Worklog } from '../types/worklogTypes';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

// Добавляем в worklogStore выбранную дату
worklogStore.selectedDate = null;
worklogStore.setSelectedDate = function(date) { this.selectedDate = date; };

const WorklogsPage: React.FC = observer(() => {
  const users = userStore.user ? [userStore.user] : [];
  const updatedFrom = worklogStore.dateRange?.[0]?.toISOString();
  const updatedTo = worklogStore.dateRange?.[1]?.toISOString();

  // Получаем смены по фильтрам
  const { data: worklogs = [], isLoading } = useQuery<Worklog[]>({
    queryKey: [
      'worklogs',
      worklogStore.selectedUserId,
      updatedFrom,
      updatedTo
    ],
    queryFn: () => {
      if (worklogStore.selectedUserId) {
        return getWorklogsByUser(worklogStore.selectedUserId, updatedFrom, updatedTo);
      } else {
        return getAllWorklogs({ updatedFrom, updatedTo });
      }
    },
    enabled: true,
  });

  // Группируем смены по дате
  const worklogsByDate = useMemo(() => {
    const map: Record<string, Worklog[]> = {};
    worklogs.forEach(w => {
      const key = dayjs(w.date).format('YYYY-MM-DD');
      if (!map[key]) map[key] = [];
      map[key].push(w);
    });
    return map;
  }, [worklogs]);

  // Смены за выбранный день
  const details = worklogStore.selectedDate ? worklogsByDate[worklogStore.selectedDate.format('YYYY-MM-DD')] || [] : [];

  // Рендер ячейки календаря
  const cellRender = (value: Dayjs) => {
    const key = value.format('YYYY-MM-DD');
    const logs = worklogsByDate[key] || [];
    if (!logs.length) return null;
    return (
      <ul className="m-0 p-0 list-none">
        {logs.map(log => (
          <li key={log.id} className="mb-1">
            <Badge
              status={log.isDayOff ? 'error' : 'success'}
              text={
                <span>
                  <b>{userStore.user?.fullName}</b>{' '}
                  {log.isDayOff
                    ? 'Выходной'
                    : `${log.startTime ?? '❓'} - ${log.endTime ?? '❓'}`}
                  <br/>
                  <span className="text-xs text-gray-500">{log.description}</span>
                </span>
              }
            />
          </li>
        ))}
      </ul>
    );
  };

  // Выбранная дата для подробностей
  const selectedDate = worklogStore.selectedDate;
  const setSelectedDate = (date: Dayjs | null) => worklogStore.setSelectedDate(date);

  // Колонки для подробной таблицы
  const columns = [
    { title: 'Сотрудник', dataIndex: 'userId', render: (id: number) => userStore.user?.fullName || id },
    { title: 'Начало', dataIndex: 'startTime', render: (v: string | null) => v ?? '❓' },
    { title: 'Окончание', dataIndex: 'endTime', render: (v: string | null) => v ?? '❓' },
    { title: 'Перерыв (мин)', dataIndex: 'breakMinutes' },
    { title: 'Выходной', dataIndex: 'isDayOff', render: (v: boolean) => v ? 'Да' : '' },
    { title: 'Описание', dataIndex: 'description' },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow mt-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <Select
          allowClear
          placeholder="Сотрудник"
          value={worklogStore.selectedUserId ?? undefined}
          onChange={val => worklogStore.setUserId(val ?? null)}
          style={{ minWidth: 200 }}
          options={users.map(u => ({ value: u.id, label: u.fullName }))}
        />
        <RangePicker
          value={worklogStore.dateRange}
          onChange={range => worklogStore.setDateRange(range as [Dayjs, Dayjs] | null)}
          format="DD.MM.YYYY"
        />
      </div>
      {isLoading ? (
        <Spin className="block mx-auto my-8" />
      ) : (
        <Calendar
            cellRender={cellRender}
          fullscreen={true}
          className="bg-white rounded-lg"
          onSelect={setSelectedDate}
        />
      )}
      {!isLoading && !worklogs.length && <Empty description="Нет данных для выбранных фильтров" className="mt-8" />}
      {selectedDate && details.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Подробности за {selectedDate.format('DD.MM.YYYY')}</h3>
          <Table
            dataSource={details}
            columns={columns}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </div>
      )}
    </div>
  );
});

export default WorklogsPage; 