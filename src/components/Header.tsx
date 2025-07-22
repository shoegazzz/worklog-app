import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { Layout, Menu, Button, Avatar, Modal } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { userStore } from "../stores/userStore";

const { Header: AntHeader } = Layout;

const Header: React.FC = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogout = () => {
    userStore.logout();
    navigate("/");
    setLogoutModalVisible(false);
  };

  const showLogoutModal = () => {
    setLogoutModalVisible(true);
  };

  const menuItems = [
    {
      key: "/profile",
      label: "Профиль",
      onClick: () => navigate("/profile"),
    },
    {
      key: "/timetracking",
      label: "Учёт времени",
      onClick: () => navigate("/timetracking"),
    },
    {
      key: "/worklogs",
      label: "График смен",
      onClick: () => navigate("/worklogs"),
    },
    {
      key: "/news",
      label: "Организация",
      onClick: () => navigate("/news"),
    },
  ];

  return (
    <>
      <AntHeader className="bg-white shadow-md px-4 lg:px-8 flex items-center justify-between h-16">
        {/* Логотип */}
        <div className="flex items-center">
          <div className="bg-blue-600 text-white font-bold text-xl px-3 py-1 rounded-lg mr-8">
            IT
          </div>
        </div>

        {/* Навигация */}
        <div className="flex-1">
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className="border-none bg-transparent justify-center"
          />
        </div>

        {/* Пользовательский блок */}
        <div className="flex items-center space-x-3">
          {/* Аватар + имя пользователя */}
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors"
            onClick={() => navigate("/profile")}
          >
            <Avatar 
              icon={<UserOutlined />} 
              className="bg-blue-600"
            />
            {userStore.user?.fullName && <span className="text-gray-700 hidden md:inline-block">
              {userStore.user?.fullName}
            </span>}
          </div>
          
          {/* Кнопка выхода */}
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={showLogoutModal}
            className="hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-opacity-50"
            title="Выйти"
          />
        </div>
      </AntHeader>

      {/* Модалка подтверждения выхода */}
      <Modal
        title="Подтверждение выхода"
        open={logoutModalVisible}
        onOk={handleLogout}
        onCancel={() => setLogoutModalVisible(false)}
        okText="Выйти"
        cancelText="Отмена"
        okButtonProps={{ danger: true }}
      >
        <p>Вы действительно хотите выйти из системы?</p>
      </Modal>
    </>
  );
});

export default Header; 