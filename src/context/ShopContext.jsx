import React, { createContext, useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { ref, onValue, push, remove, update } from "firebase/database";

export const ShopContext = createContext();

// --- ١. لیستا کۆدێن داشکاندنێ (دشێی ل ڤێرە زێدە بکەی) ---
const PROMO_CODES = {
  "HELLO10": 10,    // %10 داشکاندن
  "KURDISTAN": 20,  // %20 داشکاندن
  "OFF5": 5         // %5 داشکاندن
};

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // --- ٢. ستەیتێن Promo Code ---
  const [appliedDiscount, setAppliedDiscount] = useState(0); 
  const [promoError, setPromoError] = useState("");
  const [activePromoCode, setActivePromoCode] = useState("");

  // --- ٣. خواندنا سەبەتێ ژ LocalStorage ---
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cartItems");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) { return []; }
  });

  // --- ٤. خویندنا داتایان ب شێوێ Real-time ژ Firebase ---
  useEffect(() => {
    onValue(ref(db, 'products'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setProducts(productList);
      } else { setProducts([]); }
    });

    onValue(ref(db, 'orders'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const orderList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setOrders(orderList);
      } else { setOrders([]); }
    });

    onValue(ref(db, 'notifications'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notifList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setNotifications(notifList.reverse());
      } else { setNotifications([]); }
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // --- ٥. لۆجیکێ Promo Code ---
  const applyPromoCode = (code) => {
    if (!code || !code.trim()) {
      setPromoError("تکایە کۆدەکێ بنڤێسە");
      return false;
    }
    const upperCode = code.toUpperCase().trim();
    if (PROMO_CODES[upperCode]) {
      setAppliedDiscount(PROMO_CODES[upperCode]);
      setActivePromoCode(upperCode);
      setPromoError("");
      return true;
    } else {
      setPromoError("ئەڤ کۆدە یێ دروست نینە!");
      setAppliedDiscount(0);
      setActivePromoCode("");
      return false;
    }
  };

  const removePromoCode = () => {
    setAppliedDiscount(0);
    setActivePromoCode("");
    setPromoError("");
  };

  // --- ٦. لۆجیکێ هەژمارکرنا کۆمێ (getCartAmount) ---
  const getCartAmount = () => {
    return cartItems.reduce((total, item) => {
      // تەنێ نرخێ ئەسلی وەردگریت (Price) و جاران بڕی دکەت (Quantity)
      // سیستەم ئیتر سەیری داشکاندنا سەر بەرهەمی (Item Discount) ناکەت
      const price = Number(item.price) || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  // --- ٧. لۆجیکێ سەبەتێ (Add, Remove, Delete) ---
  const addToCart = (product) => {
    setCartItems((prev) => {
      const cartId = `${product.id || product.productId}-${product.selectedSize || 'none'}-${product.selectedColor || 'none'}`;
      const isExist = prev.find(item => item.cartId === cartId);
      if (isExist) {
        return prev.map(item => item.cartId === cartId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, cartId, quantity: 1 }];
    });
  };

  const removeFromCart = (cartId) => {
    setCartItems(prev => prev.map(item => 
      (item.cartId === cartId) ? { ...item, quantity: item.quantity - 1 } : item
    ).filter(item => item.quantity > 0));
  };

  const deleteFromCart = (cartId) => {
    setCartItems(prev => prev.filter(item => item.cartId !== cartId));
  };

  const clearCart = () => {
    setCartItems([]);
    removePromoCode();
  };

  // --- ٨. فەنکشنێن ئۆردەر و ئەدمینی ---
  const addOrder = async (orderData) => {
    try {
      const shortId = `KID-${Math.floor(1000 + Math.random() * 9000)}`;
      const fullOrder = { 
        ...orderData, 
        orderId: shortId, 
        status: 1, 
        date: new Date().toLocaleDateString('ku-IQ'), 
        createdAt: new Date().toISOString() 
      };
      await push(ref(db, 'orders'), fullOrder);
      await createNotification(`ئۆردەرەکێ نوی هات: ${shortId}`);
      return { success: true, orderId: shortId };
    } catch (error) { return { success: false }; }
  };

  const addProduct = async (data) => {
    try { await push(ref(db, 'products'), data); return true; } catch (e) { return false; }
  };

const deleteOrder = (orderId) => {
  setOrders((prevOrders) => prevOrders.filter(order => order.id !== orderId));

};

  const updateProduct = async (id, data) => {
    try { await update(ref(db, `products/${id}`), data); return true; } catch (e) { return false; }
  };

  const deleteProduct = async (id) => {
    try { await remove(ref(db, `products/${id}`)); return true; } catch (e) { return false; }
  };

  const updateOrderStatus = async (id, status) => {
    try { await update(ref(db, `orders/${id}`), { status }); return true; } catch (e) { return false; }
  };

  const createNotification = async (message) => {
    try {
      await push(ref(db, 'notifications'), { message, isRead: false, createdAt: new Date().toISOString() });
    } catch (e) { console.error(e); }
  };

  const markAllAsRead = async () => {
    try {
      const updates = {};
      notifications.forEach(notif => { if (!notif.isRead) updates[`/notifications/${notif.id}/isRead`] = true; });
      await update(ref(db), updates);
    } catch (e) { console.error(e); }
  };

  return (
    <ShopContext.Provider value={{ 
      products, orders, notifications, cartItems, searchQuery, setSearchQuery,
      appliedDiscount, promoError, activePromoCode, applyPromoCode, removePromoCode, getCartAmount,
      addProduct, updateProduct, deleteProduct, updateOrderStatus,
      addToCart, removeFromCart, deleteFromCart, clearCart, addOrder, 
      markAllAsRead, createNotification, deleteOrder
    }}>
      {children}
    </ShopContext.Provider>
  );
};