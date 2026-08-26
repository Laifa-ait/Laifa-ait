import React, { useEffect, useState } from 'react';
import { Headphones, Package, Heart, LogOut, ChevronRight, Settings, ShoppingBag, Clock, ShieldCheck, Store, Sparkles, RotateCcw, Star } from 'lucide-react';
import { BuyerSupport } from './BuyerSupport';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiGet } from '../lib/api';
import { formatPrice } from '../utils/format';
import { getRetroAvatar } from '../utils/avatar';
import { normalizeTimestamp, AppTimestamp } from '../utils/date';
import { BUYER_ORDERS_PER_PAGE } from '../constants/ui';

// Core Modular Components
import { AddressManager } from '../components/Buyer/AddressManager';
import { ProfileSettings } from '../components/Buyer/ProfileSettings';
import { SecuritySettings } from '../components/Buyer/SecuritySettings';
import { CustomerPreferences } from '../components/Buyer/CustomerPreferences';
import { ReturnManagement } from '../components/Buyer/ReturnManagement';
import { MyReviews } from '../components/Buyer/MyReviews';
import { FollowedStores } from '../components/Buyer/FollowedStores';

export interface BuyerOrder {
  id: string;
  userId: string;
  total: number;
  status: string;
  createdAt: AppTimestamp;
  items: Array<{ name: string; quantity: number; price: number; image?: string }>;
  shippingAddress?: { wilaya: string; communes?: string; commune?: string };
  unreadBuyerMessages?: boolean;
  unreadSellerMessages?: boolean;
  lastMessageText?: string;
  lastMessageAt?: AppTimestamp;
}

