import React, { createContext, useState, useEffect } from 'react';
import { 
  collection, onSnapshot, addDoc, doc, 
  updateDoc, deleteDoc, query, orderBy 
} from "firebase/firestore"; 
import { db } from '../firebase'; 

export const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [appliedDiscount, setAppliedDiscount] = useState(0); 
  const [promoError, setPromoError] = useState("");
  const [activePromoCode, setActivePromoCode] = useState("");

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cartItems");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) { return []; }
  });

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // --- ١. وەرگرتنا داتایان ب شێوەیەکێ داینامیکی ---
  useEffect(() => {
    setLoading(true);
    
    const unSubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const loadedProducts = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // --- چاککرنا لۆجیکێ وێنەی بۆ لاپەڕێ سەرەکی ---
        let finalMainImage = "https://via.placeholder.com/300"; // وێنەیێ دەسپێکێ

        if (data.images && data.images.length > 0) {
          // ئەگەر لیستەکا وێنەیان هەبیت (وەک وێ یا مە د AddProduct دا کری)
          finalMainImage = data.images[0];
        } else if (data.image) {
          // ئەگەر تەنێ ئێک وێنە هەبیت
          finalMainImage = data.image;
        } else if (data.colorImages) {
          // ئەگەر چو وێنە نەبن، وێنەیێ ڕەنگێ ئێکەم وەرگرە
          try {
            const firstColorKey = Object.keys(data.colorImages)[0];
            const firstColorArray = data.colorImages[firstColorKey];
            if (firstColorArray && firstColorArray.length > 0) {
              finalMainImage = firstColorArray[0];
            }
          } catch (e) { console.log("Color image error", e); }
        }

        return {
          id: doc.id,
          ...data,
          image: finalMainImage, // ئەڤە ئەو وێنەیە یێ د لاپەڕێ سەرەکی دا دیار دبیت
          colors: data.colors || [],
          price: data.price || 0
        };
      });
      
      setProducts(loadedProducts);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    const unSubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unSubProducts(); unSubOrders(); };
  }, []);

  // --- ٢. فۆنکشنێن سەبەتێ و ویش لیست ---
  const getCartCount = () => cartItems.reduce((total, item) => total + item.quantity, 0);
  
  const toggleWishlist = (product) => {
    setWishlist(prev => prev.includes(product.id) ? prev.filter(id => id !== product.id) : [...prev, product.id]);
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const cartId = `${product.id}-${product.selectedSize || 'none'}-${product.selectedColor || 'none'}`;
      const isExist = prev.find(item => item.cartId === cartId);

      if (isExist) {
        return prev.map(item => item.cartId === cartId ? { ...item, quantity: item.quantity + 1 } : item);
      }

      // دیارکرنا وێنەی بۆ سەبەتێ
      let cartImage = product.image;
      if (product.selectedColor && product.colorImages && product.colorImages[product.selectedColor]) {
        cartImage = product.colorImages[product.selectedColor][0] || product.image;
      }

      return [...prev, { ...product, cartId, image: cartImage, quantity: 1 }];
    });
  };

  const removeFromCart = (cartId) => {
    setCartItems(prev => prev.map(item => (item.cartId === cartId) ? { ...item, quantity: item.quantity - 1 } : item).filter(item => item.quantity > 0));
  };

  const deleteFromCart = (cartId) => setCartItems(prev => prev.filter(item => item.cartId !== cartId));
  const clearCart = () => { setCartItems([]); setAppliedDiscount(0); };
  const getCartAmount = () => cartItems.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);

  // --- ٣. فۆنکشنێن ئەدمینی ---
  const addProduct = async (data) => {
    try { 
      await addDoc(collection(db, 'products'), { 
        ...data, 
        createdAt: new Date().toISOString() 
      }); 
      return true; 
    } catch (e) { return false; }
  };

  const updateProduct = async (id, data) => {
    try { await updateDoc(doc(db, 'products', id), data); return true; } catch (e) { return false; }
  };

  const deleteProduct = async (id) => {
    try { await deleteDoc(doc(db, 'products', id)); return true; } catch (e) { return false; }
  };

  const addOrder = async (orderData) => {
    try {
      const shortId = `KID-${Math.floor(1000 + Math.random() * 9000)}`;
      await addDoc(collection(db, 'orders'), { 
        ...orderData, 
        orderId: shortId, 
        status: 1, 
        createdAt: new Date().toISOString() 
      });
      return { success: true, orderId: shortId };
    } catch (e) { return { success: false }; }
  };

  return (
    <ShopContext.Provider value={{ 
      products, orders, notifications, cartItems, searchQuery, setSearchQuery, loading,
      wishlist, toggleWishlist, isInWishlist,
      appliedDiscount, promoError, activePromoCode, getCartAmount,
      getCartCount, addToCart, removeFromCart, deleteFromCart, clearCart,
      addProduct, updateProduct, deleteProduct, addOrder
    }}>
      {children}
    </ShopContext.Provider>
  );
};



