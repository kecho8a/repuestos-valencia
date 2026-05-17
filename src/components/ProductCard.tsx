import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, ShoppingCart, Check, Camera, ArrowRight, Flame } from 'lucide-react';
import { AutoPart } from '../types/store';
import { useApp } from '../store/AppContext';

interface ProductCardProps {
  part: AutoPart;
  config: any;
  onViewProductDetails: (part: AutoPart) => void;
  addToCart: (part: AutoPart, quantity: number) => void;
  isOffer?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ part, config, onViewProductDetails, addToCart, isOffer = false }) => {
  const [added, setAdded] = useState(false);
  const { displayCurrency } = useApp();
  const priceInBs = part.precio_usd * config.tasa_cambio;

  const handleAddToCart = () => {
    addToCart(part, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className={`snap-start shrink-0 w-[240px] sm:w-[260px] md:w-[230px] lg:w-[230px] rounded-2xl flex flex-col justify-between overflow-hidden relative group transition-all duration-300
        ${isOffer 
          ? 'bg-white border border-transparent bg-clip-padding p-[1px] shadow-sm hover:shadow-xl hover:shadow-blue-100' 
          : 'border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
        }
      `}
    >
      {/* Gradient Border for Offer */}
      {isOffer && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400 via-purple-400 to-emerald-400 opacity-20 -z-10 group-hover:opacity-40 transition-opacity duration-300"></div>
      )}

      {/* Promotional Floating Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow-sm ${
          part.condicion === 'Nuevo' 
            ? 'bg-emerald-500 text-white' 
            : 'bg-amber-600 text-white'
        }`}>
          {part.condicion}
        </span>
        {part.es_promo && (
          <span className="text-[9px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase shadow-sm">
            Promo
          </span>
        )}
        {part.delivery_gratis && (
          <span className="text-[9px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase shadow-sm animate-pulse">
            Delivery Gratis
          </span>
        )}
      </div>

      {/* Hot Tag for Offer */}
      {isOffer && (
        <div className="absolute top-2 right-2 z-10">
          <span className="flex items-center gap-0.5 text-[9px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-sm">
            <Flame size={10} /> HOT
          </span>
        </div>
      )}

      {/* Product Image Frame */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
        <img 
          src={part.imagen_urls[0]} 
          alt={part.nombre} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />
        
        {/* Gallery indicator */}
        {part.imagen_urls && part.imagen_urls.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full z-10 flex items-center gap-1 backdrop-blur-sm">
            <Camera size={9} /> <span>{part.imagen_urls.length}</span>
          </div>
        )}
        
        {/* Action trigger overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/40 backdrop-blur-[2px]">
          <button
            type="button"
            onClick={() => onViewProductDetails(part)}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-900 transition-all shadow-sm cursor-pointer border border-slate-200"
            title="Ver detalle"
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            onClick={handleAddToCart}
            className={`p-2 rounded-xl transition-all shadow-sm cursor-pointer text-white border ${added ? 'bg-emerald-600 hover:bg-emerald-700 pointer-events-none' : 'bg-blue-600 hover:bg-blue-700'}`}
            title={added ? "Agregado" : "Comprar"}
          >
            {added ? <Check size={16} /> : <ShoppingCart size={16} />}
          </button>
        </div>
      </div>

      {/* Details Wrapper */}
      <div className="p-3.5 flex flex-col justify-between flex-1 text-slate-900">
        <div>
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] text-blue-600 font-black uppercase tracking-wider truncate">{part.marca_repuesto}</span>
            <span className="text-[9px] text-slate-400 font-mono shrink-0">#{part.codigo.split('-')[0]}</span>
          </div>
          
          <h4 
            className="text-[13px] font-bold text-slate-900 line-clamp-2 mt-1 leading-tight h-[32px] cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => onViewProductDetails(part)}
          >
            {part.nombre}
          </h4>
          
          <div className="flex items-center gap-1.5 mt-2 overflow-hidden">
            <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-600 shrink-0">
              <span className="opacity-70">🚗</span> {part.marca_carro}
            </div>
            <div className="text-[9px] text-slate-500 font-medium truncate italic">
              {part.modelo_carro} ({part.anio_inicio}-{part.anio_fin})
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-mono leading-none mb-1">Precio</span>
            {displayCurrency === 'USD' ? (
              <div className="flex flex-col">
                <span className="text-base font-black text-slate-900 leading-none">${part.precio_usd.toFixed(2)}</span>
                <span className="text-[9px] text-slate-500 font-mono mt-0.5">≈ {priceInBs.toFixed(2)} Bs</span>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="text-base font-black text-slate-900 leading-none">{priceInBs.toFixed(2)} Bs</span>
                <span className="text-[9px] text-slate-500 font-mono mt-0.5">≈ ${part.precio_usd.toFixed(2)}</span>
              </div>
            )}
          </div>
          
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={added}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all shadow-sm active:scale-90 cursor-pointer
              ${added 
                ? 'bg-emerald-500 text-white shadow-emerald-200' 
                : 'bg-[#0060df] text-white hover:bg-blue-700 shadow-blue-200'
              }
            `}
          >
            {added ? <Check size={18} strokeWidth={3} /> : <ShoppingCart size={18} strokeWidth={2.5} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
