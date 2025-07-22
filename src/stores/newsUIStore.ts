import { makeAutoObservable } from 'mobx';
import { Dayjs } from 'dayjs';

class NewsUIStore {
  dateRange: [Dayjs, Dayjs] | null = null;
  selectedNewsId: number | null = null;
  isModalOpen = false;
  isFormOpen = false;
  editingNewsId: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setDateRange(range: [Dayjs, Dayjs] | null) {
    this.dateRange = range;
  }

  setSelectedNewsId(id: number | null) {
    this.selectedNewsId = id;
  }

  setModalOpen(val: boolean) {
    this.isModalOpen = val;
  }

  setFormOpen(val: boolean, editingId: number | null = null) {
    this.isFormOpen = val;
    this.editingNewsId = editingId;
  }
}

export const newsUIStore = new NewsUIStore(); 