import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth';
import { useAIStore } from '../store/ai';
import { useCartStore } from '../store/cart';
import { collection, query, where, getDocs, doc, setDoc, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, ShoppingCart, MessageSquare, Box, Star, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Marketplace() {
  const user = useAuthStore((state: any) => state.user);
  const addItem = useCartStore((state) => state.addItem);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // AI Assistant Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{role: string, text: string}[]>([
    { role: 'model', text: 'Hello! I am your AI Shopping Assistant. Looking for specific construction materials, or need advice on what to buy for your project?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Product Detail / Reviews state
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const q = query(collection(db, 'products'), where('status', '==', 'active'));
        const snap = await getDocs(q);
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const openProductDetail = async (p: any) => {
    setSelectedProduct(p);
    try {
      const q = query(collection(db, 'reviews'), where('targetId', '==', p.id));
      const snap = await getDocs(q);
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch(err) {
      console.error("Failed to load reviews", err);
    }
  };

  const submitReview = async () => {
    if (!user) {
      alert("Please login to leave a review.");
      return;
    }
    if (!selectedProduct) return;
    setSubmittingReview(true);
    try {
      const newReview = {
        targetId: selectedProduct.id,
        type: 'product',
        authorId: user.id,
        rating: reviewRating,
        text: reviewText,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'reviews'), newReview);
      setReviews([...reviews, { id: docRef.id, ...newReview }]);
      setReviewText('');
      alert("Review submitted successfully!");
    } catch(err: any) {
      alert("Error submitting review: " + err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsgs = [...messages, { role: 'user', text: chatInput }];
    setMessages(newMsgs);
    setChatInput('');
    setChatLoading(true);

    try {
      const apiMessages = newMsgs.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const responseText = await useAIStore.getState().chatAssistant(apiMessages);
      setMessages([...newMsgs, { role: 'model', text: responseText }]);
    } catch (err) {
      console.error(err);
      setMessages([...newMsgs, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleAddToCart = async (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      storeId: product.storeId,
      category: product.category || 'General',
    });
    // Visual feedback could be added here
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800">BuildMarket</h1>
          <p className="text-slate-500">Find and buy quality construction materials.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="Search products or categories..." 
            className="pl-10 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 font-medium">Loading products...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map(p => (
            <Card key={p.id} onClick={() => openProductDetail(p)} className="rounded-2xl border-slate-200 shadow-sm overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow">
              <div className="h-48 bg-slate-100 flex items-center justify-center text-slate-300 relative">
                <Box className="w-16 h-16" />
                <span className="absolute top-2 left-2 text-[10px] uppercase font-bold tracking-widest text-slate-500 bg-white px-2 py-1 rounded-md shadow-sm">
                  {p.category}
                </span>
              </div>
              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-800 line-clamp-2">{p.name}</h3>
                </div>
                <div className="font-black text-brand-orange-600 text-xl mb-2">{p.price} ₽</div>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1">{p.description}</p>
                
                <Button onClick={(e) => { e.stopPropagation(); handleAddToCart(p); }} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold h-10">
                  <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
          
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-20 text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
              No products found matching "{search}"
            </div>
          )}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="text-2xl font-bold text-slate-800 line-clamp-1">{selectedProduct.name}</h2>
              <button onClick={() => setSelectedProduct(null)} className="text-slate-400 hover:text-slate-800 transition-colors bg-white rounded-full p-2 shadow-sm border border-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 space-y-8 flex-1">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 h-48 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 shrink-0 border border-slate-200">
                  <Box className="w-16 h-16" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 bg-slate-100 px-2 py-1 rounded-md shadow-sm border border-slate-200">
                      {selectedProduct.category}
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-brand-orange-600">{selectedProduct.price} ₽</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{selectedProduct.description}</p>
                  
                  <div className="pt-4 border-t border-slate-100">
                    <Button onClick={() => { handleAddToCart(selectedProduct); setSelectedProduct(null); }} className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-bold h-12 px-8">
                      <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-slate-100 pt-8">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-brand-orange-500 fill-brand-orange-500" />
                  Ratings & Reviews
                </h3>
                
                <div className="grid md:grid-cols-2 gap-8 relative">
                  <div className="space-y-4 min-h-[150px]">
                    {reviews.length === 0 ? (
                      <p className="text-slate-500 italic text-sm p-4 bg-slate-50 rounded-xl border border-slate-100">No reviews yet. Be the first to review!</p>
                    ) : (
                      reviews.map((r, i) => (
                        <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, idx) => (
                              <Star key={idx} className={`w-3 h-3 ${idx < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                            ))}
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">{r.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-0 h-fit">
                    <h4 className="font-bold text-slate-800 mb-4 text-sm">Write a Review</h4>
                    <div className="flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setReviewRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                          <Star className={`w-6 h-6 ${star <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                    <textarea 
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your experience with this material..."
                      className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl resize-none text-sm focus:ring-2 focus:ring-brand-orange-500 focus:border-brand-orange-500 outline-none transition-all placeholder:text-slate-400"
                    />
                    <Button onClick={submitReview} disabled={submittingReview} className="mt-4 w-full bg-slate-800 hover:bg-slate-700 text-white text-sm h-10 font-bold">
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        {!chatOpen ? (
          <Button 
            onClick={() => setChatOpen(true)}
            className="w-14 h-14 rounded-full bg-brand-orange-500 hover:bg-brand-orange-600 shadow-lg flex items-center justify-center text-white"
          >
            <MessageSquare className="w-6 h-6" />
          </Button>
        ) : (
          <div className="w-80 md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-slate-800 text-white p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="font-bold text-sm">AI Shopping Assistant</span>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${msg.role === 'user' ? 'bg-brand-orange-500 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 text-slate-400 rounded-2xl rounded-tl-sm p-3 text-sm shadow-sm">
                    Thinking...
                  </div>
                </div>
              )}
            </div>
            
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 shrink-0 flex gap-2">
              <Input 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask for advice..."
                className="flex-1"
                disabled={chatLoading}
              />
              <Button type="submit" disabled={chatLoading} className="bg-slate-800 text-white">Send</Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
