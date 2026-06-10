import { useState } from 'react';
import { useAuthStore } from '../store/auth';
import { Navigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Briefcase, ShoppingBag } from 'lucide-react';

export default function Login() {
  const { firebaseUser, user, fetchProfile } = useAuthStore() as any;
  const [loading, setLoading] = useState(false);
  const [creatingProfile, setCreatingProfile] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleRoleSelect = async (role: 'buyer' | 'seller') => {
    if (!firebaseUser) return;
    setCreatingProfile(true);
    try {
      const newUser: any = {
        role,
        displayName: firebaseUser.displayName || 'Пользователь',
        createdAt: new Date().toISOString()
      };
      if (firebaseUser.photoURL) newUser.photoURL = firebaseUser.photoURL;
      
      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      await fetchProfile(firebaseUser.uid);
    } catch (e: any) {
      console.error(e);
      alert('Ошибка при создании профиля: ' + e.message);
    } finally {
      setCreatingProfile(false);
    }
  };

  // If authenticated but no profile, ask for role
  if (firebaseUser && !user) {
    if (firebaseUser.email === 'jalalyahudev@gmail.com' && !creatingProfile) {
      handleRoleSelect('admin' as any);
      return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-brand-blue-500 font-medium">Создание кабинета администратора...</div>;
    }
    return (
      <div className="flex justify-center items-center py-20 px-4">
        <Card className="w-full max-w-2xl border-slate-200">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-black text-slate-800">Кем вы являетесь?</CardTitle>
            <CardDescription className="text-base text-slate-500 mt-2">
              Выберите тип аккаунта, чтобы продолжить использование платформы.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div 
                onClick={() => !creatingProfile && handleRoleSelect('buyer')}
                className={`bg-white border-2 border-slate-200 p-8 rounded-2xl cursor-pointer transition-all hover:border-brand-blue-500 hover:shadow-lg flex flex-col items-center text-center group ${creatingProfile ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="w-20 h-20 bg-brand-blue-50 text-brand-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Покупатель</h3>
                <p className="text-slate-500 mb-6">Я хочу находить и покупать строительные материалы по лучшим ценам.</p>
                <Button className="w-full mt-auto" disabled={creatingProfile}>Выбрать</Button>
              </div>

              <div 
                onClick={() => !creatingProfile && handleRoleSelect('seller')}
                className={`bg-white border-2 border-slate-200 p-8 rounded-2xl cursor-pointer transition-all hover:border-brand-orange-500 hover:shadow-lg flex flex-col items-center text-center group ${creatingProfile ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="w-20 h-20 bg-brand-orange-50 text-brand-orange-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Briefcase className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Продавец (Бизнес)</h3>
                <p className="text-slate-500 mb-6">Я хочу открыть магазин и продавать стройматериалы на платформе.</p>
                <Button className="w-full mt-auto bg-brand-orange-500 hover:bg-brand-orange-600 border-none" disabled={creatingProfile}>Выбрать</Button>
              </div>
            </div>
            <div className="mt-8 text-center">
              <button 
                onClick={() => signOut(auth)}
                className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors"
                disabled={creatingProfile}
              >
                Войти под другим аккаунтом
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error(e);
      alert('Ошибка при авторизации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-[70vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-brand-blue-900">Добро пожаловать</CardTitle>
          <CardDescription>
            Войдите, чтобы совершать покупки и управлять магазином
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex flex-col items-center">
          <Button 
            variant="outline" 
            className="w-full h-12 flex items-center justify-center gap-3 font-semibold text-slate-700 hover:bg-slate-50"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5"/>
            Войти через Google
          </Button>
          <div className="text-xs text-slate-400 text-center mt-4">
            Продолжая, вы соглашаетесь с условиями использования платформы BuildMarket.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
