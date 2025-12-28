import React, { createContext, useState, useEffect } from 'react';
import { db } from './firebase'; 
import { ref, onValue, set, push, remove, update } from "firebase/database";

export const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  // لێرە دڵنیابە کو ئەم always array وەردەگرین
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // هەر گوهۆڕینەک د سەبەتێ دا رووبدەت، د LocalStorage دا پاشکەفت بکە
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // --- 1. خاندنا داتایان ژ Firebase ---
  useEffect(() => {
    const productsRef = ref(db, 'products');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setProducts(productList);
      } else {
        setProducts([]);
      }
    });

    const ordersRef = ref(db, 'orders');
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const orderList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setOrders(orderList);
      } else {
        setOrders([]);
      }
    });
  }, []);

  // --- 2. بڕێوەبرنا بەرهەمان ---
  const addProduct = async (newProduct) => {
    const productsRef = ref(db, 'products');
    const newProductRef = push(productsRef);
    await set(newProductRef, { ...newProduct, id: newProductRef.key });
  };

  const deleteProduct = async (firebaseId) => {
    await remove(ref(db, `products/${firebaseId}`));
  };

  const updateProduct = async (firebaseId, updatedData) => {
    await update(ref(db, `products/${firebaseId}`), updatedData);
  };

  // --- 3. لۆجیکێ سەبەتێ (The Fix) ---
  
  const addToCart = (product) => {
    setCartItems((prev) => {
      // ئەگەر سایز دیار نەکرابیت، "گشتی" دابنێ دا کێشە دروست نەبن
      const productSize = product.size || "گشتی"; 
      
      const isExist = prev.find(item => item.id === product.id && item.size === productSize);
      
      if (isExist) {
        return prev.map(item => 
          (item.id === product.id && item.size === productSize) 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
        );
      }
      return [...prev, { ...product, size: productSize, quantity: 1 }];
    });
  };

  const removeFromCart = (productId, size) => {
    setCartItems(prev => {
      // ئەگەر سایز نەهاتە فرێکرن، بێژە "گشتی"
      const targetSize = size || "گشتی";
      
      return prev.map(item => {
        if (item.id === productId && item.size === targetSize) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const deleteFromCart = (productId, size) => {
    setCartItems(prev => {
      const targetSize = size || "گشتی";
      return prev.filter(item => !(item.id === productId && item.size === targetSize));
    });
  };

  const clearCart = () => setCartItems([]);

  // --- 4. ئۆردەر (چارەسەریا Error) ---
  const addOrder = async (orderData) => {
    try {
      const ordersRef = ref(db, 'orders');
      const newOrderPush = push(ordersRef);
      const finalOrder = { ...orderData, firebaseId: newOrderPush.key };
      
      await set(newOrderPush, finalOrder);
      return true; 
    } catch (error) {
      console.error("Error in addOrder:", error);
      throw error; 
    }
  };

  const updateOrderStatus = async (firebaseId, status) => {
    await update(ref(db, `orders/${firebaseId}`), { status });
  };

  return (
    <ShopContext.Provider value={{ 
      products, addProduct, deleteProduct, updateProduct,
      cartItems, addToCart, removeFromCart, deleteFromCart, clearCart,
      orders, addOrder, updateOrderStatus 
    }}>
      {children}
    </ShopContext.Provider>
  );
};