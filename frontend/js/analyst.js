requireAuth();

document.addEventListener('DOMContentLoaded', () => {
    // Render sidebar
    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar';
    sidebar.innerHTML = `
        <div class="sidebar-title">🏛 TrustScore</div>
        <ul class="nav-links">
            <li><a href="analyst.html" class="active">Overview</a></li>
            <li><a href="profile.html">My Profile</a></li>
        </ul>
        <div class="logout-container">
            <button class="logout-btn" onclick="logout()">Log Out</button>
        </div>
    `;
    document.body.insertBefore(sidebar, document.body.firstChild);
    
    initAnalystDashboard();
});

async function initAnalystDashboard() {
    loadOverview();
    loadCityScores();
    loadScoreTrends();
    loadViolationsDistribution();
    loadComplaintsByCity();
    loadTopCitizens();
    loadAgeGroupScores();
    loadBenefitPopularity();
    loadHighestViolations();
    loadRestrictions();
    loadAllBenefitsEligible();
}

async function loadOverview() {
    try {
        // Assume API returns these objects. Or we calculate if separate endpoints
        const overview = await apiFetch('/analyst/overview').catch(async () => {
            return {
                TotalCitizens: 0,
                NationalAvgScore: 0,
                TotalComplaints: 0,
                TotalRestrictions: 0
            }
        });

        document.getElementById('stat-total-citizens').textContent = overview.TotalCitizens || 0;
        document.getElementById('stat-national-avg').textContent = Math.round(overview.NationalAvgScore) || 0;
        document.getElementById('stat-total-complaints').textContent = overview.TotalComplaints || 0;
        document.getElementById('stat-total-restrictions').textContent = overview.TotalRestrictions || 0;
    } catch (err) {
        console.error("Overview error", err);
    }
}

async function loadCityScores() {
    try {
        const data = await apiFetch('/analyst/scores/by-city');
        // data = [{City: 'New York', AvgScore: 85}, ...]
        
        const canvas = document.getElementById('chart-city-scores');
        if (!canvas.getContext) return;
        const ctx = canvas.getContext('2d');
        
        const width = canvas.width;
        const height = canvas.height;
        const padding = { top: 20, right: 20, bottom: 40, left: 100 };
        const graphWidth = width - padding.left - padding.right;
        const graphHeight = height - padding.top - padding.bottom;
        
        ctx.clearRect(0, 0, width, height);
        
        if (!data || data.length === 0) {
            ctx.fillText("No data available", width/2, height/2);
            return;
        }

        const barHeight = Math.min(40, graphHeight / data.length - 10);
        
        data.forEach((item, index) => {
            const y = padding.top + index * (graphHeight / data.length);
            const scoreWidth = (item.AvgScore / 100) * graphWidth;
            
            // Draw city name
            ctx.fillStyle = '#64748b';
            ctx.font = '12px Inter';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.City || 'Unknown', padding.left - 10, y + barHeight / 2);
            
            // Draw bar
            ctx.fillStyle = '#0d9488'; // teal
            ctx.fillRect(padding.left, y, scoreWidth, barHeight);
            
            // Draw score
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'right';
            if (scoreWidth > 30) {
                ctx.fillText(Math.round(item.AvgScore), padding.left + scoreWidth - 10, y + barHeight / 2);
            }
        });

        // X axis line
        ctx.strokeStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, height - padding.bottom);
        ctx.stroke();

    } catch (err) {
        console.error("City Scores chart error", err);
    }
}

