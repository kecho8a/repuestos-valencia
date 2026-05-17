import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { AutoPart } from '../types/store';
import { Search, SlidersHorizontal, RefreshCcw, Camera, Eye, ShoppingCart, Landmark, Sparkles, FilterX, Cpu } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

interface CatalogProps {
  selectedCategory: string;
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
  onOpenScanner: () => void;
  passedSearchCode?: string;
  clearPassedSearchCode?: () => void;
  passedSearchTerm?: string;
  clearPassedSearchTerm?: () => void;
  resetGlobalFilters: () => void;
}

export const Catalog: React.FC<CatalogProps> = ({
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  selectedModel,
  setSelectedModel,
  selectedYear,
  setSelectedYear,
  selectedEngine,
  setSelectedEngine,
  onViewProductDetails,
  onOpenScanner,
  passedSearchCode,
  clearPassedSearchCode,
  passedSearchTerm,
  clearPassedSearchTerm,
  resetGlobalFilters
}) => {
  const { parts, config, addToCart, searchPartsSemantically, displayCurrency } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 16;

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    if (passedSearchCode) {
      setSearchQuery(passedSearchCode);
      if (clearPassedSearchCode) clearPassedSearchCode();
    }
  }, [passedSearchCode, clearPassedSearchCode]);

  useEffect(() => {
    if (passedSearchTerm) {
      setSearchQuery(passedSearchTerm);
      if (clearPassedSearchTerm) clearPassedSearchTerm();
    }
  }, [passedSearchTerm, clearPassedSearchTerm]);

  const activeParts = useMemo(() => parts.filter(p => p.activo !== false), [parts]);

  const brands = useMemo(() => {
    const list = activeParts.filter(p => p.marca_carro).map(p => p.marca_carro);
    return Array.from(new Set(list));
  }, [activeParts]);

  const models = useMemo(() => {
    const list = activeParts
      .filter(p => (!selectedBrand || p.marca_carro === selectedBrand) && p.modelo_carro)
      .map(p => p.modelo_carro);
    return Array.from(new Set(list));
  }, [activeParts, selectedBrand]);

  const yearsRange = useMemo(() => {
    const years: number[] = [];
    for (let yr = 1998; yr <= 2026; yr++) years.push(yr);
    return years.reverse();
  }, []);

  const engineVersions = useMemo(() => {
    if (!selectedBrand || !selectedModel) return [];
    const list = activeParts
      .filter(p => p.marca_carro === selectedBrand && p.modelo_carro === selectedModel)
      .flatMap(p => {
        const matches: string[] = [];
        const combined = `${p.nombre} ${p.compatibilidad_detalle || ''} ${p.descripcion || ''}`.toLowerCase();
        
        // Extended keywords for Chevrolet models and specific versions requested
        const keywords = [
          '1.6', '1.8', '2.0', '1.4', '1.2', '2.4', '3.6', '4.3', '5.3', '6.0',
          'design', 'limited', 'avance', 'advance', '2pt', '4pt', '2 puertas', '4 puertas',
          'ls', 'lt', 'ltz', 'ss', 'z71', 'kavak', 'fortuner', '4x4', '4x2'
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedBrand, selectedModel, selectedYear, selectedEngine]);

  const filteredProducts = useMemo(() => {
    let list = searchPartsSemantically(searchQuery);

    if (selectedCategory) {
      list = list.filter(p => p.categoria.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (selectedBrand) {
      list = list.filter(p => p.marca_carro.toLowerCase() === selectedBrand.toLowerCase());
    }
    if (selectedModel) {
      list = list.filter(p => p.modelo_carro.toLowerCase() === selectedModel.toLowerCase());
    }
    if (selectedYear) {
      const numericYear = parseInt(selectedYear);
      if (!isNaN(numericYear)) {
        list = list.filter(p => p.anio_inicio <= numericYear && p.anio_fin >= numericYear);
      }
    }
    if (selectedEngine) {
      list = list.filter(p => {
        const searchText = `${p.nombre} ${p.compatibilidad_detalle || ''} ${p.descripcion || ''}`.toLowerCase();
        return searchText.includes(selectedEngine.toLowerCase());
      });
    }

    return list;
  }, [parts, searchQuery, selectedCategory, selectedBrand, selectedModel, selectedYear, selectedEngine, searchPartsSemantically]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedEngine('');
    resetGlobalFilters();
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      <SEOHead 
        type="catalog" 
        filters={{
          category: selectedCategory,
          brand: selectedBrand,
          model: selectedModel,
          year: selectedYear,
          engine: selectedEngine
        }}
      />

      <div className="flex justify-between items-center text-zinc-900">
        <div>
          <span className="text-[10px] font-mono text-blue-600 font-bold uppercase tracking-wider">Mecánica de Precisión Automotriz</span>
          <h2 className="text-xl font-bold font-display text-zinc-900">Buscador por Filtro</h2>
        </div>
        <span className="text-xs text-zinc-500 font-mono bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-lg">
          {filteredProducts.length} acoplados
        </span>
      </div>

      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-2.5 text-zinc-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Busca por repuesto, código ó modelo..."
            className="w-full bg-zinc-50 hover:bg-zinc-100 focus:bg-white border border-zinc-200 rounded-lg pl-10 pr-4 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-blue-500 transition-all shadow-sm"
          />
        </div>

        <button
          type="button"
          onClick={onOpenScanner}
          className="bg-zinc-50 border border-zinc-200 text-blue-600 hover:bg-blue-50 p-2.5 rounded-lg transition-all cursor-pointer"
          title="Escanear Código de Barras OEM"
        >
          <Camera size={16} />
        </button>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`border p-2.5 rounded-lg transition-all cursor-pointer ${showAdvanced ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent text-zinc-800 border-zinc-200 hover:bg-zinc-50'}`}
        >
          <SlidersHorizontal size={16} />
        </button>
      </div>

      <div className={`p-4 border border-zinc-200 rounded-lg bg-zinc-50/50 flex flex-col gap-3 transition-all ${showAdvanced ? 'block' : 'hidden md:flex'} text-zinc-900 shadow-sm`}>
        <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
          <span className="text-[10px] uppercase font-mono font-bold text-zinc-800 tracking-wider flex items-center gap-1.5">
            <Cpu size={12} className="text-blue-600" /> Configuración de tu Vehículo
          </span>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-[10px] font-mono text-zinc-400 hover:text-blue-600 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RefreshCcw size={10} /> Restablecer filtros
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">1. Marca</span>
            <select
              value={selectedBrand}
              onChange={(e) => { setSelectedBrand(e.target.value); setSelectedModel(''); setSelectedEngine(''); }}
              className="bg-white text-zinc-900 border border-zinc-200 rounded-lg px-2.5 py-1.5 font-sans outline-none focus:border-blue-500 transition-all text-xs font-bold"
            >
              <option value="">Cualquier Marca</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">2. Modelo</span>
            <select
              value={selectedModel}
              onChange={(e) => { setSelectedModel(e.target.value); setSelectedEngine(''); }}
              className="bg-white text-zinc-900 border border-zinc-200 rounded-lg px-2.5 py-1.5 font-sans outline-none focus:border-blue-500 transition-all disabled:opacity-50 text-xs font-bold"
              disabled={!selectedBrand}
            >
              <option value="">Cualquier Modelo</option>
              {models.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">3. Motor / Versión</span>
            <select
              value={selectedEngine}
              onChange={(e) => setSelectedEngine(e.target.value)}
              className="bg-white text-zinc-900 border border-zinc-200 rounded-lg px-2.5 py-1.5 font-sans outline-none focus:border-blue-500 transition-all disabled:opacity-50 text-xs font-bold"
              disabled={!selectedModel || engineVersions.length === 0}
            >
              <option value="">Cualquier Versión</option>
              {engineVersions.map(ver => (
                <option key={ver} value={ver}>{ver}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">4. Año</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-white text-zinc-900 border border-zinc-200 rounded-lg px-2.5 py-1.5 font-sans outline-none focus:border-blue-500 transition-all text-xs font-bold"
            >
              <option value="">Cualquier Año</option>
              {yearsRange.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
               ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">5. Categoría</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white text-zinc-900 border border-zinc-200 rounded-lg px-2.5 py-1.5 font-sans outline-none focus:border-blue-500 transition-all text-xs font-bold"
            >
              <option value="">Todas las piezas</option>
              <option value="Frenos">Frenos</option>
              <option value="Motor">Motor</option>
              <option value="Refrigeración">Refrigeración</option>
              <option value="Suspensión">Suspensión</option>
              <option value="Eléctrico">Eléctrico</option>
              <option value="Filtros">Filtros</option>
            </select>
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center justify-center border border-dashed border-zinc-200 rounded-lg p-6 bg-zinc-50/50">
          <FilterX size={40} className="text-zinc-400 mb-2" />
          <h4 className="text-sm font-bold font-display text-zinc-800">No se acoplaron repuestos</h4>
          <p className="text-xs text-zinc-500 max-w-xs mt-1 leading-relaxed">
            No encontramos coincidencias en {selectedCategory || 'el catálogo'} para tu vehículo. Haz clic en limpiar para restablecer.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-4 bg-zinc-100 text-xs font-bold font-display px-4 py-2 rounded-lg border border-zinc-200 hover:bg-zinc-200 text-zinc-800 transition-colors cursor-pointer"
          >
            Limpiar Filtros
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {paginatedProducts.map((part) => {
              const priceInBs = part.precio_usd * config.tasa_cambio;
              return (
                <div
                  key={part.id}
                  className="rounded-lg border border-zinc-200 bg-zinc-50/40 hover:border-blue-500/50 overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:shadow-md"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 border-b border-zinc-100">
                    <img
                      src={part.imagen_urls[0]}
                      alt={part.nombre}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    {part.imagen_urls && part.imagen_urls.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-zinc-950/70 hover:bg-zinc-950 text-white text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full z-10 flex items-center gap-1 backdrop-blur-xs select-none shadow">
                        <span>📷 {part.imagen_urls.length}</span>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 text-[8px] font-bold font-mono">
                      {part.stock <= 3 && (
                        <span className="bg-red-500 text-white px-1.5 py-0.5 rounded uppercase shadow">
                          Stock Bajo
                        </span>
                      )}
                      {part.es_promo && (
                        <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase shadow">
                          Oferta
                        </span>
                      )}
                      {part.delivery_gratis && (
                        <span className="bg-indigo-600 text-white px-1.5 py-0.5 rounded uppercase shadow animate-pulse">
                          Delivery Gratis
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 flex flex-col justify-between flex-1 text-zinc-900">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-zinc-500 font-mono tracking-wider">{part.marca_carro} • {part.modelo_carro}</span>
                      <h4 
                        onClick={() => onViewProductDetails(part)}
                        className="text-xs font-bold font-display text-zinc-800 leading-snug hover:text-blue-600 cursor-pointer min-h-[36px] line-clamp-2 mt-1"
                      >
                        {part.nombre}
                      </h4>
                      <span className="text-[9px] font-mono text-zinc-500 mt-1 block">COD: {part.codigo}</span>
                    </div>

                    <div className="mt-3.5 border-t border-zinc-200 pt-3 flex flex-col gap-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-zinc-500">Precio:</span>
                        <div className="text-right">
                          {displayCurrency === 'USD' ? (
                            <>
                              <div className="text-sm font-bold font-mono text-blue-600">${part.precio_usd.toFixed(2)}</div>
                              <div className="text-[10px] font-mono text-zinc-500">{(part.precio_usd * config.tasa_cambio).toFixed(2)} Bs</div>
                            </>
                          ) : (
                            <>
                              <div className="text-sm font-bold font-mono text-blue-600">{(part.precio_usd * config.tasa_cambio).toFixed(2)} Bs</div>
                              <div className="text-[10px] font-mono text-zinc-500">${part.precio_usd.toFixed(2)}</div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-1.5 mt-1 text-xs">
                        <button
                          type="button"
                          onClick={() => onViewProductDetails(part)}
                          className="flex-1 bg-zinc-100/80 hover:bg-zinc-200 text-zinc-800 py-1.5 rounded-lg border border-zinc-200 font-semibold transition-all flex items-center justify-center gap-1 text-[11px] cursor-pointer"
                        >
                          Ficha
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            addToCart(part, 1);
                            setToastMessage(part.nombre);
                          }}
                          className="flex-1 bg-zinc-950 hover:bg-zinc-850 text-white py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1 text-[11px] cursor-pointer"
                        >
                          Llevar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-4 py-2 bg-zinc-100 text-zinc-800 rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer"
              >
                Anterior
              </button>
              <span className="text-xs text-zinc-500 font-mono">
                Pág {currentPage} de {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-20 left-4 right-4 z-50 bg-zinc-950/95 border border-zinc-800 px-4 py-3.5 rounded-xl flex items-center justify-between shadow-2xl backdrop-blur-md transition-all duration-300">
          <div className="flex items-center gap-3">
            <span className="text-[#0060df] text-sm font-bold">✓</span>
            <div>
              <p className="text-[11px] font-bold text-white leading-tight">Agregado al Carrito</p>
              <p className="text-[9px] text-zinc-400 mt-0.5 max-w-[180px] line-clamp-1">{toastMessage}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage('')}
            className="text-zinc-300 hover:text-white text-[10px] font-mono font-bold uppercase cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
};
