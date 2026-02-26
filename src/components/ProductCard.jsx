import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { ShoppingCart, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(ShopContext);

  // ١. حیسابکرنا نرخێ نوی پشتی داشکاندنێ
  const hasDiscount = product.discount > 0;
  const oldPrice = Number(product.price) || 0;
  const newPrice = hasDiscount 
    ? oldPrice - (oldPrice * (Number(product.discount) / 100)) 
    : oldPrice;

  // ٢. لۆجیکێ وەرگرتنا وێنەی: ئەگەر وێنەیێ سەرەکی نەبوو، وێنەیێ ئێکەم رەنگ هەلبژێرە
  const displayImage = product.image || 
    (product.colorImages && Object.values(product.colorImages)[0] && Object.values(product.colorImages)[0][0]) || 
    "https://via.placeholder.com/400";

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-[2rem] border dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 relative">
      
      {/* نیشاندانا ڕێژەیا داشکاندنێ ل سەر وێنەی */}
      {hasDiscount && (
        <div className="absolute top-4 right-4 z-10 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
          <Tag size={12} />
          {product.discount}% OFF
        </div>
      )}

      <Link to={`/product/${product.id}`} className="block overflow-hidden">
        <img 
          src={displayImage} 
          alt={product.name}
          className="w-full aspect-[4/5] object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </Link>

      <div className="p-5 text-right" dir="rtl">
        {/* نیشاندانا رەنگێن بەردەست ب شێوەیەکێ بچووک */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex justify-start gap-1 mb-2">
            {product.colors.map((color, index) => (
              <span 
                key={index} 
                className="w-2.5 h-2.5 rounded-full border border-gray-200 dark:border-slate-700"
                style={{ backgroundColor: color }}
              ></span>
            ))}
          </div>
        )}

        <h3 className="font-black dark:text-white text-sm mb-2 line-clamp-1">
          {product.name}
        </h3>

        <div className="flex flex-col gap-1 mb-4">
          {hasDiscount ? (
            <div className="flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-black text-lg">
                {newPrice.toLocaleString()} <small className="text-[10px]">IQD</small>
              </span>
              <span className="text-gray-400 line-through text-xs">
                {oldPrice.toLocaleString()}
              </span>
            </div>
          ) : (
            <span className="text-indigo-600 dark:text-indigo-400 font-black text-lg">
              {oldPrice.toLocaleString()} <small className="text-[10px]">IQD</small>
            </span>
          )}
        </div>

        <button 
          onClick={() => {
            // دیارکرنا وێنە و رەنگێ ئۆتۆماتیکی بۆ سەبەتێ
            const defaultColor = product.colors?.[0] || 'N/A';
            addToCart({ 
              ...product, 
              productId: product.id, 
              selectedColor: defaultColor,
              image: displayImage 
            });
          }}
          className="w-full bg-gray-100 dark:bg-slate-800 dark:text-white py-3 rounded-2xl flex items-center justify-center gap-2 font-black text-xs hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
        >
          <ShoppingCart size={16} />
          زێدەکرن بۆ سەبەتێ
        </button>
      </div>
    </div>
  );
};

export default ProductCard;