// import React, { createContext, useState, useEffect } from 'react';
// import { 
//   collection, onSnapshot, addDoc, doc, 
//   updateDoc, deleteDoc, query, orderBy 
// } from "firebase/firestore"; 
// // تەنێ db ئیمۆرت دکەین ژ فایلێ firebase چونکی مە ل وێرێ هەمی تشت حازر کریە
// import { db } from '../firebase'; 

// export const ShopContext = createContext();

// export const ShopProvider = ({ children }) => {
//   const [products, setProducts] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [notifications, setNotifications] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [appliedDiscount, setAppliedDiscount] = useState(0); 
//   const [promoError, setPromoError] = useState("");
//   const [activePromoCode, setActivePromoCode] = useState("");

//   const [wishlist, setWishlist] = useState(() => {
//     try {
//       const saved = localStorage.getItem('wishlist');
//       return saved ? JSON.parse(saved) : [];
//     } catch (e) { return []; }
//   });

//   const [cartItems, setCartItems] = useState(() => {
//     try {
//       const savedCart = localStorage.getItem("cartItems");
//       return savedCart ? JSON.parse(savedCart) : [];
//     } catch (error) { return []; }
//   });

//   useEffect(() => {
//     localStorage.setItem('wishlist', JSON.stringify(wishlist));
//   }, [wishlist]);

//   useEffect(() => {
//     localStorage.setItem("cartItems", JSON.stringify(cartItems));
//   }, [cartItems]);

//   // --- ١. وەرگرتنا داتایان ژ Firestore ب شێوەیەکێ زەینتی (Real-time) ---
//   useEffect(() => {
//     setLoading(true);
    
//     // وەرگرتنا بەرهەمان
//     const unSubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
//       const loadedProducts = snapshot.docs.map(doc => {
//         const data = doc.data();
        
//         // لۆجیکێ پشتڕاستبوون ژ هەبوونا وێنەی
//         let finalMainImage = data.image || (data.images && data.images[0]); 
        
//         if (!finalMainImage && data.colorImages) {
//           try {
//             const firstColorImages = Object.values(data.colorImages)[0];
//             if (firstColorImages && firstColorImages.length > 0) {
//               finalMainImage = firstColorImages[0];
//             }
//           } catch (e) { console.log("Color image error", e); }
//         }

//         return {
//           id: doc.id,
//           ...data,
//           image: finalMainImage || "https://via.placeholder.com/300", 
//           colors: data.colors || [],
//           price: data.price || 0
//         };
//       });
      
//       setProducts(loadedProducts);
//       setLoading(false);
//     }, (error) => {
//       console.error("Firestore Error:", error);
//       setLoading(false);
//     });

//     // وەرگرتنا ئۆردەران
//     const unSubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snapshot) => {
//       setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
//     }, (err) => console.log("Orders fetch error:", err));

//     return () => { 
//       unSubProducts(); 
//       unSubOrders(); 
//     };
//   }, []);

//   // --- ٢. فۆنکشنێن کارپێکرنێ (Sêbet u Wishlist) ---
//   const getCartCount = () => cartItems.reduce((total, item) => total + item.quantity, 0);
  
//   const toggleWishlist = (product) => {
//     setWishlist(prev => prev.includes(product.id) ? prev.filter(id => id !== product.id) : [...prev, product.id]);
//   };

//   const isInWishlist = (productId) => wishlist.includes(productId);

//   const addToCart = (product) => {
//     setCartItems((prev) => {
//       const cartId = `${product.id}-${product.selectedSize || 'none'}-${product.selectedColor || 'none'}`;
//       const isExist = prev.find(item => item.cartId === cartId);

//       if (isExist) {
//         return prev.map(item => item.cartId === cartId ? { ...item, quantity: item.quantity + 1 } : item);
//       }

//       let cartImage = product.image;
//       if (product.selectedColor && product.colorImages && product.colorImages[product.selectedColor]) {
//         cartImage = product.colorImages[product.selectedColor][0] || product.image;
//       }

//       return [...prev, { ...product, cartId, image: cartImage, quantity: 1 }];
//     });
//   };

