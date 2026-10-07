/* ==========================================================================
   NAPOLEON CAFÉ & PÂTISSERIE (KANASH)
   Interactive JavaScript Architecture
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initWorkingHours();
  initHeaderScroll();
  initMobileNav();
  initVitrineFilters();
  initCakeConfigurator();
  initGalleryLightbox();
  initOrderModals();
  initScrollAnimations();
});

/* --------------------------------------------------------------------------
   1. Live Working Hours Status Indicator
   Hours: Daily 10:00 – 19:00 (Kanash / MSK)
   -------------------------------------------------------------------------- */
function initWorkingHours() {
  const indicators = document.querySelectorAll('.top-status-indicator');
  if (!indicators.length) return;

  function updateStatus() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours + minutes / 60;

    // 10:00 to 19:00
    const isOpen = currentTime >= 10.0 && currentTime < 19.0;

    indicators.forEach(indicator => {
      const dot = indicator.querySelector('.pulse-dot');
      const text = indicator.querySelector('.status-text');

      if (!dot || !text) return;

      if (isOpen) {
        dot.classList.remove('closed');
        text.textContent = 'Сейчас открыто • до 19:00';
      } else {
        dot.classList.add('closed');
        if (currentTime < 10) {
          text.textContent = 'Откроется сегодня в 10:00';
        } else {
          text.textContent = 'Закрыто • откроется в 10:00';
        }
      }
    });
  }

  updateStatus();
  setInterval(updateStatus, 60000);
}

/* --------------------------------------------------------------------------
   2. Sticky Header Transition
   -------------------------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  function onScroll() {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* --------------------------------------------------------------------------
   3. Mobile Navigation Drawer
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const header = document.querySelector('.site-header');
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!toggleBtn || !navMenu || !header) return;

  function updateMenuPosition() {
    if (navMenu.classList.contains('open')) {
      const headerRect = header.getBoundingClientRect();
      const topOffset = Math.max(0, Math.round(headerRect.bottom));
      navMenu.style.top = `${topOffset}px`;
      navMenu.style.height = `calc(100dvh - ${topOffset}px)`;
    }
  }

  function openMenu() {
    const headerRect = header.getBoundingClientRect();
    const topOffset = Math.max(0, Math.round(headerRect.bottom));
    navMenu.style.top = `${topOffset}px`;
    navMenu.style.height = `calc(100dvh - ${topOffset}px)`;

    navMenu.classList.add('open');
    toggleBtn.classList.add('active');
    toggleBtn.setAttribute('aria-expanded', 'true');
    header.classList.add('menu-open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navMenu.classList.remove('open');
    toggleBtn.classList.remove('active');
    toggleBtn.setAttribute('aria-expanded', 'false');
    header.classList.remove('menu-open');
    document.body.style.overflow = '';

    setTimeout(() => {
      if (!navMenu.classList.contains('open')) {
        navMenu.style.top = '';
        navMenu.style.height = '';
      }
    }, 280);
  }

  function toggleMenu() {
    if (navMenu.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close when tapping outside the menu
  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('open')) {
      if (!navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
        closeMenu();
      }
    }
  });

  // Close with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      closeMenu();
    }
  });

  // Handle screen resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1040 && navMenu.classList.contains('open')) {
      closeMenu();
    } else if (navMenu.classList.contains('open')) {
      updateMenuPosition();
    }
  });
}

/* --------------------------------------------------------------------------
   4. Vitrine Category Filter Tabs
   -------------------------------------------------------------------------- */
