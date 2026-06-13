import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Search, MapPin, Grid2x2, Truck, Star, ShieldCheck, Heart } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { useLangStore } from '../store/lang';

export default function Home() {
  const { t } = useLangStore();
  const categories = [
    { name: t('home.categories.cement'), icon: <Grid2x2 className="w-6 h-6 text-brand-orange-500" /> },
    { name: t('home.categories.bricks'), icon: <Grid2x2 className="w-6 h-6 text-brand-orange-500" /> },
    { name: t('home.categories.metal'), icon: <Grid2x2 className="w-6 h-6 text-brand-orange-500" /> },
    { name: t('home.categories.wood'), icon: <Grid2x2 className="w-6 h-6 text-brand-orange-500" /> },
    { name: t('home.categories.bulk'), icon: <Grid2x2 className="w-6 h-6 text-brand-orange-500" /> },
    { name: t('home.categories.roofing'), icon: <Grid2x2 className="w-6 h-6 text-brand-orange-500" /> },
    { name: t('home.categories.electric'), icon: <Grid2x2 className="w-6 h-6 text-brand-orange-500" /> },
    { name: t('home.categories.plumbing'), icon: <Grid2x2 className="w-6 h-6 text-brand-orange-500" /> },
  ];

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="bg-brand-blue-900 rounded-2xl overflow-hidden shadow-sm relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541888086225-b772c830eb8a?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="relative z-10 px-6 py-20 text-center max-w-4xl mx-auto space-y-8">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
            {t('home.hero.title1')} <span className="text-slate-400 font-normal">{t('home.hero.title2')}</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200">
            {t('home.hero.desc')}
          </p>
          
          <div className="bg-white p-2 rounded-2xl flex flex-col md:flex-row gap-2 shadow-sm max-w-3xl mx-auto border border-slate-200">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                placeholder={t('home.search.placeholder')} 
                className="w-full h-12 pl-12 pr-4 rounded-xl border-slate-200 focus:outline-none text-slate-800"
              />
            </div>
            <div className="w-px bg-slate-200 hidden md:block"></div>
            <div className="relative md:w-64">
              <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                placeholder={t('home.search.location')} 
                className="w-full h-12 pl-12 pr-4 rounded-xl focus:outline-none text-slate-800 bg-transparent"
              />
            </div>
            <Button size="lg" className="h-12 px-8 text-sm font-bold w-full md:w-auto bg-brand-blue-900 text-white rounded-xl hover:bg-brand-blue-800">
              {t('home.search.btn')}
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="space-y-6 pt-4">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-bold text-brand-blue-900">{t('home.categories.title')}</h2>
          <span className="text-sm font-bold text-brand-orange-500 hover:underline cursor-pointer">{t('home.categories.all')}</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-transparent hover:border-orange-200 transition-all cursor-pointer group">
              <div className="p-4 flex items-center gap-4">
                <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-orange-50 transition-colors">
                  {cat.icon}
                </div>
                <span className="font-bold text-slate-800 group-hover:text-brand-orange-500 transition-colors">{cat.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-6 py-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-transparent flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-white font-bold shrink-0">
            Tr
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{t('home.features.logistics')}</h3>
            <p className="text-[10px] text-slate-500 uppercase font-black">{t('home.features.delivery')}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-transparent flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-white font-bold shrink-0">
            Re
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{t('home.features.reviews')}</h3>
            <p className="text-[10px] text-slate-500 uppercase font-black">{t('home.features.rating')}</p>
          </div>
        </div>
        <div className="bg-[#F97316] bg-opacity-5 p-6 rounded-2xl border-2 border-[#F97316] border-opacity-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-blue-900 rounded-xl flex items-center justify-center text-white font-bold shrink-0">
            VIP
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{t('home.features.suppliers')}</h3>
            <p className="text-[10px] text-slate-500 uppercase font-black">{t('home.features.partners')}</p>
          </div>
        </div>
      </section>

      {/* Popular Products section added */}
      <section className="space-y-6 pt-6">
        <div className="flex justify-between items-end mb-2">
          <h2 className="text-2xl font-bold text-brand-blue-900">{t('home.trending.title1')} <span className="text-slate-400 font-normal">{t('home.trending.title2')}</span></h2>
          <span className="text-sm font-bold text-brand-orange-500 hover:underline cursor-pointer">{t('home.trending.all')}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((item) => (
             <div key={item} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-transparent hover:border-orange-200 transition-all group">
               <div className="h-40 bg-slate-200 relative">
                 <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">-15%</div>
                 <div className="w-full h-full flex items-center justify-center text-slate-400 text-4xl group-hover:scale-110 transition-transform">📦</div>
               </div>
               <div className="p-4 space-y-2">
                 <div className="flex justify-between items-start mb-1">
                   <h4 className="font-bold text-slate-800 line-clamp-1">Цемент Портланд М500</h4>
                   <span className="text-brand-orange-500 font-black">450 ₽</span>
                 </div>
                 <p className="text-xs text-slate-400 mb-3">СтройСнаб • 1.2km away</p>
                 <div className="flex gap-2">
                   <button className="flex-1 bg-brand-blue-900 text-white py-2 rounded font-bold text-xs hover:bg-slate-800">{t('btn.details')}</button>
                   <button className="w-10 h-10 border-2 border-slate-100 flex items-center justify-center rounded-lg hover:bg-slate-50 text-brand-orange-500">⭐</button>
                 </div>
               </div>
             </div>
          ))}
        </div>
      </section>
      
    </div>
  );
}
