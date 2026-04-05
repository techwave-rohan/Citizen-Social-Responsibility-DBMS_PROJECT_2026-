requireAuth();
const officialId = getMyId();

document.addEventListener('DOMContentLoaded', () => {
    // Render sidebar
    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar';
    sidebar.innerHTML = `
        <div class="sidebar-title">🏛 TrustScore</div>
        <ul class="nav-links">
            <li><a href="official.html" class="active">Overview</a></li>
            <li><a href="profile.html">My Profile</a></li>
        </ul>
        <div class="logout-container">
            <button class="logout-btn" onclick="logout()">Log Out</button>
        </div>
    `;
    document.body.insertBefore(sidebar, document.body.firstChild);
    
    initDashboard();
});

async function initDashboard() {
    loadStats();
    loadComplaints();
    loadViolations();
    loadRepeatedViolations();
    loadDepartments();
    loadDepartmentRestrictions();
    loadCitizensWithIssues();

    // Attach form handlers
    document.getElementById('issue-restriction-form').addEventListener('submit', handleIssueRestriction);
    document.getElementById('check-eligibility-form').addEventListener('submit', handleCheckEligibility);
    document.getElementById('assign-benefit-form').addEventListener('submit', handleAssignBenefit);
}

async function loadStats() {
    try {
        const stats = await apiFetch('/official/stats');
        document.getElementById('stat-total-actions').textContent = stats.total_actions ?? 0;
        document.getElementById('stat-restricted').textContent = stats.citizens_restricted ?? 0;
    } catch (err) {
        console.error("Stats load error:", err);
        document.getElementById('stat-total-actions').textContent = '0';
        document.getElementById('stat-restricted').textContent = '0';
    }
}

async function loadDepartments() {
    try {
        const select = document.getElementById('restrict-dept');
        if (!select) return; // element might not exist
        const depts = await apiFetch('/official/departments');
        
        select.innerHTML = '<option value="">-- Select Department --</option>' + 
            depts.map(d => `<option value="${d.DepartmentID}">${d.DepartmentName}</option>`).join('');
    } catch(err) {
        console.error("Departments load error", err);
    }
}

