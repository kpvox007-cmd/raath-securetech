/* ==========================================================================
   RAATH SECURETECH - DATABASE & LOCAL STORAGE STORE
   Location: Janak Singh Pura, Neemrana | Contact: +91 9928660353
   ========================================================================== */

const DB_KEYS = {
  PRODUCTS: 'rst_products',
  QUOTATIONS: 'rst_quotations',
  CUSTOMERS: 'rst_customers',
  SERVICE_TICKETS: 'rst_tickets',
  ACTIVE_USER: 'rst_active_user',
  AMC_PLANS: 'rst_amc_plans',
  INVENTORY: 'rst_inventory',
  PURCHASES: 'rst_purchases',
  STOCK_LEDGER: 'rst_stock_ledger'
};

const DEFAULT_INVENTORY = [
  // CCTV Cameras
  { id: 'p1', hsn: '85258090', name: 'CP Plus 2MP Full HD Indoor Dome Camera', category: 'Camera', supplierParty: 'Aditya Infotech Ltd', purchasePrice: 1050, price: 1450, unit: 'Pc', stockQty: 18, minAlertQty: 3, serialNumbers: 'SN-CPP-2026-101, SN-CPP-2026-102', specs: '1080p, 20m IR, Day/Night Vision' },
  { id: 'p2', hsn: '85258090', name: 'Hikvision 5MP ColorVu Outdoor Bullet Camera', category: 'Camera', supplierParty: 'Hikvision India Official', purchasePrice: 1850, price: 2400, unit: 'Pc', stockQty: 12, minAlertQty: 4, serialNumbers: 'SN-HKV-5MP-091, SN-HKV-5MP-092', specs: '24/7 Full Color, IP67 Waterproof, 5MP' },
  { id: 'p3', hsn: '85258090', name: 'Hikvision 4K 8MP Ultra HD IP Bullet Camera', category: 'Camera', supplierParty: 'Hikvision India Official', purchasePrice: 3800, price: 4800, unit: 'Pc', stockQty: 5, minAlertQty: 2, serialNumbers: 'SN-HKV-4K-801, SN-HKV-4K-802', specs: '4K Ultra HD, PoE, Smart AI Motion Detection' },
  { id: 'p4', hsn: '85258090', name: '4G SIM Solar Wireless PTZ 360° Camera', category: 'Camera', supplierParty: 'Global Security Tech Delhi', purchasePrice: 4900, price: 6500, unit: 'Pc', stockQty: 4, minAlertQty: 2, serialNumbers: 'SN-SOL-4G-301', specs: 'No Wiring Needed, Solar Powered, 360 Rotation' },
  
  // DVR / NVR Recorders
  { id: 'p5', hsn: '84718000', name: 'CP Plus 4-Channel HD DVR', category: 'DVR/NVR', supplierParty: 'Aditya Infotech Ltd', purchasePrice: 2150, price: 2900, unit: 'Pc', stockQty: 8, minAlertQty: 2, serialNumbers: 'DVR-CPP-4CH-771', specs: '1080p Recording, H.265+, Mobile App View' },
  { id: 'p6', hsn: '84718000', name: 'Hikvision 8-Channel HD DVR (5MP Support)', category: 'DVR/NVR', supplierParty: 'Hikvision India Official', purchasePrice: 3400, price: 4500, unit: 'Pc', stockQty: 6, minAlertQty: 2, serialNumbers: 'DVR-HKV-8CH-882', specs: 'Supports up to 5MP, HDMI/VGA Out, Audio' },
  { id: 'p7', hsn: '84718000', name: 'Hikvision 16-Channel 4K NVR with 16 PoE Ports', category: 'DVR/NVR', supplierParty: 'Hikvision India Official', purchasePrice: 9200, price: 11500, unit: 'Pc', stockQty: 3, minAlertQty: 1, serialNumbers: 'NVR-HKV-16CH-901', specs: 'Plug & Play PoE, Up to 8MP, Dual HDD Slots' },

  // Surveillance Hard Disk Storage
  { id: 'p8', hsn: '84717020', name: 'Seagate SkyHawk 1TB Surveillance Hard Disk', category: 'Storage', supplierParty: 'Seagate Authorized Distributor', purchasePrice: 2950, price: 3800, unit: 'Pc', stockQty: 15, minAlertQty: 3, serialNumbers: 'ST1000-VX001-9921', specs: '24/7 Continuous Recording, 3-Yr Warranty' },
  { id: 'p9', hsn: '84717020', name: 'Seagate SkyHawk 2TB Surveillance Hard Disk', category: 'Storage', supplierParty: 'Seagate Authorized Distributor', purchasePrice: 4200, price: 5400, unit: 'Pc', stockQty: 7, minAlertQty: 2, serialNumbers: 'ST2000-VX002-4412', specs: 'High Endurance Surveillance Drive' },
  { id: 'p10', hsn: '84717020', name: 'WD Purple 4TB Surveillance Hard Disk', category: 'Storage', supplierParty: 'WD India Distributor', purchasePrice: 7100, price: 8900, unit: 'Pc', stockQty: 4, minAlertQty: 2, serialNumbers: 'WDP-4TB-8812', specs: 'AllFrame AI Technology, 64 HD Cameras' },

  // Power Supplies (SMPS)
  { id: 'p11', hsn: '85044090', name: '4-Port Metal Power Supply (SMPS)', category: 'Power Supply', supplierParty: 'Ernet Security Solution', purchasePrice: 420, price: 650, unit: 'Pc', stockQty: 25, minAlertQty: 5, serialNumbers: 'SMPS-4P-551', specs: 'Short Circuit & Surge Protection' },
  { id: 'p12', hsn: '85044090', name: '8-Port Metal Power Supply (SMPS)', category: 'Power Supply', supplierParty: 'Ernet Security Solution', purchasePrice: 650, price: 950, unit: 'Pc', stockQty: 14, minAlertQty: 3, serialNumbers: 'SMPS-8P-662', specs: 'Heavy Duty 12V 10A Output' },

  // Cabling & Networking
  { id: 'p13', hsn: '85444999', name: '3+1 Copper CCTV Cable Bundle (90m Roll)', category: 'Cabling', supplierParty: 'Finolex Cables Ltd', purchasePrice: 1150, price: 1650, unit: 'Roll', stockQty: 20, minAlertQty: 4, serialNumbers: 'N/A (Cable Roll)', specs: 'Pure Copper, Weatherproof PVC Coating' },
  { id: 'p14', hsn: '85444999', name: 'D-Link CAT6 Pure Copper Network Cable (90m)', category: 'Cabling', supplierParty: 'D-Link India Ltd', purchasePrice: 1550, price: 2200, unit: 'Roll', stockQty: 10, minAlertQty: 2, serialNumbers: 'N/A (CAT6 Roll)', specs: 'High Speed Gigabit Data for IP Cameras' },
  { id: 'p15', hsn: '85176290', name: 'D-Link 8-Port Gigabit PoE Switch', category: 'Cabling', supplierParty: 'D-Link India Ltd', purchasePrice: 2200, price: 3200, unit: 'Pc', stockQty: 8, minAlertQty: 2, serialNumbers: 'POE-8P-DL-8812', specs: '10/100/1000 Mbps, 120W PoE Power' },

  // Accessories & Connectors
  { id: 'p16', hsn: '85366990', name: 'BNC + DC Heavy Duty Connector Kit (Set of 8)', category: 'Accessory', supplierParty: 'Local Hardware Supplier', purchasePrice: 220, price: 400, unit: 'Set', stockQty: 30, minAlertQty: 5, serialNumbers: 'N/A (Connectors)', specs: 'Brass Terminals, Gold Plated' },
  { id: 'p17', hsn: '85389000', name: 'Weatherproof PVC Junction Box 4x4 (Pack of 4)', category: 'Accessory', supplierParty: 'Supreme Plastics Neemrana', purchasePrice: 160, price: 280, unit: 'Pack', stockQty: 45, minAlertQty: 10, serialNumbers: 'N/A (Boxes)', specs: 'IP66 Waterproof Outdoor Camera Mount' },
  { id: 'p18', hsn: '85389000', name: '4U Wall Mount Network & DVR Server Rack Enclosure', category: 'Accessory', supplierParty: 'Valrack Technologies', purchasePrice: 1450, price: 2200, unit: 'Pc', stockQty: 6, minAlertQty: 2, serialNumbers: 'RACK-4U-VL-102', specs: 'Lock & Key, Glass Door, Fan Slot' }
];