//   const removeFromCart = (cartId) => {
//     setCartItems(prev => prev.map(item => (item.cartId === cartId) ? { ...item, quantity: item.quantity - 1 } : item).filter(item => item.quantity > 0));
//   };

//   const deleteFromCart = (cartId) => setCartItems(prev => prev.filter(item => item.cartId !== cartId));

//   const clearCart = () => { setCartItems([]); setAppliedDiscount(0); };

//   const getCartAmount = () => cartItems.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);

//   // --- ٣. فۆنکشنێن ئەدمینی (Add, Update, Delete) ---
//   const addProduct = async (data) => {
//     try { 
//       await addDoc(collection(db, 'products'), { 
//         ...data, 
//         createdAt: new Date().toISOString() 
//       }); 
//       return true; 
//     } catch (e) { 
//       console.error("Add Product Error:", e);
//       return false; 
//     }
//   };

//   const updateProduct = async (id, data) => {
//     try { await updateDoc(doc(db, 'products', id), data); return true; } catch (e) { return false; }
//   };

//   const deleteProduct = async (id) => {
//     try { await deleteDoc(doc(db, 'products', id)); return true; } catch (e) { return false; }
//   };

//   const addOrder = async (orderData) => {
//     try {
//       const shortId = `KID-${Math.floor(1000 + Math.random() * 9000)}`;
//       await addDoc(collection(db, 'orders'), { 
//         ...orderData, 
//         orderId: shortId, 
//         status: 1, 
//         createdAt: new Date().toISOString() 
//       });
//       return { success: true, orderId: shortId };
//     } catch (e) { return { success: false }; }
//   };

//   return (
//     <ShopContext.Provider value={{ 
//       products, orders, notifications, cartItems, searchQuery, setSearchQuery, loading,
//       wishlist, toggleWishlist, isInWishlist,
//       appliedDiscount, promoError, activePromoCode, getCartAmount,
//       getCartCount, addToCart, removeFromCart, deleteFromCart, clearCart,
//       addProduct, updateProduct, deleteProduct, addOrder
//     }}>
//       {children}
//     </ShopContext.Provider>
//   );
// };



// import React, { createContext, useState, useEffect } from 'react';
// import { db, auth, googleProvider, facebookProvider, appleProvider } from '../firebase'; 
// import { ref, onValue, push, remove, update } from "firebase/database";
// import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

// export const ShopContext = createContext();

// const PROMO_CODES = {
//   "HELLO10": 10,
//   "KURDISTAN": 20,
//   "OFF5": 5
// };

// export const ShopProvider = ({ children }) => {
//   const [products, setProducts] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [notifications, setNotifications] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [loading, setLoading] = useState(true);

//   const [appliedDiscount, setAppliedDiscount] = useState(0); 
//   const [promoError, setPromoError] = useState("");
//   const [activePromoCode, setActivePromoCode] = useState("");

//   const [cartItems, setCartItems] = useState(() => {
//     try {
//       const savedCart = localStorage.getItem("cartItems");
//       return savedCart ? JSON.parse(savedCart) : [];
//     } catch (error) { 
//       localStorage.removeItem("cartItems");
//       return []; 
//     }
//   });

//   const [user, setUser] = useState(null);

//   // --- Firebase Auth Logic ---

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//     });
//     return () => unsubscribe();
//   }, []);

//   const loginWithGoogle = async () => {
//     try {
//       await signInWithPopup(auth, googleProvider);
//     } catch (error) {
//       console.error("Google Login Error:", error.message);
//     }
//   };

//   const loginWithFacebook = async () => {
//     try {
//       await signInWithPopup(auth, facebookProvider);
//     } catch (error) {
//       console.error("Facebook Login Error:", error.message);
//     }
//   };

//   const loginWithApple = async () => {
//     try {
//       await signInWithPopup(auth, appleProvider);
//     } catch (error) {
//       console.error("Apple Login Error:", error.message);
//     }
//   };

//   const logout = () => signOut(auth);

//   // --- End of Auth Logic ---

//   const [wishlist, setWishlist] = useState(() => {
//     try {
//       const saved = localStorage.getItem('wishlist');
//       return saved ? JSON.parse(saved) : [];
//     } catch (e) {
//       return [];
//     }
//   });

//   useEffect(() => {
//     try {
//       localStorage.setItem('wishlist', JSON.stringify(wishlist));
//     } catch (e) {
//       localStorage.removeItem("wishlist");
//     }
//   }, [wishlist]);

//   const toggleWishlist = (product) => {
//   setWishlist(prev => {
//     const isExist = prev.includes(product.id);
//     if (isExist) {
//       return prev.filter(id => id !== product.id);
//     } else {
//       return [...prev, product.id];
//     }
//   });
// };

