/* ==========================================================================
   RAATH SECURETECH - CUSTOMER PORTAL & SERVICE TICKET TRACKER
   Location: Janak Singh Pura, Neemrana | Contact: +91 9928660353
   ========================================================================== */

const CustomerPortal = {
  init() {
    this.setupEventListeners();
    this.renderState();
  },

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      // Auth Tab Switching (Login vs Register)
      if (e.target && e.target.classList.contains('auth-tab-btn')) {
        document.querySelectorAll('.auth-tab-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        const tab = e.target.dataset.tab;
        document.getElementById('auth-form-login').style.display = tab === 'login' ? 'block' : 'none';
        document.getElementById('auth-form-register').style.display = tab === 'register' ? 'block' : 'none';
      }

      // Quick Demo Login buttons
      if (e.target && e.target.classList.contains('btn-quick-login')) {
        const phone = e.target.dataset.phone;
        this.loginWithPhone(phone);
      }

      // Customer Logout
      if (e.target && e.target.id === 'btn-cust-logout') {
        DB.logoutUser();
        window.showToast('Logged out successfully.', 'info');
        this.renderState();
      }

      // Open Submit Ticket Modal
      if (e.target && e.target.id === 'btn-open-ticket-modal') {
        const modal = document.getElementById('modal-new-ticket');
        if (modal) modal.classList.add('active');
      }

      // Submit Service Ticket
      if (e.target && e.target.id === 'btn-submit-ticket-form') {
        this.submitServiceTicket();
      }
    });

    // Handle Login Form Submission
    const loginForm = document.getElementById('form-login-submit');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const phone = document.getElementById('login-phone').value;
        this.loginWithPhone(phone);
      });
    }

    // Handle Registration Form Submission
    const regForm = document.getElementById('form-register-submit');
    if (regForm) {
      regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const phone = document.getElementById('reg-phone').value;
        const email = document.getElementById('reg-email').value;
        const address = document.getElementById('reg-address').value;

        const newCust = {
          id: 'cust-' + Math.floor(1000 + Math.random() * 9000),
          name: name,
          phone: phone,
          email: email,
          address: address,
          location: 'Neemrana',
          cctvSystem: 'Standard 4-Cam Setup (New Registration)',
          installationDate: new Date().toISOString().split('T')[0],
          amcStatus: 'Standard Warranty (1 Year)',
          amcExpiry: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
          role: 'customer'
        };

        DB.saveCustomer(newCust);
        DB.setActiveUser(newCust);
        window.showToast(`Welcome ${name}! Account created.`, 'success');
        this.renderState();
      });
    }
  },

  loginWithPhone(phone) {
    const customers = DB.getCustomers();
    let cust = customers.find(c => c.phone.includes(phone) || phone.includes(c.phone));
    
    if (!cust) {
      // Auto register for demo seamless experience
      cust = DB.saveCustomer({
        id: 'cust-' + Math.floor(1000 + Math.random() * 9000),
        name: 'Resident / Business Owner',
        phone: phone || '9829000000',
        email: 'user@neemrana.in',
        address: 'Janak Singh Pura, Neemrana',
        location: 'Neemrana',
        cctvSystem: '4-Camera HD NightVision Kit',
        installationDate: '2025-10-01',
        amcStatus: 'Active AMC',
        amcExpiry: '2026-10-01',
        role: 'customer'
      });
    }

    DB.setActiveUser(cust);
    window.showToast(`Logged in as ${cust.name}`, 'success');
    this.renderState();
  },

  renderState() {
    const user = DB.getActiveUser();
    const loggedOutSection = document.getElementById('cust-logged-out-view');
    const loggedInSection = document.getElementById('cust-logged-in-view');

    if (!loggedOutSection || !loggedInSection) return;

    if (user && user.role === 'customer') {
      loggedOutSection.style.display = 'none';
      loggedInSection.style.display = 'block';
      this.renderDashboard(user);
    } else {
      loggedOutSection.style.display = 'block';
      loggedInSection.style.display = 'none';
    }
  },

  renderDashboard(user) {
    // User Welcome & Overview
    document.getElementById('cust-dash-name').innerText = user.name;
    document.getElementById('cust-dash-phone').innerText = `📞 ${user.phone}`;
    document.getElementById('cust-dash-address').innerText = `📍 ${user.address}`;
    document.getElementById('cust-dash-system').innerText = user.cctvSystem;
    document.getElementById('cust-dash-amc').innerText = user.amcStatus;

    // Render User's Tickets
    const tickets = DB.getTickets().filter(t => t.phone === user.phone || t.customerId === user.id);
    const container = document.getElementById('cust-tickets-list');
    
    if (!container) return;

    if (tickets.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem; background: rgba(255,255,255,0.02); border-radius: var(--radius-md);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--text-muted); margin-bottom: 1rem;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <h4 style="color: #fff; margin-bottom: 0.5rem;">No Service Complaints / Tickets Found</h4>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">Your CCTV setup is operating smoothly! Need assistance or maintenance?</p>
          <button class="btn btn-primary" id="btn-open-ticket-modal">Submit New Service Ticket</button>
        </div>
      `;
      return;
    }

    container.innerHTML = tickets.map(t => {
      let badgeClass = 'badge-warning';
      if (t.status === 'In Progress') badgeClass = 'badge-primary';
      if (t.status === 'Resolved') badgeClass = 'badge-success';

      return `
        <div class="ticket-card">
          <div class="ticket-header">
            <div>
              <span class="ticket-id">${t.id}</span>
              <span class="badge ${badgeClass}" style="margin-left: 0.75rem;">${t.status}</span>
            </div>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${t.createdAt}</span>
          </div>

          <h4 style="color: #fff; margin-bottom: 0.4rem;">${t.issueCategory}</h4>
          <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">${t.description}</p>

          <div style="background: rgba(0,0,0,0.3); padding: 0.75rem 1rem; border-radius: var(--radius-sm); font-size: 0.85rem;">
            <p style="color: var(--primary); font-weight: 600; margin-bottom: 0.25rem;">
              🧑‍🔧 Assigned Technician: ${t.technician || 'Raath SecureTech Neemrana Team (+91 9928660353)'}
            </p>
            <div style="color: var(--text-muted); margin-top: 0.5rem;">
              <strong>Tracking Timeline:</strong>
              <ul style="padding-left: 1.25rem; margin-top: 0.25rem;">
                ${(t.updates || []).map(u => `<li><span style="color: #cbd5e1;">[${u.time}]</span> ${u.text}</li>`).join('')}
              </ul>
            </div>
          </div>

          <div style="margin-top: 1rem; display: flex; gap: 0.75rem;">
            <a href="https://wa.me/919928660353?text=${encodeURIComponent(`Hello Raath SecureTech, regarding my service ticket ${t.id} (${t.issueCategory}): Please provide an update.`)}" target="_blank" class="btn btn-whatsapp btn-sm">
              💬 WhatsApp Fast Escalation (9928660353)
            </a>
          </div>
        </div>
      `;
    }).join('');
  },

  submitServiceTicket() {
    const user = DB.getActiveUser();
    const issueCat = document.getElementById('ticket-issue-cat')?.value || 'General CCTV Maintenance';
    const desc = document.getElementById('ticket-issue-desc')?.value;

    if (!desc) {
      window.showToast('Please provide a short description of the CCTV issue.', 'warning');
      return;
    }

    const newTicket = {
      id: 'RST-TICK-' + Math.floor(100 + Math.random() * 900),
      customerId: user ? user.id : 'cust-guest',
      customerName: user ? user.name : 'Guest Resident',
      phone: user ? user.phone : '9928660353',
      location: user ? user.address : 'Janak Singh Pura, Neemrana',
      issueCategory: issueCat,
      description: desc,
      status: 'Logged',
      priority: 'High',
      technician: 'Raath SecureTech Neemrana Lead Tech',
      createdAt: new Date().toLocaleString(),
      updates: [
        { time: new Date().toLocaleString(), text: 'Complaint Ticket Created via Web Portal' }
      ]
    };

    DB.saveTicket(newTicket);
    window.showToast(`Ticket ${newTicket.id} logged! Technician notified.`, 'success');

    // Close Modal
    const modal = document.getElementById('modal-new-ticket');
    if (modal) modal.classList.remove('active');

    this.renderState();
  }
};

window.CustomerPortal = CustomerPortal;