const DEFAULT_PURCHASES = [
  {
    id: 'pur-101',
    billNo: 'INV-ADI-2026-881',
    date: '2026-08-10',
    supplierParty: 'Aditya Infotech Ltd (CP Plus Authorized)',
    totalAmount: 43250,
    items: [
      { id: 'p1', name: 'CP Plus 2MP Full HD Indoor Dome Camera', category: 'Camera', hsn: '85258090', purchasePrice: 1050, price: 1450, qty: 18, serialNumbers: 'SN-CPP-2026-101, SN-CPP-2026-102' },
      { id: 'p5', name: 'CP Plus 4-Channel HD DVR', category: 'DVR/NVR', hsn: '84718000', purchasePrice: 2150, price: 2900, qty: 8, serialNumbers: 'DVR-CPP-4CH-771' }
    ]
  },
  {
    id: 'pur-102',
    billNo: 'INV-HKV-2026-904',
    date: '2026-08-12',
    supplierParty: 'Hikvision India Official',
    totalAmount: 64700,
    items: [
      { id: 'p2', name: 'Hikvision 5MP ColorVu Outdoor Bullet Camera', category: 'Camera', hsn: '85258090', purchasePrice: 1850, price: 2400, qty: 12, serialNumbers: 'SN-HKV-5MP-091, SN-HKV-5MP-092' },
      { id: 'p6', name: 'Hikvision 8-Channel HD DVR (5MP Support)', category: 'DVR/NVR', hsn: '84718000', purchasePrice: 3400, price: 4500, qty: 6, serialNumbers: 'DVR-HKV-8CH-882' }
    ]
  }
];

