// stores/auth.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Role = 'student' | 'admin';

type AuthStore = {
  isLoggedIn: boolean;
  role: Role | null;
  token: string | null;
  first_name: string | null;
  studentId: String | null;
  refreshFlag: number;

  login: (role: Role, token: string, first_name: string,studentId: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreAuth: () => Promise<void>;
  triggerRefresh:()=>void;
};

export const useAuth = create<AuthStore>((set) => ({
  isLoggedIn: false,
  role: null,
  token: null,
  first_name: null,
  studentId:null,
  refreshFlag:0,
  
  triggerRefresh: () => set((state) => ({ refreshFlag: state.refreshFlag + 1 })),

  login: async (role, token, first_name,studentId) => {
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('auth_role', role);
    await AsyncStorage.setItem('first_name', first_name);
    await AsyncStorage.setItem('studentId', String(studentId));
    set({ isLoggedIn: true, role, token, first_name, studentId });
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_role');
    await AsyncStorage.removeItem('first_name');
    await AsyncStorage.removeItem('studentId');
    set({ isLoggedIn: false, role: null, token: null, first_name: null,studentId:null });
  },

  restoreAuth: async () => {
    const token = await AsyncStorage.getItem('auth_token');
    const role = (await AsyncStorage.getItem('auth_role')) as Role | null;
    const first_name = await AsyncStorage.getItem('first_name');
    if (token && role && first_name) {
      set({ isLoggedIn: true, role, token, first_name });
    }
  },
}));
