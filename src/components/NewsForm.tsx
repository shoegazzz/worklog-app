import React, { useEffect } from 'react';
import { Modal, Form, Input } from 'antd';
import type { NewsItem } from '../types/newsTypes';

interface NewsFormProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: { title: string; content: string }) => void;
  initialValues?: Partial<NewsItem>;
}

const NewsForm: React.FC<NewsFormProps> = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues || {});
    }
  }, [open, initialValues, form]);

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      title={initialValues?.id ? 'Редактировать новость' : 'Добавить новость'}
      okText="Сохранить"
      cancelText="Отмена"
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item name="title" label="Заголовок" rules={[{ required: true, message: 'Введите заголовок' }]}> 
          <Input />
        </Form.Item>
        <Form.Item name="content" label="Текст новости" rules={[{ required: true, message: 'Введите текст' }]}> 
          <Input.TextArea rows={6} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NewsForm; 