//   const isInWishlist = (productId) => {
//   return wishlist.includes(productId); 
// };

//   useEffect(() => {
//     const productsRef = ref(db, 'products');
//     const ordersRef = ref(db, 'orders');
//     const notifRef = ref(db, 'notifications');
    
//     setLoading(true);

//     const unSubProducts = onValue(productsRef, (snapshot) => {
//       const data = snapshot.val();
//       const loadedProducts = data ? Object.keys(data).map(key => {
//         let p = data[key];
//         if (p.image && typeof p.image === 'string' && p.image.includes("unsplash.com")) {
//           p.image = p.image.split('?')[0] + "?auto=format&fit=crop&w=800&q=60";
//         }
//         return { id: key, ...p };
//       }) : [];
      
//       setProducts(loadedProducts);
//       setLoading(false);
//     });

//     const unSubOrders = onValue(ordersRef, (snapshot) => {
//       const data = snapshot.val();
//       setOrders(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : []);
//     });

//     const unSubNotif = onValue(notifRef, (snapshot) => {
//       const data = snapshot.val();
//       setNotifications(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse() : []);
//     });

//     return () => { unSubProducts(); unSubOrders(); unSubNotif(); };
//   }, []);

//   useEffect(() => {
//     try {
//       localStorage.setItem("cartItems", JSON.stringify(cartItems));
//     } catch (e) {
//       localStorage.removeItem("cartItems");
//     }
//   }, [cartItems]);

//   const applyPromoCode = (code) => {
//     if (!code?.trim()) { setPromoError("تکایە کۆدەکێ بنڤێسە"); return false; }
//     const upperCode = code.toUpperCase().trim();
//     if (PROMO_CODES[upperCode]) {
//       setAppliedDiscount(PROMO_CODES[upperCode]);
//       setActivePromoCode(upperCode);
//       setPromoError("");
//       return true;
//     }
//     setPromoError("ئەڤ کۆدە یێ دروست نینە!");
//     setAppliedDiscount(0);
//     return false;
//   };

//   const removePromoCode = () => {
//     setAppliedDiscount(0);
//     setActivePromoCode("");
//     setPromoError("");
//   };

//   const getCartAmount = () => {
//     return cartItems.reduce((total, item) => total + ((Number(item.price) || 0) * item.quantity), 0);
//   };

//   const addToCart = (product) => {
//   setCartItems((prev) => {
//     const existingItem = prev.find(item => 
//       item.id === product.id && 
//       item.selectedSize === product.selectedSize && 
//       item.selectedColor === product.selectedColor
//     );

//     if (existingItem) {
//       return prev.map(item => 
//         item === existingItem ? { ...item, quantity: item.quantity + 1 } : item
//       );
//     }

//     // ١. دیارکرنا وێنەی ب شێوەیەکێ زیرەک
//     let productImg = "";
    
//     // ئەگەر وێنەیێ ڕەنگی (Color Specific Image) هەبیت، وی بگرە
//     if (product.colorImages && product.selectedColor && product.colorImages[product.selectedColor]) {
//       productImg = product.colorImages[product.selectedColor][0];
//     } 
//     // ئەگەر نەبوو، وێنەیێ سەرەکی بگرە
//     else {
//       productImg = product.image || (product.images && product.images[0]) || "";
//     }

//     const newItem = {
//       cartId: Date.now(),
//       id: product.id,
//       name: product.name,
//       price: product.price,
//       selectedSize: product.selectedSize || "N/A",
//       selectedColor: product.selectedColor || "N/A",
//       quantity: 1,
//       image: productImg // نوکە وێنە یێ مسۆگەرە
//     };

//     return [...prev, newItem];
//   });
// };

//   const removeFromCart = (cartId) => {
//     setCartItems(prev => prev.map(item => 
//       (item.cartId === cartId) ? { ...item, quantity: item.quantity - 1 } : item
//     ).filter(item => item.quantity > 0));
//   };

//   const deleteFromCart = (cartId) => {
//     setCartItems(prev => prev.filter(item => item.cartId !== cartId));
//   };

//   const clearCart = () => {
//     setCartItems([]);
//     removePromoCode();
//   };

//   const addOrder = async (orderData) => {
//   try {
//     // ١. دروستکرنا ناسنامەکا کورت (ID)
//     const shortId = `KID-${Math.floor(1000 + Math.random() * 9000)}`;
    
