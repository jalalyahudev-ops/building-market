import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { HardHat, Hammer, Zap, Droplets, Sparkles, Send, CheckCircle2, User, Loader2, Paintbrush, Pickaxe, Download } from 'lucide-react';

import { useAIStore } from '../store/ai';
import { useLangStore } from '../store/lang';

export default function Workers() {
  const { t } = useLangStore();

  const CATEGORIES = [
    { id: 'loaders', name: t('workers.categories.loaders'), icon: User, hourlyRate: 35000 },
    { id: 'builders', name: t('workers.categories.builders'), icon: HardHat, hourlyRate: 60000 },
    { id: 'painters', name: t('workers.categories.painters'), icon: Paintbrush, hourlyRate: 50000 },
    { id: 'concrete', name: t('workers.categories.concrete'), icon: Pickaxe, hourlyRate: 65000 },
    { id: 'electricians', name: t('workers.categories.electricians'), icon: Zap, hourlyRate: 80000 },
    { id: 'plumbers', name: t('workers.categories.plumbers'), icon: Droplets, hourlyRate: 75000 },
    { id: 'cleaning', name: t('workers.categories.cleaning'), icon: Sparkles, hourlyRate: 40000 },
  ];

  const PAYMENT_METHODS = [
    { id: 'cash', name: t('workers.payment.cash') },
    { id: 'transfer', name: t('workers.payment.transfer') },
    { id: 'installments', name: t('workers.payment.installments') }
  ];

  const [activeTab, setActiveTab] = useState<'search' | 'register'>('search');
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [requestResult, setRequestResult] = useState<any>(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  // Register state
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regCategory, setRegCategory] = useState(CATEGORIES[0].id);
  const [regConfirmed, setRegConfirmed] = useState(false);

  const handleAiRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsProcessing(true);
    setRequestResult(null);
    setOrderConfirmed(false);

    try {
      const result = await useAIStore.getState().processServiceRequest(prompt);
      
      // AI returns category, quantity, datetime, location, task_description, materials
      const matchedCategory = CATEGORIES.find(c => c.id === result.category) || CATEGORIES[0];
      
      const priceEstimate = matchedCategory.hourlyRate * (result.quantity || 1) * 4; // Assume 4 hours for a default task

      setRequestResult({
        ...result,
        matchedCategory,
        priceEstimate,
        paymentMethod: 'cash',
        status: 'found_workers'
      });
    } catch (err) {
      alert(t('workers.error') + err);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderConfirmed(true);
  };

  const downloadContract = () => {
    if (!requestResult) return;
    
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text("SERVICE & MATERIAL CONTRACT", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Payment Method: ${PAYMENT_METHODS.find(p => p.id === requestResult.paymentMethod)?.name}`, 14, 35);
    
    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.text("Task Details", 14, 45);
    
    doc.setFontSize(11);
    doc.setTextColor(50);
    doc.text(`Category: ${requestResult.matchedCategory.name}`, 14, 53);
    doc.text(`Workers Required: ${requestResult.quantity || 1}`, 14, 60);
    doc.text(`Estimated Time: ${requestResult.datetime || 'N/A'}`, 14, 67);
    doc.text(`Location: ${requestResult.location || 'N/A'}`, 14, 74);
    
    let currentY = 85;

    // Materials table
    if (requestResult.materials && requestResult.materials.length > 0) {
      doc.setTextColor(0);
      doc.setFontSize(14);
      doc.text("Requested Materials", 14, currentY);
      
      const matCols = ["Material Name", "Quantity"];
      const matRows = requestResult.materials.map((m: any) => [m.name, m.quantity]);
      
      autoTable(doc, {
        startY: currentY + 5,
        head: [matCols],
        body: matRows,
        theme: 'grid',
        headStyles: { fillColor: [249, 115, 22] } // Orange
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }
    
    // Total Estimate
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`Estimated Labor Cost: ~${requestResult.priceEstimate.toLocaleString()} SUM`, 14, currentY);
    
    doc.save(`Contract_${Date.now()}.pdf`);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegConfirmed(true);
    // In a real app, send to database
    setTimeout(() => {
      setRegConfirmed(false);
      setRegName(''); setRegPhone('');
      setActiveTab('search');
    }, 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">{t('workers.title')}</h1>
          <p className="text-slate-500 mt-2 font-medium">{t('workers.desc')}</p>
        </div>
      </div>

      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('search')}
          className={`pb-3 px-4 font-bold text-sm tracking-wide transition-colors relative ${activeTab === 'search' ? 'text-brand-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          {t('workers.tab.search')}
          {activeTab === 'search' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-blue-600 rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('register')}
          className={`pb-3 px-4 font-bold text-sm tracking-wide transition-colors relative ${activeTab === 'register' ? 'text-brand-orange-500' : 'text-slate-500 hover:text-slate-700'}`}
        >
          {t('workers.tab.register')}
          {activeTab === 'register' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-orange-500 rounded-t-full"></div>}
        </button>
      </div>

      {activeTab === 'search' ? (
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
                    <h3 className="font-bold text-xl text-slate-800">{t('workers.search.title')}</h3>
                    <p className="text-slate-600 text-sm mt-1">{t('workers.search.desc')}</p>
                  </div>
                </div>

                <form onSubmit={handleAiRequest} className="relative">
                  <Input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t('workers.search.placeholder')}
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
                    <form onSubmit={confirmOrder} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 w-full h-1 bg-brand-orange-500 left-0"></div>
                      
                      <h4 className="font-bold text-lg text-slate-800 mb-4 flex gap-2 items-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        {t('workers.result.title')}
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">{t('workers.result.category')}</span>
                          <div className="font-medium text-brand-blue-900 flex items-center gap-2 mt-1">
                            <requestResult.matchedCategory.icon className="w-4 h-4 text-brand-orange-500" />
                            {requestResult.matchedCategory.name} ({requestResult.quantity || 1})
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">{t('workers.result.location')}</span>
                          <p className="font-medium text-brand-blue-900 mt-1">{requestResult.location || t('workers.result.not_specified')}, {requestResult.datetime || t('workers.result.not_specified')}</p>
                        </div>
                      </div>

                      {/* Materials Section */}
                      {requestResult.materials && requestResult.materials.length > 0 && (
                        <div className="mb-6">
                          <h5 className="font-bold text-sm text-slate-800 mb-3 border-b border-slate-100 pb-2">{t('workers.result.materials_title')}</h5>
                          <ul className="space-y-2">
                            {requestResult.materials.map((mat: any, idx: number) => (
                              <li key={idx} className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="font-medium text-slate-700">{mat.name}</span>
                                <span className="text-brand-orange-600 font-bold bg-brand-orange-100 px-3 py-1 rounded-md">{mat.quantity}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Payment Method */}
                      <div className="mb-6">
                        <h5 className="font-bold text-sm text-slate-800 mb-3 border-b border-slate-100 pb-2">{t('workers.result.payment_title')}</h5>
                        <div className="grid grid-cols-3 gap-3">
                          {PAYMENT_METHODS.map(pm => (
                            <div 
                              key={pm.id}
                              onClick={() => setRequestResult({...requestResult, paymentMethod: pm.id})}
                              className={`p-3 rounded-lg border-2 cursor-pointer text-center transition-colors text-sm font-medium ${requestResult.paymentMethod === pm.id ? 'border-brand-blue-500 bg-brand-blue-50 text-brand-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                            >
                              {pm.name}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 font-medium">{t('workers.result.estimate')}</span>
                          <span className="text-xl font-bold tracking-tight text-slate-800">
                            ~{requestResult.priceEstimate.toLocaleString()} {t('workers.catalog.per_hour').replace('/ч', '')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">{t('workers.result.estimate_desc1')} {requestResult.matchedCategory.hourlyRate.toLocaleString()} {t('workers.result.estimate_desc2')}</p>
                      </div>

                      <Button type="submit" className="w-full bg-brand-orange-500 hover:bg-brand-orange-600 text-white font-bold h-12">
                        {t('workers.result.btn_contract')}
                      </Button>
                    </form>
                  </div>
                )}

                {/* Order Confirmation View */}
                {orderConfirmed && (
                  <div className="mt-8 bg-green-50 rounded-xl p-8 border border-green-200 text-center animate-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="text-xl font-bold text-green-800 mb-2">{t('workers.contract.title')}</h4>
                    <p className="text-green-700 max-w-md mx-auto">
                      {t('workers.contract.desc1')} <b>{PAYMENT_METHODS.find(p => p.id === requestResult?.paymentMethod)?.name || t('workers.result.not_specified')}</b>. <br/><br/>{t('workers.contract.desc2')}
                    </p>
                    <div className="flex justify-center gap-4 mt-6">
                      <Button onClick={() => { setOrderConfirmed(false); setPrompt(''); setRequestResult(null); }} className="bg-green-600 hover:bg-green-700 text-white">
                        {t('workers.contract.btn_new')}
                      </Button>
                      <Button variant="outline" onClick={downloadContract} className="border-green-600 text-green-700 hover:bg-green-100">
                        <Download className="w-4 h-4 mr-2" /> {t('workers.contract.btn_download')}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Categories Sidebar */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="font-bold text-lg text-slate-800 border-b border-slate-200 pb-2">{t('workers.catalog.title')}</h3>
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
                      <span className="text-xs font-medium text-slate-500">{t('workers.catalog.from')} {category.hourlyRate.toLocaleString()} {t('workers.catalog.per_hour')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardContent className="p-8">
              {regConfirmed ? (
                  <div className="text-center py-8 animate-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="text-xl font-bold text-green-800 mb-2">{t('workers.register.success.title')}</h4>
                    <p className="text-green-700 max-w-sm mx-auto">
                      {t('workers.register.success.desc')}
                    </p>
                 </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">{t('workers.register.title')}</h3>
                    <p className="text-slate-500 text-sm mt-1">{t('workers.register.desc')}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('workers.register.label.name')}</label>
                      <Input 
                        required 
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder={t('workers.register.placeholder.name')} 
                        className="bg-slate-50 h-12" 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('workers.register.label.phone')}</label>
                      <Input 
                        required 
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+998 90 123 45 67" 
                        className="bg-slate-50 h-12" 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('workers.register.label.category')}</label>
                      <select 
                        value={regCategory}
                        onChange={(e) => setRegCategory(e.target.value)}
                        className="flex h-12 w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-brand-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {CATEGORIES.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-4 border border-blue-100 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <strong>{t('workers.register.terms.title')}</strong>
                        <p className="text-blue-700/80 mt-1">{t('workers.register.terms.desc')}</p>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-brand-blue-600 hover:bg-brand-blue-700 text-white font-bold h-14 text-base">
                    {t('workers.register.btn')}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
