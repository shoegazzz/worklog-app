import { makeAutoObservable } from 'mobx';

class TimeTrackingUIStore {
  isLogging = false;
  editingWorklogId: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setLogging(value: boolean) {
    this.isLogging = value;
  }

  setEditing(id: number | null) {
    this.editingWorklogId = id;
  }
}

export const timeTrackingUIStore = new TimeTrackingUIStore(); 