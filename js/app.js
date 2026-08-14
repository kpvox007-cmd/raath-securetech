/* ==========================================================================
   RAATH SECURETECH - APPLICATION ROUTER & WIZARD CONTROLLER
   Location: Janak Singh Pura, Neemrana | Contact: +91 9928660353
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Global Toast Function
  window.showToast = function(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';
    if (type === 'danger') icon = '🚨';

    toast.innerHTML = `<span>${icon}</span> <div>${message}</div>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-20px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  };

  // Dark / Light Mode Theme Controller
  const themeToggleBtn = document.getElementById('btn-theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const themeText = document.getElementById('theme-text');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (document.body) {
      document.body.setAttribute('data-theme', theme);
      if (theme === 'light') {
        document.body.classList.add('light-theme');
      } else {
        document.body.classList.remove('light-theme');
      }
    }
    localStorage.setItem('rst_theme', theme);

    if (themeIcon) themeIcon.innerText = theme === 'light' ? '☀️' : '🌙';
    if (themeText) themeText.innerText = theme === 'light' ? 'Light Mode' : 'Dark Mode';
  }

  const savedTheme = localStorage.getItem('rst_theme') || 'dark';
  applyTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      window.showToast(`Switched to ${newTheme.toUpperCase()} Theme!`, 'info');
    });
  }

  // Mobile Navigation Drawer Toggle
  const mobileNavBtn = document.getElementById('mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileNavBtn && navMenu) {
    mobileNavBtn.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
    });
  }

  // Main Navigation Router
  const navLinks = document.querySelectorAll('[data-view-target]');
  const appViews = document.querySelectorAll('.app-view');

  function navigateTo(targetViewId) {
    appViews.forEach(view => view.classList.remove('active'));
    navLinks.forEach(link => link.classList.remove('active'));

    const activeView = document.getElementById(`view-${targetViewId}`);
    if (activeView) {
      activeView.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    document.querySelectorAll(`[data-view-target="${targetViewId}"]`).forEach(link => {
      link.classList.add('active');
    });

    // Sub-module re-render checks
    if (targetViewId === 'quotation') {
      QuotationEngine.init();
    }
    if (targetViewId === 'customer') {
      CustomerPortal.renderState();
    }
    if (targetViewId === 'crm') {
      AdminCRM.renderCRM();
    }
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.dataset.viewTarget;
      if (target) navigateTo(target);
    });
  });

  // Modal Closing Triggers
  document.querySelectorAll('.close-modal, .modal-overlay').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target === el || e.target.classList.contains('close-modal')) {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
      }
    });
  });

  // CCTV Requirement Wizard Controller
  const wizardAnswers = {
    propertyType: 'Home',
    areaSize: 'Medium',
    cameraCount: 4,
    nightVision: 'FullColor'
  };

  document.querySelectorAll('.wizard-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const group = opt.dataset.wizardGroup;
      const val = opt.dataset.wizardVal;

      document.querySelectorAll(`[data-wizard-group="${group}"]`).forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      wizardAnswers[group] = val;

      calculateWizardRecommendation();
    });
  });

  function calculateWizardRecommendation() {
    let camCount = 4;
    let recName = '4-Camera HD NightVision System';
    let estPrice = '14,500 - 18,500';

    if (wizardAnswers.propertyType === 'Factory' || wizardAnswers.areaSize === 'Large') {
      camCount = 8;
      recName = '8 to 16 Camera 4K IP Commercial PoE Setup';
      estPrice = '34,000 - 55,000';
    } else if (wizardAnswers.propertyType === 'Shop') {
      camCount = 4;
      recName = '4-Camera 5MP ColorVu Audio Kit with HDD';
      estPrice = '16,000 - 21,000';
    }

    const recResultEl = document.getElementById('wizard-result-box');
    if (recResultEl) {
      recResultEl.innerHTML = `
        <div style="background: rgba(0, 210, 255, 0.08); border: 1px solid var(--border-glow); border-radius: var(--radius-lg); padding: 1.5rem; text-align: center; margin-top: 2rem;">
          <span class="badge badge-primary" style="margin-bottom: 0.75rem;">Recommended Security Config</span>
          <h3 style="color: #fff; font-size: 1.5rem; margin-bottom: 0.5rem;">${recName}</h3>
          <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 1.25rem;">Ideal for ${wizardAnswers.propertyType} in Neemrana / Janak Singh Pura area.</p>
          <div style="font-size: 1.35rem; font-weight: 800; color: var(--primary); margin-bottom: 1.5rem;">
            Estimated Price: ₹${estPrice} <span style="font-size: 0.8rem; font-weight: 400; color: var(--text-muted);">(Includes Wiring & Mobile App)</span>
          </div>
          <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
            <button class="btn btn-primary" id="btn-wizard-to-quote">Load into Instant Quotation Builder</button>
            <a href="https://wa.me/919928660353?text=${encodeURIComponent(`Hello Raath SecureTech (9928660353), I calculated my CCTV requirement for my ${wizardAnswers.propertyType} in Neemrana. Recommended: ${recName}. Please send details.`)}" target="_blank" class="btn btn-whatsapp">
              WhatsApp Consult (+91 9928660353)
            </a>
          </div>
        </div>
      `;

      const loadBtn = document.getElementById('btn-wizard-to-quote');
      if (loadBtn) {
        loadBtn.addEventListener('click', () => {
          navigateTo('quotation');
          window.showToast('Pre-loaded recommended items in Quotation Builder!', 'success');
        });
      }
    }
  }

  // Initial Wizard Recommendation calculation
  calculateWizardRecommendation();

  // Initialize Sub-modules
  QuotationEngine.init();
});
