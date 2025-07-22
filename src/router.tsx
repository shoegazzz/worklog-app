import { Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import WorklogsPage from "./pages/WorklogsPage";
import TimeTrackingPage from "./pages/TimeTrackingPage";
import ProfilePage from "./pages/ProfilePage";
import NewsPage from "./pages/NewsPage";

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<AuthPage />} />
    <Route path="/worklogs" element={<WorklogsPage />} />
    <Route path="/timetracking" element={<TimeTrackingPage />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/news" element={<NewsPage />} />
  </Routes>
);

export default AppRouter; 