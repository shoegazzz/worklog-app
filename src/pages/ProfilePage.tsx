import React from 'react';
import { observer } from 'mobx-react-lite';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Avatar, Input, Form, message } from 'antd';
import { getUser, updateUser } from '../api/userApi';
import type { User, UpdateProfilePayload } from '../types/userTypes';
import { profileUIStore } from '../stores/profileUIStore';

const USER_ID = 1; // временно, в реальном приложении брать из auth

const ProfilePage: React.FC = observer(() => {
  const queryClient = useQueryClient();
  const { data: user, isLoading, isError } = useQuery<User>({
    queryKey: ['user', USER_ID],
    queryFn: () => getUser(USER_ID),
  });

  const [form] = Form.useForm<UpdateProfilePayload>();
  const mutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateUser(USER_ID, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['user', USER_ID]);
      profileUIStore.setEditMode(false);
      message.success('Профиль обновлён');
    },
    onError: () => message.error('Ошибка при обновлении профиля'),
  });

  if (isLoading) return <div className="p-8">Загрузка...</div>;
  if (isError || !user) return <div className="p-8 text-red-500">Ошибка загрузки профиля</div>;

  const handleEdit = () => {
    form.setFieldsValue({
      fullName: user.fullName,
      position: user.position,
      department: user.department,
      email: user.email,
      phone: user.phone,
    });
    profileUIStore.setEditMode(true);
  };

  const handleCancel = () => {
    profileUIStore.reset();
    form.resetFields();
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      mutation.mutate(values);
    } catch {}
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow mt-8">
      <div className="flex items-center gap-6 mb-6">
        <Avatar size={80} src={user.avatarUrl} className="bg-blue-600 text-3xl">
          {user.fullName[0]}
        </Avatar>
        <div>
          <div className="text-2xl font-bold mb-1">{user.fullName}</div>
          <div className="text-gray-600">{user.position} — {user.department}</div>
          <div className="text-gray-500 text-sm mt-1">Работает с {new Date(user.workStartDate).toLocaleDateString()}</div>
        </div>
        <div className="ml-auto">
          <Button type="primary" onClick={handleEdit}>Редактировать</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <div className="text-gray-500 text-xs">Email</div>
          <div className="text-base">{user.email}</div>
        </div>
        <div>
          <div className="text-gray-500 text-xs">Телефон</div>
          <div className="text-base">{user.phone || <span className="text-gray-400">—</span>}</div>
        </div>
      </div>
      <div className="mb-8">
        <div className="font-semibold mb-2">Активность</div>
        <div className="bg-gray-50 rounded p-4 text-gray-600 text-sm">
          <div>Запланированные отпуска: <span className="font-medium">нет данных</span></div>
          <div>Часы работы за месяц: <span className="font-medium">160</span></div>
        </div>
      </div>
      <Modal
        title="Редактировать профиль"
        open={profileUIStore.isEditMode}
        onCancel={handleCancel}
        onOk={handleSave}
        okText="Сохранить"
        cancelText="Отмена"
        confirmLoading={mutation.isLoading}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="fullName" label="ФИО" rules={[{ required: true, message: 'Введите ФИО' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="position" label="Должность" rules={[{ required: true, message: 'Введите должность' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="department" label="Отдел" rules={[{ required: true, message: 'Введите отдел' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Введите корректный email' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Телефон"> 
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
});

export default ProfilePage; 