export const BuyerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, userProfile, logout } = useAuth();
  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<string | null>(null);

  // Modern UI multi-tab router (Module 5) with URL persistence
  const activeTab = (searchParams.get('tab') || 'orders') as 'orders' | 'addresses' | 'profile' | 'security' | 'preferences' | 'support' | 'returns' | 'reviews' | 'following';
  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const formatOrderDate = (createdAt: AppTimestamp | null | undefined) => {
    if (!createdAt) return "";
    try {
      return normalizeTimestamp(createdAt).toDate().toLocaleDateString();
    } catch (e) {
      console.error("Error formatting order date:", e);
      return "";
    }
  };

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth', { replace: true });
      return;
    }

    let cancelled = false;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await apiGet<{ orders: BuyerOrder[], lastVisible: string | null }>(`/api/v1/buyer/orders?limit=${BUYER_ORDERS_PER_PAGE}`);
        if (!cancelled && data && data.orders) {
          setOrders(data.orders);
          setLastVisible(data.lastVisible);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error fetching orders:", err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, [currentUser, navigate]);

  const loadMoreOrders = async () => {
    if (!currentUser || !lastVisible || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await apiGet<{ orders: BuyerOrder[], lastVisible: string | null }>(`/api/v1/buyer/orders?limit=${BUYER_ORDERS_PER_PAGE}&startAfter=${lastVisible}`);
      if (data && data.orders) {
        setOrders(prev => [...prev, ...data.orders]);
        setLastVisible(data.lastVisible);
      }
    } catch (err) {
      console.error("Error fetching more orders:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!currentUser) return null;


  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
      {/* Mobile-first top header navigation tabs */}
      <div className="md:hidden mb-6 overflow-x-auto -mx-4 px-4 flex gap-2 pb-2 scrollbar-none snap-x">
        {[
          { id: 'orders', icon: Package, label: t("dashboard.tabs.orders") },
          { id: 'returns', icon: RotateCcw, label: t("dashboard.tabs.returns") },
          { id: 'reviews', icon: Star, label: t("dashboard.tabs.evaluations") || "Mes Avis" },
          { id: 'following', icon: Store, label: t("dashboard.tabs.followed_stores") || "Boutiques Suivies" },
          { id: 'profile', icon: Settings, label: t("profile_addresses") },
          { id: 'preferences', icon: Sparkles, label: t("dashboard.tabs.preferences") || "Mes Préférences" },
          { id: 'security', icon: ShieldCheck, label: t("dashboard.tabs.security") || "Sécurité" },
          { id: 'support', icon: Headphones, label: t("support") },
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as typeof activeTab)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs whitespace-nowrap transition-all duration-250 snap-start border ${
                isSelected 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-slate-900' : ''}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 animate-in fade-in duration-300">
        {/* Sidebar */}
        <div className="col-span-1 md:col-span-4 lg:col-span-3 space-y-4 md:space-y-6">
          {/* Compact Profile Card */}
          <div className="bg-transparent p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-200/50 rounded-full blur-2xl pointer-events-none" />
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-sm shrink-0">
              <img loading="lazy" 
                src={userProfile?.photoURL || currentUser.photoURL || getRetroAvatar(currentUser.email || currentUser.uid) || undefined} 
                className="w-full h-full object-cover" 
                alt={userProfile?.displayName || "Profile"} 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-extrabold text-slate-900 truncate text-lg leading-tight">
                {userProfile?.displayName || currentUser.displayName}
              </h2>
              <p className="text-slate-500 text-[10px] font-sans font-bold uppercase tracking-widest rtl:tracking-normal mt-1 truncate">
                {userProfile?.role === 'admin' ? t("common.admin") : (userProfile?.role === 'seller' ? t("common.seller") : t("common.buyer"))}
              </p>
            </div>
          </div>

          {/* Desktop/Tablet Left Nav Menu */}
          <nav className="hidden md:block bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-3 space-y-1">
            {[
              { id: 'orders', icon: Package, label: t("dashboard.tabs.orders") },
              { id: 'returns', icon: RotateCcw, label: t("dashboard.tabs.returns") },
              { id: 'reviews', icon: Star, label: t("dashboard.tabs.evaluations") || "Mes Avis" },
              { id: 'following', icon: Store, label: t("dashboard.tabs.followed_stores") || "Boutiques Suivies" },
              { id: 'profile', icon: Settings, label: t("profile_addresses") },
              { id: 'preferences', icon: Sparkles, label: t("dashboard.tabs.preferences") || "Mes Préférences" },
              { id: 'security', icon: ShieldCheck, label: t("dashboard.tabs.security") || "Sécurité" },
              { id: 'support', icon: Headphones, label: t("support") },
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as typeof activeTab)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all border-none ${
                    isActive 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'bg-transparent text-slate-600 hover:bg-transparent hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                    <span className="font-bold text-sm tracking-tight rtl:tracking-normal">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 rtl:rotate-180 text-slate-900" />}
                </button>
              );
            })}
            
            <div className="h-[1px] bg-slate-100 my-2 mx-4" />
            
            {[
              { icon: Heart, label: t("wishlist"), onClick: () => navigate('/shop') },
              ...(userProfile?.role === 'admin' ? [{ icon: ShieldCheck, label: t("administration"), onClick: () => navigate('/dashboard/admin') }] : []),
              ...(userProfile?.role === 'seller' ? [{ icon: Store, label: t("seller_dashboard"), onClick: () => navigate('/dashboard/seller') }] : []),
            ].map((item, i) => (
              <button
                key={i}
                onClick={item.onClick}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-slate-600 hover:bg-transparent hover:text-slate-900 border-none bg-transparent"
              >
                <item.icon className="w-5 h-5 text-slate-400" />
                <span className="font-bold text-sm tracking-tight rtl:tracking-normal">{item.label}</span>
              </button>
            ))}
            
            <div className="h-[1px] bg-slate-100 my-2 mx-4" />
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-600 hover:bg-red-50 transition-all font-bold text-sm border-none bg-transparent"
            >
              <LogOut className="w-5 h-5 text-red-500" />
              <span className="tracking-tight rtl:tracking-normal">{t("logout") || "Déconnexion"}</span>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="col-span-1 md:col-span-8 lg:col-span-9 space-y-6 md:space-y-8">
          {activeTab === 'orders' && (
            <>
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-sans font-bold text-slate-900 tracking-tight rtl:tracking-normal">{t("dashboard.title")}</h1>
                  <p className="text-slate-500 text-sm mt-1">{t("dashboard.subtitle")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-transparent flex items-center justify-center text-slate-500">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest rtl:tracking-normal leading-none mb-1">{t("dashboard.stats.orders")}</p>
                      <p className="font-sans font-bold text-lg text-slate-900 leading-none">{orders.length}</p>
                    </div>
                  </div>
                </div>
              </header>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2 text-slate-900">
                    <Clock className="w-5 h-5 text-slate-400" />
                    {t("recent_orders")}
                  </h3>
                </div>

                <div className="p-0">
                  {loading ? (
                    <div className="p-6 space-y-4">
                      {[1, 2, 3].map((n) => (
                        <div key={n} className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 rounded-3xl bg-transparent animate-pulse">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-slate-200/60 rounded-2xl" />
                            <div className="space-y-2">
                              <div className="h-4 w-32 bg-slate-200/60 rounded-lg animate-pulse" />
                              <div className="h-3 w-44 bg-slate-200/40 rounded-lg animate-pulse" />
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="space-y-2">
                              <div className="h-3 w-12 bg-slate-200/60 rounded animate-pulse" />
                              <div className="h-4 w-20 bg-slate-200/80 rounded animate-pulse" />
                            </div>
                            <div className="w-10 h-10 bg-slate-200/60 rounded-xl" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="p-8 md:p-12 min-h-[400px] flex flex-col justify-center items-center text-center bg-transparent m-4 md:m-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/10 rounded-full blur-3xl pointer-events-none" />
                      
                      <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-400 shadow-sm relative z-10 mb-6">
                        <ShoppingBag className="w-8 h-8 text-slate-500" />
                      </div>
                      
                      <h4 className="text-xl md:text-2xl font-sans font-bold text-slate-900 tracking-tight rtl:tracking-normal relative z-10">{t("dashboard.no_purchases")}</h4>
                      <p className="text-xs text-slate-500 mt-3 max-w-md mx-auto font-medium leading-relaxed relative z-10">
                        {t("dashboard.no_purchases_desc") || "Vous n'avez pas encore passé de commande sur notre plateforme. Nos vendeurs des 58 Wilayas proposent des produits uniques."}
                      </p>
                      
                      <button 
                        onClick={() => navigate('/shop')}
                        className="mt-8 relative z-10 inline-flex items-center gap-2.5 px-8 py-3.5 bg-slate-900 hover:bg-[#0a0b0c] text-white font-extrabold text-[11px] uppercase tracking-widest rtl:tracking-normal rounded-2xl shadow-lg shadow-slate-900/20 transition-all active:scale-95 border-none cursor-pointer"
                      >
                        {t("dashboard.explore_catalog") || "Explorer le Catalogue"}
                        <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {orders.map((order) => {
                        
                        return (
                                              <div key={order.id} className="p-6 hover:bg-transparent transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                                                <div className="flex items-center gap-4">
                                                  <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
                                                    {order.items?.[0]?.image ? (
                                                       <img loading="lazy" src={order.items[0].image} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                       <Package className="w-6 h-6 text-slate-400" />
                                                    )}
                                                  </div>
                                                  <div>
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                      <span className="font-sans font-bold text-sm tracking-tight rtl:tracking-normal text-slate-900">{t("dashboard.orders.id_prefix") || "Commande #"} {order.id.substring(0, 8)}</span>
                                                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest rtl:tracking-normal ${
                                                        order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                                                        order.status === 'pending' ? 'bg-slate-100 text-slate-600' : 'bg-slate-100 text-slate-600'
                                                      }`}>
                                                        {order.status === 'pending' ? t("status_pending") : t("order.status.completed") || "Terminée"}
                                                      </span>
                                                      {order.unreadBuyerMessages && (
                                                        <span className="flex items-center gap-1 bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full text-[9px] font-black animate-pulse uppercase tracking-wider">
                                                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                                                          💬 {t("Nouveau message")}
                                                        </span>
                                                      )}
                                                    </div>
                                                    <p className="text-xs text-slate-400 font-medium">{order.items?.length || 0} {t("articles •")} {formatOrderDate(order.createdAt)}</p>
                                                    {order.lastMessageText && (
                                                      <p className="text-[11px] text-slate-500 font-medium italic mt-1.5 flex items-center gap-1 truncate max-w-[280px] sm:max-w-md">
                                                        <span className="font-bold text-slate-600 font-sans">{t("Dernier message :")}</span>
                                                        <span>{order.lastMessageText}</span>
                                                      </p>
                                                    )}
                                                  </div>
                                                </div>
                                                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-none pt-4 md:pt-0">
                                                  <div className="text-right">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest rtl:tracking-normal mb-1">{t("Total")}</p>
                                                    <p className="font-sans font-bold text-lg text-slate-900">{formatPrice(order.total)}</p>
                                                  </div>
                                                  <button onClick={() => navigate(`/dashboard/buyer/order/${order.id}`)} className="w-10 h-10 rounded-xl bg-transparent border border-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-slate-900 group-hover:border-slate-900 group-hover:text-white transition-all cursor-pointer">
                                                    <ChevronRight className="w-5 h-5 rtl:rotate-180" />
                                                  </button>
                                                </div>
                                              </div>
                                            );
                      })}
                    </div>
                  )}
                  {lastVisible && orders.length > 0 && (
                    <div className="p-6 border-t border-slate-50 flex justify-center bg-transparent/10">
                      <button 
                        onClick={loadMoreOrders} 
                        disabled={loadingMore}
                        className="px-8 py-3 bg-white border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-widest rtl:tracking-normal rounded-xl hover:bg-transparent transition-all active:scale-95 disabled:opacity-50 min-h-[44px] cursor-pointer"
                      >
                        {loadingMore ? t("common.loading") || "Chargement..." : t("common.load_more") || "Charger plus"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-12">
              <ProfileSettings currentUser={currentUser} userProfile={userProfile} />
              
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-200/85" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-transparent px-4 text-slate-400 font-sans text-[10px] tracking-widest uppercase font-sans font-bold">
                    {t("addresses_management")}
                  </span>
                </div>
              </div>

              <AddressManager currentUser={currentUser} userProfile={userProfile} />
            </div>
          )}

          {activeTab === 'security' && (
            <SecuritySettings currentUser={currentUser} />
          )}

          {activeTab === 'support' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
               <BuyerSupport />
            </div>
          )}

          {activeTab === 'returns' && (
            <ReturnManagement currentUser={currentUser} />
          )}

          {activeTab === 'reviews' && (
            <MyReviews currentUser={currentUser} />
          )}

          {activeTab === 'following' && (
            <FollowedStores currentUser={currentUser} />
          )}

          {activeTab === 'preferences' && (
            <CustomerPreferences currentUser={currentUser} userProfile={userProfile} />
          )}
        </div>
      </div>
    </div>
  );
};
