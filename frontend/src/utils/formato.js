export const formatoMoneda = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
});

export function formatearPrecio(n) {
  return formatoMoneda.format(n || 0);
}

export const IMAGEN_PLACEHOLDER =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80';
