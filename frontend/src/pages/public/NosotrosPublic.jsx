import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Trophy, Wallet, Rocket, HeartHandshake, UserRound, Users, Wrench } from 'lucide-react';
import { apiFetch } from '../../api';

const VALORES_DIFERENTES = [
  { icono: Trophy, titulo: 'Calidad Garantizada', texto: 'Solo trabajamos con distribuidores oficiales y fabricantes reconocidos.' },
  { icono: Wallet, titulo: 'Mejores Precios', texto: 'Ofrecemos precios competitivos sin sacrificar la calidad del producto.' },
  { icono: Rocket, titulo: 'Entrega Rápida', texto: 'Logística eficiente para que recibas tus productos lo antes posible.' },
  { icono: HeartHandshake, titulo: 'Atención Personalizada', texto: 'Nuestro equipo de expertos está listo para asesorarte.' },
];

const EQUIPO = [
  { icono: UserRound, titulo: 'Dirección General', texto: 'Liderazgo estratégico con más de 15 años de experiencia en el sector tecnológico.' },
  { icono: Users, titulo: 'Equipo de Ventas', texto: 'Profesionales capacitados para brindarte la mejor asesoría en tu compra.' },
  { icono: Wrench, titulo: 'Soporte Técnico', texto: 'Expertos en tecnología listos para resolver tus dudas y problemas.' },
];

export function NosotrosPublic() {
  const { tienda } = useOutletContext();
  const { id: empresaId } = tienda;
  const [contenido, setContenido] = useState({});

  useEffect(() => {
    let activo = true;
    apiFetch(`/api/tienda/${empresaId}/contenido/nosotros`)
      .then((data) => { if (activo) setContenido(data.contenido || {}); })
      .catch(() => {});
    return () => { activo = false; };
  }, [empresaId]);

  const c = contenido;

  return (
    <>
      <section className="bg-gradient-to-br from-[#13201d] to-[#1a3a2f] py-20 px-6 text-center text-white">
        <div className="max-w-[800px] mx-auto">
          <h1 className="text-4xl md:text-5xl font-black mb-4">{c.titulo || 'Sobre Nosotros'}</h1>
          <p className="text-white/80 text-lg leading-relaxed">
            {c.subtitulo ||
              'Somos una empresa peruana dedicada a la venta de componentes electrónicos y tecnológicos de alta calidad. Desde nuestros inicios, nos hemos comprometido a ofrecer los mejores productos al mejor precio, con un servicio al cliente excepcional.'}
          </p>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-12">
        <div className="text-center mb-4">
          <h2 className="text-3xl md:text-4xl font-black text-[#13201d]">{c.seccion_historia_titulo || 'Nuestra Historia'}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="p-7 border border-[#d9e2df] rounded-xl bg-white text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#e9f1ff] text-[#2563eb] text-3xl flex items-center justify-center">🎯</div>
            <h3 className="text-xl font-bold text-[#13201d] mb-2">Misión</h3>
            <p className="text-[#667085] leading-relaxed">
              {c.mision ||
                'Proveer componentes electrónicos de última generación a precios competitivos, brindando asesoría personalizada y garantizando la satisfacción de nuestros clientes en cada compra.'}
            </p>
          </div>
          <div className="p-7 border border-[#d9e2df] rounded-xl bg-white text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#e9f1ff] text-[#2563eb] text-3xl flex items-center justify-center">👁️</div>
            <h3 className="text-xl font-bold text-[#13201d] mb-2">Visión</h3>
            <p className="text-[#667085] leading-relaxed">
              {c.vision ||
                'Ser la tienda de referencia en tecnología y componentes electrónicos en Perú, reconocida por nuestra calidad, innovación y compromiso con el cliente.'}
            </p>
          </div>
          <div className="p-7 border border-[#d9e2df] rounded-xl bg-white text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#e9f1ff] text-[#2563eb] text-3xl flex items-center justify-center">⭐</div>
            <h3 className="text-xl font-bold text-[#13201d] mb-2">{c.valores_titulo || 'Valores'}</h3>
            <p className="text-[#667085] leading-relaxed">
              {c.valores_texto ||
                'Integridad, excelencia, innovación y compromiso. Estos son los pilares que guían cada una de nuestras acciones y decisiones.'}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#f0fdf4] py-14 px-6 md:px-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-black text-[#13201d] mb-2">¿Por qué somos diferentes?</h2>
            <p className="text-[#667085]">Descubre lo que nos hace únicos en el mercado</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
            {VALORES_DIFERENTES.map(({ icono: Icono, titulo, texto }) => (
              <div key={titulo} className="bg-white rounded-2xl p-8 text-center shadow-sm hover:-translate-y-1.5 hover:shadow-lg transition-all">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#e9f1ff] text-[#2563eb] text-3xl flex items-center justify-center">
                  <Icono size={28} />
                </div>
                <h4 className="text-lg font-bold text-[#13201d] mb-2">{titulo}</h4>
                <p className="text-[#667085] text-sm leading-relaxed">{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-black text-[#13201d] mb-2">Nuestro Equipo</h2>
          <p className="text-[#667085]">Profesionales comprometidos con tu satisfacción</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {EQUIPO.map(({ icono: Icono, titulo, texto }) => (
            <div key={titulo} className="p-7 border border-[#d9e2df] rounded-xl bg-white text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#e9f1ff] text-[#2563eb] flex items-center justify-center">
                <Icono size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#13201d] mb-2">{titulo}</h3>
              <p className="text-[#667085] leading-relaxed">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#13201d] py-12 px-6 text-center text-white">
        <h2 className="text-2xl md:text-3xl font-black mb-3">¿Quieres conocernos más?</h2>
        <p className="text-white/70 mb-6">Estamos aquí para responder todas tus preguntas</p>
        <Link
          to={`/t/${empresaId}/contactanos`}
          className="inline-flex items-center justify-center min-h-[46px] px-8 rounded-xl bg-[#f5b84b] text-[#13201d] font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-transform"
        >
          Contáctanos
        </Link>
      </section>
    </>
  );
}
