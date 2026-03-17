requireAuth();
const citizenId = getMyId();

document.addEventListener('DOMContentLoaded', () => {
    // We render the sidebar and attach simple links
    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar';
    sidebar.innerHTML = `
        <div class="sidebar-title">🏛 TrustScore</div>
        <ul class="nav-links">
            <li><a href="citizen.html" class="active">Dashboard</a></li>
            <li><a href="profile.html">My Profile</a></li>
        </ul>
        <div class="logout-container">
            <button class="logout-btn" onclick="logout()">Log Out</button>
        </div>
    `;
    document.body.insertBefore(sidebar, document.body.firstChild);
    
    if (citizenId) {
        loadDashboard();
        loadActions();
        loadBenefits();
        loadComplaints();
        loadRestrictions();
    } else {
        showToast('Session error. Please login again.', 'error');
        setTimeout(() => logout(), 2000);
    }
});

async function loadDashboard() {
    try {
        const data = await apiFetch(`/citizen/dashboard/${citizenId}`);
        document.getElementById('citizen-name').textContent = data.Name || 'Citizen';
        document.getElementById('citizen-city').textContent = `City: ${data.City || 'Unknown'}`;
        
        renderScoreGauge('score-container', data.TrustScore || 0);

        const cityAvg = data.CityAvgScore || (data.TrustScore || 50);
        document.getElementById('city-avg-text').textContent = Math.round(cityAvg);
        document.getElementById('city-avg-bar').style.width = `${Math.min(100, Math.max(0, cityAvg))}%`;
        
    } catch (err) {
        console.error("Dashboard error:", err);
        showToast('Failed to load profile details', 'error');
    }
}

async function loadActions() {
    try {
        const actions = await apiFetch(`/citizen/actions/${citizenId}`);
        const tbody = document.getElementById('actions-table-body');
        
        if (actions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No recent actions found.</td></tr>';
            return;
        }

        tbody.innerHTML = actions.map(a => {
            const isPositive = a.ScoreImpact >= 0;
            const impactClass = isPositive ? 'text-green' : 'text-red';
            const icon = isPositive ? '▲' : '▼';
            
            return `
                <tr>
                    <td>${a.ActionName}</td>
                    <td class="${impactClass} font-medium">${icon} ${Math.abs(a.ScoreImpact)}</td>
                    <td>${formatDate(a.ActionDate)}</td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error("Actions load error:", err);
        document.getElementById('actions-table-body').innerHTML = '<tr><td colspan="3" class="text-center text-red">Failed to load actions</td></tr>';
    }
}

async function loadBenefits() {
    try {
        const benefits = await apiFetch(`/citizen/benefits/${citizenId}`);
        
        const receivedDiv = document.getElementById('benefits-received');
        const eligibleDiv = document.getElementById('benefits-eligible');
        
        if (benefits.ActiveBenefits && benefits.ActiveBenefits.length > 0) {
            receivedDiv.innerHTML = benefits.ActiveBenefits.map(b => 
                `<span class="badge badge-teal">${b}</span>`
            ).join('');
        } else {
            receivedDiv.innerHTML = '<span class="text-muted" style="font-size: 0.875rem;">None</span>';
        }
        
        if (benefits.EligibleBenefits && benefits.EligibleBenefits.length > 0) {
            eligibleDiv.innerHTML = benefits.EligibleBenefits.map(b => 
                `<span class="badge badge-yellow">${b}</span>`
            ).join('');
        } else {
            eligibleDiv.innerHTML = '<span class="text-muted" style="font-size: 0.875rem;">None</span>';
        }
    } catch (err) {
        console.error("Benefits load error:", err);
    }
}

async function loadComplaints() {
    try {
        const complaints = await apiFetch(`/citizen/complaints/${citizenId}`);
        const tbody = document.getElementById('complaints-table-body');
        
        if (complaints.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No complaints filed.</td></tr>';
            return;
        }

        tbody.innerHTML = complaints.map(c => {
            let statusBadge = '';
            if (c.Status === 'Pending') statusBadge = '<span class="badge badge-yellow">Pending</span>';
            else if (c.Status === 'Reviewed' || c.Status === 'Resolved') statusBadge = '<span class="badge badge-green">Resolved</span>';
            else statusBadge = `<span class="badge" style="background:var(--border)">${c.Status}</span>`;
            
            return `
                <tr>
                    <td>ID: ${c.AgainstCitizenID}</td>
                    <td>${statusBadge}</td>
                    <td title="${c.ResolutionNote || ''}">${c.ResolutionNote ? c.ResolutionNote.substring(0, 30) + (c.ResolutionNote.length > 30 ? '...' : '') : '-'}</td>
                    <td title="${c.Description}">${formatDate(c.FiledDate)}</td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error("Complaints load error:", err);
        document.getElementById('complaints-table-body').innerHTML = '<tr><td colspan="3" class="text-center text-red">Failed to load complaints</td></tr>';
    }
}

async function loadRestrictions() {
    try {
        const restrictions = await apiFetch(`/citizen/restrictions/${citizenId}`);
        
        if (restrictions && restrictions.length > 0) {
            const active = restrictions.find(r => r.IsActive);
            if (active) {
                const banner = document.getElementById('restriction-banner');
                document.getElementById('restriction-text').textContent = active.RestrictionType;
                document.getElementById('restriction-date').textContent = `Until: ${new Date(active.EndDate).toLocaleDateString()}`;
                banner.classList.remove('hidden');
            }
        }
    } catch (err) {
        console.error("Restrictions load error:", err);
    }
}

function openComplaintModal() {
    const template = document.getElementById('complaint-modal-template').innerHTML;
    openModal('File a Complaint', template, async (e) => {
        const againstId = document.getElementById('against-citizen-id').value;
        const desc = document.getElementById('complaint-desc').value;
        
        await apiFetch('/citizen/complaint', 'POST', {
            AgainstCitizenID: parseInt(againstId),
            Description: desc
        });
        
        showToast('Complaint filed successfully!');
        loadComplaints();
    });
}
