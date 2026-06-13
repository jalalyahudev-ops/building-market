import { useState } from 'react';
import { useAuthStore } from '../store/auth';
import { useLangStore } from '../store/lang';
import { Navigate, useSearchParams, Link } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Briefcase, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function Login() {
  const { firebaseUser, user, fetchProfile } = useAuthStore() as any;
  const { t } = useLangStore();
  const [searchParams] = useSearchParams();
  const isRegister = searchParams.get('mode') === 'register';
  const [loading, setLoading] = useState(false);
  const [creatingProfile, setCreatingProfile] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const createProfile = async (role: 'buyer' | 'seller' | 'admin', fbUser: any) => {
    setCreatingProfile(true);
    try {
      const newUser: any = {
        role,
        displayName: fbUser.displayName || t('login.welcome'),
        createdAt: new Date().toISOString()
      };
      if (fbUser.photoURL) newUser.photoURL = fbUser.photoURL;
      
      await setDoc(doc(db, 'users', fbUser.uid), newUser);
      await fetchProfile(fbUser.uid);
    } catch (e: any) {
      console.error(e);
      alert('Ошибка при создании профиля: ' + e.message);
    } finally {
      setCreatingProfile(false);
    }
  };

  const onSelectRole = async (role: 'buyer' | 'seller' | 'admin') => {
    if (firebaseUser) {
      const docRef = doc(db, 'users', firebaseUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await fetchProfile(firebaseUser.uid);
      } else {
        await createProfile(role, firebaseUser);
      }
    } else {
      // Need to login first
      setLoading(true);
      try {
        const provider = new GoogleAuthProvider();
        const res = await signInWithPopup(auth, provider);
        const docRef = doc(db, 'users', res.user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          await fetchProfile(res.user.uid);
        } else {
          await createProfile(role, res.user);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // If user clicked "Register" or they are logged in but have no profile
  if (isRegister || (firebaseUser && !user)) {
    return (
      <div className="flex justify-center items-center py-20 px-4">
        <Card className="w-full max-w-4xl border-slate-200">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-black text-slate-800">{t('choose.role.title')}</CardTitle>
            <CardDescription className="text-base text-slate-500 mt-2">
              {t('choose.role.desc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 mt-4">
              <div 
                onClick={() => !loading && !creatingProfile && onSelectRole('buyer')}
                className={`bg-white border-2 border-slate-200 p-8 rounded-2xl cursor-pointer transition-all hover:border-brand-blue-500 hover:shadow-lg flex flex-col items-center text-center group ${(loading || creatingProfile) ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="w-20 h-20 bg-brand-blue-50 text-brand-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{t('role.buyer')}</h3>
                <p className="text-sm text-slate-500 mb-6">Я хочу находить и покупать строительные материалы по лучшим ценам.</p>
                <Button className="w-full mt-auto" disabled={loading || creatingProfile}>{t('btn.select')}</Button>
              </div>

              <div 
                onClick={() => !loading && !creatingProfile && onSelectRole('seller')}
                className={`bg-white border-2 border-slate-200 p-8 rounded-2xl cursor-pointer transition-all hover:border-brand-orange-500 hover:shadow-lg flex flex-col items-center text-center group ${(loading || creatingProfile) ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="w-20 h-20 bg-brand-orange-50 text-brand-orange-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Briefcase className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{t('role.seller')}</h3>
                <p className="text-sm text-slate-500 mb-6">Я хочу открыть магазин и продавать стройматериалы на платформе.</p>
                <Button className="w-full mt-auto bg-brand-orange-500 hover:bg-brand-orange-600 border-none" disabled={loading || creatingProfile}>{t('btn.select')}</Button>
              </div>

              <div 
                onClick={() => !loading && !creatingProfile && onSelectRole('admin')}
                className={`bg-white border-2 border-slate-200 p-8 rounded-2xl cursor-pointer transition-all hover:border-purple-500 hover:shadow-lg flex flex-col items-center text-center group ${(loading || creatingProfile) ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{t('role.admin')}</h3>
                <p className="text-sm text-slate-500 mb-6">Управление платформой, контроль пользователей и заказов.</p>
                <Button className="w-full mt-auto bg-purple-500 hover:bg-purple-600 border-none" disabled={loading || creatingProfile}>{t('btn.select')}</Button>
              </div>
            </div>
            {firebaseUser ? (
              <div className="mt-8 text-center">
                <button 
                  onClick={() => signOut(auth)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors"
                  disabled={creatingProfile}
                >
                  {t('btn.other_account')}
                </button>
              </div>
            ) : (
              <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center">
                <p className="text-slate-500 mb-4">{t('login.already_have_account')}</p>
                <Link to="/login">
                  <Button variant="outline" className="border-brand-blue-500 text-brand-blue-600 hover:bg-brand-blue-50 w-full sm:w-auto min-w-[200px]">
                    {t('nav.login')}
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pure login page
  return (
    <div className="flex justify-center items-center h-[70vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-brand-blue-900">{t('login.welcome')}</CardTitle>
          <CardDescription>
            {t('login.desc')}
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
            {t('login.google')}
          </Button>
          <div className="text-xs text-slate-400 text-center mt-4">
            {t('login.terms')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