function initVitrineFilters() {
  const tabs = document.querySelectorAll('.vitrine-tab');
  const cards = document.querySelectorAll('.product-card');

  if (!tabs.length || !cards.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const category = tab.dataset.category;

      cards.forEach(card => {
        const itemCategory = card.dataset.category;
        if (category === 'all' || itemCategory === category) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 20);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   5. Compact 3-Step Custom Cake Configurator
   -------------------------------------------------------------------------- */
function initCakeConfigurator() {
  const flavorRadios = document.querySelectorAll('input[name="cake_flavor"]');
  const weightRadios = document.querySelectorAll('input[name="cake_weight"]');
  const inscriptionInput = document.getElementById('cake-inscription');
  const dateInput = document.getElementById('cake-date');
  const priceDisplay = document.getElementById('calc-display-price');
  const whatsappBtn = document.getElementById('btn-builder-whatsapp');
  const modalBtn = document.getElementById('btn-builder-modal');

  if (!flavorRadios.length || !weightRadios.length || !priceDisplay) return;

  // Set default min date for custom cake (tomorrow)
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
  }

  function recalculate() {
    let selectedFlavor = 'Фирменный «Наполеон»';
    let pricePerKg = 1500;

    flavorRadios.forEach(radio => {
      if (radio.checked) {
        selectedFlavor = radio.value;
        pricePerKg = parseFloat(radio.dataset.priceKg) || 1500;
      }
    });

    let selectedWeight = 1.5;
    weightRadios.forEach(radio => {
      if (radio.checked) {
        selectedWeight = parseFloat(radio.dataset.mult) || 1.5;
      }
    });

    const inscription = inscriptionInput ? inscriptionInput.value.trim() : '';
    const date = dateInput ? dateInput.value : '';

    const totalPrice = Math.round(pricePerKg * selectedWeight);
    const formattedPrice = totalPrice.toLocaleString('ru-RU') + ' ₽';

    priceDisplay.textContent = formattedPrice;

    // Generate WhatsApp text
    let waMsg = `Здравствуйте! Хочу заказать торт в кондитерской Napoleon:\n`;
    waMsg += `• Начинка: ${selectedFlavor}\n`;
    waMsg += `• Вес: ${selectedWeight} кг\n`;
    if (inscription) waMsg += `• Надпись на торте: «${inscription}»\n`;
    if (date) waMsg += `• Дата готовности: ${date}\n`;
    waMsg += `• Ориентировочная стоимость: ${formattedPrice}`;

    if (whatsappBtn) {
      whatsappBtn.href = `https://wa.me/79370116181?text=${encodeURIComponent(waMsg)}`;
    }

    if (modalBtn) {
      modalBtn.dataset.productTitle = `Торт «${selectedFlavor}» (${selectedWeight} кг)`;
      modalBtn.dataset.productNotes = `Надпись: ${inscription || 'без надписи'}, дата: ${date || 'уточнить'}`;
    }
  }

  flavorRadios.forEach(r => r.addEventListener('change', recalculate));
  weightRadios.forEach(r => r.addEventListener('change', recalculate));
  if (inscriptionInput) inscriptionInput.addEventListener('input', recalculate);
  if (dateInput) dateInput.addEventListener('change', recalculate);

  recalculate();
}

/* --------------------------------------------------------------------------
   6. Mosaic Gallery Fullscreen Lightbox
   -------------------------------------------------------------------------- */
function initGalleryLightbox() {
  const cells = document.querySelectorAll('.mosaic-cell');
  const lightbox = document.getElementById('lightbox-modal');
  if (!lightbox) return;

  const lightboxImg = lightbox.querySelector('.lightbox-full-img');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption-text');
  const closeBtn = lightbox.querySelector('.lightbox-close');

  cells.forEach(cell => {
    cell.addEventListener('click', () => {
      const fullSrc = cell.dataset.full || (cell.querySelector('img') ? cell.querySelector('img').src : '');
      const captionText = cell.dataset.caption || (cell.querySelector('.mosaic-cell-caption') ? cell.querySelector('.mosaic-cell-caption').textContent : 'Napoleon Café');

      if (fullSrc && lightboxImg) {
        lightboxImg.src = fullSrc;
        if (lightboxCaption) lightboxCaption.textContent = captionText;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}

/* --------------------------------------------------------------------------
   7. Quick Order Modal & Form Submission
   -------------------------------------------------------------------------- */
function initOrderModals() {
  const orderModal = document.getElementById('order-modal');
  const openButtons = document.querySelectorAll('[data-open-modal="order"]');
  const closeButtons = document.querySelectorAll('.btn-modal-close');
  const orderForm = document.getElementById('quick-order-form');

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const productTitle = btn.dataset.productTitle || 'Торт на заказ';
      const notes = btn.dataset.productNotes || '';
      
      const titleInput = document.getElementById('modal-product-title');
      if (titleInput) titleInput.value = productTitle;
      
      const modalHeader = document.getElementById('modal-heading-text');
      if (modalHeader) modalHeader.textContent = `Заказ: ${productTitle}`;

      const notesInput = document.getElementById('order-notes');
      if (notesInput && notes) {
        notesInput.value = notes;
      }

      if (orderModal) {
        orderModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const parentModal = btn.closest('.modal-layer');
      if (parentModal) {
        parentModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  document.querySelectorAll('.modal-layer').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-layer.active').forEach(m => {
        m.classList.remove('active');
      });
      document.body.style.overflow = '';
    }
  });

  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('order-name').value;
      const phone = document.getElementById('order-phone').value;

      if (orderModal) {
        orderModal.classList.remove('active');
        document.body.style.overflow = '';
      }

      showToast(`Спасибо, ${name || 'гость'}! Шеф-кондитер свяжется с вами по номеру ${phone} в течение 10 минут.`);
      orderForm.reset();
    });
  }
}

/* --------------------------------------------------------------------------
   8. Toast Notice Notifications
   -------------------------------------------------------------------------- */
function showToast(message) {
  let toast = document.querySelector('.toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span style="color:#38D37E; font-weight:bold; font-size:1.1rem;">✓</span> <span>${message}</span>`;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}

/* --------------------------------------------------------------------------
   9. Scroll Reveal Animations (IntersectionObserver)
   -------------------------------------------------------------------------- */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.reveal-fade');
  if (!elements.length) return;

  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -20px 0px'
  });

  elements.forEach(el => observer.observe(el));
}
