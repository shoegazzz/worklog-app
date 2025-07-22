import type { User } from '../types/userTypes';

export const userMock: User = {
  id: 1,
  fullName: 'Иван Иванов',
  position: 'Frontend Developer',
  department: 'Разработка',
  email: 'ivan.ivanov@example.com',
  workStartDate: new Date('2021-03-15'),
  phone: '+7 999 123-45-67',
  avatarUrl: '',
  isAdmin: true,
}; 