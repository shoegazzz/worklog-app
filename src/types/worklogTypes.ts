export interface Worklog {
  id: number;
  date: Date;
  userId: number;
  startTime: string | null;
  endTime: string | null;
  breakMinutes?: number;
  isDayOff?: boolean;
  description?: string;
} 