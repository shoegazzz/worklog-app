import { makeAutoObservable } from 'mobx';
import dayjs, { Dayjs } from 'dayjs';

class WorklogStore {
  selectedUserId: number | null = null;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs] | null = null;
  selectedDate: Dayjs | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setUserId(id: number | null) {
    this.selectedUserId = id;
  }

  setDateRange(range: [dayjs.Dayjs, dayjs.Dayjs] | null) {
    this.dateRange = range;
  }

  setSelectedDate(date: Dayjs | null) {
    this.selectedDate = date;
  }
}

export const worklogStore = new WorklogStore(); 