import { useEffect, useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle, Loader2 } from 'lucide-react';
import { apiFetch } from '../../api';

export function ContactanosPublic() {
  const { tienda } = useOutletContext();
  const { id: empresaId } = tienda;
  const [contenido, setContenido] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [toast, setToast] = useState('');
  const formRef = useRef(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    let activo = true;
    apiFetch(`/api/tienda/${empresaId}/contenido/contactanos`)
      .then((data) => { if (activo) setContenido(data.contenido || {}); })
      .catch(() => {});
    return () => { activo = false; };
  }, [empresaId]);

  function mostrarToast(mensaje) {
    setToast(mensaje);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 3000);
  }

  function enviarMensaje(e) {
    e.preventDefault();
    setEnviando(true);
    setTimeout(() => {
      mostrarToast('Mensaje enviado correctamente. Te contactaremos pronto.');
      formRef.current?.reset();
      setEnviando(false);
    }, 1500);
  }

  const c = contenido;
  const whatsappLink = c.whatsapp
    ? `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(c.whatsapp_mensaje || 'Hola, quiero informacion de un producto')}`
    : '#';
  const redes = [
    { nombre: 'Facebook', href: c.facebook },
    { nombre: 'TikTok', href: c.tiktok },
    { nombre: 'Instagram', href: c.instagram },
    { nombre: 'WhatsApp', href: whatsappLink, color: '#25d366' },
  ];

  return (
    <>
      <section className="bg-gradient-to-br from-[#13201d] to-[#1a3a2f] py-20 px-6 text-center text-white">
        <div className="max-w-[800px] mx-auto">
          <h1 className="text-4xl md:text-5xl font-black mb-4">{c.titulo || 'Contáctanos'}</h1>
          <p className="text-white/80 text-lg leading-relaxed">
            {c.subtitulo || '¿Tienes alguna pregunta o necesitas asesoría? Estamos aquí para ayudarte. Escríbenos o llámanos y te responderemos lo antes posible.'}
          </p>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-12">
        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          <div className="space-y-5">
            <div className="flex items-start gap-4 p-5 border border-[#d9e2df] rounded-xl bg-white">
              <div className="w-12 h-12 min-w-12 rounded-xl bg-[#e9f1ff] text-[#2563eb] flex items-center justify-center">
                <Phone size={20} />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#13201d] mb-1">Teléfono</h4>
                <p className="text-[#667085] text-sm">{c.telefono || '+51 999 888 777'}</p>
                <p className="text-[#667085] text-xs mt-0.5">Lun - Vie: 9:00 AM - 6:00 PM</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 border border-[#d9e2df] rounded-xl bg-white">
              <div className="w-12 h-12 min-w-12 rounded-xl bg-[#e9f1ff] text-[#2563eb] flex items-center justify-center">
                <Mail size={20} />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#13201d] mb-1">Correo Electrónico</h4>
                <p className="text-[#667085] text-sm">{c.correo || 'ventas@svelectronicos.com'}</p>
                <p className="text-[#667085] text-xs mt-0.5">Respuesta en menos de 24 horas</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 border border-[#d9e2df] rounded-xl bg-white">
              <div className="w-12 h-12 min-w-12 rounded-xl bg-[#e9f1ff] text-[#2563eb] flex items-center justify-center">
                <MapPin size={20} />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#13201d] mb-1">Ubicación</h4>
                <p className="text-[#667085] text-sm">{c.direccion || 'Av. Tecnológica 1234, San Isidro'}</p>
                <p className="text-[#667085] text-xs mt-0.5">Lima, Perú</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 border border-[#d9e2df] rounded-xl bg-white">
              <div className="w-12 h-12 min-w-12 rounded-xl bg-[#e9f1ff] text-[#2563eb] flex items-center justify-center">
                <MessageCircle size={20} />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#13201d] mb-1">Redes Sociales</h4>
                <div className="flex gap-3 flex-wrap mt-1">
                  {redes
                    .filter((r) => r.href && r.href !== '#')
                    .map((r) => (
                      <a key={r.nombre} href={r.href} target="_blank" rel="noreferrer" style={{ color: r.color || '#2563eb' }} className="text-sm font-bold">
                        {r.nombre}
                      </a>
                    ))}
                </div>
                <p className="text-[#667085] text-xs mt-1">Síguenos para ofertas y novedades</p>
              </div>
            </div>
          </div>

          <div className="p-7 border border-[#d9e2df] rounded-xl bg-white h-max">
            <h3 className="text-xl font-black text-[#13201d] mb-1">Envíanos un mensaje</h3>
            <p className="text-[#667085] text-sm mb-6">Completa el formulario y te contactaremos pronto</p>
            <form ref={formRef} onSubmit={enviarMensaje} className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="grid gap-1.5 text-[#667085] text-xs font-extrabold">
                  Nombres
                  <input name="nombres" type="text" required placeholder="Juan" className="w-full min-h-[42px] border border-[#d9e2df] rounded-lg px-3 py-2.5 bg-white text-[#172033] text-sm focus:outline-none focus:ring-2" />
                </label>
                <label className="grid gap-1.5 text-[#667085] text-xs font-extrabold">
                  Apellidos
                  <input name="apellidos" type="text" required placeholder="Pérez" className="w-full min-h-[42px] border border-[#d9e2df] rounded-lg px-3 py-2.5 bg-white text-[#172033] text-sm focus:outline-none focus:ring-2" />
                </label>
              </div>
              <label className="grid gap-1.5 text-[#667085] text-xs font-extrabold">
                Correo Electrónico
                <input name="correo" type="email" required placeholder="juan@ejemplo.com" className="w-full min-h-[42px] border border-[#d9e2df] rounded-lg px-3 py-2.5 bg-white text-[#172033] text-sm focus:outline-none focus:ring-2" />
              </label>
              <label className="grid gap-1.5 text-[#667085] text-xs font-extrabold">
                Teléfono
                <input name="telefono" type="tel" placeholder="+51 999 888 777" className="w-full min-h-[42px] border border-[#d9e2df] rounded-lg px-3 py-2.5 bg-white text-[#172033] text-sm focus:outline-none focus:ring-2" />
              </label>
              <label className="grid gap-1.5 text-[#667085] text-xs font-extrabold">
                Asunto
                <select name="asunto" required className="w-full min-h-[42px] border border-[#d9e2df] rounded-lg px-3 py-2.5 bg-white text-[#172033] text-sm focus:outline-none focus:ring-2">
                  <option value="">Selecciona un asunto</option>
                  <option value="consulta">Consulta general</option>
                  <option value="pedido">Estado de pedido</option>
                  <option value="garantia">Garantía / Devolución</option>
                  <option value="soporte">Soporte técnico</option>
                  <option value="otro">Otro</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-[#667085] text-xs font-extrabold">
                Mensaje
                <textarea name="mensaje" rows={5} required placeholder="Escribe tu mensaje aquí..." className="w-full min-h-[120px] border border-[#d9e2df] rounded-lg px-3 py-2.5 bg-white text-[#172033] text-sm focus:outline-none focus:ring-2 resize-y" />
              </label>
              <button
                type="submit"
                disabled={enviando}
                className="w-full inline-flex items-center justify-center gap-2 min-h-[46px] rounded-xl text-white font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-transform disabled:opacity-60"
                style={{ backgroundColor: tienda.colorPrimario || '#2563eb' }}
              >
                {enviando && <Loader2 size={16} className="animate-spin" />}
                {enviando ? 'Enviando...' : 'Enviar Mensaje'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="bg-[#f0fdf4] py-12 px-6 text-center">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-[#13201d] mb-3">¿Prefieres comprar directamente?</h2>
          <p className="text-[#667085] mb-6">Visita nuestra tienda online y descubre todos nuestros productos</p>
          <Link
            to={`/t/${empresaId}/productos`}
            className="inline-flex items-center justify-center min-h-[46px] px-8 rounded-xl text-white font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-transform"
            style={{ backgroundColor: tienda.colorPrimario || '#2563eb' }}
          >
            Ir a la Tienda
          </Link>
        </div>
      </section>

      {toast && (
        <div className="fixed right-6 bottom-6 z-50 max-w-[360px] px-4 py-3.5 rounded-xl bg-[#13201d] text-white shadow-2xl">
          {toast}
        </div>
      )}
    </>
  );
}
