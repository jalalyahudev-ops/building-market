import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth';
import { useAIStore } from '../store/ai';
import { Navigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Store, User, FileText, ShoppingBag, Plus, Settings, TrendingUp, Package, Box, Check, X } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Input } from '../components/ui/input';

export default function Dashboard() {
  const user = useAuthStore((state: any) => state.user);
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Products and Orders state
  const [products, setProducts] = useState<any[]>([]);
  const [addingProduct, setAddingProduct] = useState(false);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [storeOrders, setStoreOrders] = useState<any[]>([]);
  
  // Admin state
  const [adminStores, setAdminStores] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);

  useEffect(() => {
    async function init() {
      if (!user) return;
      try {
        // Fetch My Orders
        const myOrdQ = query(collection(db, 'orders'), where('buyerId', '==', user.id));
        const myOrdSnap = await getDocs(myOrdQ);
        setMyOrders(myOrdSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const q = query(collection(db, 'stores'), where('ownerId', '==', user.id));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const storeData = { id: snap.docs[0].id, ...snap.docs[0].data() };
          setStore(storeData);
          
          // Load products for this store
          const pq = query(collection(db, 'products'), where('storeId', '==', storeData.id));
          const pSnap = await getDocs(pq);
          setProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));

          // Load orders for this store
          const sqQ = query(collection(db, 'orders'), where('storeId', '==', storeData.id));
          const sqSnap = await getDocs(sqQ);
          setStoreOrders(sqSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }

        // If admin, load all pending and approved stores, plus global stats
        if (user.role === 'admin') {
          const sq = query(collection(db, 'stores'));
          const sSnap = await getDocs(sq);
          setAdminStores(sSnap.docs.map(d => ({ id: d.id, ...d.data() })));

          // Compute mock stats
          const allProdsQ = query(collection(db, 'products'));
          const allProdsSnap = await getDocs(allProdsQ);
          const allOrdersQ = query(collection(db, 'orders'));
          const allOrdersSnap = await getDocs(allOrdersQ);
          
          setAdminStats({
            totalStores: sSnap.size,
            totalProducts: allProdsSnap.size,
            totalOrders: allOrdersSnap.size
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;

  const handleRegisterStore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    try {
      const docRef = await addDoc(collection(db, 'stores'), {
        ownerId: user.id,
        name: data.get('name'),
        description: data.get('description'),
        address: data.get('address'),
        phone: data.get('phone'),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setStore({ id: docRef.id, name: data.get('name'), status: 'pending' });
    } catch (err: any) {
      alert("Ошибка при регистрации магазина: " + err.message);
    }
  };

  const handleUpdateStore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    try {
      const storeRef = doc(db, 'stores', store.id);
      await updateDoc(storeRef, {
        name: data.get('name'),
        description: data.get('description'),
        address: data.get('address'),
        phone: data.get('phone'),
        operatingHours: data.get('operatingHours'),
        updatedAt: new Date().toISOString()
      });
      setStore({
        ...store,
        name: data.get('name'),
        description: data.get('description'),
        address: data.get('address'),
        phone: data.get('phone'),
        operatingHours: data.get('operatingHours')
      });
      alert('Store settings updated successfully!');
    } catch (err: any) {
      alert("Error updating store: " + err.message);
    }
  };

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAddingProduct(true);
    const data = new FormData(e.currentTarget);
    const name = data.get('name') as string;
    const description = data.get('description') as string;
    const price = Number(data.get('price'));
    const stock = Number(data.get('stock'));

    try {
      // AI categorization
      const aiResponse = await useAIStore.getState().categorizeProduct(name, description);
      const category = aiResponse.category || 'General';

      const newProd = {
        storeId: store.id,
        name,
        description,
        price,
        stock,
        category,
        subcategoryId: aiResponse.subcategory || '',
        tags: aiResponse.tags || [],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'products'), newProd);
      setProducts([...products, { id: docRef.id, ...newProd }]);
      alert(`Product added successfully! AI categorized it as: ${category}`);
      setActiveTab('store');
    } catch (err: any) {
      alert("Error adding product: " + err.message);
    } finally {
      setAddingProduct(false);
    }
  };

  const handleApproveStore = async (storeId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'stores', storeId), { status, updatedAt: new Date().toISOString() });
      setAdminStores(adminStores.map(s => s.id === storeId ? { ...s, status } : s));
    } catch (err: any) {
      alert("Error updating store: " + err.message);
    }
  };

  const handleUpdateOrder = async (orderId: string, status: string, isBuyer: boolean) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status, updatedAt: new Date().toISOString() });
      if (isBuyer) {
        setMyOrders(myOrders.map(o => o.id === orderId ? { ...o, status } : o));
      } else {
        setStoreOrders(storeOrders.map(o => o.id === orderId ? { ...o, status } : o));
      }
    } catch (err: any) {
      alert("Error updating order: " + err.message);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome back, {user.displayName}</h2>
          <p className="text-sm text-slate-500 font-medium">Account Type: <span className="uppercase text-brand-orange-500 font-bold">{user.role}</span></p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-brand-orange-200 transition-all cursor-pointer" onClick={() => setActiveTab('profile')}>
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-800 mb-4">
            <Settings className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Profile Settings</h3>
          <p className="text-xs text-slate-500">Manage your personal information, address, and security.</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-brand-orange-200 transition-all cursor-pointer">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-800 mb-4">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 mb-1">My Orders</h3>
          <p className="text-xs text-slate-500">View and track your previous and active material orders.</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-brand-orange-200 transition-all cursor-pointer" onClick={() => setActiveTab('store')}>
          <div className="w-12 h-12 bg-brand-orange-50 rounded-xl flex items-center justify-center text-brand-orange-500 mb-4">
            <Store className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Store Dashboard</h3>
          <p className="text-xs text-slate-500">{store ? "Manage your store inventory and view sales." : "Register a store to start selling."}</p>
        </div>
      </div>

      {store && store.status === 'approved' && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Store Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-brand-blue-900 p-6 rounded-2xl text-white">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">Total Sales</p>
              <p className="text-3xl font-black">0 ₽</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">Products</p>
              <p className="text-3xl font-black text-slate-800">0</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">Active Orders</p>
              <p className="text-3xl font-black text-slate-800">0</p>
            </div>
            <div className="bg-[#F97316] bg-opacity-10 p-6 rounded-2xl border border-[#F97316] border-opacity-20 flex flex-col justify-center items-center cursor-pointer hover:bg-opacity-20 transition-all">
              <Plus className="w-8 h-8 text-brand-orange-500 mb-2" />
              <p className="text-xs font-bold text-brand-orange-600">New Product</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex gap-8">
      {/* Sidebar Navigation */}
      <aside className="w-64 shrink-0 hidden md:flex flex-col space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-white overflow-hidden shadow-inner">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{user.displayName}</h3>
            <span className="text-[10px] bg-brand-orange-100 text-brand-orange-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{user.role}</span>
          </div>
        </div>

        <nav className="flex flex-col space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'overview' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}
          >
            <TrendingUp className="w-4 h-4" /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'profile' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}
          >
            <Settings className="w-4 h-4" /> Profile Settings
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'orders' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}
          >
            <ShoppingBag className="w-4 h-4" /> My Orders
          </button>
          <div className="pt-4 mt-4 border-t border-slate-200">
            <button 
              onClick={() => setActiveTab('store')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'store' ? 'bg-brand-orange-500 text-white' : 'text-brand-orange-600 bg-orange-50 hover:bg-orange-100'}`}
            >
              <Store className="w-4 h-4" /> Store Dashboard
            </button>
            {store && (
              <>
                <button 
                  onClick={() => setActiveTab('store-orders')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'store-orders' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'} mt-2 w-full`}
                >
                  <Package className="w-4 h-4" /> Customer Orders
                </button>
                <button 
                  onClick={() => setActiveTab('store-settings')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'store-settings' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'} mt-2 w-full`}
                >
                  <Settings className="w-4 h-4" /> Store Settings
                </button>
              </>
            )}
          </div>
          {user.role === 'admin' && (
            <button 
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors mt-2 ${activeTab === 'admin' ? 'bg-red-600 text-white' : 'text-red-600 bg-red-50 hover:bg-red-100'}`}
            >
              <FileText className="w-4 h-4" /> Admin Panel
            </button>
          )}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        {activeTab === 'overview' && renderOverview()}

        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-800">Profile Settings</h2>
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Display Name</label>
                  <Input defaultValue={user.displayName || ''} className="bg-slate-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                  <Input defaultValue={user.email || ''} disabled className="bg-slate-100 text-slate-500" />
                  <p className="text-[10px] text-slate-400 mt-1">Email is managed by your authentication provider.</p>
                </div>
                <Button className="mt-4 bg-slate-800 text-white hover:bg-slate-700">Save Changes</Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'store' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Store Dashboard</h2>
            
            {loading ? (
              <div className="text-slate-500 font-medium">Loading store information...</div>
            ) : store ? (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                      {store.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-slate-800">{store.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`w-2 h-2 rounded-full ${store.status === 'approved' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{store.status === 'approved' ? 'Live on Market' : 'Pending Approval'}</span>
                      </div>
                    </div>
                  </div>
                  {store.status === 'approved' && (
                    <Button onClick={() => setActiveTab('add-product')} className="bg-brand-orange-500 hover:bg-brand-orange-600 text-white">
                      <Plus className="w-4 h-4 mr-2" /> Add Material
                    </Button>
                  )}
                </div>

                {store.status === 'approved' ? (
                  products.length === 0 ? (
                    <Card className="rounded-2xl border-slate-200 shadow-sm border-dashed">
                      <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                          <Package className="w-8 h-8" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">Your inventory is empty</h4>
                          <p className="text-sm text-slate-500 mt-1">Add your first construction material to start selling.</p>
                        </div>
                        <Button variant="outline" onClick={() => setActiveTab('add-product')} className="mt-4">Import Catalog</Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.map(p => (
                        <Card key={p.id} className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
                          <div className="h-32 bg-slate-100 flex items-center justify-center text-slate-300">
                            <Box className="w-12 h-12" />
                          </div>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-slate-800">{p.name}</h4>
                              <span className="text-xs font-bold text-brand-orange-600 bg-orange-50 px-2 py-1 rounded-full">{p.price} ₽</span>
                            </div>
                            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{p.description}</p>
                            <div className="flex items-center justify-between mt-auto">
                              <span className="text-xs font-medium text-slate-500">Stock: {p.stock}</span>
                              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{p.category}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl text-amber-800">
                    <h4 className="font-bold mb-2">Store under review</h4>
                    <p className="text-sm">Our trust and safety team is reviewing your store information. You will be notified once your store is approved and ready to accept orders.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-2xl space-y-6">
                <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-sm">
                  <h3 className="font-bold text-lg mb-2">Become a Seller</h3>
                  <p className="text-sm text-slate-300">Join hundreds of suppliers on BuildMarket. Complete your registration to list your materials and reach more buyers.</p>
                </div>
                
                <Card className="rounded-2xl border-slate-200 shadow-sm">
                  <CardContent className="p-6">
                    <form onSubmit={handleRegisterStore} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Store Name</label>
                        <Input name="name" required placeholder="e.g. Iron & Steel Pro" className="bg-slate-50" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                        <Input name="description" required placeholder="Short description of your supply" className="bg-slate-50" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Address</label>
                          <Input name="address" required placeholder="Storage Location" className="bg-slate-50" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone</label>
                          <Input name="phone" required placeholder="Contact Number" className="bg-slate-50" />
                        </div>
                      </div>
                      <Button type="submit" className="w-full mt-2 bg-brand-orange-500 hover:bg-brand-orange-600 text-white h-12 text-sm font-bold">
                        Submit Store Application
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {activeTab === 'add-product' && store && (
              <div className="space-y-6 max-w-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-800">Add New Product</h2>
                  <Button variant="outline" onClick={() => setActiveTab('store')}>Back to Inventory</Button>
                </div>
                <Card className="rounded-2xl border-slate-200 shadow-sm">
                  <CardContent className="p-6">
                    <form onSubmit={handleAddProduct} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Product Name</label>
                        <Input name="name" required placeholder="e.g. Cement M500, 50kg" className="bg-slate-50" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                        <Input name="description" required placeholder="Detailed description of the material" className="bg-slate-50" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Price (₽)</label>
                          <Input name="price" type="number" min="0" required placeholder="900" className="bg-slate-50" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Stock / Quantity</label>
                          <Input name="stock" type="number" min="0" required placeholder="100" className="bg-slate-50" />
                        </div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 font-medium border border-blue-200">
                        ✨ <b>AI Assistant:</b> Product category and tags will be automatically determined by Gemini AI based on the product name and description you provide.
                      </div>
                      <Button type="submit" disabled={addingProduct} className="w-full mt-4 bg-brand-orange-500 hover:bg-brand-orange-600 text-white h-12 text-sm font-bold">
                        {addingProduct ? 'Categorizing and Adding...' : 'Add Auto-Categorized Product'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-800">My Orders</h2>
                <div className="grid gap-4">
                  {myOrders.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm">You haven't placed any orders yet.</div>
                  ) : (
                    myOrders.map(o => (
                      <Card key={o.id} className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Order #{o.id.substring(0, 8)}</p>
                              <p className="font-bold text-slate-800 text-lg">{o.totalAmount} ₽</p>
                            </div>
                            <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
                                o.status === 'completed' ? 'bg-green-100 text-green-700' :
                                o.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                o.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                                'bg-red-100 text-red-700'
                              }`}>{o.status}</span>
                          </div>
                          <div className="space-y-2 mb-4">
                            {o.items?.map((item: any, i: number) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="text-slate-600">{item.name} x {item.quantity}</span>
                                <span className="font-medium text-slate-800">{item.price * item.quantity} ₽</span>
                              </div>
                            ))}
                          </div>
                          {o.status === 'pending' && (
                            <Button variant="destructive" size="sm" onClick={() => handleUpdateOrder(o.id, 'cancelled', true)}>Cancel Order</Button>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'store-orders' && store && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-800">Customer Orders</h2>
                <div className="grid gap-4">
                  {storeOrders.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm">No incoming orders yet.</div>
                  ) : (
                    storeOrders.map(o => (
                      <Card key={o.id} className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Order #{o.id.substring(0, 8)}</p>
                              <p className="font-bold text-slate-800 text-lg">{o.totalAmount} ₽</p>
                            </div>
                            <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
                                o.status === 'completed' ? 'bg-green-100 text-green-700' :
                                o.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                o.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                                'bg-red-100 text-red-700'
                              }`}>{o.status}</span>
                          </div>
                          <div className="space-y-2 mb-4">
                            {o.items?.map((item: any, i: number) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="text-slate-600">{item.name} x {item.quantity}</span>
                                <span className="font-medium text-slate-800">{item.price * item.quantity} ₽</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex gap-2">
                            {o.status === 'pending' && (
                              <Button size="sm" className="bg-brand-orange-500 hover:bg-brand-orange-600" onClick={() => handleUpdateOrder(o.id, 'accepted', false)}>Accept Order</Button>
                            )}
                            {o.status === 'accepted' && (
                              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateOrder(o.id, 'completed', false)}>Mark Completed</Button>
                            )}
                            {(o.status === 'pending' || o.status === 'accepted') && (
                              <Button variant="destructive" size="sm" onClick={() => handleUpdateOrder(o.id, 'cancelled', false)}>Cancel</Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'admin' && user.role === 'admin' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">Platform Statistics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-brand-blue-900 p-6 rounded-2xl text-white">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">Total Stores</p>
                      <p className="text-4xl font-black">{adminStats?.totalStores || 0}</p>
                    </div>
                    <div className="bg-brand-orange-50 p-6 rounded-2xl">
                      <p className="text-xs text-brand-orange-600/70 font-bold uppercase tracking-widest mb-2">Total Products</p>
                      <p className="text-4xl font-black text-brand-orange-600">{adminStats?.totalProducts || 0}</p>
                    </div>
                    <div className="bg-green-50 p-6 rounded-2xl">
                      <p className="text-xs text-green-700/70 font-bold uppercase tracking-widest mb-2">Total Orders</p>
                      <p className="text-4xl font-black text-green-700">{adminStats?.totalOrders || 0}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-slate-800">Global Categories</h2>
                    <Button variant="outline" size="sm">Add Category</Button>
                  </div>
                  <Card className="rounded-2xl border-slate-200">
                    <CardContent className="p-0">
                       <ul className="divide-y divide-slate-100">
                         <li className="p-4 flex justify-between items-center text-sm"><span className="font-medium text-slate-700">Lumber & Composites</span><Button variant="ghost" size="sm">Edit</Button></li>
                         <li className="p-4 flex justify-between items-center text-sm"><span className="font-medium text-slate-700">Plumbing & Valves</span><Button variant="ghost" size="sm">Edit</Button></li>
                         <li className="p-4 flex justify-between items-center text-sm"><span className="font-medium text-slate-700">Electrical & Wiring</span><Button variant="ghost" size="sm">Edit</Button></li>
                         <li className="p-4 flex justify-between items-center text-sm"><span className="font-medium text-slate-700">Masonry & Cement</span><Button variant="ghost" size="sm">Edit</Button></li>
                       </ul>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-4">Store Applications</h2>
                  <div className="grid gap-4">
                    {adminStores.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm">No stores found</div>
                    ) : (
                      adminStores.map(s => (
                        <div key={s.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-lg text-slate-800">{s.name}</h3>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                s.status === 'approved' ? 'bg-green-100 text-green-700' :
                                s.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                              }`}>{s.status}</span>
                            </div>
                            <p className="text-sm text-slate-500">{s.address} • {s.phone}</p>
                            <p className="text-sm text-slate-600 mt-2">{s.description}</p>
                          </div>
                          <div className="flex gap-2">
                            {s.status === 'pending' && (
                              <>
                                <Button size="sm" onClick={() => handleApproveStore(s.id, 'approved')} className="bg-green-600 hover:bg-green-700 text-white">Approve</Button>
                                <Button size="sm" onClick={() => handleApproveStore(s.id, 'rejected')} variant="destructive">Reject</Button>
                              </>
                            )}
                            {s.status === 'approved' && (
                              <Button size="sm" onClick={() => handleApproveStore(s.id, 'rejected')} variant="destructive">Revoke</Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'store-settings' && store && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-800">Store Settings</h2>
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <form onSubmit={handleUpdateStore} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Store Name</label>
                    <Input name="name" defaultValue={store.name} required className="bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                    <Input name="description" defaultValue={store.description} required className="bg-slate-50" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Address</label>
                      <Input name="address" defaultValue={store.address} required className="bg-slate-50" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone</label>
                      <Input name="phone" defaultValue={store.phone} required className="bg-slate-50" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Operating Hours</label>
                    <Input name="operatingHours" defaultValue={store.operatingHours || ''} placeholder="e.g. Mon-Fri: 9 AM - 6 PM" className="bg-slate-50" />
                  </div>
                  <Button type="submit" className="w-full mt-4 bg-slate-800 text-white hover:bg-slate-700 h-12 text-sm font-bold">
                    Save Updates
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

      </main>
    </div>
  );
}

