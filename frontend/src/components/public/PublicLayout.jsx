import { useEffect, useState } from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { Loader2, Store } from 'lucide-react';
import { apiFetch } from '../../api';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';
import { WhatsAppFloat } from './WhatsAppFloat';
import { CarritoProvider } from '../../context/CarritoContext';
import { CarritoDrawer } from './CarritoDrawer';
import { BandejaCarrito } from './BandejaCarrito';

export function PublicLayout() {
  const { empresaId } = useParams();
  const [tienda, setTienda] = useState(null);
  const [footer, setFooter] = useState({});
  const [contacto, setContacto] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!empresaId) return;
    let activo = true;
    Promise.all([
      apiFetch(`/api/tienda/${empresaId}`),
      apiFetch(`/api/tienda/${empresaId}/contenido/footer`),
      apiFetch(`/api/tienda/${empresaId}/contenido/contactanos`),
    ])
      .then(([info, contenidoFooter, contenidoContacto]) => {
        if (!activo) return;
        setTienda(info);
        setFooter(contenidoFooter?.contenido || {});
        setContacto(contenidoContacto?.contenido || {});
      })
      .catch((e) => { if (activo) setError(e.message); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [empresaId]);

  if (cargando && empresaId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7faf9]">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  if (error && !tienda) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7faf9] p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md">
          <Store className="mx-auto text-slate-300 mb-4" size={48} />
          <h2 className="text-xl font-black text-slate-900 mb-2">Tienda no disponible</h2>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!tienda) {
    return <Navigate to="/" replace />;
  }

  const contexto = { tienda, footer, contacto };
  const color = tienda?.colorPrimario || '#2563eb';

  return (
    <div className="min-h-screen bg-[#f7faf9] text-[#172033] font-sans" style={{ '--color-tienda': color }}>
      <CarritoProvider empresaId={empresaId} tienda={tienda}>
        <PublicNavbar tienda={tienda} />
        <main>
          <Outlet context={{ ...contexto, color }} />
        </main>
        <PublicFooter tienda={tienda} contenido={footer} />
        <WhatsAppFloat whatsapp={contacto.whatsapp} mensaje={contacto.whatsapp_mensaje} />
        <BandejaCarrito />
        <CarritoDrawer />
      </CarritoProvider>
    </div>
  );
}