async function loadScoreTrends() {
    try {
        const data = await apiFetch('/analyst/score-trends');
        // data = [{Date: '2023-01-01', AvgScore: 78}, ...]
        const canvas = document.getElementById('chart-score-trend');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (!data || data.length === 0) {
            ctx.fillText("No data available", canvas.width/2, canvas.height/2);
            return;
        }

        const padding = 40;
        const width = canvas.width - padding * 2;
        const height = canvas.height - padding * 2;
        
        const xStep = width / (data.length - 1 || 1);
        
        // Draw grid lines
        ctx.strokeStyle = '#f1f5f9';
        ctx.beginPath();
        for(let i = 0; i <= 5; i++) {
            const y = padding + (height / 5) * i;
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + width, y);
             
            ctx.fillStyle = '#94a3b8';
            ctx.textAlign = 'right';
            ctx.fillText(100 - (i*20), padding - 10, y + 4);
        }
        ctx.stroke();
        
        // Draw line
        ctx.strokeStyle = '#0d9488';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        data.forEach((point, i) => {
            const x = padding + i * xStep;
            const y = padding + height - (point.AvgScore / 100) * height;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
        
        // Draw points
        ctx.fillStyle = '#ffffff';
        data.forEach((point, i) => {
            const x = padding + i * xStep;
            const y = padding + height - (point.AvgScore / 100) * height;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // X axis labels (sparse)
            if (i % Math.ceil(data.length / 5) === 0 || i === data.length - 1) {
                ctx.fillStyle = '#94a3b8';
                ctx.textAlign = 'center';
                const d = new Date(point.Date);
                ctx.fillText(d.toLocaleDateString(undefined, {month:'short', day:'numeric'}), x, canvas.height - 10);
            }
        });

    } catch (err) {
        console.error("Score trend error", err);
    }
}

async function loadViolationsDistribution() {
    try {
        const data = await apiFetch('/analyst/violations/frequent');
        // data = [{ActionName: 'Littering', Count: 15}, ...]
        const canvas = document.getElementById('chart-violations-pie');
        const ctx = canvas.getContext('2d');
        const legend = document.getElementById('violations-legend');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        legend.innerHTML = '';
        
        if (!data || data.length === 0) {
            ctx.fillText("No data", canvas.width/2, canvas.height/2);
            return;
        }

        const colors = ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#ccfbf1', '#94a3b8', '#64748b'];
        const total = data.reduce((sum, item) => sum + item.Count, 0);
        let currentAngle = 0;
        
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const radius = Math.min(cx, cy) - 10;
        
        data.forEach((item, index) => {
            const sliceAngle = (item.Count / total) * 2 * Math.PI;
            const color = colors[index % colors.length];
            
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            currentAngle += sliceAngle;
            
            // legend item
            const percent = Math.round((item.Count / total) * 100);
            legend.innerHTML += `
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="width: 12px; height: 12px; background-color: ${color}; border-radius: 2px;"></div>
                    <span>${item.ActionName} (${percent}%)</span>
                </div>
            `;
        });

    } catch (err) {
        console.error("Violation pie error", err);
    }
}

async function loadComplaintsByCity() {
    try {
        const data = await apiFetch('/analyst/complaints/by-city');
        const tbody = document.getElementById('complaints-city-body');
        
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" class="text-center text-muted">No data available.</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.map(c => `
            <tr>
                <td>${c.City || 'Unknown'}</td>
                <td style="font-weight: 500;">${c.Count}</td>
            </tr>
        `).join('');

    } catch (err) {
        console.error("Complaints by city error", err);
    }
}

async function loadTopCitizens() {
    try {
        const citizens = await apiFetch('/analyst/citizens/top');
        const tbody = document.getElementById('top-citizens-body');
        
        if (!citizens || citizens.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No data available.</td></tr>';
            return;
        }
        
        tbody.innerHTML = citizens.map((c, index) => {
            let rowStyle = '';
            let rankDecor = `#${index + 1}`;
            
            if (index === 0) { rowStyle = 'background-color: #fef08a;'; rankDecor = `🥇 ${rankDecor}`; }
            else if (index === 1) { rowStyle = 'background-color: #e2e8f0;'; rankDecor = `🥈 ${rankDecor}`; }
            else if (index === 2) { rowStyle = 'background-color: #ffedd5;'; rankDecor = `🥉 ${rankDecor}`; }
            
            return `
                <tr style="${rowStyle}">
                    <td style="font-weight: 600;">${rankDecor}</td>
                    <td>${c.Name || `Citizen ID: ${c.CitizenID}`}</td>
                    <td>${c.City || '—'}</td>
                    <td class="text-green font-bold">${Math.round(c.TrustScore)}</td>
                </tr>
            `;
        }).join('');

    } catch (err) {
        console.error("Top citizens error", err);
    }
}

async function loadAgeGroupScores() {
    try {
        const data = await apiFetch('/analyst/scores/by-agegroup');
        const tbody = document.getElementById('agegroup-scores-body');
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" class="text-center text-muted">No data available.</td></tr>';
            return;
        }
        tbody.innerHTML = data.map(item => `
            <tr>
                <td>${item.GroupName}</td>
                <td style="font-weight: 500;">${Math.round(item.AvgScore)}</td>
            </tr>
        `).join('');
    } catch(e) { console.error(e); }
}

async function loadBenefitPopularity() {
    try {
        const data = await apiFetch('/analyst/benefits/popularity');
        const tbody = document.getElementById('benefit-popularity-body');
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" class="text-center text-muted">No data available.</td></tr>';
            return;
        }
        tbody.innerHTML = data.map(item => `
            <tr>
                <td>${item.BenefitName}</td>
                <td style="font-weight: 500;">${item.GrantedCount}</td>
            </tr>
        `).join('');
    } catch(e) { console.error(e); }
}

async function loadHighestViolations() {
    try {
        const data = await apiFetch('/analyst/citizens/highest-violations');
        const tbody = document.getElementById('highest-violations-body');
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" class="text-center text-muted">No data available.</td></tr>';
            return;
        }
        tbody.innerHTML = data.map(item => `
            <tr>
                <td>${item.FullName} (ID: ${item.CitizenID})</td>
                <td class="text-red font-bold">${item.ViolationCount}</td>
            </tr>
        `).join('');
    } catch(e) { console.error(e); }
}

async function loadRestrictions() {
    try {
        const data = await apiFetch('/analyst/citizens/with-restrictions');
        const tbody = document.getElementById('restrictions-body');
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No active restrictions.</td></tr>';
            return;
        }
        
        // Use a simple date formatter since formatDate might not be explicitly imported if not in window
        // But assuming it is in api.js globally:
        tbody.innerHTML = data.map(item => `
            <tr>
                <td>${item.FullName} (ID: ${item.CitizenID})</td>
                <td><span class="badge badge-yellow">${item.RestrictionType}</span></td>
                <td>${item.DepartmentName}</td>
                <td>${new Date(item.EndDate).toLocaleDateString()}</td>
            </tr>
        `).join('');
    } catch(e) { console.error(e); }
}

async function loadAllBenefitsEligible() {
    try {
        const data = await apiFetch('/analyst/citizens/all-benefits-eligible');
        const tbody = document.getElementById('all-benefits-eligible-body');
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" class="text-center text-muted">No citizens eligible for all benefits.</td></tr>';
            return;
        }
        tbody.innerHTML = data.map(item => `
            <tr>
                <td>${item.FullName} (ID: ${item.CitizenID})</td>
                <td class="text-green font-bold">${item.CurrentScore}</td>
            </tr>
        `).join('');
    } catch(e) { console.error(e); }
}
