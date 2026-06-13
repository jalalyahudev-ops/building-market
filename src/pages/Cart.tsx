import React, { useState } from 'react';
import { useCartStore } from '../store/cart';
import { useAuthStore } from '../store/auth';
import { useLangStore } from '../store/lang';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Minus, Plus, Trash2, ArrowLeft, CheckCircle2, Box } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
  const user = useAuthStore((state: any) => state.user);
  const { t } = useLangStore();
  const navigate = useNavigate();
  
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      alert("Please log in to checkout.");
      navigate('/login');
      return;
    }
    
    setCheckingOut(true);
    try {
      // Group items by storeId
      const storesMap = new Map<string, typeof items>();
      items.forEach(item => {
        const storeItems = storesMap.get(item.storeId) || [];
        storeItems.push(item);
        storesMap.set(item.storeId, storeItems);
      });

      // Create an order for each store
      for (const [storeId, storeItems] of storesMap.entries()) {
        const storeTotal = storeItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        await addDoc(collection(db, 'orders'), {
          buyerId: user.id,
          storeId: storeId,
          items: storeItems,
          totalAmount: storeTotal,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      clearCart();
      setOrderComplete(true);
    } catch (err: any) {
      alert("Error placing order: " + err.message);
    } finally {
      setCheckingOut(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black text-slate-800">{t('cart.success.title')}</h1>
        <p className="text-lg text-slate-500">{t('cart.success.desc')}</p>
        <div className="pt-8">
          <Button onClick={() => navigate('/marketplace')} className="bg-brand-orange-500 hover:bg-brand-orange-600">
            {t('cart.success.btn')}
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6 flex flex-col items-center">
        <div className="w-24 h-24 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
          <Box className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-slate-800">{t('cart.empty.title')}</h1>
        <p className="text-slate-500">{t('cart.empty.desc')}</p>
        <div className="pt-4">
          <Link to="/marketplace">
            <Button className="bg-brand-orange-500 hover:bg-brand-orange-600 text-white font-bold h-12 px-8">
              {t('cart.empty.btn')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/marketplace" className="text-slate-400 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-black text-slate-800">{t('cart.title')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
              <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                  <Box className="w-8 h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-slate-800 truncate">{item.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{item.price} ₽</p>
                  <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-widest text-slate-500 bg-slate-100 px-2 py-1 rounded-md shadow-sm">
                    {item.category}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0 justify-between">
                  <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1 border border-slate-200">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-slate-600 transition-all disabled:opacity-50"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm text-slate-800">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-slate-600 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-black text-lg text-slate-800">{item.price * item.quantity} ₽</div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 text-sm mt-1 flex items-center justify-end w-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="rounded-2xl border-slate-200 shadow-sm sticky top-24">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-6">{t('cart.summary.title')}</h3>
              
              <div className="space-y-4 text-sm text-slate-600 mb-6">
                <div className="flex justify-between">
                  <span>{t('cart.summary.subtotal')} ({items.reduce((acc, item) => acc + item.quantity, 0)} {t('cart.summary.items')})</span>
                  <span className="font-medium text-slate-800">{getTotal()} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('cart.summary.tax')}</span>
                  <span className="font-medium text-slate-800">{(getTotal() * 0.1).toFixed(0)} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('cart.summary.shipping')}</span>
                  <span className="text-green-600 font-medium">{t('cart.summary.shipping_calc')}</span>
                </div>
                <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-lg text-slate-800">{t('cart.summary.total')}</span>
                  <span className="font-black text-2xl text-brand-orange-600">{(getTotal() * 1.1).toFixed(0)} ₽</span>
                </div>
              </div>

              <Button 
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold h-12 text-base"
                onClick={handleCheckout}
                disabled={checkingOut}
              >
                {checkingOut ? t('cart.btn.processing') : t('cart.btn.checkout')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
