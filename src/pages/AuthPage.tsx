import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { Form, Input, Button, Alert } from "antd";
import { userStore } from "../stores/userStore";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthPage: React.FC = observer(() => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post("/api/login", values);
      const { token, user } = res.data;
      
      // Сохраняем токен и пользователя в store
      userStore.login(token, user);
      
      // Перенаправляем на страницу профиля
      navigate("/profile");
    } catch (e: any) {
      setError(e.response?.data?.message || "Ошибка авторизации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Вход</h2>
        <Form
          name="auth"
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Введите email" },
              { type: "email", message: "Введите корректный email" }
            ]}
          >
            <Input type="email" placeholder="Email" autoComplete="email" />
          </Form.Item>
          <Form.Item
            label="Пароль"
            name="password"
            rules={[
              { required: true, message: "Введите пароль" },
              { 
                pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
                message: "Пароль должен содержать минимум 8 символов, включая буквы и цифры"
              }
            ]}
          >
            <Input.Password placeholder="Пароль" autoComplete="current-password" />
          </Form.Item>
          {error && <Alert message={error} type="error" showIcon className="mb-4" />}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full"
            >
              Войти
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
});

export default AuthPage; 