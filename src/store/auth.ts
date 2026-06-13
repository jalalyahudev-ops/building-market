import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export type UserRole = 'buyer' | 'seller' | 'admin';

export interface AppUser {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  createdAt: string;
}

interface AuthState {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  setUser: (user: AppUser | null, firebaseUser: FirebaseUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  fetchProfile: (uid: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  firebaseUser: null,
  loading: true,
  setUser: (user, firebaseUser) => set({ user, firebaseUser, loading: false }),
  setLoading: (loading) => set({ loading }),
  logout: () => set({ user: null, firebaseUser: null, loading: false }),
  fetchProfile: async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as Omit<AppUser, 'id'>;
        
        // Автоматически дать права админа владельцу
        const fbUser = get().firebaseUser;
        if (fbUser && fbUser.email === 'jalalyahudev@gmail.com' && data.role !== 'admin') {
          try {
            await setDoc(docRef, { role: 'admin' }, { merge: true });
            data.role = 'admin';
          } catch (err) {
            console.error("Could not upgrade to admin role:", err);
          }
        }
        
        set({ user: { id: docSnap.id, ...data } });
      } else {
        set({ user: null });
      }
    } catch (e) {
      console.error("Error fetching profile", e);
    }
  }
}));
