import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { InventoryItem, CartItem } from '../types';
import { BUSINESS_INFO } from '../data/businessInfo';
import { calculateSettlement, generatePayPalPaymentUrl } from '../utils/payment';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: InventoryItem, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItemCount: number;
  subtotal: number;
  buyersPremium: number;
  totalSettlement: number;
  payPalCheckoutUrl: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('hgs_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('hgs_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  const addToCart = (item: InventoryItem, quantity: number = 1) => {
    if (item.status === 'Unavailable') return;
    const qtyToAdd = Math.max(1, quantity);

    setCartItems((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + qtyToAdd } : ci
        );
      }
      return [...prev, { item, quantity: qtyToAdd }];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((ci) => ci.item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((ci) => (ci.item.id === itemId ? { ...ci, quantity } : ci))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItemCount = useMemo(() => {
    return cartItems.reduce((acc, ci) => acc + ci.quantity, 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, ci) => acc + ci.item.price * ci.quantity, 0);
  }, [cartItems]);

  const settlement = useMemo(() => {
    return calculateSettlement(subtotal, BUSINESS_INFO.terms.buyersPremiumPercent);
  }, [subtotal]);

  const payPalCheckoutUrl = useMemo(() => {
    return generatePayPalPaymentUrl(
      BUSINESS_INFO.payPalUrl,
      settlement.totalSettlement > 0 ? settlement.totalSettlement : undefined
    );
  }, [settlement.totalSettlement]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItemCount,
        subtotal,
        buyersPremium: settlement.buyersPremium,
        totalSettlement: settlement.totalSettlement,
        payPalCheckoutUrl
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
