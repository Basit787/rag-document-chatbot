import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface UserStore {
  accessToken: string | null;
  isAuthenticated: boolean;

  setUser: (data: { accessToken: string }) => void;

  clearUser: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      accessToken: null,
      isAuthenticated: false,

      setUser: ({ accessToken }) =>
        set({
          accessToken,
          isAuthenticated: true,
        }),

      clearUser: () =>
        set({
          accessToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
