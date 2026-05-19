import React, { useEffect } from 'react';
import { AutoPart } from '../types/store';
import { useApp } from '../store/AppContext';

interface SEOHeadProps {
  title?: string;
  description?: string;
  type?: 'home' | 'product' | 'catalog' | 'admin';
  product?: AutoPart;
  filters?: {
    category?: string;
    brand?: string;
    model?: string;
    year?: string;
    engine?: string;
  };
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  type = 'home',
  product,
  filters
}) => {
  const { config } = useApp();

  useEffect(() => {
    // 1. Dynamic Title & Description Update
    const defaultTitle = `Repuestos Chevrolet a Domicilio en Valencia | ${config.site_nombre}`;
    const defaultDesc = `Venta de repuestos Chevrolet (Aveo, Optra, Spark) y todas las marcas a domicilio en Valencia, San Diego y Naguanagua. Compras seguras con delivery express. ¡Conseguimos lo que necesites!`;
    const defaultKeywords = `repuestos, chevrolet, valencia, venezuela, aveo, optra, spark, a domicilio, delivery, autopartes, carabobo`;
    
    let seoTitle = title;
    let seoDesc = description;
    let seoKeywords = defaultKeywords;

    // AIO: Automatic SEO Generation for Products
    if (type === 'product' && product) {
      seoTitle = `${product.nombre} ${product.marca_carro} ${product.modelo_carro} en Valencia | Repuestos ${product.categoria}`;
      seoDesc = `Compra ${product.nombre} ${product.condicion.toLowerCase()} para ${product.marca_carro} ${product.modelo_carro} (${product.anio_inicio}-${product.anio_fin}). Repuestos de calidad en Valencia, Naguanagua y San Diego. Código OEM: ${product.codigo}. Delivery Express disponible.`;
      seoKeywords = `${product.nombre}, ${product.marca_carro}, ${product.modelo_carro}, ${product.categoria}, repuestos ${product.marca_carro}, valencia, venezuela, carabobo, repuestos naguanagua, repuestos san diego, autopartes valencia, codigo ${product.codigo}, ${product.marca_repuesto}`;
    }

    // AIO: Automatic SEO Generation for Catalog
    if (type === 'catalog') {
      const { category, brand, model, year, engine } = filters || {};
      
      const parts = [];
      if (category) parts.push(category);
      if (brand) parts.push(brand);
      if (model) parts.push(model);
      if (year) parts.push(year);
      if (engine) parts.push(engine);

      const filterText = parts.length > 0 ? parts.join(' ') : 'Repuestos Chevrolet y Multimarca';
      
      seoTitle = `Venta de ${filterText} en Valencia | Catálogo Autopartes`;
      seoDesc = `Catálogo especializado de ${filterText} en Valencia, Venezuela. Pastillas de freno, bobinas, amortiguadores y más con delivery a domicilio. Naguanagua y San Diego. Compra repuestos para ${brand || 'tu vehículo'} con stock real.`;
      
      const kwParts = ['repuestos', 'valencia', 'venezuela', 'autopartes', 'delivery domicilio', 'naguanagua', 'san diego'];
      if (category) kwParts.push(`repuestos ${category.toLowerCase()}`);
      if (brand) kwParts.push(`repuestos ${brand.toLowerCase()}`);
      if (model) kwParts.push(model.toLowerCase());
      if (year) kwParts.push(year);
      seoKeywords = kwParts.join(', ');
    }

    document.title = seoTitle ? `${seoTitle} | ${config.site_nombre}` : defaultTitle;
    
    const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    setMeta('description', seoDesc || defaultDesc);
    setMeta('keywords', seoKeywords);
    setMeta('og:title', seoTitle || defaultTitle, 'property');
    setMeta('og:description', seoDesc || defaultDesc, 'property');
    if (type === 'product' && product) {
      setMeta('og:type', 'product', 'property');
      setMeta('og:image', product.imagen_urls[0], 'property');
    } else {
      setMeta('og:type', 'website', 'property');
      setMeta('og:image', 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=1200', 'property');
    }

    // Dynamic Manifest injection for PWA Standalone behavior
    const manifestObj = {
      name: config.site_nombre,
      short_name: config.site_nombre,
      start_url: "/",
      display: "standalone",
      background_color: config.theme_color || "#ffffff",
      theme_color: config.theme_color || "#3b82f6",
      icons: [
        {
          src: config.logo_url || config.favicon_url || "https://vitejs.dev/logo.svg",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable"
        },
        {
          src: config.logo_url || config.favicon_url || "https://vitejs.dev/logo.svg",
          sizes: "512x512",
          type: "image/png"
        }
      ]
    };
    
    const manifestBlob = new Blob([JSON.stringify(manifestObj)], { type: 'application/json' });
    const manifestUrl = URL.createObjectURL(manifestBlob);

    let manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.setAttribute('rel', 'manifest');
      document.head.appendChild(manifestLink);
    }
    manifestLink.setAttribute('href', manifestUrl);

    // Favicon injection
    if (config.favicon_url || config.logo_url) {
      let iconLink = document.querySelector('link[rel="icon"]');
      if (!iconLink) {
        iconLink = document.createElement('link');
        iconLink.setAttribute('rel', 'icon');
        document.head.appendChild(iconLink);
      }
      iconLink.setAttribute('href', config.favicon_url || config.logo_url || '/favicon.ico');
    }
    
    // Theme color meta
    let themeMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeMeta) {
      themeMeta = document.createElement('meta');
      themeMeta.setAttribute('name', 'theme-color');
      document.head.appendChild(themeMeta);
    }
    themeMeta.setAttribute('content', config.theme_color || '#3b82f6');

    // 2. Generate and Inject JSON-LD Schema
    const existingScript = document.getElementById('trv-jsonld-schema');
    if (existingScript) {
      existingScript.remove();
    }

    let schemaObj: any = null;

    if (type === 'home') {
      schemaObj = {
        '@context': 'https://schema.org',
        '@type': 'AutoPartsStore',
        'name': 'TuRepuestoValencia',
        'image': 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=1200',
        '@id': 'https://turepuestovalencia.com',
        'url': 'https://turepuestovalencia.com',
        'telephone': '+584124976451',
        'priceRange': '$$',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': 'Calle 140 con Av. Bolívar Norte, Sector Las Acacias',
          'addressLocality': 'Valencia',
          'addressRegion': 'Carabobo',
          'postalCode': '2001',
          'addressCountry': 'VE'
        },
        'areaServed': [
          { '@type': 'City', 'name': 'Valencia' },
          { '@type': 'City', 'name': 'Naguanagua' },
          { '@type': 'City', 'name': 'San Diego' }
        ],
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': 10.198300,
          'longitude': -68.004400
        },
        'openingHoursSpecification': {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': [
            'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
          ],
          'opens': '08:00',
          'closes': '17:30'
        },
        'description': 'La mejor opción para comprar repuestos Chevrolet a domicilio en Valencia.'
      };
    } else if (type === 'product' && product) {
      schemaObj = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': product.nombre,
        'image': product.imagen_urls[0],
        'description': seoDesc,
        'sku': product.codigo,
        'mpn': product.codigo,
        'brand': {
          '@type': 'Brand',
          'name': product.marca_repuesto
        },
        'offers': {
          '@type': 'Offer',
          'url': `https://turepuestovalencia.com/catalog?search=${product.codigo}`,
          'priceCurrency': 'USD',
          'price': product.precio_usd.toFixed(2),
          'itemCondition': product.condicion === 'Nuevo' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
          'availability': product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          'areaServed': ['Valencia', 'Naguanagua', 'San Diego'],
          'seller': {
            '@type': 'AutoPartsStore',
            'name': 'TuRepuestoValencia'
          }
        },
        'category': product.categoria
      };
    } else if (type === 'catalog') {
      schemaObj = {
        '@context': 'https://schema.org',
        '@type': 'SearchResultsPage',
        'name': 'Catálogo Inteligente de Repuestos | TuRepuestoValencia',
        'description': 'Filtrado inteligente por año, marca y modelo para repuestos premium en Valencia, Venezuela.'
      };
    }

    if (schemaObj) {
      const script = document.createElement('script');
      script.id = 'trv-jsonld-schema';
      script.type = 'application/ld+json';
      script.innerHTML = JSON.stringify(schemaObj);
      document.head.appendChild(script);
    }
  }, [title, description, type, product, filters]);

  return null; // Side-effect only component
};
