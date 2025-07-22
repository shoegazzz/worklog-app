export interface User {
  id: number;
  fullName: string;
  position: string;
  department: string;
  email: string;
  workStartDate: Date;
  phone?: string;
  avatarUrl?: string;
  isAdmin?: boolean;
}

export interface UpdateProfilePayload {
  fullName?: string;
  position?: string;
  department?: string;
  email?: string;
  phone?: string;
} 