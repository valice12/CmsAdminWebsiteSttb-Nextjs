// Authentication utilities with localStorage simulation

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
}

export interface SignInData {
  email: string;
  password: string;
}

const USERS_KEY = 'cms_users';
const CURRENT_USER_KEY = 'cms_current_user';

// Initialize with a super admin
export const initializeAuth = () => {
  const users = getUsers();
  if (users.length === 0) {
    const superAdmin: User = {
      id: '1',
      email: 'admin@university.ac.id',
      name: 'Super Admin',
      role: 'super_admin',
      status: 'approved',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([superAdmin]));
    // Store password separately (in real app, this would be hashed)
    localStorage.setItem('cms_passwords', JSON.stringify({ '1': 'admin123' }));
  }
};

export const getUsers = (): User[] => {
  const usersJson = localStorage.getItem(USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

export const getPasswords = (): Record<string, string> => {
  const passwordsJson = localStorage.getItem('cms_passwords');
  return passwordsJson ? JSON.parse(passwordsJson) : {};
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const savePasswords = (passwords: Record<string, string>) => {
  localStorage.setItem('cms_passwords', JSON.stringify(passwords));
};

export const signUp = (data: SignUpData): { success: boolean; message: string } => {
  const users = getUsers();
  const passwords = getPasswords();

  // Check if email already exists
  if (users.find(u => u.email === data.email)) {
    return { success: false, message: 'Email sudah terdaftar' };
  }

  // Create new user with pending status
  const newUser: User = {
    id: Date.now().toString(),
    email: data.email,
    name: data.name,
    role: 'admin',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  passwords[newUser.id] = data.password;

  saveUsers(users);
  savePasswords(passwords);

  return { success: true, message: 'Pendaftaran berhasil. Menunggu verifikasi admin.' };
};

export const signIn = (data: SignInData): { success: boolean; message: string; user?: User } => {
  const users = getUsers();
  const passwords = getPasswords();

  const user = users.find(u => u.email === data.email);

  if (!user) {
    return { success: false, message: 'Email tidak ditemukan' };
  }

  if (passwords[user.id] !== data.password) {
    return { success: false, message: 'Password salah' };
  }

  if (user.status === 'pending') {
    return { success: false, message: 'Akun Anda masih menunggu verifikasi admin' };
  }

  if (user.status === 'rejected') {
    return { success: false, message: 'Akun Anda ditolak oleh admin' };
  }

  // Save current user
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

  return { success: true, message: 'Login berhasil', user };
};

export const signOut = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

export const updateUserStatus = (userId: string, status: 'approved' | 'rejected'): boolean => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) return false;

  users[userIndex].status = status;
  saveUsers(users);

  return true;
};

export const deleteUser = (userId: string): boolean => {
  const users = getUsers();
  const passwords = getPasswords();

  const filteredUsers = users.filter(u => u.id !== userId);
  delete passwords[userId];

  saveUsers(filteredUsers);
  savePasswords(passwords);

  return true;
};
