import { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { HardHat, Hammer, Zap, Droplets, Sparkles, Send, CheckCircle2, User, Loader2 } from 'lucide-react';
import { useAIStore } from '../store/ai';

const CATEGORIES = [
  { id: 'грузчики', name: 'Грузчики', icon: User, hourlyRate: 35000 },
  { id: 'строители', name: 'Строители', icon: HardHat, hourlyRate: 60000 },
  { id: 'электрики', name: 'Электрики', icon: Zap, hourlyRate: 80000 },
  { id: 'сантехники', name: 'Сантехники', icon: Droplets, hourlyRate: 75000 },
  { id: 'уборка', name: 'Уборка', icon: Sparkles, hourlyRate: 40000 },
];

export default function Workers() {
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [requestResult, setRequestResult] = useState<any>(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const handleAiRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsProcessing(true);
    setRequestResult(null);
    setOrderConfirmed(false);

    try {
      const result = await useAIStore.getState().processServiceRequest(prompt);
      
      // AI returns category, quantity, datetime, location, task_description
      const matchedCategory = CATEGORIES.find(c => c.id === result.category) || CATEGORIES[0];
      
      const priceEstimate = matchedCategory.hourlyRate * (result.quantity || 1) * 4; // Assume 4 hours for a default task

      setRequestResult({
        ...result,
        matchedCategory,
        priceEstimate,
        status: 'found_workers'
      });
    } catch (err) {
      alert("Ошибка при обработке запроса: " + err);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmOrder = () => {
    setOrderConfirmed(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Услуги и Мастера</h1>
          <p className="text-slate-500 mt-2 font-medium">Найдите специалистов для любых задач</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* AI Assistant Search Box */}
        <div className="md:col-span-2">
          <Card className="rounded-2xl border-slate-200 border-2 overflow-hidden shadow-sm bg-gradient-to-br from-white to-blue-50">
            <CardContent className="p-6 md:p-8">
              <div className="flex gap-4 items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-brand-blue-500 text-white flex items-center justify-center shrink-0">
                  <span className="text-2xl">✨</span>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-800">Умный поиск мастеров</h3>
                  <p className="text-slate-600 text-sm mt-1">Опишите задачу своими словами, и ИИ сам подберет нужных людей, рассчитает цену и оформит заказ.</p>
                </div>
              </div>

              <form onSubmit={handleAiRequest} className="relative">
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Например: Мне нужны 3 грузчика завтра в Ташкенте..."
                  className="pl-4 pr-16 py-6 text-base bg-white rounded-xl shadow-sm border-slate-200 focus:border-brand-blue-500 focus:ring-brand-blue-500 outline-none"
                />
                <Button 
                  type="submit" 
                  disabled={isProcessing || !prompt.trim()}
                  className="absolute right-2 top-2 bottom-2 rounded-lg bg-brand-blue-500 hover:bg-brand-blue-600"
                  size="icon"
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Send className="w-5 h-5 text-white" />}
                </Button>
              </form>

              {/* AI Processing Results View */}
              {requestResult && !orderConfirmed && (
                <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 w-full h-1 bg-brand-orange-500 left-0"></div>
                    
                    <h4 className="font-bold text-lg text-slate-800 mb-4 flex gap-2 items-center">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      Исполнители найдены
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Категория</span>
                        <div className="font-medium text-brand-blue-900 flex items-center gap-2 mt-1">
                          <requestResult.matchedCategory.icon className="w-4 h-4 text-brand-orange-500" />
                          {requestResult.matchedCategory.name}
                        </div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Количество</span>
                        <p className="font-medium text-brand-blue-900 mt-1">{requestResult.quantity || 1} чел.</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Время</span>
                        <p className="font-medium text-brand-blue-900 mt-1">{requestResult.datetime || 'Не указано (по договоренности)'}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Локация</span>
                        <p className="font-medium text-brand-blue-900 mt-1">{requestResult.location || 'Не указано'}</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">Примерная стоимость (за смену):</span>
                        <span className="text-xl font-bold tracking-tight text-slate-800">
                          ~{requestResult.priceEstimate.toLocaleString()} сум
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">ИИ проанализировал среднюю ставку по рынку: {requestResult.matchedCategory.hourlyRate.toLocaleString()} сум/час за рабочего.</p>
                    </div>

                    <Button onClick={confirmOrder} className="w-full bg-brand-orange-500 hover:bg-brand-orange-600 text-white font-bold h-12">
                      Оформить заказ
                    </Button>
                  </div>
                </div>
              )}

              {/* Order Confirmation View */}
              {orderConfirmed && (
                <div className="mt-8 bg-green-50 rounded-xl p-8 border border-green-200 text-center animate-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-xl font-bold text-green-800 mb-2">Заказ успешно оформлен!</h4>
                  <p className="text-green-700 max-w-sm mx-auto">
                    Специалисты скоро свяжутся с вами для уточнения деталей задачи. Вся оплата по факту выполнения работы.
                  </p>
                  <Button onClick={() => { setOrderConfirmed(false); setPrompt(''); setRequestResult(null); }} className="mt-6 bg-green-600 hover:bg-green-700 text-white">
                    Новый запрос
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Categories Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <h3 className="font-bold text-lg text-slate-800 border-b border-slate-200 pb-2">Каталог услуг</h3>
          <div className="grid grid-cols-1 gap-3">
            {CATEGORIES.map(category => {
              const Icon = category.icon;
              return (
                <div key={category.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-brand-blue-300 cursor-pointer transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-brand-orange-100 group-hover:text-brand-orange-500 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 group-hover:text-brand-blue-600 transition-colors">{category.name}</h4>
                    <span className="text-xs font-medium text-slate-500">от {category.hourlyRate.toLocaleString()} сум/ч</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
