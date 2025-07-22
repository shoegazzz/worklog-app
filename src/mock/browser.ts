import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

// Настройки для development
worker.events.on('request:start', ({ request }) => {
  console.log('MSW intercepted:', request.method, request.url);
}); 