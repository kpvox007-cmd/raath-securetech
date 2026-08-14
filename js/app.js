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
  const wizardState = {
    currentStep: 1,
    propertyType: 'Home',
    areaSize: 'Medium',
    nightVision: 'FullColor'
  };

  let currentRecommendedItems = [];

  // Step switching function
  function switchWizardStep(stepNum) {
    if (stepNum < 1 || stepNum > 3) return;
    wizardState.currentStep = stepNum;

    // Update panels visibility
    document.querySelectorAll('.wizard-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    const targetPanel = document.getElementById(`wizard-panel-${stepNum}`);
    if (targetPanel) targetPanel.classList.add('active');

    // Update step tab headers
    document.querySelectorAll('.wizard-step-item').forEach((stepItem, idx) => {
      const itemStep = idx + 1;
      stepItem.classList.remove('active', 'completed');
      if (itemStep === stepNum) {
        stepItem.classList.add('active');
      } else if (itemStep < stepNum) {
        stepItem.classList.add('completed');
      }
    });

    // Update Nav Buttons
    const prevBtn = document.getElementById('btn-wiz-prev');
    const nextBtn = document.getElementById('btn-wiz-next');
    const counterEl = document.getElementById('wiz-step-counter');

    if (prevBtn) {
      prevBtn.style.visibility = stepNum === 1 ? 'hidden' : 'visible';
    }

    if (nextBtn) {
      if (stepNum === 3) {
        nextBtn.innerHTML = '✔ View Final Recommendation';
      } else {
        nextBtn.innerHTML = 'Next Step →';
      }
    }

    if (counterEl) {
      counterEl.innerText = `Step ${stepNum} of 3`;
    }
  }

  // Click handler for step tabs
  document.querySelectorAll('.wizard-step-item').forEach(item => {
    item.addEventListener('click', () => {
      const targetStep = parseInt(item.dataset.stepTarget || '1', 10);
      switchWizardStep(targetStep);
    });
  });

  // Next / Prev button listeners
  const btnWizNext = document.getElementById('btn-wiz-next');
  const btnWizPrev = document.getElementById('btn-wiz-prev');

  if (btnWizNext) {
    btnWizNext.addEventListener('click', () => {
      if (wizardState.currentStep < 3) {
        switchWizardStep(wizardState.currentStep + 1);
      } else {
        // Scroll smoothly to results
        const resBox = document.getElementById('wizard-result-box');
        if (resBox) resBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  if (btnWizPrev) {
    btnWizPrev.addEventListener('click', () => {
      switchWizardStep(wizardState.currentStep - 1);
    });
  }

  // Click handler for wizard option cards
  document.querySelectorAll('.wizard-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const group = opt.dataset.wizardGroup;
      const val = opt.dataset.wizardVal;

      document.querySelectorAll(`[data-wizard-group="${group}"]`).forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      wizardState[group] = val;

      calculateWizardRecommendation();
    });
  });

  function calculateWizardRecommendation() {
    const inventory = DB.getInventory();
    
    // 1. Calculate Camera Quantity
    let camQty = 4;
    if (wizardState.areaSize === 'Small') {
      camQty = (wizardState.propertyType === 'Factory') ? 4 : 2;
    } else if (wizardState.areaSize === 'Medium') {
      camQty = (wizardState.propertyType === 'Factory' || wizardState.propertyType === 'Office') ? 8 : 4;
    } else if (wizardState.areaSize === 'Large') {
      camQty = (wizardState.propertyType === 'Factory') ? 12 : 8;
    } else if (wizardState.areaSize === 'ExtraLarge') {
      camQty = (wizardState.propertyType === 'Factory') ? 16 : 12;
    }

    // 2. Determine Recorder (DVR / NVR)
    let dvrId = 'p5'; // 4-CH DVR
    let dvrName = 'CP Plus 4-Channel HD DVR';
    if (camQty > 8) {
      dvrId = 'p7';
      dvrName = 'Hikvision 16-Channel 4K NVR with PoE';
    } else if (camQty > 4) {
      dvrId = 'p6';
      dvrName = 'Hikvision 8-Channel HD DVR (5MP)';
    }

    // 3. Determine Storage Hard Disk
    let hddId = 'p8'; // 1TB
    let hddName = 'Seagate SkyHawk 1TB Surveillance HDD';
    let retentionDays = '15-20 Days';
    if (camQty > 8) {
      hddId = 'p10'; // 4TB
      hddName = 'WD Purple 4TB Surveillance HDD';
      retentionDays = '25-30 Days';
    } else if (camQty > 4) {
      hddId = 'p9'; // 2TB
      hddName = 'Seagate SkyHawk 2TB Surveillance HDD';
      retentionDays = '20-25 Days';
    }

    // 4. Determine Camera Model based on NightVision
    let camId = 'p1'; // 2MP IR
    let camName = 'CP Plus 2MP Full HD Indoor/Outdoor Camera';
    let nightVisionText = 'Infrared Night Vision (B/W)';

    if (wizardState.nightVision === 'FullColor') {
      camId = 'p2';
      camName = 'Hikvision 5MP ColorVu 24/7 Full-Color Camera';
      nightVisionText = '24/7 True Full-Color NightVision';
    } else if (wizardState.nightVision === 'SmartAI') {
      camId = 'p3';
      camName = 'Hikvision 4K 8MP Ultra HD Smart AI IP Camera';
      nightVisionText = '4K Ultra HD + Smart AI Motion Alert';
    } else if (wizardState.nightVision === 'SolarPTZ') {
      camId = 'p4';
      camName = '4G SIM Solar Wireless PTZ 360° Camera';
      nightVisionText = 'Solar Powered + 4G Wireless 360° PTZ';
    }

    // 5. Determine Power Supply & Cabling
    let powerId = (camQty > 8) ? 'p15' : (camQty > 4 ? 'p12' : 'p11');
    let cableId = (camQty > 8) ? 'p14' : 'p13';
    let cableQty = Math.max(1, Math.ceil(camQty / 4));
    let connQty = Math.max(1, Math.ceil(camQty / 4));
    let boxQty = Math.max(1, Math.ceil(camQty / 4));

    // Construct Item list for Quote Engine
    currentRecommendedItems = [
      { productId: camId, qty: camQty },
      { productId: dvrId, qty: 1 },
      { productId: hddId, qty: 1 },
      { productId: powerId, qty: camQty > 8 ? 2 : 1 },
      { productId: cableId, qty: cableQty },
      { productId: 'p16', qty: connQty },
      { productId: 'p17', qty: boxQty }
    ];

    // Calculate Exact Package Price
    let estimatedTotal = 0;
    currentRecommendedItems.forEach(item => {
      const prod = inventory.find(p => p.id === item.productId);
      if (prod) estimatedTotal += (prod.price * item.qty);
    });

    const priceMin = Math.round(estimatedTotal * 0.95);
    const priceMax = Math.round(estimatedTotal * 1.1);

    // Format readable property labels
    const propLabels = { Home: 'Residence / Villa', Shop: 'Retail Shop', Factory: 'Factory / RIICO Plant', Office: 'Commercial Office' };
    const areaLabels = { Small: '< 1,000 sq.ft', Medium: '1,000 - 2,500 sq.ft', Large: '2,500 - 5,000 sq.ft', ExtraLarge: '> 5,000 sq.ft' };

    const recResultEl = document.getElementById('wizard-result-box');
    if (recResultEl) {
      recResultEl.innerHTML = `
        <div style="background: rgba(0, 210, 255, 0.05); border: 1px solid var(--border-glow); border-radius: var(--radius-lg); padding: 1.5rem; text-align: left;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 1rem;">
            <div>
              <span class="badge badge-success" style="margin-bottom: 0.5rem;">Custom Calculated Solution</span>
              <h3 style="color: #fff; font-size: 1.35rem; margin: 0;">${camQty}-Camera ${nightVisionText} Security Kit</h3>
              <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0.25rem 0 0;">Configured for ${propLabels[wizardState.propertyType] || wizardState.propertyType} (${areaLabels[wizardState.areaSize] || wizardState.areaSize}) in Neemrana</p>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Est. Price (Incl. Wiring & App)</span>
              <span style="font-size: 1.4rem; font-weight: 800; color: var(--primary);">₹${priceMin.toLocaleString('en-IN')} - ₹${priceMax.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <!-- Component Breakdown Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
            <div style="background: rgba(255,255,255,0.02); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.05);">
              <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">📷 Cameras</span>
              <strong style="color: #fff; font-size: 0.95rem;">${camQty}x ${camName}</strong>
            </div>

            <div style="background: rgba(255,255,255,0.02); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.05);">
              <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">📼 Recorder</span>
              <strong style="color: #fff; font-size: 0.95rem;">${dvrName}</strong>
            </div>

            <div style="background: rgba(255,255,255,0.02); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.05);">
              <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">💾 Surveillance Storage</span>
              <strong style="color: #fff; font-size: 0.95rem;">${hddName} (${retentionDays})</strong>
            </div>

            <div style="background: rgba(255,255,255,0.02); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.05);">
              <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">⚡ Power & Cabling</span>
              <strong style="color: #fff; font-size: 0.95rem;">Power Supply + ${cableQty} Roll Copper Cable</strong>
            </div>
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
            <button class="btn btn-primary" id="btn-wizard-to-quote">⚡ Load Kit into Instant Quotation Builder</button>
            <a href="https://wa.me/919928660353?text=${encodeURIComponent(
              `Hello Raath SecureTech (9928660353),\nI calculated my CCTV requirement on your website:\n• Property: ${propLabels[wizardState.propertyType]}\n• Area: ${areaLabels[wizardState.areaSize]}\n• Night Vision: ${nightVisionText}\n• Recommended Setup: ${camQty} Cameras + ${dvrName} + ${hddName}\n• Est. Price: ₹${priceMin.toLocaleString('en-IN')} - ₹${priceMax.toLocaleString('en-IN')}\n\nPlease share detailed quotation and site visit schedule.`
            )}" target="_blank" class="btn btn-whatsapp">
              💬 WhatsApp Consult (+91 9928660353)
            </a>
          </div>
        </div>
      `;

      const loadBtn = document.getElementById('btn-wizard-to-quote');
      if (loadBtn) {
        loadBtn.addEventListener('click', () => {
          if (typeof QuotationEngine !== 'undefined' && QuotationEngine.loadCustomKit) {
            QuotationEngine.loadCustomKit(currentRecommendedItems);
          }
          navigateTo('quotation');
          if (window.showToast) {
            window.showToast(`Pre-loaded ${camQty}-Camera security setup into Quotation Builder!`, 'success');
          }
        });
      }
    }
  }

  // Initial Wizard Recommendation calculation
  calculateWizardRecommendation();

  // Initialize Sub-modules
  QuotationEngine.init();
});
