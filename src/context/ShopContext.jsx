import React, { createContext, useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { ref, onValue, push, remove, update } from "firebase/database";

export const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // --- 1. خویندنا داتایان ب شێوێ Real-time ---
  useEffect(() => {
    // خویندنا بەرهەمان
    onValue(ref(db, 'products'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setProducts(productList);
      } else { setProducts([]); }
    });

    // خویندنا ئۆردەران
    onValue(ref(db, 'orders'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const orderList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setOrders(orderList);
      } else { setOrders([]); }
    });

    // خویندنا ئاگەهدارییان
    onValue(ref(db, 'notifications'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notifList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        // ڕێزبەندکرن ژ نویترین بۆ کۆنترین
        setNotifications(notifList.reverse());
      } else { setNotifications([]); }
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // --- 2. کارێن ئەدمینی (Admin Functions) ---
  const addProduct = async (productData) => {
    try {
      await push(ref(db, 'products'), productData);
      return true;
    } catch (error) { console.error(error); return false; }
  };

  const updateProduct = async (productId, updatedData) => {
    try {
      await update(ref(db, `products/${productId}`), {
        ...updatedData,
        discount: Number(updatedData.discount) || 0,
        price: Number(updatedData.price)
      });
      return true;
    } catch (error) { return false; }
  };

  const deleteProduct = async (productId) => {
    try {
      await remove(ref(db, `products/${productId}`));
      return true;
    } catch (error) { return false; }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await update(ref(db, `orders/${orderId}`), { status: newStatus });
      return true;
    } catch (error) { return false; }
  };

  // --- 3. لۆجیکێ ئاگەهدارییان (Notification Logic) ---
  
  // نیشانکرنا هەمییان وەک خواندی د ناڤ Firebase دا
  const markAllAsRead = async () => {
    try {
      const updates = {};
      notifications.forEach(notif => {
        if (!notif.isRead) {
          updates[`/notifications/${notif.id}/isRead`] = true;
        }
      });
      await update(ref(db), updates);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  // زێدەکرنا ئاگەهدارییەکا نوی (بۆ نموونە دەمێ ئۆردەرەک دهێت)
  const createNotification = async (message) => {
    try {
      const notifRef = ref(db, 'notifications');
      await push(notifRef, {
        message,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    } catch (error) { console.error(error); }
  };

  // --- 4. لۆجیکێ سەبەتێ (Cart Logic) ---
  const addToCart = (product) => {
    setCartItems((prev) => {
      const isExist = prev.find(item => 
        item.productId === product.productId && 
        item.selectedSize === product.selectedSize && 
        item.selectedColor === product.selectedColor
      );

      if (isExist) {
        return prev.map(item => 
          (item.productId === product.productId && 
           item.selectedSize === product.selectedSize && 
           item.selectedColor === product.selectedColor) 
          ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, id: Date.now().toString(), quantity: 1 }];
    });
  };

  const removeFromCart = (uniqueId) => {
    setCartItems(prev => prev.map(item => 
      (item.id === uniqueId) ? { ...item, quantity: item.quantity - 1 } : item
    ).filter(item => item.quantity > 0));
  };

  const deleteFromCart = (uniqueId) => {
    setCartItems(prev => prev.filter(item => item.id !== uniqueId));
  };

  const clearCart = () => setCartItems([]);

  // --- 5. زێدەکرنا ئۆردەری ---
  const addOrder = async (orderData) => {
    try {
      const ordersRef = ref(db, 'orders');
      const shortId = `KID-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const fullOrder = { 
        ...orderData, 
        orderId: shortId,
        status: 1, 
        date: new Date().toLocaleDateString('ku-IQ'),
        createdAt: new Date().toISOString() 
      };
      
      await push(ordersRef, fullOrder);
      
      // دروستکرنا ئاگەهدارییەکێ بۆ ئەدمینی
      await createNotification(`ئۆردەرەکێ نوی هات: ${shortId} ب کۆژمێ ${orderData.totalPrice} دینار`);
      
      return { success: true, orderId: shortId };
    } catch (error) { 
      return { success: false }; 
    }
  };

  return (
    <ShopContext.Provider value={{ 
      products, orders, notifications, cartItems,
      searchQuery, setSearchQuery,
      addProduct, updateProduct, deleteProduct, updateOrderStatus,
      addToCart, removeFromCart, deleteFromCart, clearCart, addOrder, markAllAsRead, createNotification
    }}>
      {children}
    </ShopContext.Provider>
  );
};