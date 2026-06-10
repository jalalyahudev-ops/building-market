import { useState } from 'react';
import { useAuthStore } from '../store/auth';
import { Navigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export default function Login() {
  const { firebaseUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  if (firebaseUser) {
    return <Navigate to="/dashboard" replace />;
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