const DEFAULT_STOCK_LEDGER = [
  { id: 'led-1', date: '2026-08-12', itemName: 'Hikvision 5MP ColorVu Outdoor Bullet Camera', type: 'INWARD (PURCHASE)', refNo: 'INV-HKV-2026-904', qty: 12, rate: 1850, party: 'Hikvision India Official' },
  { id: 'led-2', date: '2026-08-13', itemName: 'Hikvision 5MP ColorVu Outdoor Bullet Camera', type: 'OUTWARD (BILL / QUOTE)', refNo: 'QT-2026-8812', qty: 6, rate: 2400, party: 'RAJ (Shree Ram Logistics)' }
];

const DEFAULT_AMC_PLANS = [
  { id: 'amc-silver', name: 'Silver AMC Plan', price: 2499, cams: 'Up to 4 Cameras', Visits: '2 Regular Visits / Year', Response: 'Within 24 Hours in Neemrana', Replacement: 'Free Repairs, Parts Charged' },
  { id: 'amc-gold', name: 'Gold AMC Plan', price: 4999, cams: 'Up to 8 Cameras', Visits: '4 Regular Visits / Year', Response: 'Within 6 Hours Priority', Replacement: 'Free Standby Camera During Repair' },
  { id: 'amc-platinum', name: 'Platinum Industrial AMC', price: 9999, cams: 'Up to 16+ Cameras', Visits: 'Monthly Preventive Checkup', Response: 'Within 2 Hours Emergency Support', Replacement: 'Zero-Cost Parts & Standby NVR' }
];

