import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { AutoPart } from '../types/store';
import { Disc, Cpu, Wind, ShieldCheck, Zap, Filter, ArrowRight, Eye, ShoppingCart, Landmark, Check, Bell, Sparkles, Flame, Camera, MessageSquare, Search, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { SEOHead } from '../components/SEOHead';
import { BentoGrid } from '../components/BentoGrid';
import { ProductCard } from '../components/ProductCard';

interface HomeProps {
  setTab: (tab: 'home' | 'catalog' | 'cart' | 'admin' | 'profile') => void;
  setSelectedCategory: (category: string) => void;
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  selectedEngine: string;
  setSelectedEngine: (engine: string) => void;
  onViewProductDetails: (part: AutoPart) => void;
  globalSearch: string;
  setGlobalSearch: (term: string) => void;
  navigateToCatalog: (filters?: { category?: string; brand?: string; model?: string; year?: string; engine?: string }) => void;
}

export const Home: React.FC<HomeProps> = ({ 
  setTab, setSelectedCategory, 
  selectedBrand, setSelectedBrand, 
  selectedModel, setSelectedModel, 
  selectedYear, setSelectedYear,
  selectedEngine, setSelectedEngine,
  onViewProductDetails, globalSearch, setGlobalSearch,
  navigateToCatalog 
}) => {
  const { parts, config, addToCart, currentUser, requestPart } = useApp();
  const [activeBanner, setActiveBanner] = useState(0);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [suggestions, setSuggestions] = useState<AutoPart[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
       if (Notification.permission === 'default') {
         const timer = setTimeout(() => setShowNotificationPrompt(true), 1500);
         return () => clearTimeout(timer);
       }
    }
  }, []);

  const handleRequestPermissionHome = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        if (res === 'granted') {
          new Notification('¡Notificaciones Habilitadas!', {
            body: '¡Excelente! Ahora recibirás actualizaciones rápidas de tus pedidos y promociones de TuRepuestoValencia.',
            icon: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=100',
            tag: 'welcome-trv'
          });
        }
        setShowNotificationPrompt(false);
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % config.banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [config.banners.length]);

  const CATEGORIES = [
    { name: 'Frenos', label: 'Frenos', icon: Disc, color: 'text-red-600 border-red-200 bg-red-50/50' },
    { name: 'Motor', label: 'Motor', icon: Cpu, color: 'text-amber-600 border-amber-200 bg-amber-50/50' },
    { name: 'Refrigeración', label: 'Refrigeración', icon: Wind, color: 'text-blue-600 border-blue-200 bg-blue-50/50' },
    { name: 'Suspensión', label: 'Suspensión', icon: ShieldCheck, color: 'text-indigo-600 border-indigo-200 bg-indigo-50/50' },
    { name: 'Eléctrico', label: 'Eléctrico', icon: Zap, color: 'text-yellow-600 border-yellow-200 bg-yellow-50/50' },
    { name: 'Filtros', label: 'Filtros', icon: Filter, color: 'text-emerald-600 border-emerald-200 bg-emerald-50/50' }
  ];

  const activeParts = useMemo(() => parts.filter(p => p.activo !== false), [parts]);
  const brands = useMemo(() => Array.from(new Set(activeParts.filter(p => p.marca_carro).map(p => p.marca_carro))), [activeParts]);
  const models = useMemo(() => Array.from(new Set(activeParts.filter(p => (!selectedBrand || p.marca_carro === selectedBrand) && p.modelo_carro).map(p => p.modelo_carro))), [activeParts, selectedBrand]);
  const yearsRange = useMemo(() => {
    const years: number[] = [];
    for (let yr = 1998; yr <= 2026; yr++) years.push(yr);
    return years.reverse();
  }, []);

  // Predefined version keywords for Chevrolet models
  const engineVersions = useMemo(() => {
    if (!selectedBrand || !selectedModel) return [];
    
    const list = activeParts
      .filter(p => p.marca_carro === selectedBrand && p.modelo_carro === selectedModel)
      .flatMap(p => {
        const matches: string[] = [];
        const combined = `${p.nombre} ${p.compatibilidad_detalle || ''} ${p.descripcion || ''}`.toLowerCase();
        
        const keywords = [
          '1.6', '1.8', '2.0', '1.4', '1.2', '2.4', '3.6', '4.3', '5.3', '6.0',
          'design', 'limited', 'avance', 'advance', '2pt', '4pt', '2 puertas', '4 puertas'
        ];
        keywords.forEach(kw => {
          if (combined.includes(kw)) {
             let display = kw.toUpperCase();
             if (kw === '2pt' || kw === '2 puertas') display = '2 PUERTAS';
             if (kw === '4pt' || kw === '4 puertas') display = '4 PUERTAS';
             matches.push(display);
          }
        });
        return matches;
      });
    
    return Array.from(new Set(list)).sort();
  }, [activeParts, selectedBrand, selectedModel]);

  const navigateToCatalogWithEngine = () => {
    navigateToCatalog({ 
      brand: selectedBrand, 
      model: selectedModel, 
      year: selectedYear,
      engine: selectedEngine
    });
  };

  const promoParts = parts.filter(p => p.es_promo && p.stock > 0 && p.activo !== false);
  const newParts = parts.filter(p => p.es_nuevo && p.stock > 0 && p.activo !== false);
  const bestsellerParts = parts.filter(p => p.es_mas_vendido && p.stock > 0 && p.activo !== false);

  useEffect(() => {
    if (globalSearch.trim().length > 1) {
      const filtered = parts
        .filter(p => 
          p.activo !== false && 
          (p.nombre.toLowerCase().includes(globalSearch.toLowerCase()) || 
           p.descripcion.toLowerCase().includes(globalSearch.toLowerCase()) ||
           p.categoria.toLowerCase().includes(globalSearch.toLowerCase()) ||
           p.marca_carro.toLowerCase().includes(globalSearch.toLowerCase()) ||
           p.modelo_carro.toLowerCase().includes(globalSearch.toLowerCase()))
        )
        .slice(0, 6);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [globalSearch, parts]);

  const handleCategoryClick = (catName: string) => {
    navigateToCatalog({ category: catName });
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      <SEOHead title="Repuestos Chevrolet a Domicilio en Valencia" type="home" />
      <h1 className="sr-only">Repuestos Chevrolet en Valencia con Delivery a Domicilio | Compra Repuestos Aveo, Optra y Spark en Naguanagua y San Diego</h1>

      {/* 1. BUSCADOR INTELIGENTE POR VEHÍCULO */}
      <div className="px-1 relative z-30 -mb-2">
        <div className="max-w-2xl mx-auto w-full relative">
          <div className="bg-white rounded-2xl shadow-[0_12px_45px_rgb(0,0,0,0.1)] border border-zinc-200 p-1.5 flex items-center group transition-all focus-within:ring-4 focus-within:ring-blue-500/10">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text"
                placeholder="Busca por repuesto, código OEM o marca..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onFocus={() => globalSearch.trim().length > 1 && setShowSuggestions(true)}
                className="w-full pl-12 pr-4 py-3.5 text-sm font-medium focus:outline-none text-zinc-900 placeholder-zinc-400 bg-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && globalSearch.trim()) {
                    navigateToCatalog();
                    setShowSuggestions(false);
                  }
                }}
              />
            </div>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden z-50 divide-y divide-zinc-50"
            >
              {suggestions.map((suggestion) => (
                <div 
                  key={suggestion.id}
                  onClick={() => {
                    setGlobalSearch(suggestion.nombre);
                    onViewProductDetails(suggestion);
                    setShowSuggestions(false);
                  }}
                  className="flex items-center gap-4 p-4 hover:bg-blue-50/50 cursor-pointer group transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200 shadow-sm">
                    <img 
                      src={suggestion.imagen_urls[0] || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=100'} 
                      alt={suggestion.nombre} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-bold text-zinc-900 truncate group-hover:text-blue-700">{suggestion.nombre}</h4>
                    <p className="text-[10px] text-zinc-500 font-mono leading-none flex items-center gap-2 mt-1.5">
                      <span className="font-extrabold text-blue-600 uppercase bg-blue-50 px-1.5 py-0.5 rounded text-[8px] border border-blue-100">{suggestion.marca_repuesto}</span>
                      <span className="opacity-30">•</span>
                      <span className={suggestion.condicion === 'Nuevo' ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                        {suggestion.condicion}
                      </span>
                      <span className="opacity-30">•</span>
                      <span className="font-semibold text-zinc-700">{suggestion.marca_carro} {suggestion.modelo_carro}</span>
                    </p>
                  </div>
                  <div className="text-sm font-black text-blue-600">
                    ${(suggestion.precio_usd || 0).toFixed(2)}
                  </div>
                </div>
              ))}
              <div 
                onClick={() => {
                  navigateToCatalog();
                  setShowSuggestions(false);
                }}
                className="p-3 text-center bg-zinc-50 hover:bg-zinc-100 cursor-pointer transition-colors"
              >
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Explorar todos los resultados</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* COMPACT GARAGE FILTER */}
        <div className="max-w-2xl mx-auto w-full bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl p-4 flex flex-col gap-4 text-white border border-blue-400/30 mt-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
          
          <div className="flex justify-between items-center px-0.5 relative z-10">
             <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Cpu size={15} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black uppercase tracking-widest text-white leading-none">Mi Taller Virtual</span>
                  <span className="text-[8px] text-blue-100 uppercase font-mono mt-0.5">Filtrar por Vehículo</span>
                </div>
             </div>
             { (selectedBrand || selectedModel || selectedYear) && (
               <button 
                 onClick={() => { setSelectedBrand(''); setSelectedModel(''); setSelectedYear(''); setSelectedEngine(''); }}
                 className="text-[10px] text-blue-100 hover:text-white uppercase font-bold transition-colors flex items-center gap-1.5 cursor-pointer bg-white/10 px-2 py-1 rounded-md"
               >
                 <RefreshCcw size={10} /> Limpiar
               </button>
             )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 relative z-10">
            <div className="relative">
              <select 
                value={selectedBrand}
                onChange={(e) => { setSelectedBrand(e.target.value); setSelectedModel(''); setSelectedEngine(''); }}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-3 py-2.5 text-xs font-bold outline-none transition-all cursor-pointer text-white appearance-none shadow-sm"
              >
                <option value="" className="text-zinc-900">Marca</option>
                {brands.map(b => <option key={b} value={b} className="text-zinc-900">{b}</option>)}
              </select>
            </div>

            <div className="relative">
              <select 
                value={selectedModel}
                onChange={(e) => { setSelectedModel(e.target.value); setSelectedEngine(''); }}
                disabled={!selectedBrand}
                className={`w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-3 py-2.5 text-xs font-bold outline-none transition-all cursor-pointer text-white appearance-none shadow-sm ${!selectedBrand ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                <option value="" className="text-zinc-900">Modelo</option>
                {models.map(m => <option key={m} value={m} className="text-zinc-900">{m}</option>)}
              </select>
            </div>

            <div className="relative">
              <select 
                value={selectedEngine}
                onChange={(e) => setSelectedEngine(e.target.value)}
                disabled={!selectedModel || engineVersions.length === 0}
                className={`w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-3 py-2.5 text-xs font-bold outline-none transition-all cursor-pointer text-white appearance-none shadow-sm ${!selectedModel || engineVersions.length === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                <option value="" className="text-zinc-900">Versión</option>
                {engineVersions.map(v => <option key={v} value={v} className="text-zinc-900">{v}</option>)}
              </select>
            </div>

            <div className="relative">
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-3 py-2.5 text-xs font-bold outline-none transition-all cursor-pointer text-white appearance-none shadow-sm"
              >
                <option value="" className="text-zinc-900">Año</option>
                {yearsRange.map(y => <option key={y} value={y.toString()} className="text-zinc-900">{y}</option>)}
              </select>
            </div>
          </div>

          <button 
            onClick={navigateToCatalogWithEngine}
            className="w-full bg-white text-blue-700 hover:bg-blue-50 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer mt-1"
          >
            <span>Buscador por mi vehículo</span>
            <ArrowRight size={14} strokeWidth={3} />
          </button>
        </div>
      </div>


      {/* 2. COMPONENTE BANNER ROTATIVO */}
      <div className="relative h-[180px] md:h-[260px] w-full bg-zinc-200 rounded-xl overflow-hidden border border-zinc-200 shadow-lg">
        {config.banners.map((url, index) => (
          <div
            key={url}
            className={`absolute inset-0 transition-opacity duration-800 ${index === activeBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <img
              src={url}
              alt={`Promoción ${index + 1}`}
              className="w-full h-full object-cover opacity-85"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

            <div className="absolute left-6 bottom-6 right-6 z-20">
              <span className="text-[10px] uppercase font-bold tracking-wider text-white bg-blue-600/90 border border-blue-400 px-2 py-0.5 rounded" style={{ backgroundColor: config.theme_color }}>
                {config.site_nombre}
              </span>
              <h2 className="text-xl md:text-2xl font-bold font-display text-white mt-1.5 max-w-sm drop-shadow-md leading-tight">
                {config.banner_texts?.[index] || (index === 0 ? 'FRENOS PREMIUM DE CERÁMICA' : index === 1 ? 'REPOTENCIA TU MOTOR CON OEM' : 'SUSPENSIÓN DE ALTO RENDIMIENTO')}
              </h2>
              <button
                type="button"
                onClick={() => setTab('catalog')}
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-4 py-1.5 rounded-lg transition-all shadow-md uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                Explorar Catálogo
              </button>
            </div>
          </div>
        ))}

        <div className="absolute right-4 bottom-4 z-25 flex gap-1.5">
          {config.banners.map((_, i) => (
            <button
              type="button"
              key={i}
              onClick={() => setActiveBanner(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${i === activeBanner ? 'bg-blue-600 w-4' : 'bg-white/40'}`}
            />
          ))}
        </div>
      </div>


      {showNotificationPrompt && (
        <div id="home-notification-invite" className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-zinc-200 rounded-xl bg-gradient-to-r from-zinc-50 to-zinc-100/30 text-xs gap-3 animate-fade-in shadow-xs">
          <div className="flex gap-2.5 items-start sm:items-center">
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0 text-base">
              <Bell size={16} />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-zinc-900 text-xs">Activar Notificaciones en Vivo</span>
              <span className="text-[11px] text-zinc-500 leading-normal">Recibe alertas en tiempo real de tus pedidos (En camino, Preparación) y promociones exclusivas.</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 md:justify-end">
            <button
              type="button"
              onClick={() => setShowNotificationPrompt(false)}
              className="text-zinc-400 hover:text-zinc-600 transition-colors uppercase font-mono font-bold text-[9px] px-2 py-1.5 cursor-pointer font-sans"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleRequestPermissionHome}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold max-sm:w-full font-display uppercase tracking-wider px-3.5 py-1.5 rounded-lg text-[10px] transition-all cursor-pointer shadow-xs active:scale-95"
            >
              Habilitar
            </button>
          </div>
        </div>
      )}

      <div>
        <span className="text-[10px] uppercase font-mono font-bold text-zinc-500 tracking-wider block mb-3 px-1">Sistemas del Vehículo</span>
        <div className="overflow-x-auto lg:overflow-x-visible lg:flex-wrap no-scrollbar flex gap-3 pb-2 font-display">
          {CATEGORIES.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => handleCategoryClick(cat.name)}
                className={`shrink-0 flex items-center gap-2.5 border border-zinc-200 rounded-lg px-4 py-2.5 text-xs text-zinc-800 transition-all hover:border-blue-500/30 hover:bg-zinc-50 active:scale-95 ${cat.color} cursor-pointer`}
              >
                <IconComponent size={14} />
                <span className="font-semibold">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {promoParts.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Zap className="text-blue-600" size={20} /> Ofertas de Locura
            </h3>
            <button
              type="button"
              onClick={() => { setSelectedCategory(''); setTab('catalog'); }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Ver todo
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 px-4 -mx-4 snap-x snap-mandatory scroll-smooth no-scrollbar">
            {promoParts.map((part) => (
              <ProductCard key={part.id} part={part} config={config} onViewProductDetails={onViewProductDetails} addToCart={addToCart} isOffer={true} />
            ))}
          </div>
        </div>
      )}

      {newParts.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="text-violet-600" size={20} /> Recién Ingresados
            </h3>
            <button
              type="button"
              onClick={() => { setSelectedCategory(''); setTab('catalog'); }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Ver todo
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 px-4 -mx-4 snap-x snap-mandatory scroll-smooth no-scrollbar">
            {newParts.map((part) => (
              <ProductCard key={part.id} part={part} config={config} onViewProductDetails={onViewProductDetails} addToCart={addToCart} />
            ))}
          </div>
        </div>
      )}

      {bestsellerParts.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Flame className="text-amber-600" size={20} /> Repuestos Más Solicitados
            </h3>
            <button
              type="button"
              onClick={() => { setSelectedCategory(''); setTab('catalog'); }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Ver todo
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 px-4 -mx-4 snap-x snap-mandatory scroll-smooth no-scrollbar">
            {bestsellerParts.map((part) => (
              <ProductCard key={part.id} part={part} config={config} onViewProductDetails={onViewProductDetails} addToCart={addToCart} />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 p-5 border border-indigo-100 rounded-2xl bg-indigo-50/50 shadow-sm relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
          <MessageSquare size={20} className="text-indigo-600" /> ¿No encuentras tu repuesto?
        </h3>
        <p className="text-xs text-indigo-700/80 leading-relaxed font-medium">Explícanos qué necesitas y nuestro equipo te ayudará a conseguir el repuesto exacto.</p>
        <div className="flex flex-col gap-3 z-10">
          <input 
            type="text"
            id="req-phone"
            defaultValue={currentUser?.telefono || ''}
            className="w-full text-xs p-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white" 
            placeholder="Tu número telefónico (Ej: +584120001122)"
          />
          <textarea 
            className="w-full text-xs p-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white" 
            placeholder="Ej: Quiero un radiador para un Optra 2008..."
            id="req-desc"
            rows={3}
          />
          <button 
            onClick={() => {
              const desc = (document.getElementById('req-desc') as HTMLTextAreaElement).value;
              const phone = (document.getElementById('req-phone') as HTMLInputElement).value;
              if (desc && phone) {
                requestPart(currentUser?.nombre || 'Invitado/Cliente No Registrado', phone, desc);
                (document.getElementById('req-desc') as HTMLTextAreaElement).value = '';
                alert('¡Solicitud enviada! Nuestro equipo te contactará.');
              } else {
                alert('Por favor, ingresa tu teléfono y la descripción del repuesto.');
              }
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-bold text-xs cursor-pointer shadow-md shadow-indigo-200 transition-all active:scale-[0.98]"
          >
            Enviar Solicitud Búsqueda
          </button>
        </div>
        <a 
          href={`https://wa.me/${config.telefono_soporte.replace(/[^0-9]/g, '')}`}
          target="_blank"
          className="text-center text-xs font-semibold text-indigo-800 underline mt-1 cursor-pointer hover:text-indigo-600"
        >
          O contactar vía WhatsApp
        </a>
      </div>

      <BentoGrid />

      <footer className="mt-8 border-t border-zinc-200 pt-8 pb-4 px-1 text-zinc-650">
        <h2 className="text-sm font-black font-display text-zinc-900 uppercase tracking-widest mb-3">
          Repuestos Chevrolet a Domicilio en Valencia, San Diego y Naguanagua
        </h2>
        <p className="text-xs leading-relaxed text-zinc-500 mb-3 font-sans">
          ¿Buscando repuestos en Valencia, San Diego o Naguanagua? <strong>TuRepuestoValencia</strong> es la mejor opción para comprar repuestos con delivery directo a tu ubicación. Somos especialistas en el catálogo completo de <strong>Chevrolet</strong>: Aveo, Optra, Spark, Cruze y Luv D-Max. Si no encuentras el repuesto en nuestro sitio, ¡lo conseguimos para ti de cualquier marca y te lo llevamos!
        </p>
        <p className="text-xs leading-relaxed text-zinc-500 mb-4 font-sans">
          Nuestra logística de <strong>Delivery Express</strong> cubre las zonas de El Viñedo, Prebo, Las Acacias, Los Nísperos, Guaparo, Tazajal, Mañongo y Flor Amarillo. Despachamos con eficiencia para que tu vehículo no se detenga. Aceptamos pagos en dólares (USD) y bolívares (Bs) a tasa oficial BCV, brindando transparencia y rapidez en cada entrega a domicilio en el estado Carabobo.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10px] font-mono border-t border-zinc-100 pt-4 text-zinc-400">
          <div>
            <h3 className="font-bold text-zinc-700 uppercase mb-1">Repuestos Chevrolet Valencia</h3>
            <p>Pastillas de Freno, Bobinas de Encendido, Filtros de Aire Aveo, Spark, Tahoe, Optra con delivery.</p>
          </div>
          <div>
            <h3 className="font-bold text-zinc-700 uppercase mb-1">Delivery Naguanagua</h3>
            <p>Despacho de repuestos en Tazajal, Mañongo y alrededores. Repuestos originales y genéricos.</p>
          </div>
          <div>
            <h3 className="font-bold text-zinc-700 uppercase mb-1">Repuestos San Diego</h3>
            <p>Conseguimos cualquier repuesto para Ford, Toyota o Chevrolet y te lo llevamos a San Diego hoy mismo.</p>
          </div>
          <div>
            <h3 className="font-bold text-zinc-700 uppercase mb-1">Estatus de Pedido AIO</h3>
            <p>Seguimiento en tiempo real de tu delivery en Valencia Norte, Prebo, Las Acacias y Zona Industrial.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
