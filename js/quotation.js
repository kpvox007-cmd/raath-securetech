/* ==========================================================================
   RAATH SECURETECH - QUOTATION ENGINE & INVOICE / BILL GENERATOR
   Location: Janak Singh Pura, Neemrana | Contact: +91 9928660353
   ========================================================================== */

const QuotationEngine = {
  selectedItems: [],
  sameInstallation: false,
  docType: 'quote', // 'quote' or 'tax_invoice'
  gstEnabled: true,
  discount: 0,
  currentQuotation: null,

  init() {
    this.renderProductSelector();
    this.setupEventListeners();
    this.loadLatestQuoteIfAvailable();
    this.updateSavedCount();
  },

  loadLatestQuoteIfAvailable() {
    const quotes = DB.getQuotations();
    if (quotes && quotes.length > 0) {
      this.loadSavedQuoteIntoBuilder(quotes[0].id);
    }
  },

  updateSavedCount() {
    const quotes = DB.getQuotations();
    const countEl = document.getElementById('lbl-saved-quotes-count');
    if (countEl) countEl.innerText = quotes.length;
  },

  renderProductSelector() {
    const container = document.getElementById('quote-product-selector');
    if (!container) return;

    const products = DB.getInventory();
    const categories = [...new Set(products.map(p => p.category))];

    let html = `
      <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.5rem;">
        
        <!-- Pre-defined Product Selector -->
        <div style="margin-bottom: 1rem;">
          <label class="form-label">1. Choose Product From Stock Inventory (Live HSN & Stock)</label>
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <select id="select-product-dropdown" class="form-select" style="flex: 1; min-width: 250px;">
              <option value="">-- Choose CCTV Camera / DVR / Cable / Power Supply / Storage --</option>
              ${categories.map(cat => `
                <optgroup label="--- ${cat} ---">
                  ${products.filter(p => p.category === cat).map(p => {
                    const isLabor = p.category === 'Labor' || p.category === 'AMC';
                    const stockTag = isLabor ? 'Available' : (p.stockQty > 0 ? `${p.stockQty} In Stock` : '⚠️ OUT OF STOCK');
                    return `
                      <option value="${p.id}">${p.name} (HSN: ${p.hsn || '85258090'}) — ₹${p.price.toLocaleString('en-IN')} [${stockTag}]</option>
                    `;
                  }).join('')}
                </optgroup>
              `).join('')}
            </select>
            <button id="btn-add-product" class="btn btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add Selected
            </button>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 1rem; margin: 1rem 0; color: var(--text-muted); font-size: 0.8rem;">
          <hr style="flex: 1; border-color: var(--border-light);">
          <span>OR TYPE ANY CUSTOM PRODUCT (FROM GOOGLE / CATALOG)</span>
          <hr style="flex: 1; border-color: var(--border-light);">
        </div>

        <!-- Custom Product Input (Google Search / Any Brand) -->
        <div>
          <label class="form-label">2. Add Any Custom Item (Editable Name & Rate)</label>
          <div class="custom-prod-row">
            <input type="text" id="custom-prod-name" class="form-control" placeholder="Product Name (e.g. Hikvision 4MP DarkFighter Dome)">
            <input type="number" id="custom-prod-price" class="form-control" placeholder="Price (₹)" min="0">
            <input type="number" id="custom-prod-qty" class="form-control" value="1" min="1">
            <button id="btn-add-custom-product" class="btn btn-whatsapp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              + Add Custom
            </button>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Default pre-loaded items for quick start
    if (this.selectedItems.length === 0) {
      const defaultP1 = products.find(p => p.id === 'p2'); // 5MP Bullet
      const defaultP2 = products.find(p => p.id === 'p5'); // DVR
      const defaultP3 = products.find(p => p.id === 'p8'); // HDD 1TB
      const defaultP4 = products.find(p => p.id === 'p11'); // Power Supply
      const defaultP5 = products.find(p => p.id === 'p16'); // Installation
      if (defaultP1) this.addItem(defaultP1.id, 4);
      if (defaultP2) this.addItem(defaultP2.id, 1);
      if (defaultP3) this.addItem(defaultP3.id, 1);
      if (defaultP4) this.addItem(defaultP4.id, 1);
      if (defaultP5) this.addItem(defaultP5.id, 4);
    }
  },

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      // Add Pre-defined Product
      if (e.target && e.target.id === 'btn-add-product') {
        const select = document.getElementById('select-product-dropdown');
        if (select && select.value) {
          this.addItem(select.value, 1);
        } else {
          window.showToast('Please select a product from the list first.', 'warning');
        }
      }

      // Add Custom Product
      if (e.target && e.target.id === 'btn-add-custom-product') {
        const nameInput = document.getElementById('custom-prod-name');
        const priceInput = document.getElementById('custom-prod-price');
        const qtyInput = document.getElementById('custom-prod-qty');

        const name = nameInput ? nameInput.value.trim() : '';
        const price = priceInput ? parseFloat(priceInput.value) || 0 : 0;
        const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

        if (!name) {
          window.showToast('Please type a product name.', 'warning');
          return;
        }

        this.addCustomItem(name, price, qty);
        nameInput.value = '';
        priceInput.value = '';
        qtyInput.value = '1';
        window.showToast(`Added '${name}' to list!`, 'success');
      }

      // Remove Line Item
      if (e.target && e.target.classList.contains('remove-quote-item')) {
        const itemId = e.target.dataset.id;
        this.removeItem(itemId);
      }

      // Save Quote / Bill explicitly to History (creates fresh copy)
      if (e.target && (e.target.id === 'btn-save-quote-history' || e.target.closest('#btn-save-quote-history'))) {
        this.saveCurrentQuotation(false, true);
      }

      // Reset to New Blank Quotation
      if (e.target && (e.target.id === 'btn-new-quote' || e.target.closest('#btn-new-quote'))) {
        this.resetToNewQuotation();
      }

      // Open Saved Quotes Archive Modal
      if (e.target && (e.target.id === 'btn-open-saved-quotes' || e.target.closest('#btn-open-saved-quotes'))) {
        this.openSavedQuotesModal();
      }

      // Saved Quotes Modal Actions: View, Load, Delete, WhatsApp
      if (e.target && e.target.classList.contains('btn-action-view-saved')) {
        const qId = e.target.dataset.id;
        this.previewSavedQuote(qId);
      }
      if (e.target && e.target.classList.contains('btn-action-load-saved')) {
        const qId = e.target.dataset.id;
        this.loadSavedQuoteIntoBuilder(qId);
      }
      if (e.target && e.target.classList.contains('btn-action-delete-saved')) {
        const qId = e.target.dataset.id;
        this.deleteSavedQuote(qId);
      }
      if (e.target && e.target.classList.contains('btn-action-wa-saved')) {
        const qId = e.target.dataset.id;
        this.sendSavedQuoteViaWhatsApp(qId);
      }

      // Preview / Generate Invoice
      if (e.target && e.target.id === 'btn-preview-quote') {
        this.generateAndPreviewQuotation();
      }

      // Send via WhatsApp
      if (e.target && e.target.id === 'btn-send-whatsapp-quote') {
        this.sendQuotationViaWhatsApp();
      }

      // Download Invoice Photo PNG
      if (e.target && (e.target.id === 'btn-download-invoice-photo' || e.target.closest('#btn-download-invoice-photo'))) {
        this.downloadInvoicePhoto();
      }

      // Direct WhatsApp PDF Sharing
      if (e.target && (e.target.id === 'btn-share-whatsapp-pdf' || e.target.closest('#btn-share-whatsapp-pdf'))) {
        this.shareOrSendWhatsAppPDF();
      }

      // Direct WhatsApp Image Sharing
      if (e.target && (e.target.id === 'btn-share-whatsapp-image' || e.target.closest('#btn-share-whatsapp-image'))) {
        this.shareOrSendWhatsAppImage();
      }

      // Print / PDF Download Invoice
      if (e.target && e.target.id === 'btn-print-quote') {
        this.printQuotation();
      }
    });

    // Listen to inline editing of Item Name, Price, and Quantity in table
    document.addEventListener('change', (e) => {
      if (e.target && e.target.classList.contains('qty-input')) {
        const id = e.target.dataset.id;
        const newQty = parseInt(e.target.value) || 1;
        this.updateQty(id, newQty);
      }

      if (e.target && e.target.classList.contains('item-price-input')) {
        const id = e.target.dataset.id;
        const newPrice = parseFloat(e.target.value) || 0;
        this.updatePrice(id, newPrice);
      }

      if (e.target && e.target.classList.contains('item-name-input')) {
        const id = e.target.dataset.id;
        const newName = e.target.value.trim();
        this.updateName(id, newName);
      }

      if (e.target && e.target.id === 'quote-gst-toggle') {
        this.gstEnabled = e.target.checked;
        this.calculateTotals();
      }

      if (e.target && e.target.id === 'quote-installation-toggle') {
        this.sameInstallation = e.target.checked;
        this.calculateTotals();
      }

      if (e.target && e.target.id === 'quote-doc-type') {
        this.docType = e.target.value;
        const gstinBox = document.getElementById('box-gstin-fields');
        if (gstinBox) {
          gstinBox.style.display = (this.docType === 'tax_invoice' || this.gstEnabled) ? 'block' : 'none';
        }
        this.calculateTotals();
      }
    });

    document.addEventListener('input', (e) => {
      if (e.target && e.target.id === 'quote-discount-input') {
        this.discount = parseFloat(e.target.value) || 0;
        this.calculateTotals();
      }

      if (e.target && (e.target.classList.contains('item-name-input') || e.target.classList.contains('item-price-input'))) {
        const id = e.target.dataset.id;
        if (e.target.classList.contains('item-price-input')) {
          this.updatePrice(id, parseFloat(e.target.value) || 0, false);
        }
        if (e.target.classList.contains('item-name-input')) {
          this.updateName(id, e.target.value, false);
        }
      }
    });
  },

  getAllItems() {
    if (this.sameInstallation) {
      return this.selectedItems.concat(this.selectedItems.map(item => ({
        ...item,
        id: item.id + '-inst',
        name: item.name + ' (Installation)'
      })));
    }
    return this.selectedItems;
  },

  addItem(productId, qty = 1) {
    const products = DB.getInventory();
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const existing = this.selectedItems.find(item => item.id === productId);
    if (existing) {
      existing.qty += qty;
      existing.total = existing.qty * existing.price;
    } else {
      this.selectedItems.push({
        id: prod.id,
        name: prod.name,
        category: prod.category,
        price: prod.price,
        unit: prod.unit,
        qty: qty,
        total: prod.price * qty
      });
    }

    this.renderItemsTable();
    this.calculateTotals();
  },

  addCustomItem(name, price, qty = 1) {
    const customId = 'cust-prod-' + Date.now();
    this.selectedItems.push({
      id: customId,
      name: name,
      category: 'Custom Product',
      price: price,
      unit: 'Pc',
      qty: qty,
      total: price * qty
    });

    this.renderItemsTable();
    this.calculateTotals();
  },

  removeItem(productId) {
    this.selectedItems = this.selectedItems.filter(item => item.id !== productId);
    this.renderItemsTable();
    this.calculateTotals();
  },

  updateQty(productId, qty) {
    const item = this.selectedItems.find(i => i.id === productId);
    if (item) {
      item.qty = Math.max(1, qty);
      item.total = item.qty * item.price;
    }
    this.renderItemsTable();
    this.calculateTotals();
  },

  updatePrice(productId, newPrice, reRender = true) {
    const item = this.selectedItems.find(i => i.id === productId);
    if (item) {
      item.price = Math.max(0, newPrice);
      item.total = item.qty * item.price;
    }
    if (reRender) this.renderItemsTable();
    this.calculateTotals();
  },

  updateName(productId, newName, reRender = true) {
    const item = this.selectedItems.find(i => i.id === productId);
    if (item && newName) {
      item.name = newName;
    }
    if (reRender) this.renderItemsTable();
  },

  renderItemsTable() {
    const tbody = document.getElementById('quote-items-tbody');
    if (!tbody) return;

    if (this.selectedItems.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">No items selected. Add products above to start building your quote or bill.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.selectedItems.map(item => `
      <tr>
        <td>
          <input type="text" class="item-name-input form-control" data-id="${item.id}" value="${item.name}" style="padding: 0.35rem 0.5rem; font-weight: 600; font-size: 0.875rem; background: rgba(0,0,0,0.4);">
          <span style="font-size: 0.7rem; color: var(--text-muted);">${item.category}</span>
        </td>
        <td>
          <input type="number" class="item-price-input form-control" data-id="${item.id}" value="${item.price}" style="width: 100px; padding: 0.35rem 0.5rem; text-align: right;" min="0">
        </td>
        <td>
          <input type="number" class="qty-input form-control" data-id="${item.id}" value="${item.qty}" min="1" style="width: 70px; text-align: center;">
        </td>
        <td style="font-weight: 700; color: var(--primary); vertical-align: middle;">₹${item.total.toLocaleString('en-IN')}</td>
        <td style="vertical-align: middle;">
          <button class="btn btn-secondary btn-sm remove-quote-item" data-id="${item.id}" style="color: var(--danger); padding: 0.2rem 0.5rem;" title="Remove Item">✕</button>
        </td>
      </tr>
    `).join('');
  },

  calculateTotals() {
    const items = this.getAllItems();
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const gstAmount = this.gstEnabled ? Math.round(subtotal * 0.18) : 0;
    const cgst = this.gstEnabled ? Math.round(gstAmount / 2) : 0;
    const sgst = this.gstEnabled ? (gstAmount - cgst) : 0;
    const grandTotal = Math.max(0, subtotal + gstAmount - this.discount);

    const lblSub = document.getElementById('lbl-quote-subtotal');
    const lblGst = document.getElementById('lbl-quote-gst');
    const lblGrand = document.getElementById('lbl-quote-grandtotal');

    if (lblSub) lblSub.innerText = `₹${subtotal.toLocaleString('en-IN')}`;
    if (lblGst) lblGst.innerText = `₹${gstAmount.toLocaleString('en-IN')}`;
    if (lblGrand) lblGrand.innerText = `₹${grandTotal.toLocaleString('en-IN')}`;

    return { subtotal, gstAmount, cgst, sgst, discount: this.discount, grandTotal };
  },

  generateAndPreviewQuotation() {
    const custName = document.getElementById('quote-cust-name')?.value || 'Valued Customer';
    const custPhone = document.getElementById('quote-cust-phone')?.value || '9928660353';
    const custLoc = document.getElementById('quote-cust-loc')?.value || 'Janak Singh Pura, Neemrana';

    const firmName = document.getElementById('quote-firm-name')?.value || 'RAATH SECURETECH';
    const firmGstin = document.getElementById('quote-firm-gstin')?.value || '08AAAFR9928C1Z3';
    const custFirm = document.getElementById('quote-cust-firm')?.value || custName;
    const custGstin = document.getElementById('quote-cust-gstin')?.value || 'N/A (Unregistered)';

    this.docType = document.getElementById('quote-doc-type')?.value || 'quote';

    if (this.selectedItems.length === 0) {
      window.showToast('Please add at least one camera or accessory item.', 'warning');
      return;
    }

    const allItems = this.getAllItems();
    const totals = this.calculateTotals();

    const prefix = this.docType === 'tax_invoice' ? 'RST-INV-' : 'RST-Q-';
    let refId;
    if (this.currentQuotation && this.currentQuotation.id) {
      refId = this.currentQuotation.id;
    } else {
      const existingQuotes = DB.getQuotations();
      const match = existingQuotes.find(q => {
        const sameName = (q.customerName || '').trim().toLowerCase() === custName.trim().toLowerCase();
        const samePhone = custPhone ? (q.customerPhone || '').trim().toLowerCase() === custPhone.trim().toLowerCase() : true;
        return sameName && samePhone;
      });
      refId = match ? match.id : (prefix + Math.floor(100000 + Math.random() * 900000));
    }
    const today = new Date().toISOString().split('T')[0];

    const isTaxBill = this.docType === 'tax_invoice';
    const docTitle = isTaxBill ? 'OFFICIAL TAX INVOICE / BILL' : 'OFFICIAL ESTIMATE & QUOTATION';

    const quoteObj = {
      id: refId,
      docType: this.docType,
      firmName: firmName,
      firmGstin: firmGstin,
      customerName: custName,
      customerFirm: custFirm,
      customerGstin: custGstin,
      customerPhone: custPhone,
      customerLocation: custLoc,
      date: today,
      items: allItems,

      subtotal: totals.subtotal,
      gstAmount: totals.gstAmount,
      cgst: totals.cgst,
      sgst: totals.sgst,
      includeGst: this.gstEnabled,
      discount: totals.discount,
      grandTotal: totals.grandTotal
    };

    this.currentQuotation = DB.saveQuotation(quoteObj);

    if (this.docType === 'tax_invoice') {
      DB.deductStockForInvoice(allItems);
    }

    // Render Printable Modal Content
    const container = document.getElementById('invoice-render-area');
    if (container) {
      container.innerHTML = `
        <div class="invoice-container" id="printable-invoice">
          <div class="invoice-header">
            <div class="invoice-company">
              <h2>🛡️ ${firmName}</h2>
              <p><strong>CCTV Sales, Installation & AMC Services</strong></p>
              <p>📍 Main Market, Janak Singh Pura, Neemrana, Rajasthan - 301705</p>
              <p>📞 Phone / WhatsApp: +91 9928660353 | Email: contact@raathsecuretech.in</p>
              ${this.gstEnabled || isTaxBill ? `<p style="color: #0284c7; font-weight: 700; margin-top: 0.25rem;">FIRM GSTIN: ${firmGstin}</p>` : ''}
            </div>
            <div class="invoice-meta">
              <h3 style="color: ${isTaxBill ? '#16a34a' : '#0284c7'}; font-size: 1.2rem;">${docTitle}</h3>
              <p><strong>Ref / Bill No:</strong> ${refId}</p>
              <p><strong>Date:</strong> ${today}</p>
              <p><strong>Status:</strong> ${isTaxBill ? 'INSTALLED & BILLED ✅' : 'Valid 15 Days'}</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <div>
              <p style="color: #64748b; font-size: 0.75rem; text-transform: uppercase;">BILLED TO / CUSTOMER</p>
              <p><strong>Client / Firm:</strong> ${custFirm}</p>
              <p><strong>Contact Person:</strong> ${custName}</p>
              <p><strong>Phone:</strong> ${custPhone}</p>
            </div>
            <div>
              <p style="color: #64748b; font-size: 0.75rem; text-transform: uppercase;">SITE & TAX DETAILS</p>
              <p><strong>Site Address:</strong> ${custLoc}</p>
              ${isTaxBill || custGstin !== 'N/A (Unregistered)' ? `<p><strong>Buyer GSTIN:</strong> ${custGstin}</p>` : ''}
            </div>
          </div>

          <table class="invoice-table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Price (₹)</th>
                <th>Qty</th>
                <th>Total Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${allItems.map(item => `
                <tr>
                  <td><strong>${item.name}</strong></td>
                  <td>₹${item.price.toLocaleString('en-IN')}</td>
                  <td>${item.qty} ${item.unit}</td>
                  <td>₹${item.total.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="invoice-totals">
            <div><span>Taxable Subtotal:</span> <strong>₹${totals.subtotal.toLocaleString('en-IN')}</strong></div>
            ${this.gstEnabled ? `
              <div><span>CGST (9%):</span> <strong>₹${totals.cgst.toLocaleString('en-IN')}</strong></div>
              <div><span>SGST (9%):</span> <strong>₹${totals.sgst.toLocaleString('en-IN')}</strong></div>
              <div style="border-bottom: 1px dashed #cbd5e1;"><span>Total GST (18%):</span> <strong>₹${totals.gstAmount.toLocaleString('en-IN')}</strong></div>
            ` : ''}
            ${totals.discount > 0 ? `<div style="color: #10b981;"><span>Discount Off:</span> <strong>-₹${totals.discount.toLocaleString('en-IN')}</strong></div>` : ''}
            <div class="grand-total"><span>Grand Total:</span> <span>₹${totals.grandTotal.toLocaleString('en-IN')}</span></div>
          </div>

          <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; font-size: 0.8rem; color: #64748b;">
            <p><strong>Declaration & Terms:</strong></p>
            <p>1. Certified that the particulars given above are true and correct.</p>
            <p>2. Products carry 1 to 2 Years Manufacturer Warranty. Services backed by Raath SecureTech Neemrana.</p>
            <p>3. Thank you for doing business with Raath SecureTech!</p>
          </div>
        </div>
      `;
    }

    this.currentQuotation = DB.saveQuotation(quoteObj);
    this.updateSavedCount();
    if (window.AdminCRM && typeof window.AdminCRM.renderCRM === 'function') {
      window.AdminCRM.renderCRM();
    }

    // Set page title for print / save PDF
    document.title = `${custName} - ${custFirm} - ${refId} - ${today}`;

    // Open Modal
    const modal = document.getElementById('modal-quote-preview');
    if (modal) modal.classList.add('active');

    window.showToast(`${isTaxBill ? 'GST Tax Bill' : 'Quotation'} #${refId} saved & generated successfully!`, 'success');
  },

  printQuotation() {
    const invoiceEl = document.getElementById('printable-invoice');
    const custName = this.currentQuotation ? this.currentQuotation.customerName : (document.getElementById('quote-cust-name')?.value || 'Customer');
    const custFirm = this.currentQuotation ? (this.currentQuotation.customerFirm || custName) : (document.getElementById('quote-cust-firm')?.value || custName);
    const refId = this.currentQuotation ? this.currentQuotation.id : 'RST-Q-1001';
    const today = this.currentQuotation ? this.currentQuotation.date : new Date().toISOString().split('T')[0];

    const pdfTitle = `${custName} - ${custFirm} - ${refId} - ${today}`;
    const originalTitle = 'Raath SecureTech CCTV | Janak Singh Pura, Neemrana';
    document.title = pdfTitle;

    if (!invoiceEl) {
      window.print();
      setTimeout(() => { document.title = originalTitle; }, 1000);
      return;
    }

    const printWin = window.open('', '_blank', 'width=900,height=950');

    if (!printWin) {
      window.print();
      setTimeout(() => { document.title = originalTitle; }, 1000);
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${pdfTitle}</title>
        <style>
          @page { size: A4 portrait; margin: 10mm 15mm; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #ffffff !important; color: #0f172a !important; margin: 0; padding: 25px; font-size: 11pt; line-height: 1.5; }
          .invoice-container { background: #ffffff !important; color: #0f172a !important; width: 100%; border: none !important; box-shadow: none !important; padding: 0 !important; }
          .invoice-header { display: flex; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 1.25rem; margin-bottom: 1.5rem; }
          .invoice-company h2 { color: #0284c7; font-size: 1.75rem; margin: 0 0 0.4rem 0; font-weight: 800; }
          .invoice-company p { color: #475569; font-size: 0.875rem; margin: 0.2rem 0; }
          .invoice-meta { text-align: right; }
          .invoice-meta h3 { margin: 0 0 0.4rem 0; font-size: 1.25rem; }
          .invoice-meta p { margin: 0.2rem 0; font-size: 0.875rem; color: #334155; }
          .invoice-table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
          .invoice-table th { background: #f1f5f9 !important; color: #334155 !important; text-align: left; padding: 0.75rem; font-size: 0.85rem; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
          .invoice-table td { padding: 0.75rem; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 0.9rem; }
          .invoice-totals { width: 280px; margin-left: auto; margin-top: 1rem; }
          .invoice-totals div { display: flex; justify-content: space-between; padding: 0.4rem 0; color: #334155; font-size: 0.95rem; }
          .invoice-totals .grand-total { font-weight: 800; font-size: 1.3rem; color: #0284c7; border-top: 2px solid #0284c7; padding-top: 0.75rem; margin-top: 0.4rem; }
        </style>
      </head>
      <body>
        ${invoiceEl.outerHTML}
        <script>
          window.onload = function() {
            window.focus();
            window.print();
            setTimeout(function() { window.close(); }, 800);
          };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
    setTimeout(() => { document.title = originalTitle; }, 1000);
  },

  downloadInvoicePhoto() {
    const invoiceEl = document.getElementById('printable-invoice');
    if (!invoiceEl) {
      window.showToast('Please preview or generate an invoice first.', 'warning');
      return;
    }

    const custName = this.currentQuotation ? this.currentQuotation.customerName : (document.getElementById('quote-cust-name')?.value || 'Customer');
    const custFirm = this.currentQuotation ? (this.currentQuotation.customerFirm || custName) : (document.getElementById('quote-cust-firm')?.value || custName);
    const refId = this.currentQuotation ? this.currentQuotation.id : 'RST-Q-1001';
    const today = this.currentQuotation ? this.currentQuotation.date : new Date().toISOString().split('T')[0];

    const fileName = `Invoice_${custName.replace(/[^a-zA-Z0-9]/g, '_')}_${refId}_${today}.png`;

    window.showToast('Generating HD Invoice Photo image...', 'info');

    const clone = invoiceEl.cloneNode(true);
    clone.style.width = '800px';
    clone.style.padding = '25px';
    clone.style.background = '#ffffff';
    clone.style.color = '#0f172a';

    const width = 850;
    const height = Math.max(900, (invoiceEl.offsetHeight || 800) + 60);

    const svgData = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="background:#ffffff; color:#0f172a; font-family: 'Inter', system-ui, -apple-system, sans-serif; padding: 25px;">
            ${clone.outerHTML}
          </div>
        </foreignObject>
      </svg>
    `;

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width * 2;
      canvas.height = height * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const a = document.createElement('a');
      a.download = fileName;
      a.href = canvas.toDataURL('image/png');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.showToast(`📸 Downloaded ${fileName}! You can now attach/send it on WhatsApp.`, 'success');
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      window.showToast('Could not generate image. Please use "Print / Download PDF" button.', 'warning');
    };

    img.src = url;
  },

  async shareOrSendWhatsAppImage() {
    const invoiceEl = document.getElementById('printable-invoice');
    if (!invoiceEl) {
      window.showToast('Please preview or generate an invoice first.', 'warning');
      return;
    }

    const custName = this.currentQuotation ? this.currentQuotation.customerName : (document.getElementById('quote-cust-name')?.value || 'Customer');
    const custPhoneRaw = (this.currentQuotation ? this.currentQuotation.customerPhone : (document.getElementById('quote-cust-phone')?.value || '9928660353')).replace(/[^0-9]/g, '');
    const targetPhone = custPhoneRaw.length >= 10 ? (custPhoneRaw.startsWith('91') ? custPhoneRaw : '91' + custPhoneRaw.slice(-10)) : '919928660353';
    const custFirm = this.currentQuotation ? (this.currentQuotation.customerFirm || custName) : (document.getElementById('quote-cust-firm')?.value || custName);
    const refId = this.currentQuotation ? this.currentQuotation.id : 'RST-Q-1001';

    const fileName = `Invoice_${custName.replace(/[^a-zA-Z0-9]/g, '_')}_${refId}.png`;

    window.showToast('Generating HD Invoice Photo image...', 'info');

    try {
      let canvas;
      if (window.html2canvas) {
        canvas = await window.html2canvas(invoiceEl, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      }

      if (!canvas) {
        window.showToast('Image generator loading, retrying...', 'warning');
        return;
      }

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], fileName, { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: `CCTV Invoice ${refId} - Raath SecureTech`,
              text: `Greetings ${custName}, please find attached quotation photo ${refId} from Raath SecureTech Neemrana (9928660353).`,
              files: [file]
            });
            window.showToast('Shared Invoice Photo via WhatsApp!', 'success');
            return;
          } catch (err) {
            console.log('Share canceled or web fallback');
          }
        }

        const a = document.createElement('a');
        a.download = fileName;
        a.href = URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        const textMsg = `🛡️ *RAATH SECURETECH - NEEMRANA*\n*Ref No:* ${refId}\nCustomer: *${custName}* (${custFirm})\nGrand Total: *₹${(this.currentQuotation ? this.currentQuotation.grandTotal : 0).toLocaleString('en-IN')}*\n\n📸 *Invoice Photo image downloaded to your device! Drag or attach the image file directly into this WhatsApp chat.*`;
        const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(textMsg)}`;
        window.open(whatsappUrl, '_blank');

        window.showToast(`📸 Downloaded ${fileName} & opened WhatsApp! Drag or attach image into chat.`, 'success');
      }, 'image/png');
    } catch (e) {
      console.error(e);
      window.showToast('Could not convert to image.', 'warning');
    }
  },

  async shareOrSendWhatsAppPDF() {
    const invoiceEl = document.getElementById('printable-invoice');
    if (!invoiceEl) {
      window.showToast('Please preview or generate an invoice first.', 'warning');
      return;
    }

    const custName = this.currentQuotation ? this.currentQuotation.customerName : (document.getElementById('quote-cust-name')?.value || 'Customer');
    const custPhoneRaw = (this.currentQuotation ? this.currentQuotation.customerPhone : (document.getElementById('quote-cust-phone')?.value || '9928660353')).replace(/[^0-9]/g, '');
    const targetPhone = custPhoneRaw.length >= 10 ? (custPhoneRaw.startsWith('91') ? custPhoneRaw : '91' + custPhoneRaw.slice(-10)) : '919928660353';
    const custFirm = this.currentQuotation ? (this.currentQuotation.customerFirm || custName) : (document.getElementById('quote-cust-firm')?.value || custName);
    const refId = this.currentQuotation ? this.currentQuotation.id : 'RST-Q-1001';

    const fileName = `Invoice_${custName.replace(/[^a-zA-Z0-9]/g, '_')}_${refId}.pdf`;

    window.showToast('Generating official PDF file for WhatsApp...', 'info');

    try {
      let pdfBlob;

      if (window.html2canvas && window.jspdf) {
        const canvas = await window.html2canvas(invoiceEl, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(pdfHeight, 295));
        pdfBlob = pdf.output('blob');
      }

      if (!pdfBlob) {
        window.showToast('Please use "Print / Download PDF" button.', 'info');
        this.printQuotation();
        return;
      }

      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `CCTV Invoice ${refId} - Raath SecureTech`,
            text: `Greetings ${custName}, please find attached official PDF invoice ${refId} from Raath SecureTech Neemrana (9928660353).`,
            files: [file]
          });
          window.showToast('Shared PDF Invoice file via WhatsApp!', 'success');
          return;
        } catch (err) {
          console.log('Share canceled or browser fallback');
        }
      }

      const a = document.createElement('a');
      a.download = fileName;
      a.href = URL.createObjectURL(pdfBlob);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      const textMsg = `🛡️ *RAATH SECURETECH - NEEMRANA*\n*Official PDF Invoice Ref:* ${refId}\nCustomer: *${custName}* (${custFirm})\nGrand Total: *₹${(this.currentQuotation ? this.currentQuotation.grandTotal : 0).toLocaleString('en-IN')}*\n\n📄 *Official PDF Invoice downloaded to your device! Drag or attach the PDF file directly into this WhatsApp chat.*`;
      const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(textMsg)}`;
      window.open(whatsappUrl, '_blank');

      window.showToast(`📄 Downloaded ${fileName} & opened WhatsApp! Attach/drag PDF into chat.`, 'success');
    } catch (e) {
      console.error(e);
      window.showToast('Could not generate PDF file. Opening print window.', 'warning');
      this.printQuotation();
    }
  },

  saveCurrentQuotation(silent = false, forceNew = false) {
    if (this.selectedItems.length === 0) {
      if (!silent) window.showToast('Please add items to save a quotation/bill.', 'warning');
      return null;
    }

    const custName = document.getElementById('quote-cust-name')?.value || 'Valued Customer';
    const custPhone = document.getElementById('quote-cust-phone')?.value || '9928660353';
    const custLoc = document.getElementById('quote-cust-loc')?.value || 'Janak Singh Pura, Neemrana';
    const firmName = document.getElementById('quote-firm-name')?.value || 'RAATH SECURETECH';
    const firmGstin = document.getElementById('quote-firm-gstin')?.value || '08AAAFR9928C1Z3';
    const custFirm = document.getElementById('quote-cust-firm')?.value || custName;
    const custGstin = document.getElementById('quote-cust-gstin')?.value || 'N/A (Unregistered)';
    this.docType = document.getElementById('quote-doc-type')?.value || 'quote';

    const allItems = this.getAllItems();
    const totals = this.calculateTotals();

    const prefix = this.docType === 'tax_invoice' ? 'RST-INV-' : 'RST-Q-';
    let refId;
    if (!forceNew && this.currentQuotation && this.currentQuotation.id) {
      refId = this.currentQuotation.id;
    } else if (!forceNew) {
      const existingQuotes = DB.getQuotations();
      const match = existingQuotes.find(q => {
        const sameName = (q.customerName || '').trim().toLowerCase() === custName.trim().toLowerCase();
        const samePhone = custPhone ? (q.customerPhone || '').trim().toLowerCase() === custPhone.trim().toLowerCase() : true;
        return sameName && samePhone;
      });
      refId = match ? match.id : (prefix + Math.floor(100000 + Math.random() * 900000));
    } else {
      refId = prefix + Math.floor(100000 + Math.random() * 900000);
    }
    const today = new Date().toISOString().split('T')[0];

    const quoteObj = {
      id: refId,
      docType: this.docType,
      firmName: firmName,
      firmGstin: firmGstin,
      customerName: custName,
      customerFirm: custFirm,
      customerGstin: custGstin,
      customerPhone: custPhone,
      customerLocation: custLoc,
      date: today,
      items: allItems,
      subtotal: totals.subtotal,
      gstAmount: totals.gstAmount,
      cgst: totals.cgst,
      sgst: totals.sgst,
      includeGst: this.gstEnabled,
      discount: totals.discount,
      grandTotal: totals.grandTotal
    };

    const saved = DB.saveQuotation(quoteObj);
    this.currentQuotation = saved;

    if (this.docType === 'tax_invoice') {
      DB.deductStockForInvoice(allItems);
    }
    this.updateSavedCount();
    if (window.AdminCRM && typeof window.AdminCRM.renderCRM === 'function') {
      window.AdminCRM.renderCRM();
    }

    if (!silent) {
      window.showToast(`Saved copy of ${this.docType === 'tax_invoice' ? 'GST Bill' : 'Quotation'} #${refId} to history!`, 'success');
    }
    return saved;
  },

  resetToNewQuotation() {
    this.currentQuotation = null;
    this.selectedItems = [];
    this.docType = 'quote';
    this.gstEnabled = true;
    this.discount = 0;
    
    const nameEl = document.getElementById('quote-cust-name');
    const phoneEl = document.getElementById('quote-cust-phone');
    const locEl = document.getElementById('quote-cust-loc');
    const firmEl = document.getElementById('quote-cust-firm');
    const docTypeEl = document.getElementById('quote-doc-type');
    const gstToggle = document.getElementById('quote-gst-toggle');
    const discountEl = document.getElementById('quote-discount-input');

    if (nameEl) nameEl.value = 'New Customer';
    if (phoneEl) phoneEl.value = '9928660353';
    if (locEl) locEl.value = 'Janak Singh Pura, Neemrana';
    if (firmEl) firmEl.value = 'Customer Firm';
    if (docTypeEl) docTypeEl.value = 'quote';
    if (gstToggle) gstToggle.checked = true;
    if (discountEl) discountEl.value = 0;

    const products = DB.getProducts();
    const defaultP1 = products.find(p => p.id === 'p2');
    const defaultP2 = products.find(p => p.id === 'p5');
    const defaultP3 = products.find(p => p.id === 'p8');
    const defaultP4 = products.find(p => p.id === 'p11');
    const defaultP5 = products.find(p => p.id === 'p16');
    if (defaultP1) this.addItem(defaultP1.id, 4);
    if (defaultP2) this.addItem(defaultP2.id, 1);
    if (defaultP3) this.addItem(defaultP3.id, 1);
    if (defaultP4) this.addItem(defaultP4.id, 1);
    if (defaultP5) this.addItem(defaultP5.id, 4);

    this.renderItemsTable();
    this.calculateTotals();
    window.showToast('Cleared builder. Ready to create a new quotation!', 'info');
  },

  openSavedQuotesModal() {
    this.renderSavedQuotesModal();
    const modal = document.getElementById('modal-saved-quotes');
    if (modal) modal.classList.add('active');
  },

  renderSavedQuotesModal() {
    const tbody = document.getElementById('saved-quotes-modal-tbody');
    if (!tbody) return;

    const quotes = DB.getQuotations();
    this.updateSavedCount();

    if (quotes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-muted); padding: 2rem;">No saved quotations or bills found. Generate a quote or bill above to save it.</td></tr>`;
      return;
    }

    tbody.innerHTML = quotes.map(q => {
      const isBill = q.docType === 'tax_invoice';
      const badgeClass = isBill ? 'badge-success' : 'badge-primary';
      const typeLabel = isBill ? '🧾 Tax Bill' : '📋 Quotation';
      const itemCount = q.items ? q.items.length : 0;

      return `
        <tr>
          <td>
            <strong style="color: var(--primary);">${q.id}</strong>
            <br><span style="font-size: 0.75rem; color: var(--text-muted);">${q.date}</span>
          </td>
          <td><span class="badge ${badgeClass}">${typeLabel}</span></td>
          <td>
            <strong style="color: #fff;">${q.customerName}</strong> ${q.customerFirm ? `<span style="font-size: 0.8rem; color: var(--text-muted);">(${q.customerFirm})</span>` : ''}
            <br><span style="font-size: 0.78rem; color: var(--text-secondary);">📞 ${q.customerPhone} | 📍 ${q.customerLocation}</span>
            <br><span style="font-size: 0.72rem; color: var(--text-muted);">${itemCount} line item(s)</span>
          </td>
          <td>
            <strong style="color: var(--accent); font-size: 1.05rem;">₹${(q.grandTotal || 0).toLocaleString('en-IN')}</strong>
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <button class="btn btn-primary btn-sm btn-action-view-saved" data-id="${q.id}" title="View / Print Printable Invoice" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; margin-right: 0.25rem;">
              👁️ View / Print
            </button>
            <button class="btn btn-whatsapp btn-sm btn-action-wa-saved" data-id="${q.id}" title="Send via WhatsApp" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; margin-right: 0.25rem;">
              📲 WhatsApp
            </button>
            <button class="btn btn-secondary btn-sm btn-action-load-saved" data-id="${q.id}" title="Load into Builder to edit" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; margin-right: 0.25rem;">
              📋 Load
            </button>
            <button class="btn btn-secondary btn-sm btn-action-delete-saved" data-id="${q.id}" title="Delete Quote" style="color: var(--danger); padding: 0.25rem 0.4rem; font-size: 0.75rem;">
              🗑️
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  previewSavedQuote(quoteId) {
    const quotes = DB.getQuotations();
    const quoteObj = quotes.find(q => q.id === quoteId);
    if (!quoteObj) {
      window.showToast('Quotation not found.', 'warning');
      return;
    }

    this.currentQuotation = quoteObj;

    const isTaxBill = quoteObj.docType === 'tax_invoice';
    const docTitle = isTaxBill ? 'OFFICIAL TAX INVOICE / BILL' : 'OFFICIAL ESTIMATE & QUOTATION';
    const firmName = quoteObj.firmName || 'RAATH SECURETECH';
    const firmGstin = quoteObj.firmGstin || '08AAAFR9928C1Z3';

    const container = document.getElementById('invoice-render-area');
    if (container) {
      container.innerHTML = `
        <div class="invoice-container" id="printable-invoice">
          <div class="invoice-header">
            <div class="invoice-company">
              <h2>🛡️ ${firmName}</h2>
              <p><strong>CCTV Sales, Installation & AMC Services</strong></p>
              <p>📍 Main Market, Janak Singh Pura, Neemrana, Rajasthan - 301705</p>
              <p>📞 Phone / WhatsApp: +91 9928660353 | Email: contact@raathsecuretech.in</p>
              ${quoteObj.includeGst || isTaxBill ? `<p style="color: #0284c7; font-weight: 700; margin-top: 0.25rem;">FIRM GSTIN: ${firmGstin}</p>` : ''}
            </div>
            <div class="invoice-meta">
              <h3 style="color: ${isTaxBill ? '#16a34a' : '#0284c7'}; font-size: 1.2rem;">${docTitle}</h3>
              <p><strong>Ref / Bill No:</strong> ${quoteObj.id}</p>
              <p><strong>Date:</strong> ${quoteObj.date}</p>
              <p><strong>Status:</strong> ${isTaxBill ? 'INSTALLED & BILLED ✅' : 'Valid 15 Days'}</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <div>
              <p style="color: #64748b; font-size: 0.75rem; text-transform: uppercase;">BILLED TO / CUSTOMER</p>
              <p><strong>Client / Firm:</strong> ${quoteObj.customerFirm || quoteObj.customerName}</p>
              <p><strong>Contact Person:</strong> ${quoteObj.customerName}</p>
              <p><strong>Phone:</strong> ${quoteObj.customerPhone}</p>
            </div>
            <div>
              <p style="color: #64748b; font-size: 0.75rem; text-transform: uppercase;">SITE & TAX DETAILS</p>
              <p><strong>Site Address:</strong> ${quoteObj.customerLocation}</p>
              ${isTaxBill || (quoteObj.customerGstin && quoteObj.customerGstin !== 'N/A (Unregistered)') ? `<p><strong>Buyer GSTIN:</strong> ${quoteObj.customerGstin}</p>` : ''}
            </div>
          </div>

          <table class="invoice-table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Price (₹)</th>
                <th>Qty</th>
                <th>Total Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${quoteObj.items.map(item => `
                <tr>
                  <td><strong>${item.name}</strong></td>
                  <td>₹${item.price.toLocaleString('en-IN')}</td>
                  <td>${item.qty} ${item.unit || 'Pc'}</td>
                  <td>₹${item.total.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="invoice-totals">
            <div><span>Taxable Subtotal:</span> <strong>₹${(quoteObj.subtotal || 0).toLocaleString('en-IN')}</strong></div>
            ${quoteObj.includeGst ? `
              <div><span>CGST (9%):</span> <strong>₹${(quoteObj.cgst || 0).toLocaleString('en-IN')}</strong></div>
              <div><span>SGST (9%):</span> <strong>₹${(quoteObj.sgst || 0).toLocaleString('en-IN')}</strong></div>
              <div style="border-bottom: 1px dashed #cbd5e1;"><span>Total GST (18%):</span> <strong>₹${(quoteObj.gstAmount || 0).toLocaleString('en-IN')}</strong></div>
            ` : ''}
            ${quoteObj.discount > 0 ? `<div style="color: #10b981;"><span>Discount Off:</span> <strong>-₹${quoteObj.discount.toLocaleString('en-IN')}</strong></div>` : ''}
            <div class="grand-total"><span>Grand Total:</span> <span>₹${(quoteObj.grandTotal || 0).toLocaleString('en-IN')}</span></div>
          </div>

          <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; font-size: 0.8rem; color: #64748b;">
            <p><strong>Declaration & Terms:</strong></p>
            <p>1. Certified that the particulars given above are true and correct.</p>
            <p>2. Products carry 1 to 2 Years Manufacturer Warranty. Services backed by Raath SecureTech Neemrana.</p>
            <p>3. Thank you for doing business with Raath SecureTech!</p>
          </div>
        </div>
      `;
    }

    const savedModal = document.getElementById('modal-saved-quotes');
    if (savedModal) savedModal.classList.remove('active');

    const previewModal = document.getElementById('modal-quote-preview');
    if (previewModal) previewModal.classList.add('active');
  },

  loadSavedQuoteIntoBuilder(quoteId) {
    const quotes = DB.getQuotations();
    const q = quotes.find(x => x.id === quoteId);
    if (!q) return;

    // Filter out duplicated installation items so base items aren't duplicated exponentially
    this.selectedItems = q.items
      .filter(i => !i.id.toString().endsWith('-inst') && !i.name.includes('(Installation)'))
      .map(i => ({ ...i }));

    this.sameInstallation = q.items.some(i => i.id.toString().endsWith('-inst') || i.name.includes('(Installation)'));
    this.docType = q.docType || 'quote';
    this.gstEnabled = q.includeGst !== false;
    this.discount = q.discount || 0;
    this.currentQuotation = q;

    const nameEl = document.getElementById('quote-cust-name');
    const phoneEl = document.getElementById('quote-cust-phone');
    const locEl = document.getElementById('quote-cust-loc');
    const firmEl = document.getElementById('quote-cust-firm');
    const docTypeEl = document.getElementById('quote-doc-type');
    const gstToggle = document.getElementById('quote-gst-toggle');
    const discountEl = document.getElementById('quote-discount-input');

    if (nameEl) nameEl.value = q.customerName || '';
    if (phoneEl) phoneEl.value = q.customerPhone || '';
    if (locEl) locEl.value = q.customerLocation || '';
    if (firmEl) firmEl.value = q.customerFirm || '';
    if (docTypeEl) docTypeEl.value = this.docType;
    if (gstToggle) gstToggle.checked = this.gstEnabled;
    if (discountEl) discountEl.value = this.discount;

    this.renderItemsTable();
    this.calculateTotals();

    const savedModal = document.getElementById('modal-saved-quotes');
    if (savedModal) savedModal.classList.remove('active');

    window.showToast(`Loaded ${q.id} into Quotation Builder!`, 'success');
  },

  deleteSavedQuote(quoteId) {
    if (confirm(`Are you sure you want to delete quotation/bill #${quoteId}?`)) {
      DB.deleteQuotation(quoteId);
      this.renderSavedQuotesModal();
      if (window.AdminCRM && typeof window.AdminCRM.renderCRM === 'function') {
        window.AdminCRM.renderCRM();
      }
      window.showToast(`Deleted ${quoteId} from history.`, 'info');
    }
  },

  sendSavedQuoteViaWhatsApp(quoteId) {
    const quotes = DB.getQuotations();
    const q = quotes.find(x => x.id === quoteId);
    if (!q) return;

    const custPhone = (q.customerPhone || '9928660353').replace(/[^0-9]/g, '');
    const targetPhone = custPhone.length >= 10 ? (custPhone.startsWith('91') ? custPhone : '91' + custPhone.slice(-10)) : '919928660353';
    const isTaxBill = q.docType === 'tax_invoice';

    let itemsListText = q.items.map((item, index) => 
      `  ${index + 1}. *${item.name}* (Qty: ${item.qty}) - ₹${item.total.toLocaleString('en-IN')}`
    ).join('\n');

    let messageText = 
`🛡️ *${(q.firmName || 'RAATH SECURETECH').toUpperCase()} - JANAK SINGH PURA, NEEMRANA*
*${isTaxBill ? '🧾 OFFICIAL GST TAX INVOICE / BILL' : '📋 OFFICIAL CCTV ESTIMATE / QUOTATION'}*
*Ref ID: ${q.id}*
--------------------------------------------------
Customer: *${q.customerName}* (${q.customerFirm || q.customerName})
📍 Site Location: ${q.customerLocation}
📞 Phone: ${q.customerPhone}
${q.includeGst ? `🆔 Firm GSTIN: *${q.firmGstin || '08AAAFR9928C1Z3'}*\n` : ''}
📋 *ITEMS & SERVICES BREAKDOWN:*
${itemsListText}

--------------------------------------------------
💵 *Taxable Value:* ₹${(q.subtotal || 0).toLocaleString('en-IN')}
${q.includeGst ? `🧾 *CGST (9%):* ₹${(q.cgst || 0).toLocaleString('en-IN')}\n🧾 *SGST (9%):* ₹${(q.sgst || 0).toLocaleString('en-IN')}\n` : ''}${q.discount > 0 ? `🎁 *Special Discount:* -₹${q.discount.toLocaleString('en-IN')}\n` : ''}💰 *GRAND TOTAL:* *₹${(q.grandTotal || 0).toLocaleString('en-IN')}*
--------------------------------------------------
✅ Includes Full Installation & Mobile App View Setup
✅ Includes Service Support in Neemrana Area

📍 Store Address: Janak Singh Pura, Neemrana
📞 Helpline / WhatsApp: 9928660353`;

    const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(messageText)}`;
    window.open(whatsappUrl, '_blank');
  },

  sendQuotationViaWhatsApp() {
    this.saveCurrentQuotation(true);

    const custPhone = document.getElementById('quote-cust-phone')?.value.replace(/[^0-9]/g, '') || '9928660353';
    const targetPhone = custPhone.length >= 10 ? (custPhone.startsWith('91') ? custPhone : '91' + custPhone.slice(-10)) : '919928660353';

    const custName = document.getElementById('quote-cust-name')?.value || 'Customer';
    const custLoc = document.getElementById('quote-cust-loc')?.value || 'Janak Singh Pura, Neemrana';
    const firmName = document.getElementById('quote-firm-name')?.value || 'RAATH SECURETECH';
    const firmGstin = document.getElementById('quote-firm-gstin')?.value || '08AAAFR9928C1Z3';
    const custFirm = document.getElementById('quote-cust-firm')?.value || custName;
    const docTypeVal = document.getElementById('quote-doc-type')?.value || 'quote';

    const isTaxBill = docTypeVal === 'tax_invoice';
    const totals = this.calculateTotals();

    const allItemsForWhatsApp = this.getAllItems();
    let itemsListText = allItemsForWhatsApp.map((item, index) => 
      `  ${index + 1}. *${item.name}* (Qty: ${item.qty}) - ₹${item.total.toLocaleString('en-IN')}`
    ).join('\n');

    let messageText = 
`🛡️ *${firmName.toUpperCase()} - JANAK SINGH PURA, NEEMRANA*
*${isTaxBill ? '🧾 OFFICIAL GST TAX INVOICE / BILL' : '📋 OFFICIAL CCTV ESTIMATE / QUOTATION'}*
--------------------------------------------------
Customer: *${custName}* (${custFirm})
📍 Site Location: ${custLoc}
📞 Phone: ${custPhone}
${this.gstEnabled || isTaxBill ? `🆔 Firm GSTIN: *${firmGstin}*\n` : ''}
📋 *ITEMS & SERVICES BREAKDOWN:*
${itemsListText}

--------------------------------------------------
💵 *Taxable Value:* ₹${totals.subtotal.toLocaleString('en-IN')}
${this.gstEnabled ? `🧾 *CGST (9%):* ₹${totals.cgst.toLocaleString('en-IN')}\n🧾 *SGST (9%):* ₹${totals.sgst.toLocaleString('en-IN')}\n` : ''}${totals.discount > 0 ? `🎁 *Special Discount:* -₹${totals.discount.toLocaleString('en-IN')}\n` : ''}💰 *GRAND TOTAL:* *₹${totals.grandTotal.toLocaleString('en-IN')}*
--------------------------------------------------
✅ Includes Full Installation & Mobile App View Setup (rates duplicated if selected)
✅ Includes Service Support in Neemrana Area

📍 Store Address: Janak Singh Pura, Neemrana
📞 Helpline / WhatsApp: 9928660353`;

    const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(messageText)}`;
    window.open(whatsappUrl, '_blank');
  }
};

window.QuotationEngine = QuotationEngine;
