import React, { createContext, useContext, useState, useEffect } from 'react';
import { AutoPart, Order, StoreConfig, InAppNotification, OrderItem, AppUser } from '../types/store';
import { supabase } from '../supabaseClient';

interface AppContextProps {
  parts: AutoPart[];
  orders: Order[];
  config: StoreConfig;
  notifications: InAppNotification[];
  cart: { item: AutoPart; quantity: number }[];
  isAdminAuthenticated: boolean;
  favorites: string[];
  toggleFavorite: (partId: string) => void;
  isFavorite: (partId: string) => boolean;
  
  // User Management
  displayCurrency: 'USD' | 'BS';
  toggleCurrency: () => void;
  users: AppUser[];
  currentUser: AppUser | null;
  registerUser: (nombre: string, telefono: string, contrasena: string) => AppUser;
  loginUser: (telefono: string, contrasena: string) => boolean;
  logoutUser: () => void;
  updateUser: (updated: Partial<AppUser>) => void;
  updateUserByAdmin: (userId: string, updated: Partial<AppUser>) => void;
  requestPart: (nombre: string, telefono: string, descripcion: string, imagenUrl?: string) => void;
  
  // Catalog actions
  addPart: (part: Omit<AutoPart, 'id'>) => void;
  updatePart: (id: string, updated: Partial<AutoPart>) => void;
  deletePart: (id: string) => void;
  searchPartsSemantically: (query: string) => AutoPart[];
  
