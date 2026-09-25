import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const SESSION_STORAGE_KEY = 'arka-session';

interface SessionState {
  userId: string | null;
  setUserId: (userId: string | null) => void;
}

export const useSessionStore = create<SessionState>()(persist(
  set => ({ userId: null, setUserId: userId => set({ userId }) }),
  { name: SESSION_STORAGE_KEY, partialize: state => ({ userId: state.userId }) },
));