//     // ٢. ئامادەکردنا داتایان (پشکنین دکەین کو چو داتا undefined نینن)
//     const fullOrder = { 
//       ...orderData, 
//       orderId: shortId, 
//       status: 1, 
//       // بەکارهێنانی رێکەوتی کوردی بۆ نیشاندان و ISO بۆ رێزبەندی (Sorting)
//       date: new Date().toLocaleDateString('ku-IQ'), 
//       createdAt: new Date().toISOString() 
//     };

//     // فەنکشنا گوهۆڕینا بارێ ئۆردەری (چاڤەڕێ، ڕێدایە، گەهشت)
// const updateOrderStatus = async (orderId, newStatus) => {
//   try {
//     // ١. نوژەنکرن د ناو Firebase دا (بکارئینانا db و ref)
//     const orderRef = ref(db, `orders/${orderId}`);
//     await update(orderRef, { status: newStatus });

//     // ٢. نوژەنکرنا لیستێ د ناڤ بەرنامەی دا دا کو بێ ریفرێش بگوهۆڕیت
//     setOrders(prevOrders => 
//       prevOrders.map(order => order.id === orderId ? { ...order, status: newStatus } : order)
//     );

//     return { success: true };
//   } catch (error) {
//     console.error("Error updating order status:", error);
//     return { success: false, error };
//   }
// };

// // ⚠️ پشتڕاست بە کو تە ناڤێ فەنکشنێ ل بنێ 'value' د 'ShopContext.Provider' دا یێ دانای

//     // ٣. دیارکرنا ناڤنیشانێ (Path) داتابەیسێ
//     const ordersRef = ref(db, 'orders');
    
//     // ٤. پاشکەفتکرن د Firebase دا
//     await push(ordersRef, fullOrder);

//     // ٥. دروستکرنا ئاگەهداریێ (Notification)
//     // تێبینی: ئەگەر فەنکشنا createNotification ئاریشە هەبیت، بلا ئۆردەر هەر بڕوات
//     try {
//       if (typeof createNotification === "function") {
//         await createNotification(`ئۆردەرەکێ نوی هات: ${shortId}`);
//       }
//     } catch (notifError) {
//       console.warn("Notification failed, but order was saved:", notifError);
//     }

//     // ٦. زڤڕاندنا ئەنجامێ سەرکەفتی
//     return { success: true, orderId: shortId };

//   } catch (error) {
//     // نیشاندانا هەڵەیێ د کۆنسۆڵێ دا بۆ هندێ تو بزانی کێشە ل کیڤەیە
//     console.error("Firebase AddOrder Error:", error);
//     return { success: false, error: error.message };
//   }
// };

//   const addProduct = async (data) => {
//     try { await push(ref(db, 'products'), data); return true; } catch (e) { return false; }
//   };

//   const updateProduct = async (id, data) => {
//     try { await update(ref(db, `products/${id}`), data); return true; } catch (e) { return false; }
//   };

//   const deleteProduct = async (id) => {
//     try { await remove(ref(db, `products/${id}`)); return true; } catch (e) { return false; }
//   };

//   const deleteOrder = async (id) => {
//     try { await remove(ref(db, `orders/${id}`)); return true; } catch (e) { return false; }
//   };

//   const updateOrderStatus = async (id, status) => {
//     try { await update(ref(db, `orders/${id}`), { status }); return true; } catch (e) { return false; }
//   };

//   const createNotification = async (message) => {
//     try {
//       await push(ref(db, 'notifications'), { message, isRead: false, createdAt: new Date().toISOString() });
//     } catch (e) { console.error(e); }
//   };

//   const markAllAsRead = async () => {
//     try {
//       const updates = {};
//       notifications.forEach(notif => { if (!notif.isRead) updates[`/notifications/${notif.id}/isRead`] = true; });
//       await update(ref(db), updates);
//     } catch (e) { console.error(e); }
//   };

//   const getCartCount = () => {
//     return cartItems.reduce((total, item) => total + item.quantity, 0);
//   };

//   return (
//     <ShopContext.Provider value={{ 
//       products, orders, notifications, cartItems, searchQuery, setSearchQuery,
//       wishlist, toggleWishlist, isInWishlist, loading, user, 
//       loginWithGoogle, loginWithFacebook, loginWithApple, logout,
//       appliedDiscount, promoError, activePromoCode, applyPromoCode, removePromoCode, getCartAmount,
//       addProduct, updateProduct, deleteProduct, updateOrderStatus, deleteOrder,
//       addToCart, removeFromCart, deleteFromCart, clearCart, addOrder, 
//       markAllAsRead, createNotification , getCartCount
//     }}>
//       {children}
//     </ShopContext.Provider>
//   );
// };