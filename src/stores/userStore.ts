import { makeAutoObservable } from "mobx";
import type { User } from "../types/userTypes";

class UserStore {
  token: string | null = null;
  user: User | null = null;
  isAuthenticated = false;

  constructor() {
    makeAutoObservable(this);
    this.loadFromStorage();
  }

  setToken(token: string) {
    this.token = token;
    this.isAuthenticated = true;
    localStorage.setItem('authToken', token);
  }

  setUser(user: User) {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  login(token: string, user: User) {
    this.setToken(token);
    this.setUser(user);
  }

  logout() {
    this.token = null;
    this.user = null;
    this.isAuthenticated = false;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  private loadFromStorage() {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    
    if (token) {
      this.token = token;
      this.isAuthenticated = true;
    }
    
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        localStorage.removeItem('user');
      }
    }
  }
}

export const userStore = new UserStore(); 