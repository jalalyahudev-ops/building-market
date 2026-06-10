/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { useAuthStore } from './store/auth';
import { Layout } from './components/Layout';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import Cart from './pages/Cart';

function AuthObserver({ children }: { children: React.ReactNode }) {
  const loading = useAuthStore((state: any) => state.loading);
  const setLoading = useAuthStore((state: any) => state.setLoading);
  const fetchProfile = useAuthStore((state: any) => state.fetchProfile);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Automatically fetch or create profile
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            await fetchProfile(firebaseUser.uid);
          }
        } catch (e) {
          console.error("Error setting up user profile", e);
        }
        useAuthStore.setState({ firebaseUser });
      } else {
        useAuthStore.setState({ user: null, firebaseUser: null });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchProfile, setLoading]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-brand-blue-500 font-medium">Загрузка...</div>;
  }

  return <>{children}</>;
}


export default function App() {
  return (
    <BrowserRouter>
      <AuthObserver>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="cart" element={<Cart />} />
          </Route>
        </Routes>
      </AuthObserver>
    </BrowserRouter>
  );
}
