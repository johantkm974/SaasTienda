export function WhatsAppFloat({ whatsapp, mensaje }) {
  if (!whatsapp) return null;
  const texto = encodeURIComponent(mensaje || 'Hola, quiero informacion de un producto');
  return (
    <a
      href={`https://wa.me/${whatsapp}?text=${texto}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-[#25d366] shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
    >
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 fill-white">
        <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.132 6.744 3.058 9.374L1.054 31.29l6.118-1.98C9.78 31.036 12.81 32 16.004 32 24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.318 22.6c-.39 1.1-1.932 2.014-3.16 2.27-.84.18-1.936.322-5.626-1.21-4.724-1.96-7.762-6.79-8-7.1-.23-.31-1.896-2.524-1.896-4.814 0-2.29 1.2-3.416 1.628-3.874.39-.42.936-.55 1.246-.55.31 0 .62.003.89.016.286.01.67-.108 1.05.802.39.936 1.33 3.24 1.446 3.476.116.236.194.51.04.82-.15.31-.28.45-.52.73-.236.28-.45.5-.68.79-.21.27-.43.55-.18.97.25.41 1.1 1.82 2.37 2.95 1.63 1.46 3.01 1.91 3.43 2.13.31.16.67.12.87-.14.26-.33.58-.87.9-1.39.23-.37.51-.31.85-.19.35.11 2.19 1.03 2.56 1.22.37.18.62.27.71.42.1.14.1.83-.29 1.93z" />
      </svg>
    </a>
  );
}
