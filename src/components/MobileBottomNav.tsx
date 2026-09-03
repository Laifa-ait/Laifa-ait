import React from "react";
import { Home, Heart, ShoppingBag, User as UserIcon, LayoutGrid } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useUI } from "../context/UIContext";

export const MobileBottomNav: React.FC<{ hideOnRoutes?: string[] }> = ({ hideOnRoutes = [] }) => {
  const { currentUser, userProfile } = useAuth();
  const { cart, wishlist } = useCart();
  const { setIsCartOpen, setIsWishlistOpen, isStickyBuyBarVisible } = useUI();
  const location = useLocation();
  const navigate = useNavigate();

  const isHidden = hideOnRoutes.some(
    (route) =>
      location.pathname === route ||
      location.pathname.startsWith(route + "/") ||
      (route.length > 1 && location.pathname.startsWith(route))
  );
  if (isHidden || isStickyBuyBarVisible) {
    return null;
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-zinc-100 z-50 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] overflow-hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-[3.8rem] w-full px-1">
        {/* Home / Accueil */}
        <button
          onClick={() => navigate("/")}
          aria-label="Accueil"
          className="flex flex-col items-center justify-center flex-1 py-1 active:scale-95 transition-all bg-transparent border-none cursor-pointer"
        >
          <div className={`p-1 rounded-2xl transition-all ${isActive("/") ? "bg-orange-500 text-white shadow-xs" : "text-zinc-500"}`}>
            <Home className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className={`text-[10px] font-bold mt-0.5 ${isActive("/") ? "text-orange-600" : "text-zinc-500"}`}>
            Accueil
          </span>
        </button>

        {/* Categories */}
        <button
          onClick={() => navigate("/categories")}
          aria-label="Catégories"
          className="flex flex-col items-center justify-center flex-1 py-1 active:scale-95 transition-all bg-transparent border-none cursor-pointer"
        >
          <div className={`p-1 rounded-2xl transition-all ${isActive("/categories") ? "bg-orange-50 text-orange-600" : "text-zinc-500"}`}>
            <LayoutGrid className="w-5 h-5 stroke-[2]" />
          </div>
          <span className={`text-[10px] font-bold mt-0.5 ${isActive("/categories") ? "text-orange-600" : "text-zinc-500"}`}>
            Catégories
          </span>
        </button>

        {/* Wishlist / Favoris */}
        <button
          onClick={() => setIsWishlistOpen(true)}
          aria-label={wishlist.length > 0 ? `Favoris, ${wishlist.length} articles` : "Favoris"}
          className="flex flex-col items-center justify-center flex-1 py-1 active:scale-95 transition-all relative bg-transparent border-none cursor-pointer"
        >
          <div className="relative p-1 rounded-2xl text-zinc-500">
            <Heart className="w-5 h-5 stroke-[2]" />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full shadow-xs" />
            )}
          </div>
          <span className="text-[10px] font-bold text-zinc-500 mt-0.5">
            Favoris
          </span>
        </button>

        {/* Cart / Panier */}
        <button
          onClick={() => setIsCartOpen(true)}
          aria-label={cart.length > 0 ? `Panier, ${cart.length} articles` : "Panier"}
          className="flex flex-col items-center justify-center flex-1 py-1 active:scale-95 transition-all relative bg-transparent border-none cursor-pointer"
        >
          <div className="relative p-1 rounded-2xl text-zinc-500">
            <ShoppingBag className="w-5 h-5 stroke-[2]" />
            {cart.length > 0 && (
              <span 
                className="absolute -top-0.5 -right-1 min-w-4 h-4 bg-[#FF5000] text-white text-[9px] rounded-full flex items-center justify-center font-extrabold px-1 border border-white shadow-xs"
              >
                {cart.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold text-zinc-500 mt-0.5">
            Panier
          </span>
        </button>

        {/* Account / Mon Olmart */}
        <button
          onClick={() => {
            if (!currentUser) {
              navigate("/auth", { replace: true });
              return;
            }
            if (userProfile?.role === "admin") {
              navigate("/dashboard/admin");
            } else if (userProfile?.role === "seller") {
              navigate("/dashboard/seller");
            } else {
              navigate("/dashboard/buyer");
            }
          }}
          aria-label="Mon compte"
          className="flex flex-col items-center justify-center flex-1 py-1 active:scale-95 transition-all bg-transparent border-none cursor-pointer"
        >
          <div className={`p-1 rounded-2xl ${location.pathname.startsWith("/dashboard") ? "bg-orange-50 text-orange-600" : "text-zinc-500"}`}>
            <UserIcon className="w-5 h-5 stroke-[2]" />
          </div>
          <span className={`text-[10px] font-bold mt-0.5 ${location.pathname.startsWith("/dashboard") ? "text-orange-600" : "text-zinc-500"}`}>
            Mon Olmart
          </span>
        </button>
      </div>
    </div>
  );
};

