import React, { createContext, useState, useEffect } from 'react';
import { 
  collection, onSnapshot, addDoc, doc, 
  updateDoc, deleteDoc, query, orderBy, getDoc 
} from "firebase/firestore"; 
import { onAuthStateChanged, signOut } from "firebase/auth"; // ✅ زێدەکرنا ئەڤان بۆ ناسینا یوزەری
import { db, auth } from '../firebase'; 

export const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  // --- ✅ بەشێ نوێ: زانیارییێن بەکارهێنەری ---
  const [user, setUser] = useState(null);
  const [dbUserData, setDbUserData] = useState(null);

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

  // --- ١. چاودێریکردنی لۆگین بوونی یوزەری (زۆر گرنگ) ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // ئەگەر یوزەر هەبوو، داتاکانی لە Firestore دەهێنێت
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setDbUserData(userDoc.data());
        }
      } else {
        setDbUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // --- ٢. فەنکشنی Logout ---
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setDbUserData(null);
      localStorage.removeItem('isAdmin'); // لادانی نیشانەی ئەدمین
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // --- ٣. وەرگرتنا داتایێن بەرهەمان (وەک کۆدێ تە) ---
  useEffect(() => {
    setLoading(true);
    
    const unSubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const loadedProducts = snapshot.docs.map(doc => {
        const data = doc.data();
        let finalMainImage = "https://via.placeholder.com/300";

        if (data.images && data.images.length > 0) {
          finalMainImage = data.images[0];
        } else if (data.image) {
          finalMainImage = data.image;
        } else if (data.colorImages) {
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
          image: finalMainImage,
          colors: data.colors || [],
          price: data.price || 0
        };
      });
      
      setProducts(loadedProducts);
      setLoading(false);
    }, (error) => {
      setLoading(false);
    });

    const unSubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unSubProducts(); unSubOrders(); };
  }, []);

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

  // --- فۆنکشنێن ئەدمینی ---
  const addProduct = async (data) => {
    try { await addDoc(collection(db, 'products'), { ...data, createdAt: new Date().toISOString() }); return true; } catch (e) { return false; }
  };
  const updateProduct = async (id, data) => {
    try { await updateDoc(doc(db, 'products', id), data); return true; } catch (e) { return false; }
  };
  const deleteProduct = async (id) => {
    try { await deleteDoc(doc(db, 'products', id)); return true; } catch (e) { return false; }
  };

  return (
    <ShopContext.Provider value={{ 
      products, orders, notifications, cartItems, searchQuery, setSearchQuery, loading,
      user, dbUserData, logout, // ✅ ناردنی زانیارییەکانی یوزەر بۆ هەموو بەرنامەکە
      wishlist, toggleWishlist, isInWishlist,
      appliedDiscount, promoError, activePromoCode, getCartAmount,
      getCartCount, addToCart, removeFromCart, deleteFromCart, clearCart,
      addProduct, updateProduct, deleteProduct
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

//   // --- ١. وەرگرتنا داتایان ب شێوەیەکێ داینامیکی ---
//   useEffect(() => {
//     setLoading(true);
    
//     const unSubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
//       const loadedProducts = snapshot.docs.map(doc => {
//         const data = doc.data();
        
//         // --- چاککرنا لۆجیکێ وێنەی بۆ لاپەڕێ سەرەکی ---
//         let finalMainImage = "https://via.placeholder.com/300"; // وێنەیێ دەسپێکێ

//         if (data.images && data.images.length > 0) {
//           // ئەگەر لیستەکا وێنەیان هەبیت (وەک وێ یا مە د AddProduct دا کری)
//           finalMainImage = data.images[0];
//         } else if (data.image) {
//           // ئەگەر تەنێ ئێک وێنە هەبیت
//           finalMainImage = data.image;
//         } else if (data.colorImages) {
//           // ئەگەر چو وێنە نەبن، وێنەیێ ڕەنگێ ئێکەم وەرگرە
//           try {
//             const firstColorKey = Object.keys(data.colorImages)[0];
//             const firstColorArray = data.colorImages[firstColorKey];
//             if (firstColorArray && firstColorArray.length > 0) {
//               finalMainImage = firstColorArray[0];
//             }
//           } catch (e) { console.log("Color image error", e); }
//         }

//         return {
//           id: doc.id,
//           ...data,
//           image: finalMainImage, // ئەڤە ئەو وێنەیە یێ د لاپەڕێ سەرەکی دا دیار دبیت
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

//     const unSubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snapshot) => {
//       setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
//     });

//     return () => { unSubProducts(); unSubOrders(); };
//   }, []);

//   // --- ٢. فۆنکشنێن سەبەتێ و ویش لیست ---
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

//       // دیارکرنا وێنەی بۆ سەبەتێ
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

//   // --- ٣. فۆنکشنێن ئەدمینی ---
//   const addProduct = async (data) => {
//     try { 
//       await addDoc(collection(db, 'products'), { 
//         ...data, 
//         createdAt: new Date().toISOString() 
//       }); 
//       return true; 
//     } catch (e) { return false; }
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