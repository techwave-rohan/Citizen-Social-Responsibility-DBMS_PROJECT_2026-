// ⚡ DEPLOYMENT: Replace with your Render backend URL, e.g. 'https://csr-backend.onrender.com'
// For local development, keep as 'http://localhost:8000'
const BASE = 'http://localhost:8000';

function getToken() { 
    return localStorage.getItem('token'); 
}

async function apiFetch(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const options = {
    method, 
    headers,
    cache: 'no-store'
  };
  
  if (body) {
      options.body = JSON.stringify(body);
  }
  
  try {
      const res = await fetch(BASE + endpoint, options);
      
      if (res.status === 401) {
        localStorage.clear();
        window.location.href = 'index.html';
        return;
      }
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
          const data = await res.json();
          if (!res.ok) throw new Error(data.detail || 'API Error');
          return data;
      } else {
          const text = await res.text();
          if (!res.ok) throw new Error(text || 'API Error');
          return text;
      }
  } catch (err) {
      console.error("API Fetch Error:", err);
      throw err;
  }
}

function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function openModal(title, formHTML, onSubmit) {
    let overlay = document.getElementById('modal-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'modal-overlay';
        overlay.className = 'modal-overlay';
        
        const content = document.createElement('div');
        content.className = 'card modal-content';
        
        const header = document.createElement('div');
        header.className = 'modal-header';
        
        const titleEl = document.createElement('h2');
        titleEl.id = 'modal-title';
        titleEl.style.fontSize = '1.25rem';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = closeModal;
        
        header.appendChild(titleEl);
        header.appendChild(closeBtn);
        
        const body = document.createElement('div');
        body.id = 'modal-body';
        
        content.appendChild(header);
        content.appendChild(body);
        overlay.appendChild(content);
        document.body.appendChild(overlay);
    }
    
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = formHTML;
    
    const form = overlay.querySelector('form');
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            if (btn) btn.disabled = true;
            try {
                await onSubmit(e);
                closeModal();
            } catch (err) {
                showToast(err.message || 'An error occurred', 'error');
            } finally {
                if (btn) btn.disabled = false;
            }
        };
    }
    
    overlay.classList.remove('hidden');
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
        document.getElementById('modal-body').innerHTML = '';
    }
}

function requireAuth() {
    if (!getToken()) {
        window.location.href = 'index.html';
    }
}

function getMyId() {
    const token = getToken();
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.user_id || payload.sub; // typically user ID is stored in sub
    } catch {
        return null;
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

function renderSidebar(role) {
    let links = '';
    if (role === 'citizen') {
        links = `
            <li><a href="#dashboard">Dashboard</a></li>
            <li><a href="#actions">My Actions</a></li>
            <li><a href="#benefits">Benefits</a></li>
            <li><a href="#complaints">Complaints</a></li>
        `;
    } else if (role === 'official') {
        links = `
            <li><a href="#dashboard">Overview</a></li>
            <li><a href="#complaints">Complaints</a></li>
            <li><a href="#record-action">Record Action</a></li>
            <li><a href="#violations">Violations</a></li>
        `;
    } else if (role === 'analyst') {
        links = `
            <li><a href="#dashboard">Overview</a></li>
            <li><a href="#analysis">Analysis</a></li>
            <li><a href="#citizens">Top Citizens</a></li>
        `;
    } else if (role === 'admin') {
        links = `
            <li><a href="#action-types">Action Types</a></li>
            <li><a href="#benefits">Benefits</a></li>
            <li><a href="#departments">Departments</a></li>
            <li><a href="#age-groups">Age Groups</a></li>
        `;
    }

    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar';
    sidebar.innerHTML = `
        <div class="sidebar-title">🏛 TrustScore</div>
        <ul class="nav-links">
            ${links}
        </ul>
        <div class="logout-container">
            <button class="logout-btn" onclick="logout()">Log Out</button>
        </div>
    `;
    
    const mainContent = document.querySelector('.main-content');
    if (mainContent) document.body.insertBefore(sidebar, mainContent);
    else document.body.insertBefore(sidebar, document.body.firstChild);
}

function renderScoreGauge(containerId, score) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let colorClass = 'var(--text)';
    if (score > 75) colorClass = 'var(--green)';
    else if (score >= 50) colorClass = 'var(--yellow)';
    else colorClass = 'var(--red)';
    
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    
    container.innerHTML = `
        <div style="position: relative; width: 160px; height: 160px; margin: 0 auto;">
            <svg width="160" height="160" style="transform: rotate(-90deg);">
                <circle cx="80" cy="80" r="${radius}" fill="none" stroke="var(--border)" stroke-width="12"></circle>
                <circle cx="80" cy="80" r="${radius}" fill="none" stroke="${colorClass}" stroke-width="12" 
                    stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" 
                    stroke-linecap="round" style="transition: stroke-dashoffset 1s ease-in-out;"></circle>
            </svg>
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                <span style="font-size: 2.5rem; font-weight: 700; color: ${colorClass}; line-height: 1;">${score}</span>
            </div>
        </div>
    `;
}

// Utility: format data
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}