  // Cart Actions
  addToCart: (part: AutoPart, qty?: number) => void;
  removeFromCart: (partId: string) => void;
  updateCartQuantity: (partId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Checkout & Order Actions
  createOrder: (orderData: Omit<Order, 'id' | 'subtotal_usd' | 'total_usd' | 'total_bs' | 'fecha' | 'status'>) => Order;
  updateOrderStatus: (orderId: string, status: Order['status'], estimatedTime?: string) => void;
  
  // Config Actions
  updateConfig: (newConfig: Partial<StoreConfig>) => void;
  updateExchangeRate: (rate: number) => void;
  fetchExchangeRate: () => Promise<void>;
  
  // Notification Actions
  addNotification: (title: string, message: string, tipo?: 'todos' | 'personal' | 'admin' | 'request', targetPhone?: string) => void;
  markNotificationAsRead: (id: string) => void;
  toggleNotificationReadStatus: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Auth
  authenticateAdmin: (user: string, pass: string) => boolean;
  logoutAdmin: () => void;
  updateAdminCredentials: (user: string, pass: string) => void;
  adminUser: string;
  adminPass: string;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// INITIAL PRODUCTS DATA
const DEFAULT_PARTS: AutoPart[] = [
  {
    id: 'a4829bef-0c7f-4b08-be94-7123aa123b01',
    codigo: 'GM-96416301',
    nombre: 'Pastillas de Freno Delanteras Chevrolet Aveo',
    descripcion: 'Pastillas de freno de cerámica premium para máxima durabilidad y frenado silencioso de alta fricción.',
    categoria: 'Frenos',
    marca_carro: 'Chevrolet',
    modelo_carro: 'Aveo',
    marca_repuesto: 'FRAS-LE',
    condicion: 'Nuevo',
    anio_inicio: 2004,
    anio_fin: 2018,
    precio_usd: 18.50,
    stock: 24,
    imagen_urls: ['https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=500'],
    es_promo: true,
    es_nuevo: false,
    es_mas_vendido: true,
    delivery_gratis: true,
    compatibilidad_detalle: 'Chevrolet Aveo T200/T250 L4 1.6L'
  },
  {
    id: 'a4829bef-0c7f-4b08-be94-7123aa123b02',
    codigo: 'GM-96350550',
    nombre: 'Correa de Tiempo Chevrolet Aveo 1.6',
    descripcion: 'Correa de distribución genuina marca GM. Alta durabilidad y resistencia al desgaste térmico.',
    categoria: 'Motor',
    marca_carro: 'Chevrolet',
    modelo_carro: 'Aveo',
    marca_repuesto: 'GM',
    condicion: 'Nuevo',
    anio_inicio: 2004,
    anio_fin: 2018,
    precio_usd: 12.00,
    stock: 16,
    imagen_urls: ['https://images.unsplash.com/photo-1516387938699-a93567ec168e?auto=format&fit=crop&q=80&w=500'],
    es_promo: false,
    es_nuevo: true,
    es_mas_vendido: true,
    compatibilidad_detalle: 'Chevrolet Aveo 1.6L 16V / Nubira / Lanos'
  },
  {
    id: 'a4829bef-0c7f-4b08-be94-7123aa123b03',
    codigo: 'GM-96350161',
    nombre: 'Bomba de Agua Chevrolet Optra Design / Limited',
    descripcion: 'Bomba de agua de aluminio forjado de alta resistencia mecánica. Evita recalentamientos y fugas.',
    categoria: 'Refrigeración',
    marca_carro: 'Chevrolet',
    modelo_carro: 'Optra',
    marca_repuesto: 'MORUCH',
    condicion: 'Nuevo',
    anio_inicio: 2004,
    anio_fin: 2014,
    precio_usd: 28.00,
    stock: 8,
    imagen_urls: ['https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&q=80&w=500'],
    es_promo: true,
    es_nuevo: false,
    es_mas_vendido: false,
    delivery_gratis: true,
    compatibilidad_detalle: 'Chevrolet Optra Motor T20SED 1.8L Ltd y Design'
  },
  {
    id: 'a4829bef-0c7f-4b08-be94-7123aa123b04',
    codigo: 'CN11-18080-AD',
    nombre: 'Amortiguador Delantero Izquierdo Ford Fiesta',
    descripcion: 'Amortiguador a gas presurizado con tecnología Twin-Tube. Amortiguado óptimo en baches valencianos.',
    categoria: 'Suspensión',
    marca_carro: 'Ford',
    modelo_carro: 'Fiesta',
    marca_repuesto: 'HACODECH',
    condicion: 'Nuevo',
    anio_inicio: 2002,
    anio_fin: 2019,
    precio_usd: 35.50,
    stock: 12,
    imagen_urls: ['https://images.unsplash.com/photo-1512461351119-24977bcb8d77?auto=format&fit=crop&q=80&w=500'],
    es_promo: false,
    es_nuevo: false,
    es_mas_vendido: true,
    compatibilidad_detalle: 'Ford Fiesta Balita, Power, Max, Move, Titanium L4 1.6L'
  },
  {
    id: 'a4829bef-0c7f-4b08-be94-7123aa123b05',
    codigo: '7S61-8C607-AB',
    nombre: 'Electroventilador Completo Ford Fiesta',
    descripcion: 'Electroventilador completo con aspas balanceadas y difusor térmicamente optimizado para clima del Carabobo.',
    categoria: 'Refrigeración',
    marca_carro: 'Ford',
    modelo_carro: 'Fiesta',
    marca_repuesto: 'FOMOCO',
    condicion: 'Usado',
    anio_inicio: 2004,
    anio_fin: 2014,
    precio_usd: 45.00,
    stock: 5,
    imagen_urls: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=500'],
    es_promo: true,
    es_nuevo: false,
    es_mas_vendido: false,
    delivery_gratis: true,
    compatibilidad_detalle: 'Ford Fiesta Power, Max, Move L4 1.6L Motor Zetec'
  },
  {
    id: 'a4829bef-0c7f-4b08-be94-7123aa123b06',
    codigo: 'TY-90919-01210',
    nombre: 'Bujías Denso de Iridio Toyota Corolla',
    descripcion: 'Kit de 4 de bujías de iridio originales de alto desempeño y óptima eficiencia de combustible.',
    categoria: 'Eléctrico',
    marca_carro: 'Toyota',
    modelo_carro: 'Corolla',
    marca_repuesto: 'DENSO',
    condicion: 'Nuevo',
    anio_inicio: 2000,
    anio_fin: 2022,
    precio_usd: 24.00,
    stock: 40,
    imagen_urls: ['https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=500'],
    es_promo: false,
    es_nuevo: true,
    es_mas_vendido: true,
    compatibilidad_detalle: 'Toyota Corolla Baby Camry, Pantallita, Sensación, New Sensation, GLI, Motor 1.6/1.8'
  },
  {
    id: 'a4829bef-0c7f-4b08-be94-7123aa123b07',
    codigo: 'TY-17801-21050',
    nombre: 'Filtro de Aire Toyota Yaris / Corolla',
    descripcion: 'Filtro de aire de alto flujo y filtrado microscópico para proteger el motor de residuos externos.',
    categoria: 'Filtros',
    marca_carro: 'Toyota',
    modelo_carro: 'Corolla',
    marca_repuesto: 'TOYOTA',
    condicion: 'Usado',
    anio_inicio: 2003,
    anio_fin: 2018,
    precio_usd: 9.50,
    stock: 30,
    imagen_urls: ['https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=500'],
    es_promo: false,
    es_nuevo: false,
    es_mas_vendido: false,
    compatibilidad_detalle: 'Toyota Corolla 1.6 / 1.8L & Toyota Yaris Belta Sol Hatchback 1.3 / 1.5'
  },
  {
    id: 'a4829bef-0c7f-4b08-be94-7123aa123b08',
    codigo: 'GM-96413420',
    nombre: 'Empacadura de Cámara Chevrolet Aveo',
    descripcion: 'Empacadura metálica de cámara de compresión (formato MLS) importada de altísima confiabilidad térmica.',
    categoria: 'Motor',
    marca_carro: 'Chevrolet',
    modelo_carro: 'Aveo',
    marca_repuesto: 'GM',
    condicion: 'Nuevo',
    anio_inicio: 2004,
    anio_fin: 2018,
    precio_usd: 15.00,
    stock: 20,
    imagen_urls: ['https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&q=80&w=500'],
    es_promo: false,
    es_nuevo: true,
    es_mas_vendido: false,
    compatibilidad_detalle: 'Motor GM Aveo 1.6L L4 16v de doble árbol'
  },
  {
    id: 'a4829bef-0c7f-4b08-be94-7123aa123b09',
    codigo: 'TY-04465-0K140',
    nombre: 'Pastillas de Freno Toyota Hilux Kavak / Fortuner',
    descripcion: 'Pastillas de freno Heavy Duty diseñadas para carga pesada, terrenos agrestes y frenado severo seguro.',
    categoria: 'Frenos',
    marca_carro: 'Toyota',
    modelo_carro: 'Hilux',
    marca_repuesto: 'ADVICS',
    condicion: 'Nuevo',
    anio_inicio: 2006,
    anio_fin: 2020,
    precio_usd: 32.00,
    stock: 15,
    imagen_urls: ['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=500'],
    es_promo: false,
    es_nuevo: false,
    es_mas_vendido: true,
    compatibilidad_detalle: 'Toyota Hilux Kavak 2.7/4.0L Dakar / Fortuner 4x2 & 4x4'
  },
  {
    id: 'a4829bef-0c7f-4b08-be94-7123aa123b10',
    codigo: '7S61-3K186-AA',
    nombre: 'Kit de Bocinas de Meseta Ford EcoSport / Fiesta',
    descripcion: 'Bocinas de meseta de suspensión delantera fabricadas en poliuretano de alta resistencia. Resistencia incrementada.',
    categoria: 'Suspensión',
    marca_carro: 'Ford',
    modelo_carro: 'EcoSport',
    marca_repuesto: 'VIBRACO',
    condicion: 'Nuevo',
    anio_inicio: 2004,
    anio_fin: 2017,
    precio_usd: 19.99,
    stock: 18,
    imagen_urls: ['https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=500'],
    es_promo: true,
    es_nuevo: true,
    es_mas_vendido: false,
    compatibilidad_detalle: 'Ford EcoSport 1.6/2.0L tracción delantera & Ford Fiesta Max/Move'
  }
];

const DEFAULT_CONFIG: StoreConfig = {
  site_nombre: 'TuRepuestoValencia',
  telefono_soporte: '+584124976451',
  direccion_fisica: 'Calle 140 con Av. Bolívar Norte, local #12, Sector Las Acacias, Valencia, Carabobo',
  coordenadas_tienda: { lat: 10.198300, lng: -68.004400 },
  banners: [
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=1200', // Banner 1 (Frenos Premium)
    'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=1200', // Banner 2 (Motor Tuning)
    'https://images.unsplash.com/photo-1512461351119-24977bcb8d77?auto=format&fit=crop&q=80&w=1200'  // Banner 3 (Amortiguadores High Perform)
  ],
  zelle_enabled: true,
  zelle_data: '',
  zelle_discount_percent: 0,
  pagomovil_enabled: true,
  pagomovil_data: '',
  pagomovil_discount_percent: 0,
  efectivo_enabled: true,
  efectivo_data: '',
  efectivo_discount_percent: 0,
  transferencia_enabled: true,
  transferencia_data: '',
  transferencia_discount_percent: 0,
  tasa_cambio: 36.50,
  logo_url: '',
  theme_color: '#3b82f6',
  delivery_gratis: false,
  costo_delivery_km: 1.5,
  envio_nacional: true,
  costo_envio_nacional: 5.0,
  favicon_url: '',
  banner_texts: [
    'Frenos Premium - 15% DCTO',
    'Potencia tu Motor - Accesorios Tuning',
    'Amortiguadores High Performance'
  ]
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistence state loaders
  const [parts, setParts] = useState<AutoPart[]>(() => {
    const saved = localStorage.getItem('trv_parts');
    return saved ? JSON.parse(saved) : DEFAULT_PARTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('trv_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [config, setConfig] = useState<StoreConfig>(() => {
    const saved = localStorage.getItem('trv_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    const saved = localStorage.getItem('trv_notifications');
    return saved ? JSON.parse(saved) : [
      {
        id: 'init-notif',
        titulo: '¡Bienvenidos a TuRepuestoValencia!',
        mensaje: 'Encuentra las mejores pastillas de freno, correas y bombas de agua para tu Chevrolet, Ford o Toyota en Valencia.',
        fecha: new Date().toLocaleDateString(),
        tipo: 'todos',
        leida: false
      }
    ];
  });

  const [cart, setCart] = useState<{ item: AutoPart; quantity: number }[]>(() => {
    const saved = localStorage.getItem('trv_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('trv_admin_auth') === 'true';
  });

  const [adminUser, setAdminUser] = useState<string>(() => {
    const saved = localStorage.getItem('trv_admin_user')?.trim();
    return saved && saved.length > 0 ? saved : 'admin';
  });

  const [adminPass, setAdminPass] = useState<string>(() => {
    const saved = localStorage.getItem('trv_admin_pass')?.trim();
    return saved && saved.length > 0 ? saved : 'admin123';
  });

  const [displayCurrency, setDisplayCurrency] = useState<'USD' | 'BS'>(() => {
    return (localStorage.getItem('trv_currency') as 'USD' | 'BS') || 'USD';
  });

  const toggleCurrency = () => {
    const newCurrency = displayCurrency === 'USD' ? 'BS' : 'USD';
    setDisplayCurrency(newCurrency);
    localStorage.setItem('trv_currency', newCurrency);
  };

  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem('trv_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem('trv_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('trv_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to locale variables on updates
  useEffect(() => {
    localStorage.setItem('trv_parts', JSON.stringify(parts));
  }, [parts]);

  useEffect(() => {
    localStorage.setItem('trv_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('trv_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('trv_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('trv_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('trv_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('trv_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('trv_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Attempt to load catalog from Supabase if env vars are present
  useEffect(() => {
    const loadFromSupabase = async () => {
      try {
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) return;
        const { data, error } = await supabase
          .from('repuestos_catalogo')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200);

        if (error) {
          console.error('Supabase error fetching repuestos_catalogo:', error);
          return;
        }

        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((r: any) => ({
            id: r.id,
            codigo: r.codigo,
            nombre: r.nombre,
            descripcion: r.descripcion,
            categoria: r.categoria,
            marca_carro: r.marca_carro,
            modelo_carro: r.modelo_carro,
            marca_repuesto: r.marca_repuesto || '',
            condicion: r.condicion || 'Nuevo',
            anio_inicio: r.anio_inicio,
            anio_fin: r.anio_fin,
            precio_usd: typeof r.precio_usd === 'string' ? parseFloat(r.precio_usd) : r.precio_usd,
            stock: typeof r.stock === 'string' ? parseInt(r.stock, 10) : r.stock,
            imagen_urls: r.imagen_urls || [],
            es_promo: r.es_promo || false,
            es_nuevo: r.es_nuevo || false,
            es_mas_vendido: r.es_mas_vendido || false,
            compatibilidad_detalle: r.compatibilidad_detalle || ''
          } as AutoPart));

          setParts(mapped);
        }
      } catch (err) {
        console.error('Error cargando repuestos desde Supabase', err);
      }
    };

    loadFromSupabase();
  }, []);

  useEffect(() => {
    localStorage.setItem('trv_admin_user', adminUser);
    localStorage.setItem('trv_admin_pass', adminPass);
  }, [adminUser, adminPass]);

  // Daily Exchange Rate Update Routine
  const fetchExchangeRate = async () => {
    try {
      console.log('Fetching latest exchange rate from BCV...');
      // Using a reputable open source API for BCV rates in Venezuela
      const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
      if (response.ok) {
        const data = await response.json();
        if (data && data.promedio) {
          const newRate = parseFloat(data.promedio);
          if (!isNaN(newRate) && newRate > 0) {
            updateExchangeRate(newRate);
            localStorage.setItem('trv_last_rate_fetch', new Date().toDateString());
            console.log(`Rate updated to: ${newRate} Bs.`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch BCV rate:', error);
    }
  };

  useEffect(() => {
    const lastFetch = localStorage.getItem('trv_last_rate_fetch');
    const today = new Date().toDateString();
    
    if (lastFetch !== today) {
      fetchExchangeRate();
    }
  }, []);

  const toggleFavorite = (partId: string) => {
    setFavorites(prev => 
      prev.includes(partId) ? prev.filter(id => id !== partId) : [...prev, partId]
    );
  };

  const isFavorite = (partId: string) => {
    return favorites.includes(partId);
  };

  const requestPart = (nombre: string, telefono: string, descripcion: string, imagenUrl?: string) => {
    addNotification(
      'Nueva Solicitud de Repuesto 🧰',
      `Solicitud de: ${nombre} (${telefono})\n\nRepuesto: ${descripcion}${imagenUrl ? `\n\nImagen disponible` : ''}`,
      'request',
      telefono
    );
     // Also notify user that request was received
     addNotification(
      'Solicitud de Repuesto Recibida',
      `Hola ${nombre}, hemos recibido tu solicitud para"${descripcion.substring(0, 30)}...". Un agente de TuRepuestoValencia te contactará pronto.`,
      'personal',
      telefono
    );
  };

  // Catalog CRUD Functions
  const addPart = (partData: Omit<AutoPart, 'id'>) => {
    const newPart: AutoPart = {
      ...partData,
      id: `part-${Date.now()}`
    };
    setParts(prev => [...prev, newPart]);
    addNotification('Nuevo Repuesto Agregado', `Se ha agregado ${newPart.nombre} al catálogo de repuestos.`);
    
    if (newPart.stock < 5) {
      addNotification(
        '⚠️ Alerta de Stock Bajo (Admin)',
        `El repuesto "${newPart.nombre}" (Código: ${newPart.codigo}) tiene un nivel de stock crítico inicial de ${newPart.stock} unidades. Por favor, reabastecer a la brevedad.`,
        'admin'
      );
    }
  };

  const updatePart = (id: string, updated: Partial<AutoPart>) => {
    setParts(prev => prev.map(p => {
      if (p.id === id) {
        const nextStock = updated.stock !== undefined ? updated.stock : p.stock;
        if (p.stock >= 5 && nextStock < 5) {
          addNotification(
            '⚠️ Alerta de Stock Bajo (Admin)',
            `El repuesto "${p.nombre}" (Código: ${p.codigo}) tiene un nivel de stock crítico de ${nextStock} unidades. Por favor, reabastecer a la brevedad.`,
            'admin'
          );
        }
        return { ...p, ...updated };
      }
      return p;
    }));
  };

  const deletePart = (id: string) => {
    setParts(prev => prev.filter(p => p.id !== id));
    // Remove from cart if it was there
    setCart(prev => prev.filter(item => item.item.id !== id));
  };

  // Semantical Automotive Intelligent Search
  const searchPartsSemantically = (query: string): AutoPart[] => {
    if (!query || query.trim() === '') return parts.filter(p => p.activo !== false);
    
    const cleanQuery = query.toLowerCase().trim();
    const tokens = cleanQuery.split(/\s+/);
    
    // Isolate target year if any numeric text of 4 digits exists between 1980 and 2026
    let queryYear: number | null = null;
    const remainingTokens: string[] = [];
    
    for (const token of tokens) {
      const parsedNum = parseInt(token);
      if (!isNaN(parsedNum) && parsedNum >= 1980 && parsedNum <= 2026) {
        queryYear = parsedNum;
      } else {
        remainingTokens.push(token);
      }
    }
    
    return parts.filter(part => {
      // 0. Only active parts
      if (part.activo === false) {
        return false;
      }

      // 1. Year Match (anio_inicio <= queryYear <= anio_fin)
      if (queryYear !== null) {
        if (part.anio_inicio > queryYear || part.anio_fin < queryYear) {
          return false;
        }
      }
      
      // If there are no other keywords, just filter by compatible year
      if (remainingTokens.length === 0) return true;
      
      // 2. Keyword Match on Name, Code, Description, Brand, Model, Category, Compatibility Detalle, Condition, Delivery
      const partSearchText = `${part.nombre} ${part.codigo} ${part.descripcion} ${part.categoria} ${part.marca_carro} ${part.modelo_carro} ${part.marca_repuesto} ${part.condicion} ${part.delivery_gratis ? 'delivery gratis' : ''} ${part.compatibilidad_detalle || ''}`.toLowerCase();
      
      // Enforce AND logic or highly relevant matching
      return remainingTokens.every(tok => partSearchText.includes(tok));
    });
  };

  // Cart Actions
  const addToCart = (part: AutoPart, qty = 1) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.item.id === part.id);
      if (idx > -1) {
        const currentQty = prev[idx].quantity;
        const targetQty = Math.min(part.stock, currentQty + qty);
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: targetQty };
        return copy;
      } else {
        return [...prev, { item: part, quantity: Math.min(part.stock, qty) }];
      }
    });
  };

  const removeFromCart = (partId: string) => {
    setCart(prev => prev.filter(item => item.item.id !== partId));
  };

  const updateCartQuantity = (partId: string, quantity: number) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.item.id === partId);
      if (idx > -1) {
        const partStock = prev[idx].item.stock;
        const targetQty = Math.max(1, Math.min(partStock, quantity));
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: targetQty };
        return copy;
      }
      return prev;
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  // Orders Management
  const createOrder = (orderData: Omit<Order, 'id' | 'subtotal_usd' | 'total_usd' | 'total_bs' | 'fecha' | 'status'>) => {
    // Recalculate Totals securely
    const items = cart.map(item => ({
      part_id: item.item.id,
      nombre: item.item.nombre,
      codigo: item.item.codigo,
      precio_usd: item.item.precio_usd,
      cantidad: item.quantity
    }));

    const subtotal = items.reduce((acc, item) => acc + (item.precio_usd * item.cantidad), 0);
    console.log('Subtotal:', subtotal);
    
    // Apply discount based on payment method
    let discountPercent = 0;
    if (orderData.metodo_pago === 'Pago Móvil') discountPercent = config.pagomovil_discount_percent || 0;
    else if (orderData.metodo_pago === 'Zelle') discountPercent = config.zelle_discount_percent || 0;
    else if (orderData.metodo_pago === 'Efectivo') discountPercent = config.efectivo_discount_percent || 0;
    else if (orderData.metodo_pago === 'Transferencia') discountPercent = config.transferencia_discount_percent || 0;
    
    console.log('Discount Percent:', discountPercent, 'Payment Method:', orderData.metodo_pago);
    
    const discountAmount = (subtotal || 0) * ((discountPercent || 0) / 100);
    const subtotalAfterDiscount = (subtotal || 0) - (discountAmount || 0);
    
    console.log('Discount Amount:', discountAmount, 'Costo Envío:', orderData.costo_envio_usd);
    
    const totalUsd = (subtotalAfterDiscount || 0) + (orderData.costo_envio_usd || 0);
    const totalBs = (totalUsd || 0) * (config.tasa_cambio || 1);

    console.log('Total USD:', totalUsd, 'Total BS:', totalBs);



    const newOrder: Order = {
      ...orderData,
      id: `PED-${Math.floor(1000 + Math.random() * 9000)}-VAL-${new Date().getFullYear()}`,
      usuario_id: currentUser ? currentUser.id : undefined,
      items,
      subtotal_usd: subtotal,
      total_usd: totalUsd,
      total_bs: totalBs,
      status: 'Pendiente',
      fecha: new Date().toLocaleString()
    };

    // Discount stock of our products
    setParts(prev => prev.map(p => {
      const cartItem = cart.find(ci => ci.item.id === p.id);
      if (cartItem) {
        const nextStock = Math.max(0, p.stock - cartItem.quantity);
        if (p.stock >= 5 && nextStock < 5) {
          addNotification(
            '⚠️ Alerta de Stock Bajo (Admin)',
            `El repuesto "${p.nombre}" (Código: ${p.codigo}) tiene un nivel de stock crítico de ${nextStock} unidades. Por favor, reabastecer a la brevedad.`,
            'admin'
          );
        }
        return { ...p, stock: nextStock };
      }
      return p;
    }));

    setOrders(prev => [newOrder, ...prev]);
    clearCart();

    // Trigger Notification for the store and the client
    addNotification('Nuevo Pedido Recibido', `Pedido ${newOrder.id} fue procesado correctamente para ${newOrder.cliente_nombre}.`);

    // Add notification specifically for the admin
    addNotification(
      'Nuevo Pedido Recibido',
      `Se ha recibido un nuevo pedido con el ID: ${newOrder.id} del cliente "${newOrder.cliente_nombre}".`,
      'admin'
    );

    // If the order has a targeted user or phone, notify them
    if (newOrder.cliente_telefono) {
      addNotification(
        'Pedido Recibido con Éxito 📦',
        `Hola ${newOrder.cliente_nombre}! Tu pedido con ID ${newOrder.id} por un monto de $${newOrder.total_usd.toFixed(2)} (${newOrder.total_bs.toFixed(2)} Bs) ha sido ingresado en estado: Pendiente. Estamos listos para atenderte.`,
        'personal',
        newOrder.cliente_telefono
      );
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status'], estimatedTime?: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, tiempo_estimado_entrega: estimatedTime !== undefined ? estimatedTime : o.tiempo_estimado_entrega } : o));
    
    // Find who placed the order and send a profile notification
    const orderObj = orders.find(o => o.id === orderId);
    const targetPhone = orderObj?.cliente_telefono;
    const clientName = orderObj?.cliente_nombre || 'Cliente';
    
    let statusMsg = `Tu pedido ${orderId} ahora se encuentra en estado: ${status}.`;
    if (status === 'En preparación') {
      statusMsg = `🔧 ¡Buenas noticias, ${clientName}! Tu pedido ${orderId} ya está en preparación en nuestros almacenes de Las Acacias.`;
    } else if (status === 'En camino') {
      statusMsg = `🛵 ¡Tu pedido ${orderId} va en camino! Nuestro motorizado se dirige a tu ubicación en Valencia.`;
    } else if (status === 'Entregado') {
      statusMsg = `✅ Pedido ${orderId} entregado con éxito. ¡Gracias por preferir a TuRepuestoValencia!`;
    } else {
      statusMsg = `El pedido ${orderId} ahora se encuentra en estado: ${status}.`;
    }
    
    if (estimatedTime) {
      statusMsg += ` Tiempo estimado de entrega: ${estimatedTime}.`;
    }
    
    addNotification('Estado de Pedido Actualizado', statusMsg, 'todos');
    
    if (targetPhone) {
      addNotification('Estado de Pedido Actualizado', statusMsg, 'personal', targetPhone);
    }
  };

  // User Management Implementation
  const registerUser = (nombre: string, telefono: string, contrasena: string): AppUser => {
    const newUser: AppUser = {
      id: `user-${Date.now()}`,
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      contrasena: contrasena.trim(),
      createdAt: new Date().toISOString()
    };
    
    setUsers(prev => {
      // Remove any existing user with the same phone to avoid duplicates
      const filtered = prev.filter(u => u.telefono.trim() !== newUser.telefono.trim());
      return [...filtered, newUser];
    });
    setCurrentUser(newUser);

    addNotification(
      '¡Registro Exitoso! 🎉',
      `Hola ${newUser.nombre}. Te has registrado con éxito. Recuerda que con tu nombre, teléfono (${newUser.telefono}) y tu clave secreta podrás acceder siempre a tu panel de usuario.`,
      'personal',
      newUser.telefono
    );
    
    return newUser;
  };

  const loginUser = (telefono: string, contrasena: string): boolean => {
    const user = users.find(u => u.telefono.trim() === telefono.trim() && u.contrasena.trim() === contrasena.trim());
    if (user) {
      setCurrentUser(user);
      addNotification(
        'Sesión Iniciada',
        `Bienvenido de vuelta, ${user.nombre}. Accede a tus notificaciones y estatus de compras desde este panel.`,
        'personal',
        user.telefono
      );
      return true;
    }
    return false;
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const updateUser = (updated: Partial<AppUser>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updated };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    addNotification(
      'Datos Actualizados ⚙️',
      `Tus datos han sido guardados. Nombre: ${updatedUser.nombre}, Teléfono: ${updatedUser.telefono}. Tus credenciales de acceso son tu nombre, teléfono y contraseña guardada.`,
      'personal',
      updatedUser.telefono
    );
  };

  const updateUserByAdmin = (userId: string, updated: Partial<AppUser>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updated } : u));
    
    // If the updated user is the current user, update current user too
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, ...updated } : null);
    }
  };

  // Configurations
  const updateConfig = (newSettings: Partial<StoreConfig>) => {
    setConfig(prev => ({ ...prev, ...newSettings }));
  };

  const updateExchangeRate = (rate: number) => {
    setConfig(prev => ({ ...prev, tasa_cambio: rate }));
  };

  // Log notifications
  const addNotification = (title: string, message: string, tipo: 'todos' | 'personal' | 'admin' | 'request' = 'todos', targetPhone?: string) => {
    const newNotif: InAppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      titulo: title,
      mensaje: message,
      fecha: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tipo,
      destinatario_telefono: targetPhone,
      leida: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Push local browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${title} - TuRepuestoValencia`, { body: message });
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
  };

  const toggleNotificationReadStatus = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, leida: !n.leida } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Admin Auth functions
  const authenticateAdmin = (user: string, pass: string): boolean => {
    if (user.trim() === adminUser.trim() && pass.trim() === adminPass.trim()) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('trv_admin_auth', 'true');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('trv_admin_auth');
  };

  const updateAdminCredentials = (user: string, pass: string) => {
    setAdminUser(user.trim() || 'admin');
    setAdminPass(pass.trim() || 'admin123');
  };

  return (
    <AppContext.Provider value={{
      parts,
      orders,
      config,
      notifications,
      cart,
      isAdminAuthenticated,
      favorites,
      toggleFavorite,
      isFavorite,
      users,
      currentUser,
      registerUser,
      loginUser,
      logoutUser,
      updateUser,
      updateUserByAdmin,
      addPart,
      updatePart,
      deletePart,
      searchPartsSemantically,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      createOrder,
      updateOrderStatus,
      updateConfig,
      updateExchangeRate,
      fetchExchangeRate,
      addNotification,
      markNotificationAsRead,
      toggleNotificationReadStatus,
      clearAllNotifications,
      authenticateAdmin,
      logoutAdmin,
      updateAdminCredentials,
      adminUser,
      adminPass,
      requestPart,
      displayCurrency,
      toggleCurrency
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside an AppProvider');
  }
  return context;
};