const DEFAULT_CUSTOMERS = [
  {
    id: 'cust-101',
    name: 'Rajesh Sharma',
    phone: '9829123456',
    email: 'rajesh.neemrana@gmail.com',
    address: 'Plot 45, Near RIICO Industrial Area Phase 1, Neemrana',
    location: 'Neemrana',
    cctvSystem: 'Hikvision 8-Cam 5MP HD Kit',
    installationDate: '2025-11-10',
    amcStatus: 'Active',
    amcExpiry: '2026-11-10',
    role: 'customer'
  },
  {
    id: 'cust-102',
    name: 'Shree Ram Logistics & Warehouse',
    phone: '9414098765',
    email: 'contact@shreeramlogistics.in',
    address: 'Janak Singh Pura, Near NH-48 Highway, Neemrana',
    location: 'Janak Singh Pura, Neemrana',
    cctvSystem: '16-Channel 4K IP PoE System with Solar Backup',
    installationDate: '2025-06-15',
    amcStatus: 'Active (Platinum)',
    amcExpiry: '2026-06-15',
    role: 'customer'
  }
];

const DEFAULT_TICKETS = [
  {
    id: 'RST-TICK-101',
    customerId: 'cust-101',
    customerName: 'Rajesh Sharma',
    phone: '9829123456',
    location: 'RIICO Phase 1, Neemrana',
    issueCategory: 'Camera Display Issue',
    description: 'Camera No. 3 (Front Gate) shows black screen / No Video signal on DVR.',
    status: 'In Progress',
    priority: 'High',
    technician: 'Ramesh Kumar (Neemrana Team)',
    createdAt: '2026-07-22 10:30 AM',
    updates: [
      { time: '2026-07-22 10:30 AM', text: 'Ticket Logged by Customer' },
      { time: '2026-07-22 11:15 AM', text: 'Assigned to Technician Ramesh Kumar (+91 9928660353)' },
      { time: '2026-07-22 02:00 PM', text: 'Technician visited site, replacing faulty BNC connector.' }
    ]
  },
  {
    id: 'RST-TICK-102',
    customerId: 'cust-102',
    customerName: 'Shree Ram Logistics',
    phone: '9414098765',
    location: 'Janak Singh Pura, Neemrana',
    issueCategory: 'Mobile App Setup',
    description: 'Replaced router, need to re-configure Hik-Connect remote viewing on 3 mobile phones.',
    status: 'Scheduled',
    priority: 'Medium',
    technician: 'Vikram Singh',
    createdAt: '2026-07-23 09:00 AM',
    updates: [
      { time: '2026-07-23 09:00 AM', text: 'Ticket Created' },
      { time: '2026-07-23 09:30 AM', text: 'Scheduled for technician visit today at 4 PM' }
    ]
  }
];

const DEFAULT_QUOTATIONS = [
  {
    id: 'RST-Q-2026-881',
    customerName: 'Aman Yadav',
    customerPhone: '9928660353',
    customerLocation: 'Janak Singh Pura, Neemrana',
    date: '2026-07-23',
    items: [
      { id: 'p2', name: 'Hikvision 5MP ColorVu Outdoor Bullet Camera', price: 2400, qty: 4, total: 9600 },
      { id: 'p5', name: 'CP Plus 4-Channel HD DVR', price: 2900, qty: 1, total: 2900 },
      { id: 'p8', name: 'Seagate SkyHawk 1TB Surveillance Hard Disk', price: 3800, qty: 1, total: 3800 },
      { id: 'p11', name: '4-Port Metal Power Supply (SMPS)', price: 650, qty: 1, total: 650 },
      { id: 'p13', name: '3+1 Copper CCTV Cable Bundle (90m Roll)', price: 1650, qty: 1, total: 1650 },
      { id: 'p16', name: 'Standard CCTV Camera Installation', price: 350, qty: 4, total: 1400 }
    ],
    subtotal: 20000,
    gstAmount: 3600,
    includeGst: true,
    discount: 600,
    grandTotal: 23000
  }
];

