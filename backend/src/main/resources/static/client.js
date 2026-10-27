/* Banner Carousel */
const bannerState = {
  current: 0,
  total: 0,
  autoPlayInterval: null,
  autoPlayDelay: 4500
};

function initBanner() {
  const track = document.querySelector('.banner-track');
  if (!track) return;
  loadBanners();
}

async function loadBanners() {
  try {
    const response = await fetch('/api/contenido/banners?pagina=home');
    if (!response.ok) throw new Error('Error al cargar banners');
    const banners = await response.json();
    
    if (!banners || banners.length === 0) return;
    
    const track = document.getElementById('bannerTrack');
    const dotsContainer = document.getElementById('bannerDots');
    
    track.innerHTML = banners.map(banner => `
      <div class="banner-slide" style="background-image: url('${banner.imagenUrl || ''}')">
        <div class="banner-overlay">
          <div class="banner-content">
            <span class="eyebrow">${banner.titulo || ''}</span>
            <h1>${banner.subtitulo || ''}</h1>
            <p>${banner.descripcion || ''}</p>
            ${banner.enlace ? `<a href="${banner.enlace}" class="primary-btn">Ver mas</a>` : ''}
          </div>
        </div>
      </div>
    `).join('');
    
    dotsContainer.innerHTML = banners.map((_, i) => `
      <button class="banner-dot${i === 0 ? ' active' : ''}" onclick="goToBanner(${i})" aria-label="Slide ${i + 1}"></button>
    `).join('');
    
    bannerState.total = banners.length;
    bannerState.current = 0;
    
    startAutoPlay();
    
    const carousel = document.querySelector('.banner-carousel');
    if (carousel) {
      carousel.addEventListener('mouseenter', stopAutoPlay);
      carousel.addEventListener('mouseleave', startAutoPlay);
      
      let touchStartX = 0;
      carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoPlay();
      }, { passive: true });
      
      carousel.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) nextBanner();
          else prevBanner();
        }
        startAutoPlay();
      }, { passive: true });
    }
  } catch (error) {
    console.error('Error cargando banners:', error);
  }
}

function goToBanner(index) {
  if (index < 0 || index >= bannerState.total) return;
  
  bannerState.current = index;
  
  const track = document.querySelector('.banner-track');
  if (track) {
    track.style.transform = `translateX(-${index * 100}%)`;
  }
  
  document.querySelectorAll('.banner-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

function nextBanner() {
  if (bannerState.total === 0) return;
  const next = (bannerState.current + 1) % bannerState.total;
  goToBanner(next);
}

function prevBanner() {
  if (bannerState.total === 0) return;
  const prev = (bannerState.current - 1 + bannerState.total) % bannerState.total;
  goToBanner(prev);
}

function startAutoPlay() {
  stopAutoPlay();
  if (bannerState.total > 0) {
    bannerState.autoPlayInterval = setInterval(nextBanner, bannerState.autoPlayDelay);
  }
}

function stopAutoPlay() {
  if (bannerState.autoPlayInterval) {
    clearInterval(bannerState.autoPlayInterval);
    bannerState.autoPlayInterval = null;
  }
}

/* Categories */
async function loadCategories() {
  const grid = document.getElementById('categoryGrid');
  if (!grid) return;
  
  try {
    const response = await fetch('/api/categorias/activas');
    if (!response.ok) throw new Error('Error al cargar categorias');
    const categorias = await response.json();
    
    if (!categorias || categorias.length === 0) {
      grid.innerHTML = '<div class="empty-panel">No hay categorias disponibles</div>';
      return;
    }
    
    grid.innerHTML = categorias.map(cat => `
      <a href="productos.html?category=${encodeURIComponent(cat.nombre)}" class="category-card">
        ${cat.imagenUrl ? `<img src="${cat.imagenUrl}" alt="${cat.nombre}">` : ''}
        <div class="card-label">${cat.nombre.toUpperCase()} &rarr;</div>
      </a>
    `).join('') + `
      <a href="productos.html" class="category-card category-more">
        <div class="card-label">VER MAS &rarr;</div>
      </a>
    `;
  } catch (error) {
    grid.innerHTML = '<div class="empty-panel">No se pudieron cargar las categorias</div>';
    console.error('Error cargando categorias:', error);
  }
}

/* Products */
async function loadProducts() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  
  try {
    const response = await fetch('/api/tienda/productos-comprados');
    if (!response.ok) throw new Error(`Error ${response.status}`);
    
    const products = await response.json();
    renderProducts(products);
  } catch (error) {
    grid.innerHTML = '<div class="empty-panel">No se pudieron cargar los productos</div>';
    console.error(error);
  }
}

function renderProducts(products) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  
  if (!products.length) {
    grid.innerHTML = '<div class="empty-panel">No hay productos disponibles</div>';
    return;
  }
  
  const currency = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  });
  
  grid.innerHTML = products.map(product => `
    <article class="product-card">
      <img src="${product.imagen || fallbackImage()}" alt="${product.nombre}">
      <div class="product-body">
        <div class="product-meta">
          <span class="badge">${product.categoria?.nombre || product.categoria || 'Catálogo'}</span>
          <span class="stock">${product.stock} en stock</span>
        </div>
        <h3>${product.nombre}</h3>
        <p>${product.descripcion || 'Producto disponible para compra online.'}</p>
        <div class="product-footer">
          <span class="price">${currency.format(product.precio || 0)}</span>
          <button type="button" class="primary-btn" onclick="comprarAhora(${product.idProducto}, '${product.categoria?.nombre || product.categoria || ''}')">Comprar</button>
        </div>
      </div>
    </article>
  `).join('');
}

function fallbackImage() {
  return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80';
}

/* Contact Form */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Simulate form submission
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Enviando...';
    btn.disabled = true;
    
    setTimeout(() => {
      toast('Mensaje enviado correctamente. Te contactaremos pronto.');
      form.reset();
      btn.textContent = originalText;
      btn.disabled = false;
    }, 1500);
  });
}

/* Toast */
function toast(message) {
  const toastElement = document.getElementById('toast');
  if (!toastElement) return;
  
  toastElement.textContent = message;
  toastElement.classList.add('show');
  window.clearTimeout(toastElement.timer);
  toastElement.timer = window.setTimeout(() => toastElement.classList.remove('show'), 3000);
}

/* Comprar ahora */
function comprarAhora(idProducto, categoria) {
  localStorage.setItem('pendingProduct', String(idProducto));
  if (categoria) {
    localStorage.setItem('pendingCategory', categoria);
  }
  window.location.href = 'tienda.html';
}

/* Init */
document.addEventListener('DOMContentLoaded', () => {
  initBanner();
  loadCategories();
  loadProducts();
  initContactForm();
});
