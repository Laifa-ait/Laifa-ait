import React, { useMemo } from "react";
import { Home, LayoutGrid, Heart, ShoppingBag, User as UserIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useUI } from "../context/UIContext";
import { CurvedBottomNav, CurvedNavItem } from "./ui/CurvedBottomNav";

interface MobileBottomNavProps {
  hideOnRoutes?: string[];
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ hideOnRoutes = [] }) => {
  const { currentUser } = useAuth();
  const { cart, wishlist } = useCart();
  const {
    isCartOpen,
    setIsCartOpen,
    isWishlistOpen,
    setIsWishlistOpen,
    isAccountMenuOpen,
    setIsAccountMenuOpen,
  } = useUI();
  const location = useLocation();
  const navigate = useNavigate();

  const isHidden =
    isCartOpen ||
    hideOnRoutes.some(
      (route) =>
        location.pathname === route ||
        location.pathname.startsWith(route + "/") ||
        (route.length > 1 && location.pathname.startsWith(route))
    );

  // Détermination de l'identifiant d'onglet actif
  const activeId = useMemo(() => {
    if (isCartOpen || location.pathname === "/cart") return "cart";
    if (isWishlistOpen || location.pathname === "/wishlist") return "wishlist";
    if (
      isAccountMenuOpen ||
      location.pathname.startsWith("/auth") ||
      location.pathname.startsWith("/login") ||
      location.pathname.startsWith("/register") ||
      location.pathname.startsWith("/onboarding") ||
      location.pathname.startsWith("/verify-email") ||
      location.pathname.startsWith("/forgot-password") ||
      location.pathname.startsWith("/dashboard") ||
      location.pathname.startsWith("/profile") ||
      location.pathname.startsWith("/account")
    ) {
      return "account";
    }
    if (location.pathname === "/categories" || location.pathname.startsWith("/category")) {
      return "categories";
    }
    return "home";
  }, [isCartOpen, isWishlistOpen, isAccountMenuOpen, location.pathname]);

  if (isHidden) {
    return null;
  }

  const navItems: CurvedNavItem[] = [
    {
      id: "home",
      icon: Home,
      ariaLabel: "Accueil",
      onClick: () => {
        setIsCartOpen(false);
        setIsWishlistOpen(false);
        setIsAccountMenuOpen(false);
        navigate("/");
      },
    },
    {
      id: "categories",
      icon: LayoutGrid,
      ariaLabel: "Catégories",
      onClick: () => {
        setIsCartOpen(false);
        setIsWishlistOpen(false);
        setIsAccountMenuOpen(false);
        navigate("/categories");
      },
    },
    {
      id: "wishlist",
      icon: Heart,
      ariaLabel: wishlist.length > 0 ? `Favoris (${wishlist.length})` : "Favoris",
      badge: wishlist.length > 0 ? wishlist.length : undefined,
      onClick: () => {
        setIsCartOpen(false);
        setIsAccountMenuOpen(false);
        setIsWishlistOpen(!isWishlistOpen);
      },
    },
    {
      id: "cart",
      icon: ShoppingBag,
      ariaLabel: cart.length > 0 ? `Panier (${cart.length})` : "Panier",
      badge: cart.length > 0 ? (cart.length > 99 ? "99+" : cart.length) : undefined,
      onClick: () => {
        setIsWishlistOpen(false);
        setIsAccountMenuOpen(false);
        setIsCartOpen(!isCartOpen);
      },
    },
    {
      id: "account",
      icon: UserIcon,
      ariaLabel: "Mon compte",
      onClick: () => {
        setIsCartOpen(false);
        setIsWishlistOpen(false);
        if (!currentUser) {
          navigate("/auth");
          return;
        }
        setIsAccountMenuOpen(!isAccountMenuOpen);
      },
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[200] pointer-events-none">
      <div className="pointer-events-auto">
        <CurvedBottomNav
          items={navItems}
          activeId={activeId}
          onChange={() => {}}
        />
      </div>
    </div>
  );
};