// DB Helper Module
const DB = {
  init() {
    if (!localStorage.getItem(DB_KEYS.INVENTORY) || JSON.parse(localStorage.getItem(DB_KEYS.INVENTORY) || '[]').length === 0) {
      localStorage.setItem(DB_KEYS.INVENTORY, JSON.stringify(DEFAULT_INVENTORY));
    }
    if (!localStorage.getItem(DB_KEYS.PRODUCTS)) {
      localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(DEFAULT_INVENTORY));
    }
    if (!localStorage.getItem(DB_KEYS.AMC_PLANS)) {
      localStorage.setItem(DB_KEYS.AMC_PLANS, JSON.stringify(DEFAULT_AMC_PLANS));
    }
    if (!localStorage.getItem(DB_KEYS.CUSTOMERS)) {
      localStorage.setItem(DB_KEYS.CUSTOMERS, JSON.stringify(DEFAULT_CUSTOMERS));
    }
    if (!localStorage.getItem(DB_KEYS.SERVICE_TICKETS)) {
      localStorage.setItem(DB_KEYS.SERVICE_TICKETS, JSON.stringify(DEFAULT_TICKETS));
    }
    if (!localStorage.getItem(DB_KEYS.QUOTATIONS)) {
      localStorage.setItem(DB_KEYS.QUOTATIONS, JSON.stringify(DEFAULT_QUOTATIONS));
    }
  },

  getProducts() {
    return JSON.parse(localStorage.getItem(DB_KEYS.PRODUCTS) || '[]');
  },

  getAMCPlans() {
    return JSON.parse(localStorage.getItem(DB_KEYS.AMC_PLANS) || '[]');
  },

  getCustomers() {
    return JSON.parse(localStorage.getItem(DB_KEYS.CUSTOMERS) || '[]');
  },

  saveCustomer(cust) {
    const list = this.getCustomers();
    list.unshift(cust);
    localStorage.setItem(DB_KEYS.CUSTOMERS, JSON.stringify(list));
    return cust;
  },

  getTickets() {
    return JSON.parse(localStorage.getItem(DB_KEYS.SERVICE_TICKETS) || '[]');
  },

  saveTicket(ticket) {
    const list = this.getTickets();
    list.unshift(ticket);
    localStorage.setItem(DB_KEYS.SERVICE_TICKETS, JSON.stringify(list));
    return ticket;
  },

  updateTicketStatus(ticketId, newStatus, technicianName = null, note = null) {
    const list = this.getTickets();
    const t = list.find(x => x.id === ticketId);
    if (t) {
      t.status = newStatus;
      if (technicianName) t.technician = technicianName;
      const now = new Date().toLocaleString();
      t.updates = t.updates || [];
      t.updates.push({ time: now, text: note || `Status updated to ${newStatus}` });
      localStorage.setItem(DB_KEYS.SERVICE_TICKETS, JSON.stringify(list));
    }
    return t;
  },

  deduplicateQuotationsList(list) {
    if (!Array.isArray(list)) return [];
    const seen = new Set();
    const cleanList = [];

    for (const q of list) {
      if (!q) continue;
      const normalize = str => (str || '').toString().trim().toLowerCase();
      const custName = normalize(q.customerName);
      const custPhone = normalize(q.customerPhone);
      const docType = q.docType || 'quote';
      const key = custName ? `${custName}_${custPhone}_${docType}` : q.id;

      if (!custName || !seen.has(key)) {
        if (custName) seen.add(key);
        cleanList.push(q);
      }
    }
    return cleanList;
  },

  getQuotations() {
    let list = JSON.parse(localStorage.getItem(DB_KEYS.QUOTATIONS) || '[]');
    const deduplicated = this.deduplicateQuotationsList(list);
    if (deduplicated.length !== list.length) {
      localStorage.setItem(DB_KEYS.QUOTATIONS, JSON.stringify(deduplicated));
    }
    return deduplicated;
  },

  saveQuotation(quote, forceNew = false) {
    let list = this.getQuotations();
    const normalize = str => (str || '').toString().trim().toLowerCase();
    const targetCustName = normalize(quote.customerName);
    const targetCustPhone = normalize(quote.customerPhone);

    let existingIndex = -1;

    if (!forceNew) {
      // 1st Priority: Match by exact ID
      if (quote.id) {
        existingIndex = list.findIndex(q => q.id === quote.id);
      }

      // 2nd Priority: Match by same customer name and phone
      if (existingIndex === -1 && targetCustName) {
        existingIndex = list.findIndex(q => {
          const sameName = normalize(q.customerName) === targetCustName;
          const samePhone = targetCustPhone ? normalize(q.customerPhone) === targetCustPhone : true;
          return sameName && samePhone;
        });
      }
    }

    if (existingIndex >= 0) {
      quote.id = list[existingIndex].id; // Keep existing ID
      list[existingIndex] = { ...list[existingIndex], ...quote, date: new Date().toISOString().split('T')[0] };
    } else {
      list.unshift(quote);
    }

    list = this.deduplicateQuotationsList(list);
    localStorage.setItem(DB_KEYS.QUOTATIONS, JSON.stringify(list));
    return quote;
  },

  deleteQuotation(quoteId) {
    let list = this.getQuotations();
    list = list.filter(q => q.id !== quoteId);
    localStorage.setItem(DB_KEYS.QUOTATIONS, JSON.stringify(list));
    return list;
  },

  getActiveUser() {
    return JSON.parse(localStorage.getItem(DB_KEYS.ACTIVE_USER) || 'null');
  },

  setActiveUser(user) {
    localStorage.setItem(DB_KEYS.ACTIVE_USER, JSON.stringify(user));
  },

  getInventory() {
    let list = JSON.parse(localStorage.getItem(DB_KEYS.INVENTORY) || '[]');
    if (!Array.isArray(list) || list.length === 0) {
      list = DEFAULT_INVENTORY;
      localStorage.setItem(DB_KEYS.INVENTORY, JSON.stringify(list));
    }
    // Filter out non-physical labor & service items
    return list.filter(item => item && item.category !== 'Labor' && item.category !== 'Labor/Service' && item.category !== 'AMC');
  },

  saveInventoryItem(item) {
    let list = this.getInventory();
    const existingIndex = list.findIndex(i => i.id === item.id);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...item };
    } else {
      if (!item.id) item.id = 'inv-' + Math.floor(1000 + Math.random() * 9000);
      list.unshift(item);
    }
    localStorage.setItem(DB_KEYS.INVENTORY, JSON.stringify(list));
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(list));
    return item;
  },

  deleteInventoryItem(itemId) {
    let list = this.getInventory();
    list = list.filter(i => i.id !== itemId);
    localStorage.setItem(DB_KEYS.INVENTORY, JSON.stringify(list));
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(list));
    return list;
  },

  deductStockForInvoice(billedItems) {
    if (!Array.isArray(billedItems)) return;
    let list = this.getInventory();
    let updated = false;

    for (const item of billedItems) {
      if (!item) continue;
      const baseId = (item.id || '').toString().replace('-inst', '');
      const normalize = str => (str || '').toString().trim().toLowerCase();
      
      const match = list.find(inv => inv.id === baseId || normalize(inv.name) === normalize(item.name));
      if (match && match.category !== 'Labor' && match.category !== 'AMC') {
        const qtyToDeduct = parseInt(item.qty) || 1;
        match.stockQty = Math.max(0, (parseInt(match.stockQty) || 0) - qtyToDeduct);
        updated = true;

        this.addStockLedgerEntry({
          date: new Date().toISOString().split('T')[0],
          itemName: match.name,
          type: 'OUTWARD (BILL / QUOTE)',
          refNo: item.quoteId || 'BILL-OUTWARD',
          qty: qtyToDeduct,
          rate: parseFloat(item.price) || match.price,
          party: item.custName || 'Customer'
        });
      }
    }

    if (updated) {
      localStorage.setItem(DB_KEYS.INVENTORY, JSON.stringify(list));
      localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(list));
      if (window.AdminCRM && typeof window.AdminCRM.renderCRM === 'function') {
        window.AdminCRM.renderCRM();
      }
    }
  },

  getPurchases() {
    let list = JSON.parse(localStorage.getItem(DB_KEYS.PURCHASES) || '[]');
    if (!Array.isArray(list) || list.length === 0) {
      list = DEFAULT_PURCHASES;
      localStorage.setItem(DB_KEYS.PURCHASES, JSON.stringify(list));
    }
    return list;
  },

  savePurchaseVoucher(voucher) {
    let list = this.getPurchases();
    if (!voucher.id) voucher.id = 'pur-' + Date.now();
    voucher.createdAt = voucher.createdAt || new Date().toISOString();
    list.unshift(voucher);
    localStorage.setItem(DB_KEYS.PURCHASES, JSON.stringify(list));

    const inventory = this.getInventory();
    if (Array.isArray(voucher.items)) {
      voucher.items.forEach(vItem => {
        let existing = inventory.find(i => (i.name || '').toLowerCase() === (vItem.name || '').toLowerCase() || i.id === vItem.id);
        if (existing) {
          existing.stockQty = (parseInt(existing.stockQty) || 0) + (parseInt(vItem.qty) || 0);
          existing.purchasePrice = parseFloat(vItem.purchasePrice) || existing.purchasePrice;
          existing.price = parseFloat(vItem.price) || existing.price;
          if (vItem.serialNumbers && vItem.serialNumbers.trim() !== '') {
            existing.serialNumbers = existing.serialNumbers ? `${existing.serialNumbers}, ${vItem.serialNumbers}` : vItem.serialNumbers;
          }
        } else {
          const newItem = {
            id: 'inv-' + Math.floor(1000 + Math.random() * 9000),
            name: vItem.name,
            category: vItem.category || 'Accessory',
            hsn: vItem.hsn || '85258090',
            supplierParty: voucher.supplierParty || 'Direct Party',
            purchasePrice: parseFloat(vItem.purchasePrice) || 0,
            price: parseFloat(vItem.price) || 0,
            unit: vItem.unit || 'Pc',
            stockQty: parseInt(vItem.qty) || 1,
            minAlertQty: 2,
            serialNumbers: vItem.serialNumbers || 'N/A',
            specs: vItem.specs || ''
          };
          inventory.push(newItem);
        }

        this.addStockLedgerEntry({
          date: voucher.date || new Date().toISOString().split('T')[0],
          itemName: vItem.name,
          type: 'INWARD (PURCHASE)',
          refNo: voucher.billNo || voucher.id,
          qty: parseInt(vItem.qty) || 1,
          rate: parseFloat(vItem.purchasePrice) || 0,
          party: voucher.supplierParty || 'Supplier'
        });
      });
    }

    localStorage.setItem(DB_KEYS.INVENTORY, JSON.stringify(inventory));
    return voucher;
  },

  deletePurchaseVoucher(voucherId) {
    let list = this.getPurchases();
    list = list.filter(v => v.id !== voucherId);
    localStorage.setItem(DB_KEYS.PURCHASES, JSON.stringify(list));
    return list;
  },

  getStockLedger() {
    let ledger = JSON.parse(localStorage.getItem(DB_KEYS.STOCK_LEDGER) || '[]');
    if (!Array.isArray(ledger) || ledger.length === 0) {
      ledger = DEFAULT_STOCK_LEDGER;
      localStorage.setItem(DB_KEYS.STOCK_LEDGER, JSON.stringify(ledger));
    }
    return ledger;
  },

  addStockLedgerEntry(entry) {
    let ledger = this.getStockLedger();
    entry.id = 'led-' + Date.now() + Math.random().toString(36).substring(2, 5);
    entry.timestamp = new Date().toISOString();
    ledger.unshift(entry);
    localStorage.setItem(DB_KEYS.STOCK_LEDGER, JSON.stringify(ledger));
  },

  logoutUser() {
    localStorage.removeItem(DB_KEYS.ACTIVE_USER);
  }
};

// Initialize DB on script load
DB.init();
window.DB = DB;
