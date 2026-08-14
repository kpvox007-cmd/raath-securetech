/* ==========================================================================
   RAATH SECURETECH - ADMIN CRM DASHBOARD & ORDER MANAGEMENT
   Location: Janak Singh Pura, Neemrana | Contact: +91 9928660353
   ========================================================================== */

const AdminCRM = {
  quoteFilters: {
    search: '',
    docType: 'all',
    location: 'all',
    sort: 'date-desc',
    colRef: '',
    colType: 'all',
    colCust: '',
    colLoc: '',
    colAmount: ''
  },

  invFilters: {
    search: '',
    category: 'all',
    status: 'all'
  },

  init() {
    this.renderCRM();
    this.setupEventListeners();
    this.setupStockTabListeners();
  },

  setupEventListeners() {
    // Filter Inputs Event Listener
    const handleFilterChange = () => {
      this.quoteFilters = {
        search: document.getElementById('filter-quote-search')?.value || '',
        docType: document.getElementById('filter-quote-doctype')?.value || 'all',
        location: document.getElementById('filter-quote-location')?.value || 'all',
        sort: document.getElementById('filter-quote-sort')?.value || 'date-desc',
        colRef: document.getElementById('col-filter-ref')?.value || '',
        colType: document.getElementById('col-filter-type')?.value || 'all',
        colCust: document.getElementById('col-filter-cust')?.value || '',
        colLoc: document.getElementById('col-filter-loc')?.value || '',
        colAmount: document.getElementById('col-filter-amount')?.value || ''
      };
      this.renderQuotationHistory();
    };

    const handleInvFilterChange = () => {
      this.invFilters = {
        search: document.getElementById('filter-inv-search')?.value || '',
        category: document.getElementById('filter-inv-category')?.value || 'all',
        status: document.getElementById('filter-inv-status')?.value || 'all'
      };
      this.renderInventory();
    };

    document.addEventListener('input', (e) => {
      if (e.target && (e.target.id.startsWith('filter-quote-') || e.target.id.startsWith('col-filter-'))) {
        handleFilterChange();
      }
      if (e.target && e.target.id.startsWith('filter-inv-')) {
        handleInvFilterChange();
      }
    });

    document.addEventListener('change', (e) => {
      if (e.target && (e.target.id.startsWith('filter-quote-') || e.target.id.startsWith('col-filter-'))) {
        handleFilterChange();
      }
      if (e.target && e.target.id.startsWith('filter-inv-')) {
        handleInvFilterChange();
      }
    });

    document.addEventListener('click', (e) => {
      // Clear Quote Filters Button
      if (e.target && (e.target.id === 'btn-reset-quote-filters' || e.target.closest('#btn-reset-quote-filters'))) {
        this.resetQuoteFilters();
      }

      // Clear Inventory Filters Button
      if (e.target && (e.target.id === 'btn-reset-inv-filters' || e.target.closest('#btn-reset-inv-filters'))) {
        this.resetInventoryFilters();
      }

      // Open Add Inventory Modal
      if (e.target && (e.target.id === 'btn-open-add-inventory' || e.target.closest('#btn-open-add-inventory'))) {
        this.openAddInventoryModal();
      }

      // Save Inventory Form
      if (e.target && (e.target.id === 'btn-save-inventory-form' || e.target.closest('#btn-save-inventory-form'))) {
        this.saveInventoryForm();
      }

      // Edit Inventory Item
      if (e.target && e.target.classList.contains('btn-edit-inv')) {
        const id = e.target.dataset.id;
        this.openAddInventoryModal(id);
      }

      // Delete Inventory Item
      if (e.target && e.target.classList.contains('btn-delete-inv')) {
        const id = e.target.dataset.id;
        if (confirm('Are you sure you want to remove this item from stock inventory?')) {
          DB.deleteInventoryItem(id);
          window.showToast('Removed item from stock inventory!', 'info');
          this.renderInventory();
          if (window.QuotationEngine) window.QuotationEngine.populateProductSelector();
        }
      }

      // Category Box Click Handler
      const catBox = e.target ? e.target.closest('.inv-cat-box') : null;
      if (catBox) {
        const cat = catBox.dataset.category;
        this.invFilters.category = cat;
        const catSelect = document.getElementById('filter-inv-category');
        if (catSelect) catSelect.value = cat;
        this.renderInventory();
      }

      // CRM Sub-Tab Navigation
      const tabBtn = e.target ? e.target.closest('.crm-tab-btn') : null;
      if (tabBtn) {
        document.querySelectorAll('.crm-tab-btn').forEach(b => b.classList.remove('active'));
        tabBtn.classList.add('active');
        const view = tabBtn.dataset.crmView;
        
        document.querySelectorAll('.crm-subview').forEach(v => v.style.display = 'none');
        const targetView = document.getElementById(`crm-view-${view}`);
        if (targetView) targetView.style.display = 'block';
        this.renderCRM();
      }

      // Ticket Status Action Buttons inside CRM
      if (e.target && e.target.classList.contains('btn-crm-update-ticket')) {
        const ticketId = e.target.dataset.id;
        const select = document.getElementById(`select-status-${ticketId}`);
        const techInput = document.getElementById(`input-tech-${ticketId}`);

        if (select) {
          const newStatus = select.value;
          const techName = techInput ? techInput.value : null;
          DB.updateTicketStatus(ticketId, newStatus, techName, `Status updated to ${newStatus} by Admin`);
          window.showToast(`Ticket ${ticketId} updated to ${newStatus}`, 'success');
          this.renderCRM();
        }
      }

      // Export Quotation to WhatsApp from CRM
      if (e.target && e.target.classList.contains('btn-crm-send-quote-wa')) {
        const quoteId = e.target.dataset.id;
        const quote = DB.getQuotations().find(q => q.id === quoteId);
        if (quote) {
          const phone = quote.customerPhone.replace(/[^0-9]/g, '') || '9928660353';
          const message = `🛡️ *RAATH SECURETECH - JANAK SINGH PURA, NEEMRANA*\nRe-Sending Quote Ref: *${quote.id}*\nCustomer: *${quote.customerName}*\nGrand Total: *₹${quote.grandTotal.toLocaleString('en-IN')}*\nCall/WhatsApp: 9928660353 for details.`;
          window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`, '_blank');
        }
      }
    });
  },

  openAddInventoryModal(itemId = null) {
    const modal = document.getElementById('modal-add-inventory');
    if (!modal) return;

    const idInput = document.getElementById('inv-item-id');
    const nameInput = document.getElementById('inv-item-name');
    const hsnInput = document.getElementById('inv-item-hsn');
    const catInput = document.getElementById('inv-item-category');
    const suppInput = document.getElementById('inv-item-supplier');
    const costInput = document.getElementById('inv-item-cost');
    const priceInput = document.getElementById('inv-item-price');
    const unitInput = document.getElementById('inv-item-unit');
    const qtyInput = document.getElementById('inv-item-qty');
    const alertQtyInput = document.getElementById('inv-item-alert-qty');
    const serialsInput = document.getElementById('inv-item-serials');
    const specsInput = document.getElementById('inv-item-specs');

    if (itemId) {
      const item = DB.getInventory().find(i => i.id === itemId);
      if (item) {
        if (idInput) idInput.value = item.id;
        if (nameInput) nameInput.value = item.name;
        if (hsnInput) hsnInput.value = item.hsn || '85258090';
        if (catInput) catInput.value = item.category || 'Camera';
        if (suppInput) suppInput.value = item.supplierParty || '';
        if (costInput) costInput.value = item.purchasePrice || 0;
        if (priceInput) priceInput.value = item.price || 0;
        if (unitInput) unitInput.value = item.unit || 'Pc';
        if (qtyInput) qtyInput.value = item.stockQty || 0;
        if (alertQtyInput) alertQtyInput.value = item.minAlertQty || 2;
        if (serialsInput) serialsInput.value = item.serialNumbers || '';
        if (specsInput) specsInput.value = item.specs || '';
      }
    } else {
      if (idInput) idInput.value = '';
      if (nameInput) nameInput.value = '';
      if (hsnInput) hsnInput.value = '85258090';
      if (catInput) catInput.value = 'Camera';
      if (suppInput) suppInput.value = '';
      if (costInput) costInput.value = '';
      if (priceInput) priceInput.value = '';
      if (unitInput) unitInput.value = 'Pc';
      if (qtyInput) qtyInput.value = '10';
      if (alertQtyInput) alertQtyInput.value = '2';
      if (serialsInput) serialsInput.value = '';
      if (specsInput) specsInput.value = '';
    }

    modal.classList.add('active');
  },

  saveInventoryForm() {
    const id = document.getElementById('inv-item-id')?.value;
    const name = document.getElementById('inv-item-name')?.value;
    const hsn = document.getElementById('inv-item-hsn')?.value || '85258090';
    const category = document.getElementById('inv-item-category')?.value || 'Camera';
    const supplierParty = document.getElementById('inv-item-supplier')?.value || 'General Distributor';
    const purchasePrice = parseFloat(document.getElementById('inv-item-cost')?.value) || 0;
    const price = parseFloat(document.getElementById('inv-item-price')?.value) || 0;
    const unit = document.getElementById('inv-item-unit')?.value || 'Pc';
    const stockQty = parseInt(document.getElementById('inv-item-qty')?.value) || 0;
    const minAlertQty = parseInt(document.getElementById('inv-item-alert-qty')?.value) || 2;
    const serialNumbers = document.getElementById('inv-item-serials')?.value || 'N/A';
    const specs = document.getElementById('inv-item-specs')?.value || '';

    if (!name) {
      window.showToast('Please enter a product name.', 'warning');
      return;
    }

    const item = {
      id: id || ('inv-' + Math.floor(1000 + Math.random() * 9000)),
      hsn,
      name,
      category,
      supplierParty,
      purchasePrice,
      price,
      unit,
      stockQty,
      minAlertQty,
      serialNumbers,
      specs
    };

    DB.saveInventoryItem(item);
    window.showToast(`Saved ${name} in Stock Inventory!`, 'success');

    const modal = document.getElementById('modal-add-inventory');
    if (modal) modal.classList.remove('active');

    this.renderInventory();
    if (window.QuotationEngine) window.QuotationEngine.populateProductSelector();
  },

  resetInventoryFilters() {
    this.invFilters = { search: '', category: 'all', status: 'all' };
    const searchInput = document.getElementById('filter-inv-search');
    const catSelect = document.getElementById('filter-inv-category');
    const statusSelect = document.getElementById('filter-inv-status');

    if (searchInput) searchInput.value = '';
    if (catSelect) catSelect.value = 'all';
    if (statusSelect) statusSelect.value = 'all';

    this.renderInventory();
  },

  renderCRM() {
    this.renderMetrics();
    this.renderTicketsManager();
    this.renderCustomerDatabase();
    this.renderQuotationHistory();
    this.renderInventory();
  },

  renderMetrics() {
    const tickets = DB.getTickets();
    const customers = DB.getCustomers();
    const quotes = DB.getQuotations();

    const openTicketsCount = tickets.filter(t => t.status !== 'Resolved').length;
    const totalSalesEstimate = quotes.reduce((acc, q) => acc + (q.grandTotal || 0), 0);

    const elSales = document.getElementById('crm-metric-sales');
    const elTickets = document.getElementById('crm-metric-tickets');
    const elCust = document.getElementById('crm-metric-customers');
    const elQuotes = document.getElementById('crm-metric-quotes');

    if (elSales) elSales.innerText = `₹${totalSalesEstimate.toLocaleString('en-IN')}`;
    if (elTickets) elTickets.innerText = openTicketsCount;
    if (elCust) elCust.innerText = customers.length;
    if (elQuotes) elQuotes.innerText = quotes.length;
  },

  renderTicketsManager() {
    const tickets = DB.getTickets();
    const container = document.getElementById('crm-tickets-table-body');
    if (!container) return;

    if (tickets.length === 0) {
      container.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-muted); padding: 2rem;">No active service tickets in CRM.</td></tr>`;
      return;
    }

    container.innerHTML = tickets.map(t => {
      let badgeStyle = 'badge-warning';
      if (t.status === 'In Progress') badgeStyle = 'badge-primary';
      if (t.status === 'Resolved') badgeStyle = 'badge-success';

      return `
        <tr>
          <td>
            <strong style="color: var(--primary);">${t.id}</strong>
            <br><span style="font-size: 0.75rem; color: var(--text-muted);">${t.createdAt}</span>
          </td>
          <td>
            <strong style="color: #fff;">${t.customerName}</strong>
            <br><span style="font-size: 0.8rem; color: var(--text-secondary);">📞 ${t.phone}</span>
            <br><span style="font-size: 0.75rem; color: var(--text-muted);">📍 ${t.location}</span>
          </td>
          <td>
            <strong style="color: var(--warning);">${t.issueCategory}</strong>
            <p style="font-size: 0.825rem; color: var(--text-secondary); max-width: 250px;">${t.description}</p>
          </td>
          <td>
            <span class="badge ${badgeStyle}">${t.status}</span>
          </td>
          <td>
            <input type="text" id="input-tech-${t.id}" class="form-control" style="padding: 0.35rem 0.5rem; font-size: 0.8rem; margin-bottom: 0.35rem;" value="${t.technician || 'Ramesh Kumar (Neemrana)'}">
            <select id="select-status-${t.id}" class="form-select" style="padding: 0.35rem 0.5rem; font-size: 0.8rem;">
              <option value="Logged" ${t.status === 'Logged' ? 'selected' : ''}>Logged</option>
              <option value="Assigned" ${t.status === 'Assigned' ? 'selected' : ''}>Assigned</option>
              <option value="In Progress" ${t.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Scheduled" ${t.status === 'Scheduled' ? 'selected' : ''}>Scheduled</option>
              <option value="Resolved" ${t.status === 'Resolved' ? 'selected' : ''}>Resolved / Closed</option>
            </select>
          </td>
          <td>
            <button class="btn btn-primary btn-sm btn-crm-update-ticket" data-id="${t.id}">Save</button>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderCustomerDatabase() {
    const customers = DB.getCustomers();
    const container = document.getElementById('crm-customers-table-body');
    if (!container) return;

    container.innerHTML = customers.map(c => `
      <tr>
        <td><strong style="color: #fff;">${c.name}</strong></td>
        <td>📞 ${c.phone}<br><span style="font-size: 0.75rem; color: var(--text-muted);">${c.email}</span></td>
        <td style="font-size: 0.85rem;">📍 ${c.address}</td>
        <td><span class="badge badge-primary">${c.cctvSystem}</span></td>
        <td><span class="badge badge-success">${c.amcStatus}</span><br><span style="font-size: 0.75rem; color: var(--text-muted);">Expires: ${c.amcExpiry}</span></td>
        <td>
          <a href="https://wa.me/91${c.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${c.name}, greetings from Raath SecureTech Janak Singh Pura, Neemrana! Contact 9928660353 for AMC renewal & CCTV servicing.`)}" target="_blank" class="btn btn-whatsapp btn-sm">
            WhatsApp
          </a>
        </td>
      </tr>
    `).join('');
  },

  renderQuotationHistory() {
    const quotes = DB.getQuotations();
    const container = document.getElementById('crm-quotes-table-body');
    const lblCount = document.getElementById('lbl-quote-filtered-count');
    const locSelect = document.getElementById('filter-quote-location');
    if (!container) return;

    // Populate Location Dropdown dynamically
    if (locSelect) {
      const selectedLoc = locSelect.value;
      const locations = Array.from(new Set(quotes.map(q => q.customerLocation).filter(Boolean)));
      locSelect.innerHTML = '<option value="all">All Locations</option>' + 
        locations.map(loc => `<option value="${loc}">${loc}</option>`).join('');
      locSelect.value = selectedLoc && locations.includes(selectedLoc) ? selectedLoc : (this.quoteFilters.location || 'all');
    }

    const normalize = str => (str || '').toString().toLowerCase().trim();

    let filtered = quotes.filter(q => {
      // 1. Toolbar Search Filter
      if (this.quoteFilters.search) {
        const s = normalize(this.quoteFilters.search);
        const matchSearch = normalize(q.id).includes(s) ||
                            normalize(q.customerName).includes(s) ||
                            normalize(q.customerFirm).includes(s) ||
                            normalize(q.customerPhone).includes(s) ||
                            normalize(q.customerLocation).includes(s) ||
                            normalize(q.date).includes(s);
        if (!matchSearch) return false;
      }

      // 2. Toolbar Doc Type Filter
      if (this.quoteFilters.docType !== 'all') {
        if (this.quoteFilters.docType === 'tax_invoice' && q.docType !== 'tax_invoice') return false;
        if (this.quoteFilters.docType === 'quote' && q.docType === 'tax_invoice') return false;
      }

      // 3. Toolbar Location Filter
      if (this.quoteFilters.location !== 'all') {
        if (normalize(q.customerLocation) !== normalize(this.quoteFilters.location)) return false;
      }

      // 4. In-line Column Header Filters
      if (this.quoteFilters.colRef) {
        const r = normalize(this.quoteFilters.colRef);
        if (!normalize(q.id).includes(r) && !normalize(q.date).includes(r)) return false;
      }

      if (this.quoteFilters.colType !== 'all') {
        if (this.quoteFilters.colType === 'tax_invoice' && q.docType !== 'tax_invoice') return false;
        if (this.quoteFilters.colType === 'quote' && q.docType === 'tax_invoice') return false;
      }

      if (this.quoteFilters.colCust) {
        const c = normalize(this.quoteFilters.colCust);
        const matchCust = normalize(q.customerName).includes(c) ||
                          normalize(q.customerFirm).includes(c) ||
                          normalize(q.customerPhone).includes(c);
        if (!matchCust) return false;
      }

      if (this.quoteFilters.colLoc) {
        const l = normalize(this.quoteFilters.colLoc);
        if (!normalize(q.customerLocation).includes(l)) return false;
      }

      if (this.quoteFilters.colAmount) {
        const a = normalize(this.quoteFilters.colAmount);
        const amtStr = (q.grandTotal || 0).toString();
        if (!amtStr.includes(a)) return false;
      }

      return true;
    });

    // Sorting
    const sortMode = this.quoteFilters.sort || 'date-desc';
    filtered.sort((a, b) => {
      if (sortMode === 'date-desc') return new Date(b.date || 0) - new Date(a.date || 0);
      if (sortMode === 'date-asc') return new Date(a.date || 0) - new Date(b.date || 0);
      if (sortMode === 'amount-desc') return (b.grandTotal || 0) - (a.grandTotal || 0);
      if (sortMode === 'amount-asc') return (a.grandTotal || 0) - (b.grandTotal || 0);
      return 0;
    });

    if (lblCount) {
      lblCount.innerText = `Showing ${filtered.length} of ${quotes.length} estimates`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-muted); padding: 2rem;">No matching quotations found for current filters.</td></tr>`;
      return;
    }

    container.innerHTML = filtered.map(q => {
      const isBill = q.docType === 'tax_invoice';
      const badgeClass = isBill ? 'badge-success' : 'badge-primary';
      const typeLabel = isBill ? '🧾 Tax Bill' : '📋 Quotation';

      return `
        <tr>
          <td><strong style="color: var(--primary);">${q.id}</strong><br><span style="font-size: 0.75rem; color: var(--text-muted);">${q.date}</span></td>
          <td><span class="badge ${badgeClass}">${typeLabel}</span></td>
          <td><strong style="color: #fff;">${q.customerName}</strong> ${q.customerFirm ? `<span style="font-size: 0.8rem; color: var(--text-muted);">(${q.customerFirm})</span>` : ''}<br><span style="font-size: 0.8rem; color: var(--text-secondary);">📞 ${q.customerPhone}</span></td>
          <td style="font-size: 0.85rem;">📍 ${q.customerLocation}</td>
          <td><strong style="color: var(--accent); font-size: 1.05rem;">₹${(q.grandTotal || 0).toLocaleString('en-IN')}</strong></td>
          <td style="text-align: right; white-space: nowrap;">
            <button class="btn btn-primary btn-sm" onclick="QuotationEngine.previewSavedQuote('${q.id}')" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; margin-right: 0.25rem;">
              👁️ View / Print
            </button>
            <button class="btn btn-whatsapp btn-sm" onclick="QuotationEngine.sendSavedQuoteViaWhatsApp('${q.id}')" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; margin-right: 0.25rem;">
              📲 WhatsApp
            </button>
            <button class="btn btn-secondary btn-sm" onclick="QuotationEngine.loadSavedQuoteIntoBuilder('${q.id}')" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; margin-right: 0.25rem;">
              📋 Load
            </button>
            <button class="btn btn-secondary btn-sm" onclick="QuotationEngine.deleteSavedQuote('${q.id}')" style="color: var(--danger); padding: 0.25rem 0.4rem; font-size: 0.75rem;">
              🗑️
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderCategoryBoxes(inventory) {
    const boxContainer = document.getElementById('inventory-category-boxes');
    if (!boxContainer) return;

    const categoriesConfig = [
      { key: 'all', label: 'All Hardware', icon: '🌐' },
      { key: 'Camera', label: 'CCTV Cameras', icon: '📷' },
      { key: 'DVR/NVR', label: 'DVR & NVR', icon: '📼' },
      { key: 'Storage', label: 'Hard Disks', icon: '💾' },
      { key: 'Power Supply', label: 'Power Supply', icon: '⚡' },
      { key: 'Cabling', label: 'Cables & Net', icon: '🔌' },
      { key: 'Accessory', label: 'Accessories', icon: '🛠️' }
    ];

    const currentCat = this.invFilters.category || 'all';

    boxContainer.innerHTML = categoriesConfig.map(c => {
      let items = inventory;
      if (c.key !== 'all') {
        items = inventory.filter(i => (i.category || '').toLowerCase() === c.key.toLowerCase());
      }

      const totalQty = items.reduce((sum, i) => sum + (parseInt(i.stockQty) || 0), 0);
      const totalVal = items.reduce((sum, i) => sum + ((parseInt(i.stockQty) || 0) * (parseFloat(i.price) || 0)), 0);

      const maxEstimatedCapacity = Math.max(1, items.length * 20);
      const fillPct = Math.min(100, Math.round((totalQty / maxEstimatedCapacity) * 100));

      let progressColor = 'linear-gradient(90deg, #10b981, #059669)';
      if (fillPct <= 20) {
        progressColor = 'linear-gradient(90deg, #ef4444, #dc2626)';
      } else if (fillPct <= 50) {
        progressColor = 'linear-gradient(90deg, #eab308, #d97706)';
      }

      const isActive = currentCat.toLowerCase() === c.key.toLowerCase();

      return `
        <div class="inv-cat-box ${isActive ? 'active' : ''}" data-category="${c.key}">
          <div class="inv-cat-header">
            <span class="inv-cat-title">${c.icon} ${c.label}</span>
            <span class="inv-cat-count">${totalQty}</span>
          </div>
          <div class="inv-cat-val">₹${totalVal.toLocaleString('en-IN')} Stock Val</div>
          <div class="inv-progress-track">
            <div class="inv-progress-fill" style="width: ${fillPct}%; background: ${progressColor};"></div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderInventory() {
    const inventory = DB.getInventory();
    const container = document.getElementById('crm-inventory-table-body');
    const elVal = document.getElementById('inv-metric-value');
    const elQty = document.getElementById('inv-metric-qty');
    const elAlerts = document.getElementById('inv-metric-alerts');

    if (!container) return;

    // Render Category Boxes Cards
    this.renderCategoryBoxes(inventory);

    // Calculate Summary Metrics
    let totalVal = 0;
    let totalUnits = 0;
    let alertCount = 0;

    inventory.forEach(i => {
      const q = parseInt(i.stockQty) || 0;
      const p = parseFloat(i.price) || 0;
      const minA = parseInt(i.minAlertQty) || 2;
      
      if (i.category !== 'Labor' && i.category !== 'AMC') {
        totalVal += (q * p);
        totalUnits += q;
      }
      if (q <= minA && i.category !== 'Labor' && i.category !== 'AMC') {
        alertCount++;
      }
    });

    if (elVal) elVal.innerText = `₹${totalVal.toLocaleString('en-IN')}`;
    if (elQty) elQty.innerText = `${totalUnits.toLocaleString('en-IN')} Units`;
    if (elAlerts) elAlerts.innerText = `${alertCount} Items`;

    const normalize = str => (str || '').toString().toLowerCase().trim();

    // Filter Items
    let filtered = inventory.filter(item => {
      if (this.invFilters.search) {
        const s = normalize(this.invFilters.search);
        const match = normalize(item.name).includes(s) ||
                      normalize(item.hsn).includes(s) ||
                      normalize(item.supplierParty).includes(s) ||
                      normalize(item.category).includes(s) ||
                      normalize(item.serialNumbers).includes(s);
        if (!match) return false;
      }

      if (this.invFilters.category !== 'all') {
        if (normalize(item.category) !== normalize(this.invFilters.category)) return false;
      }

      if (this.invFilters.status !== 'all') {
        const q = parseInt(item.stockQty) || 0;
        const minA = parseInt(item.minAlertQty) || 2;

        if (this.invFilters.status === 'instock' && q <= minA) return false;
        if (this.invFilters.status === 'lowstock' && (q > minA || q === 0)) return false;
        if (this.invFilters.status === 'outofstock' && q > 0) return false;
      }

      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--text-muted); padding: 2rem;">No products match current stock filters.</td></tr>`;
      return;
    }

    container.innerHTML = filtered.map(item => {
      const q = parseInt(item.stockQty) || 0;
      const minA = parseInt(item.minAlertQty) || 2;
      const isLabor = item.category === 'Labor' || item.category === 'AMC';

      let statusBadge = '<span class="badge badge-success">In Stock ✅</span>';
      if (isLabor) {
        statusBadge = '<span class="badge badge-primary">Service / Labor 🛠️</span>';
      } else if (q === 0) {
        statusBadge = '<span class="badge badge-danger" style="background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid #ef4444;">Out of Stock ❌</span>';
      } else if (q <= minA) {
        statusBadge = `<span class="badge badge-warning" style="background: rgba(234, 179, 8, 0.2); color: #eab308; border: 1px solid #eab308;">Low Stock ⚠️ (${q} Left)</span>`;
      }

      return `
        <tr>
          <td>
            <strong style="color: #fff;">${item.name}</strong>
            <br><span class="badge badge-primary" style="font-size: 0.7rem; padding: 0.15rem 0.4rem;">${item.category}</span>
            <span style="font-size: 0.75rem; color: var(--primary); margin-left: 0.35rem;">HSN: ${item.hsn || '85258090'}</span>
          </td>
          <td>
            <strong style="color: var(--text-secondary); font-size: 0.85rem;">🏢 ${item.supplierParty || 'Direct Party'}</strong>
          </td>
          <td>
            <span style="font-size: 0.75rem; color: var(--accent);">SN: ${item.serialNumbers || 'N/A'}</span>
            <br><span style="font-size: 0.725rem; color: var(--text-muted);">${item.specs || ''}</span>
          </td>
          <td>
            <strong style="color: var(--warning); font-size: 0.95rem;">₹${(item.purchasePrice || 0).toLocaleString('en-IN')}</strong>
          </td>
          <td>
            <strong style="color: var(--primary); font-size: 1.05rem;">₹${(item.price || 0).toLocaleString('en-IN')}</strong> / ${item.unit || 'Pc'}
          </td>
          <td>
            <strong style="font-size: 1.1rem; color: #fff;">${isLabor ? 'Unlimited' : q + ' ' + (item.unit || 'Pcs')}</strong>
            <br>${statusBadge}
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <button class="btn btn-secondary btn-sm btn-delete-inv" data-id="${item.id}" style="color: var(--danger); padding: 0.25rem 0.4rem; font-size: 0.75rem;">
              🗑️
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  voucherRows: [],

  setupStockTabListeners() {
    document.addEventListener('click', (e) => {
      const invTabBtn = e.target ? e.target.closest('[data-inv-tab]') : null;
      if (invTabBtn) {
        const tab = invTabBtn.dataset.invTab;
        document.querySelectorAll('[data-inv-tab]').forEach(b => b.classList.remove('active'));
        invTabBtn.classList.add('active');

        document.querySelectorAll('.inv-tab-content').forEach(c => c.style.display = 'none');
        const targetTab = document.getElementById(`inv-tab-${tab}`);
        if (targetTab) targetTab.style.display = 'block';

        if (tab === 'purchase-history') this.renderPurchasesHistory();
        if (tab === 'stock-ledger') this.renderStockLedger();
        if (tab === 'current-stock') this.renderInventory();
      }

      if (e.target && (e.target.id === 'btn-add-voucher-row' || e.target.closest('#btn-add-voucher-row'))) {
        this.addVoucherRow();
      }

      if (e.target && e.target.classList.contains('btn-remove-voucher-row')) {
        const idx = parseInt(e.target.dataset.index);
        this.removeVoucherRow(idx);
      }

      if (e.target && (e.target.id === 'btn-save-purchase-voucher' || e.target.closest('#btn-save-purchase-voucher'))) {
        this.savePurchaseVoucherForm();
      }

      if (e.target && e.target.classList.contains('btn-delete-pur')) {
        const purId = e.target.dataset.id;
        if (confirm('Are you sure you want to delete this purchase voucher record?')) {
          DB.deletePurchaseVoucher(purId);
          window.showToast('Deleted purchase voucher record!', 'info');
          this.renderPurchasesHistory();
        }
      }
    });

    document.addEventListener('input', (e) => {
      if (e.target && e.target.id === 'filter-pur-search') {
        this.renderPurchasesHistory();
      }
    });
  },

  openAddInventoryModal() {
    const modal = document.getElementById('modal-add-inventory');
    if (!modal) return;

    const dateInput = document.getElementById('pur-bill-date');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    const billNoInput = document.getElementById('pur-bill-no');
    if (billNoInput) billNoInput.value = 'INV-ADI-' + Math.floor(1000 + Math.random() * 9000);

    this.voucherRows = [
      { id: 'p1', name: 'CP Plus 2MP Full HD Indoor Dome Camera', category: 'Camera', hsn: '85258090', purchasePrice: 1050, price: 1450, qty: 10, serialNumbers: 'SN-CPP-2026-101' },
      { id: 'p5', name: 'CP Plus 4-Channel HD DVR', category: 'DVR/NVR', hsn: '84718000', purchasePrice: 2150, price: 2900, qty: 5, serialNumbers: 'DVR-CPP-4CH-771' }
    ];

    this.renderVoucherRows();
    modal.classList.add('active');
  },

  addVoucherRow() {
    this.voucherRows.push({
      name: '',
      category: 'Camera',
      hsn: '85258090',
      purchasePrice: 0,
      price: 0,
      qty: 1,
      serialNumbers: ''
    });
    this.renderVoucherRows();
  },

  removeVoucherRow(index) {
    this.voucherRows.splice(index, 1);
    this.renderVoucherRows();
  },

  renderVoucherRows() {
    const container = document.getElementById('pur-voucher-rows-tbody');
    const lblItems = document.getElementById('lbl-voucher-total-items');
    const lblTotal = document.getElementById('lbl-voucher-grand-total');

    if (!container) return;

    let grandTotal = 0;
    let totalItemsCount = 0;

    container.innerHTML = this.voucherRows.map((row, idx) => {
      const rowTotal = (parseFloat(row.purchasePrice) || 0) * (parseInt(row.qty) || 0);
      grandTotal += rowTotal;
      totalItemsCount += (parseInt(row.qty) || 0);

      return `
        <tr>
          <td>
            <input type="text" class="form-control pur-row-name" data-index="${idx}" value="${row.name}" placeholder="e.g. Hikvision 5MP Bullet Camera" style="padding: 0.3rem 0.5rem; font-size: 0.85rem;">
          </td>
          <td>
            <select class="form-select pur-row-cat" data-index="${idx}" style="padding: 0.3rem 0.5rem; font-size: 0.825rem;">
              <option value="Camera" ${row.category === 'Camera' ? 'selected' : ''}>Camera</option>
              <option value="DVR/NVR" ${row.category === 'DVR/NVR' ? 'selected' : ''}>DVR/NVR</option>
              <option value="Storage" ${row.category === 'Storage' ? 'selected' : ''}>Storage</option>
              <option value="Power Supply" ${row.category === 'Power Supply' ? 'selected' : ''}>Power Supply</option>
              <option value="Cabling" ${row.category === 'Cabling' ? 'selected' : ''}>Cabling</option>
              <option value="Accessory" ${row.category === 'Accessory' ? 'selected' : ''}>Accessory</option>
            </select>
          </td>
          <td>
            <input type="text" class="form-control pur-row-hsn" data-index="${idx}" value="${row.hsn || '85258090'}" style="padding: 0.3rem 0.5rem; font-size: 0.825rem;">
          </td>
          <td>
            <input type="number" class="form-control pur-row-cost" data-index="${idx}" value="${row.purchasePrice}" placeholder="Cost (₹)" style="padding: 0.3rem 0.5rem; font-size: 0.85rem;">
          </td>
          <td>
            <input type="number" class="form-control pur-row-price" data-index="${idx}" value="${row.price}" placeholder="Selling (₹)" style="padding: 0.3rem 0.5rem; font-size: 0.85rem;">
          </td>
          <td>
            <input type="number" class="form-control pur-row-qty" data-index="${idx}" value="${row.qty}" min="1" style="padding: 0.3rem 0.5rem; font-size: 0.85rem; width: 60px;">
          </td>
          <td>
            <input type="text" class="form-control pur-row-serials" data-index="${idx}" value="${row.serialNumbers || ''}" placeholder="Serial / Specs" style="padding: 0.3rem 0.5rem; font-size: 0.825rem;">
          </td>
          <td>
            <button class="btn btn-secondary btn-sm btn-remove-voucher-row" data-index="${idx}" style="color: var(--danger); padding: 0.2rem 0.4rem;">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');

    if (lblItems) lblItems.innerText = `${totalItemsCount} Units`;
    if (lblTotal) lblTotal.innerText = `₹${grandTotal.toLocaleString('en-IN')}`;

    container.querySelectorAll('input, select').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index);
        if (isNaN(idx) || !this.voucherRows[idx]) return;

        if (e.target.classList.contains('pur-row-name')) this.voucherRows[idx].name = e.target.value;
        if (e.target.classList.contains('pur-row-cat')) this.voucherRows[idx].category = e.target.value;
        if (e.target.classList.contains('pur-row-hsn')) this.voucherRows[idx].hsn = e.target.value;
        if (e.target.classList.contains('pur-row-cost')) this.voucherRows[idx].purchasePrice = parseFloat(e.target.value) || 0;
        if (e.target.classList.contains('pur-row-price')) this.voucherRows[idx].price = parseFloat(e.target.value) || 0;
        if (e.target.classList.contains('pur-row-qty')) this.voucherRows[idx].qty = parseInt(e.target.value) || 1;
        if (e.target.classList.contains('pur-row-serials')) this.voucherRows[idx].serialNumbers = e.target.value;

        let gTotal = 0;
        let tItems = 0;
        this.voucherRows.forEach(r => {
          gTotal += (parseFloat(r.purchasePrice) || 0) * (parseInt(r.qty) || 0);
          tItems += (parseInt(r.qty) || 0);
        });
        if (lblItems) lblItems.innerText = `${tItems} Units`;
        if (lblTotal) lblTotal.innerText = `₹${gTotal.toLocaleString('en-IN')}`;
      });
    });
  },

  savePurchaseVoucherForm() {
    const party = document.getElementById('pur-supplier-party')?.value || 'Direct Supplier';
    const billNo = document.getElementById('pur-bill-no')?.value || ('BILL-' + Date.now());
    const date = document.getElementById('pur-bill-date')?.value || new Date().toISOString().split('T')[0];

    const validItems = this.voucherRows.filter(r => r.name && r.name.trim() !== '');

    if (validItems.length === 0) {
      window.showToast('Please add at least 1 product name in the purchase table!', 'warning');
      return;
    }

    const totalAmount = validItems.reduce((sum, r) => sum + ((parseFloat(r.purchasePrice) || 0) * (parseInt(r.qty) || 0)), 0);

    const voucher = {
      billNo: billNo,
      date: date,
      supplierParty: party,
      totalAmount: totalAmount,
      items: validItems
    };

    DB.savePurchaseVoucher(voucher);

    const modal = document.getElementById('modal-add-inventory');
    if (modal) modal.classList.remove('active');

    window.showToast(`Saved Purchase Voucher #${billNo} & updated physical stock inventory!`, 'success');

    this.renderInventory();
    this.renderPurchasesHistory();
    this.renderStockLedger();
    if (window.QuotationEngine) window.QuotationEngine.populateProductSelector();
  },

  renderPurchasesHistory() {
    const purchases = DB.getPurchases();
    const container = document.getElementById('purchases-history-tbody');
    const elVal = document.getElementById('pur-metric-total-val');
    const elCount = document.getElementById('pur-metric-count');
    const searchVal = (document.getElementById('filter-pur-search')?.value || '').toLowerCase();

    if (!container) return;

    const totalVal = purchases.reduce((sum, p) => sum + (parseFloat(p.totalAmount) || 0), 0);
    if (elVal) elVal.innerText = `₹${totalVal.toLocaleString('en-IN')}`;
    if (elCount) elCount.innerText = `${purchases.length} Vouchers`;

    let filtered = purchases.filter(p => {
      if (!searchVal) return true;
      return (p.supplierParty || '').toLowerCase().includes(searchVal) ||
             (p.billNo || '').toLowerCase().includes(searchVal) ||
             (p.date || '').toLowerCase().includes(searchVal);
    });

    if (filtered.length === 0) {
      container.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-muted); padding: 2rem;">No purchase invoice vouchers recorded yet.</td></tr>`;
      return;
    }

    container.innerHTML = filtered.map(p => {
      const itemsCount = (p.items || []).reduce((sum, i) => sum + (parseInt(i.qty) || 0), 0);

      return `
        <tr>
          <td><strong style="color: #fff;">${p.date}</strong></td>
          <td><span class="badge badge-primary" style="font-family: monospace;">${p.billNo}</span></td>
          <td><strong style="color: var(--primary);">${p.supplierParty}</strong></td>
          <td><span class="badge badge-success">${itemsCount} Items</span></td>
          <td><strong style="color: var(--accent); font-size: 1.05rem;">₹${parseFloat(p.totalAmount || 0).toLocaleString('en-IN')}</strong></td>
          <td style="text-align: right;">
            <button class="btn btn-secondary btn-sm btn-delete-pur" data-id="${p.id}" style="color: var(--danger); padding: 0.25rem 0.5rem; font-size: 0.75rem;">
              🗑️ Delete
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderStockLedger() {
    const ledger = DB.getStockLedger();
    const container = document.getElementById('stock-ledger-tbody');
    if (!container) return;

    if (ledger.length === 0) {
      container.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--text-muted); padding: 2rem;">No stock movement entries recorded yet.</td></tr>`;
      return;
    }

    container.innerHTML = ledger.map(l => {
      const isInward = (l.type || '').includes('INWARD');
      const badgeStyle = isInward ? 'background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid #10b981;' : 'background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid #ef4444;';

      return `
        <tr>
          <td><span style="color: var(--text-secondary); font-size: 0.85rem;">${l.date}</span></td>
          <td><strong style="color: #fff;">${l.itemName}</strong></td>
          <td><span class="badge" style="${badgeStyle}">${l.type}</span></td>
          <td><span style="font-family: monospace; font-size: 0.8rem; color: var(--text-muted);">${l.refNo}</span></td>
          <td><strong style="color: ${isInward ? '#10b981' : '#ef4444'};">${isInward ? '+' : '-'}${l.qty}</strong></td>
          <td><strong>₹${parseFloat(l.rate || 0).toLocaleString('en-IN')}</strong></td>
          <td><span style="color: var(--primary);">${l.party || 'N/A'}</span></td>
        </tr>
      `;
    }).join('');
  }
};

AdminCRM.init();
window.AdminCRM = AdminCRM;
