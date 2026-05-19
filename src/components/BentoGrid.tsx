import React from 'react';
import { ShieldCheck, Truck, Clock, Sparkles, Award, History, Check } from 'lucide-react';

export const BentoGrid: React.FC = () => {
  return (
    <div id="quienes-somos" className="my-10 px-1 scroll-mt-20">
      {/* Dynamic Header targeting Valencia mechanics positioning */}
      <div className="flex flex-col mb-6">
        <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-blue-600 mb-1 flex items-center gap-1.5">
          <Sparkles size={11} /> Concesionarios e Inteligencia
        </span>
        <h3 className="text-lg font-bold font-display text-zinc-900 leading-tight">Especialistas Certificados en Carabobo</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-md">Descubre por qué somos el buscador de repuestos preferido en Valencia, San Diego y Naguanagua, por encima de listados genéricos.</p>
      </div>

      {/* Flexible Bento Grid layout without rigid line heights that clip texts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        
        {/* Card 1: Main Story (Trayectoria) */}
        <div className="md:col-span-2 md:row-span-2 p-5 rounded-2xl border border-zinc-200 bg-gradient-to-br from-white via-zinc-50/30 to-zinc-50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative group min-h-[220px]">
          <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 text-blue-600/[0.03] text-9xl font-display font-extrabold select-none transition-transform duration-500 group-hover:scale-105">
            TRV
          </div>
          <div className="z-10">
            <span className="bg-blue-50 border border-blue-100 text-blue-600 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider inline-flex items-center gap-1.5 mb-3">
              <History size={11} /> Trayectoria Confiable
            </span>
            <h4 className="text-base font-bold font-display text-zinc-950 leading-snug">Líderes de Autopartes en Valencia desde 2014</h4>
            <p className="text-xs text-zinc-600 mt-2.5 leading-relaxed max-w-md">
              Nacimos en el estado Carabobo con el propósito de erradicar los repuestos defectuosos. Facilitamos piezas originales y certificadas con un catálogo inteligente cruzado por año, marca y modelo para que tu coche rinda de forma impecable desde el primer encendido.
            </p>
          </div>
          <div className="z-10 flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-4">
            <span>📍 Av. Bolívar Norte, Valencia</span>
            <span className="text-blue-600">•</span>
            <span>Establecimiento Físico y Delivery Express</span>
          </div>
        </div>

        {/* Card 2: Delivery Speed */}
        <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/40 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between gap-3 min-h-[140px] group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-blue-600 font-mono uppercase tracking-wider font-bold">Logística Veloz</span>
            <Truck size={18} className="text-blue-600" />
          </div>
          <div>
            <h5 className="text-xs font-bold font-display text-zinc-900 leading-tight">Envíos a Domicilio</h5>
            <p className="text-[11px] text-zinc-500 leading-snug mt-1 font-sans">
              Envío rápido directo a tu taller en Valencia, San Diego y Naguanagua. Despachamos para evitar esperas largas.
            </p>
          </div>
        </div>

        {/* Card 3: Quality Guarantee */}
        <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/40 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between gap-3 min-h-[140px] group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-blue-600 font-mono uppercase tracking-wider font-bold">Confianza Total</span>
            <ShieldCheck size={18} className="text-blue-700 font-semibold" />
          </div>
          <div>
            <h5 className="text-xs font-bold font-display text-zinc-900 leading-tight">Repuestos Certificados</h5>
            <p className="text-[11px] text-zinc-500 leading-snug mt-1 font-sans">
              Cada repuesto es verificado para asegurar la máxima protección de tu inversión y el rendimiento de tu vehículo.
            </p>
          </div>
        </div>

        {/* Card 4: Precision Fit */}
        <div className="md:col-span-2 p-4 rounded-xl border border-zinc-200 bg-zinc-50/40 hover:bg-white hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <span className="text-[10px] text-blue-600 font-mono uppercase tracking-wider font-bold flex items-center gap-1">
              <Clock size={11} /> Filtro de Precisión Mecánica
            </span>
            <h5 className="text-xs font-bold font-display text-zinc-900 leading-tight">Soporte de Compatibilidad</h5>
            <p className="text-[11px] text-zinc-500 mt-1 max-w-sm font-sans leading-relaxed">
              Nuestro buscador de repuestos asocia de inmediato la pieza con el rango de año de tu carro para evitar devoluciones innecesarias.
            </p>
          </div>
          <div className="p-2 sm:px-3.5 border border-blue-100 bg-blue-100/30 rounded-lg text-center shrink-0 w-full sm:w-auto">
            <div className="text-xs font-bold font-mono text-blue-750 text-blue-700">0% Errores</div>
            <div className="text-[9px] text-zinc-500 font-mono font-semibold">De Modelación</div>
          </div>
        </div>

        {/* Card 5: Certified Brands */}
        <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/40 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between gap-3 min-h-[140px] group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-blue-700 font-mono uppercase tracking-wider font-bold flex items-center gap-1">
              <Award size={12} /> Fabricación
            </span>
            <Check size={14} className="text-blue-600" />
          </div>
          <div>
            <h5 className="text-xs font-bold font-display text-zinc-900 leading-tight">Marcas Oficiales OEM</h5>
            <p className="text-[11px] text-zinc-500 leading-snug mt-1 font-sans">
              Originales ACDelco, Denso, Motorcraft, KYB y Mopar genuinos procedentes directo de fábricas autorizadas.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