async function loadComplaints() {
    try {
        const complaints = await apiFetch('/official/complaints/pending').catch(async () => {
            return [];
        });

        const tbody = document.getElementById('complaints-table-body');
        document.getElementById('stat-pending-complaints').textContent = complaints.length || 0;
        
        if (complaints.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No pending complaints.</td></tr>';
            return;
        }

        tbody.innerHTML = complaints.map(c => `
            <tr>
                <td>${c.ComplaintID}</td>
                <td>${c.FilerName || 'Unknown'} (ID: ${c.FiledByCitizenID})</td>
                <td>${c.AgainstName || 'Unknown'} (ID: ${c.AgainstCitizenID})</td>
                <td title="${c.Description}">${c.Description.substring(0, 30)}...</td>
                <td><span class="badge badge-yellow">${c.Status}</span></td>
                <td>
                    <button class="btn btn-primary" onclick="openResolveModal(${c.ComplaintID})" style="padding: 0.25rem 0.75rem;">Resolve</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Load complaints error:", err);
        document.getElementById('complaints-table-body').innerHTML = '<tr><td colspan="6" class="text-center text-red">Failed to load</td></tr>';
    }
}

async function loadViolations() {
    try {
        const violations = await apiFetch('/official/violations');
        document.getElementById('stat-violations-today').textContent = violations.length || 0;
        
        const tbody = document.getElementById('violations-table-body');
        if (violations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No recent violations.</td></tr>';
            return;
        }

        tbody.innerHTML = violations.map(v => `
            <tr>
                <td>${v.CitizenID}</td>
                <td><span class="badge badge-red">Violation</span></td>
                <td>${v.ActionName || 'Unknown Violation'}</td>
                <td>${formatDate(v.ActionDate)}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Violations error:", err);
    }
}

async function loadRepeatedViolations() {
    try {
        const repeatViolations = await apiFetch('/official/violations/repeated');
        
        const tbody = document.getElementById('repeated-violations-table-body');
        if (!tbody) return;

        if (repeatViolations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No repeated offenders.</td></tr>';
            return;
        }

        tbody.innerHTML = repeatViolations.map(v => `
            <tr>
                <td>${v.CitizenID}</td>
                <td>${v.FullName}</td>
                <td>${v.ActionName}</td>
                <td><span class="badge badge-red">${v.ViolationCount} Offenses</span></td>
                <td>${formatDate(v.LastViolationDate)}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Repeated Violations error:", err);
        const tbody = document.getElementById('repeated-violations-table-body');
        if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="text-center text-red">Failed to load</td></tr>';

    }
}

async function handleCheckEligibility(e) {
    e.preventDefault();
    const citizenId = document.getElementById('eligibility-citizen-id').value;
    const resultDiv = document.getElementById('eligibility-result');
    const msgDiv = document.getElementById('eligibility-message');
    const select = document.getElementById('assign-benefit-id');
    
    resultDiv.classList.add('hidden');
    msgDiv.classList.add('hidden');
    
    try {
        const benefits = await apiFetch(`/official/citizen/${citizenId}/eligible-benefits`);
        
        if (benefits.length === 0) {
            msgDiv.textContent = 'Citizen is not eligible for any unassigned benefits currently.';
            msgDiv.classList.remove('hidden');
            return;
        }
        
        document.getElementById('assign-citizen-id').value = citizenId;
        select.innerHTML = '<option value="">-- Select a Benefit --</option>' + 
            benefits.map(b => `<option value="${b.BenefitID}">${b.BenefitName} (Min Score: ${b.MinScoreRequired})</option>`).join('');
            
        resultDiv.classList.remove('hidden');
    } catch (err) {
        msgDiv.textContent = err.message || 'Failed to fetch eligibility';
        msgDiv.classList.remove('hidden');
    }
}

async function handleAssignBenefit(e) {
    e.preventDefault();
    const citizenId = document.getElementById('assign-citizen-id').value;
    const benefitId = document.getElementById('assign-benefit-id').value;
    
    try {
        await apiFetch('/official/benefit/assign', 'POST', {
            CitizenID: parseInt(citizenId),
            BenefitID: parseInt(benefitId)
        });
        showToast('Benefit assigned successfully!');
        
        // Reset and hide
        document.getElementById('eligibility-result').classList.add('hidden');
        document.getElementById('check-eligibility-form').reset();
        document.getElementById('assign-benefit-form').reset();
    } catch (err) {
        showToast(err.message || 'Failed to assign benefit', 'error');
    }
}

async function loadDepartmentRestrictions() {
    try {
        const restrictions = await apiFetch('/official/restrictions');
        const tbody = document.getElementById('restrictions-table-body');
        if (!tbody) return;

        if (restrictions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No active restrictions.</td></tr>';
            return;
        }

        tbody.innerHTML = restrictions.map(r => `
            <tr>
                <td>${r.CitizenName} (ID: ${r.CitizenID})</td>
                <td>${r.DepartmentName}</td>
                <td><span class="badge badge-yellow">${r.RestrictionType}</span></td>
                <td>${formatDate(r.StartDate)}</td>
                <td>${formatDate(r.EndDate)}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Restrictions error:", err);
    }
}

async function loadCitizensWithIssues() {
    try {
        const issues = await apiFetch('/official/citizens-with-issues');
        const tbody = document.getElementById('issues-table-body');
        if (!tbody) return;

        if (issues.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No citizens with both complaints and violations.</td></tr>';
            return;
        }

        tbody.innerHTML = issues.map(i => `
            <tr>
                <td>${i.FullName} (ID: ${i.CitizenID})</td>
                <td><span class="badge badge-yellow">${i.ComplaintCount}</span></td>
                <td><span class="badge badge-red">${i.ViolationCount}</span></td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Citizens with issues error:", err);
    }
}



async function handleIssueRestriction(e) {
    e.preventDefault();
    const citizenId = document.getElementById('restrict-citizen-id').value;
    const type = document.getElementById('restrict-type').value;
    const endDate = document.getElementById('restrict-end-date').value;
    const deptId = document.getElementById('restrict-dept') ? document.getElementById('restrict-dept').value : '1';
    
    try {
        await apiFetch('/official/restriction', 'POST', {
            CitizenID: parseInt(citizenId),
            RestrictionType: type,
            DepartmentID: parseInt(deptId),
            EndDate: endDate
        });
        showToast('Restriction issued successfully!');
        e.target.reset();
    } catch (err) {
        showToast(err.message || 'Failed to issue restriction', 'error');
    }
}

function openResolveModal(complaintId) {
    const template = document.getElementById('resolve-modal-template').innerHTML;
    openModal(`Resolve Complaint #${complaintId}`, template, async (e) => {
        const status = document.getElementById('resolve-status').value;
        const note = document.getElementById('resolve-note').value;
        
        await apiFetch(`/official/complaint/${complaintId}/resolve`, 'PUT', {
            Status: status,
            ResolutionNote: note
        });
        
        showToast('Complaint resolved!');
        loadComplaints();
    });
}
