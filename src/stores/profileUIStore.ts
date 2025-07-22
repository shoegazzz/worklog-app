import { makeAutoObservable } from 'mobx';

class ProfileUIStore {
  isEditMode = false;

  constructor() {
    makeAutoObservable(this);
  }

  setEditMode(val: boolean) {
    this.isEditMode = val;
  }

  reset() {
    this.isEditMode = false;
  }
}

export const profileUIStore = new ProfileUIStore(); 