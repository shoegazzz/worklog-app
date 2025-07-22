import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import AuthPage from "./pages/AuthPage";
import WorklogsPage from "./pages/WorklogsPage";
import ProfilePage from "./pages/ProfilePage";
import NewsPage from "./pages/NewsPage";
import TimeTrackingPage from "./pages/TimeTrackingPage";
import Header from "./components/Header";
import { userStore } from "./stores/userStore";

const AppContent = observer(() => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/";

  // Если пользователь авторизован и пытается зайти на страницу входа
  if (isAuthPage && userStore.isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  // Если пользователь не авторизован и пытается зайти на защищенные страницы
  if (!isAuthPage && !userStore.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      {!isAuthPage && <Header />}
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/worklogs" element={<WorklogsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/timetracking" element={<TimeTrackingPage />} />
      </Routes>
    </>
  );
});

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
