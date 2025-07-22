import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';

// Запуск MSW в режиме разработки
if (import.meta.env.MODE === "development") {
  import("./mock/browser").then(async ({ worker }) => {
    try {
      await worker.start();
      console.log("MSW worker started successfully");
    } catch (error) {
      console.error("Failed to start MSW worker:", error);
    }
  });
}

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
