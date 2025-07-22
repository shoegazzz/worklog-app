import React, { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Form, Input, DatePicker, TimePicker, InputNumber, Checkbox, message, Progress, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import { getWorklogsByUser, createWorklog, updateWorklog, deleteWorklog } from '../api/worklogApi';
import type { Worklog } from '../types/worklogTypes';
import { timeTrackingUIStore } from '../stores/timeTrackingUIStore';
import { userStore } from '../stores/userStore';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const TimeTrackingPage: React.FC = observer(() => {
  const userId = userStore.user?.id;
  const queryClient = useQueryClient();
  const [filterDates, setFilterDates] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [form] = Form.useForm<Partial<Worklog>>();
  const [isDayOff, setIsDayOff] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Получение смен пользователя
  const { data: worklogs = [], isLoading } = useQuery<Worklog[]>({
    queryKey: ['worklogs', userId, filterDates?.[0]?.toISOString(), filterDates?.[1]?.toISOString()],
    queryFn: () => userId ? getWorklogsByUser(userId, filterDates?.[0]?.toISOString()) : Promise.resolve([]),
    enabled: !!userId,
  });

  // Мутации
  const createMutation = useMutation({
    mutationFn: createWorklog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worklogs', userId] });
      message.success('Смена добавлена');
      timeTrackingUIStore.setEditing(null);
    },
    onError: () => message.error('Ошибка при добавлении смены'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Worklog> }) => updateWorklog(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worklogs', userId] });
      message.success('Смена обновлена');
      timeTrackingUIStore.setEditing(null);
    },
    onError: () => message.error('Ошибка при обновлении смены'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWorklog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worklogs', userId] });
      message.success('Смена удалена');
      setDeleteId(null);
    },
    onError: () => message.error('Ошибка при удалении смены'),
  });

  // Старт/стоп рабочего дня
  const handleStartDay = () => {
    if (!userId) return;
    createMutation.mutate({
      userId,
      date: new Date(),
      startTime: dayjs().format('HH:mm'),
      endTime: null,
      breakMinutes: 0,
      isDayOff: false,
      description: '',
    });
    timeTrackingUIStore.setLogging(true);
  };

  const handleEndDay = () => {
    if (!userId) return;
    // Находим последнюю незавершённую смену
    const last = worklogs.find(w => w.userId === userId && w.endTime === null);
    if (!last) return message.error('Нет активной смены');
    updateMutation.mutate({ id: last.id, payload: { endTime: dayjs().format('HH:mm') } });
    timeTrackingUIStore.setLogging(false);
  };

  // --- Сброс времени при выборе выходного ---
  const handleIsDayOffChange = (checked: boolean) => {
    setIsDayOff(checked);
    if (checked) {
      form.setFieldsValue({ startTime: null, endTime: null });
    }
  };

  // --- Сброс состояния при открытии формы редактирования ---
  const handleEdit = (worklog: Worklog) => {
    form.setFieldsValue({
      ...worklog,
      date: dayjs(worklog.date),
      startTime: worklog.startTime ? dayjs(worklog.startTime, 'HH:mm') : null,
      endTime: worklog.endTime ? dayjs(worklog.endTime, 'HH:mm') : null,
    });
    setIsDayOff(!!worklog.isDayOff);
    timeTrackingUIStore.setEditing(worklog.id);
  };

  // --- Сброс состояния при открытии новой формы ---
  const handleNew = () => {
    form.resetFields();
    setIsDayOff(false);
    timeTrackingUIStore.setEditing(0);
  };

  const handleFormFinish = (values: any) => {
    const payload = {
      ...values,
      date: values.date.toDate(),
      startTime: values.startTime ? (typeof values.startTime === 'string' ? values.startTime : values.startTime.format('HH:mm')) : null,
      endTime: values.endTime ? (typeof values.endTime === 'string' ? values.endTime : values.endTime.format('HH:mm')) : null,
    };
    if (timeTrackingUIStore.editingWorklogId) {
      updateMutation.mutate({ id: timeTrackingUIStore.editingWorklogId, payload });
    } else {
      createMutation.mutate({ ...payload, userId });
    }
    form.resetFields();
  };

  // Статистика
  const stats = useMemo(() => {
    let totalMinutes = 0;
    worklogs.forEach(w => {
      if (w.startTime && w.endTime) {
        const start = dayjs(w.date).hour(Number(w.startTime.split(':')[0])).minute(Number(w.startTime.split(':')[1]));
        const end = dayjs(w.date).hour(Number(w.endTime.split(':')[0])).minute(Number(w.endTime.split(':')[1]));
        let diff = end.diff(start, 'minute') - (w.breakMinutes || 0);
        if (diff > 0) totalMinutes += diff;
      }
    });
    return {
      totalMinutes,
      totalHours: (totalMinutes / 60).toFixed(1),
      percent: Math.min(100, Math.round((totalMinutes / (40 * 60)) * 100)), // 40 часов в неделе
    };
  }, [worklogs]);

  // Колонки таблицы
  const columns = [
    {
      title: 'Дата',
      dataIndex: 'date',
      render: (date: Date) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Начало',
      dataIndex: 'startTime',
    },
    {
      title: 'Окончание',
      dataIndex: 'endTime',
    },
    {
      title: 'Перерыв (мин)',
      dataIndex: 'breakMinutes',
    },
    {
      title: 'Описание',
      dataIndex: 'description',
    },
    {
      title: 'Выходной',
      dataIndex: 'isDayOff',
      render: (val: boolean) => val ? 'Да' : '',
    },
    {
      title: '',
      dataIndex: 'actions',
      render: (_: any, record: Worklog) => (
        <>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} className="mr-2" />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => setDeleteId(record.id)} />
        </>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow mt-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex gap-2">
          {!timeTrackingUIStore.isLogging ? (
            <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleStartDay}>
              Начать рабочий день
            </Button>
          ) : (
            <Button type="primary" danger icon={<StopOutlined />} onClick={handleEndDay}>
              Завершить рабочий день
            </Button>
          )}
          <Button icon={<PlusOutlined />} onClick={handleNew}>
            Новая запись
          </Button>
        </div>
        <div>
          <RangePicker
            value={filterDates}
            onChange={(dates) => setFilterDates(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null] | null)}
            format="DD.MM.YYYY"
            className="mr-2"
          />
        </div>
        <div className="flex flex-col items-end">
          <div className="mb-1 text-gray-500 text-xs">Отработано за неделю</div>
          <Progress percent={stats.percent} showInfo format={() => `${stats.totalHours} ч`} />
        </div>
      </div>
      <Table
        dataSource={worklogs}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        className="mb-8"
      />
      <Modal
        title={timeTrackingUIStore.editingWorklogId ? 'Редактировать смену' : 'Новая смена'}
        open={!!timeTrackingUIStore.editingWorklogId || timeTrackingUIStore.editingWorklogId === 0}
        onCancel={() => { timeTrackingUIStore.setEditing(null); setIsDayOff(false); }}
        onOk={() => form.submit()}
        okText="Сохранить"
        cancelText="Отмена"
        confirmLoading={createMutation.status === 'pending' || updateMutation.status === 'pending'}
      >
        <Form form={form} layout="vertical" onFinish={handleFormFinish}>
          <Form.Item name="date" label="Дата" rules={[{ required: true, message: 'Укажите дату' }]}> 
            <DatePicker format="DD.MM.YYYY" className="w-full" />
          </Form.Item>
          <Form.Item name="startTime" label="Начало рабочего дня">
            <TimePicker format="HH:mm" className="w-full" disabled={isDayOff} />
          </Form.Item>
          <Form.Item name="endTime" label="Окончание рабочего дня">
            <TimePicker format="HH:mm" className="w-full" disabled={isDayOff} />
          </Form.Item>
          <Form.Item name="breakMinutes" label="Перерыв (мин)">
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name="isDayOff" valuePropName="checked">
            <Checkbox checked={isDayOff} onChange={e => handleIsDayOffChange(e.target.checked)}>Выходной</Checkbox>
          </Form.Item>
          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={deleteId !== null}
        onOk={() => {
          if (deleteId !== null) {
            deleteMutation.mutate(deleteId);
            setDeleteId(null);
          }
        }}
        onCancel={() => setDeleteId(null)}
        okText="Удалить"
        cancelText="Отмена"
        okButtonProps={{ danger: true }}
      >
        <p>Удалить смену?</p>
      </Modal>
    </div>
  );
});

export default TimeTrackingPage; 