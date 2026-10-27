document.addEventListener('DOMContentLoaded', async function() {
  try {
    const res = await fetch('/api/contenido/footer');
    if (!res.ok) return;
    const c = await res.json();
    if (c.marca_texto) {
      const el = document.getElementById('footerMarcaTexto');
      if (el) el.textContent = c.marca_texto;
    }
    if (c.telefono) {
      const el = document.getElementById('footerTelefono');
      if (el) { el.textContent = c.telefono; el.href = 'tel:' + c.telefono.replace(/\s/g, ''); }
    }
    if (c.correo) {
      const el = document.getElementById('footerCorreo');
      if (el) { el.textContent = c.correo; el.href = 'mailto:' + c.correo; }
    }
    if (c.direccion) {
      const el = document.getElementById('footerDireccion');
      if (el) el.textContent = c.direccion;
    }
    if (c.facebook) {
      const el = document.getElementById('footerFacebook');
      if (el) el.href = c.facebook;
    }
    if (c.tiktok) {
      const el = document.getElementById('footerTiktok');
      if (el) el.href = c.tiktok;
    }
    if (c.instagram) {
      const el = document.getElementById('footerInstagram');
      if (el) el.href = c.instagram;
    }
  } catch(e) { console.error('Error loading footer:', e); }
});
