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
    loadComplaints();
    loadViolations();
    loadRepeatedViolations();
    loadActionTypes();
    loadDepartments();

    // Attach form handlers
    document.getElementById('record-action-form').addEventListener('submit', handleRecordAction);
    document.getElementById('issue-restriction-form').addEventListener('submit', handleIssueRestriction);
}

// Global variable to store active action types
let actionTypesData = [];

async function loadActionTypes() {
    try {
        const select = document.getElementById('action-type-id');
        const types = await apiFetch('/admin/action-types');
        actionTypesData = types;
        
        select.innerHTML = '<option value="">-- Select an Action --</option>' + 
            types.map(t => {
                const impactStr = t.ScoreImpact > 0 ? `(+${t.ScoreImpact})` : `(${t.ScoreImpact})`;
                return `<option value="${t.ActionTypeID}">${t.ActionName} ${impactStr}</option>`;
            }).join('');
    } catch(err) {
        console.error("Action types load error", err);
        document.getElementById('action-type-id').innerHTML = '<option value="">Failed to load</option>';
    }
}

async function loadDepartments() {
    try {
        const select = document.getElementById('restrict-dept');
        if (!select) return; // element might not exist
        const depts = await apiFetch('/admin/departments');
        
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
                <td>${c.FiledByCitizenID}</td>
                <td>${c.AgainstCitizenID}</td>
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

async function handleRecordAction(e) {
    e.preventDefault();
    const citizenId = document.getElementById('action-citizen-id').value;
    const actionTypeId = document.getElementById('action-type-id').value;
    
    try {
        await apiFetch('/official/action', 'POST', {
            CitizenID: parseInt(citizenId),
            ActionTypeID: parseInt(actionTypeId)
        });
        
        showToast('Action recorded successfully!');
        e.target.reset();
        loadViolations();
    } catch (err) {
        showToast(err.message || 'Failed to record action', 'error');
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
