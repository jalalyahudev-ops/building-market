import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { useCartStore } from '../store/cart';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { Hammer, User, LogOut, Heart, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';

export function Layout() {
  const { user, firebaseUser } = useAuthStore();
  const cartItemsCount = useCartStore((state) => state.items.reduce((acc, item) => acc + item.quantity, 0));

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800">
      <header className="sticky top-0 z-50 w-full border-b border-brand-blue-500 bg-brand-blue-900 text-white shrink-0">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-2xl font-black tracking-tighter text-white">
            <div className="w-10 h-10 bg-brand-orange-500 rounded-lg flex items-center justify-center font-bold text-white text-xl">B</div>
            <span>Build<span className="text-brand-orange-500">Market</span></span>
          </Link>

          <div className="flex-1 max-w-xl mx-8 hidden md:flex">
            <div className="relative w-full flex border-2 border-brand-blue-500 rounded-lg overflow-hidden focus-within:border-brand-orange-500 transition-colors bg-brand-blue-900">
              <input
                type="text"
                placeholder="Поиск товаров и магазинов..."
                className="w-full bg-transparent py-2 px-4 text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <Link to="/marketplace" className="flex items-center gap-2 hover:text-brand-orange-500 transition-colors">
              <span className="text-sm font-medium hidden sm:inline-block">Товары</span>
            </Link>
            
            <Link to="/workers" className="flex items-center gap-2 hover:text-brand-orange-500 transition-colors">
              <span className="text-sm font-medium hidden sm:inline-block">Услуги & Мастера</span>
            </Link>
            
            <Link to="/cart" className="relative group flex items-center hover:text-brand-orange-500 transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-brand-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-brand-blue-900">
                  {cartItemsCount}
                </span>
              )}
            </Link>
            {firebaseUser ? (
              <>
                <Link to="/favorites" className="hover:text-brand-orange-500 transition-colors">
                  <Heart className="h-5 w-5" />
                </Link>
                <Link to="/dashboard" className="flex items-center gap-2 hover:text-brand-orange-500 transition-colors">
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium hidden sm:inline-block">Кабинет</span>
                </Link>
                <button onClick={handleLogout} className="hover:text-red-400 transition-colors" title="Выйти">
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <Link to="/login">
                <Button className="bg-brand-orange-500 hover:bg-brand-orange-600 text-white border-0">
                  Войти
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-slate-200 py-6 mt-auto">
        <div className="container mx-auto px-6 text-center text-[10px] font-bold tracking-widest text-slate-500 flex flex-col gap-2 uppercase">
          <p>&copy; {new Date().getFullYear()} BUILDMARKET • API UPTIME: 99.9% • PLATFORM STATUS: OPERATIONAL</p>
        </div>
      </footer>
    </div>
  );
}
