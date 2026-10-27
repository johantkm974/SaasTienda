import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function BannerCarousel({ banners }) {
  const [current, setCurrent] = useState(0);
  const [pausado, setPausado] = useState(false);
  const touchX = useRef(null);

  useEffect(() => {
    if (pausado || banners.length <= 1) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 4500);
    return () => clearInterval(t);
  }, [pausado, banners.length]);

  if (!banners.length) return null;

  const irA = (i) => setCurrent((i + banners.length) % banners.length);

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onTouchStart={(e) => { touchX.current = e.changedTouches[0].screenX; setPausado(true); }}
      onTouchEnd={(e) => {
        const diff = touchX.current - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) irA(diff > 0 ? current + 1 : current - 1);
        setPausado(false);
      }}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((b) => (
          <div
            key={b.id}
            className="min-w-full h-full bg-cover bg-center relative"
            style={{ backgroundImage: `url(${b.imagenUrl || ''})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#13201d]/85 via-[#13201d]/40 to-transparent flex items-center px-[8%]">
              <div className="max-w-[500px] text-white">
                {b.titulo && (
                  <span className="inline-block mb-3 px-3.5 py-1.5 rounded-full bg-[#0e9f6e] text-white text-xs font-extrabold uppercase tracking-wider">
                    {b.titulo}
                  </span>
                )}
                {b.subtitulo && <h1 className="text-4xl md:text-5xl font-black leading-tight mb-3">{b.subtitulo}</h1>}
                {b.descripcion && <p className="text-white/85 mb-6 text-base md:text-lg">{b.descripcion}</p>}
                {b.enlace && (
                  <a
                    href={b.enlace}
                    className="inline-flex items-center justify-center min-h-[46px] px-7 rounded-xl bg-[#f5b84b] text-[#13201d] font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-transform"
                  >
                    Ver mas
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={() => irA(current - 1)}
            aria-label="Anterior"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 text-[#13201d] shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => irA(current + 1)}
            aria-label="Siguiente"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 text-[#13201d] shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((b, i) => (
              <button
                key={b.id}
                onClick={() => irA(i)}
                aria-label={`Slide ${i + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === current ? 'bg-[#f5b84b] scale-125' : 'bg-white/45'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
