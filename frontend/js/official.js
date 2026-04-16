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
    loadActionTypes();
    loadComplaints();
    loadViolations();
    loadRepeatedViolations();
    loadDepartments();
    loadDepartmentRestrictions();
    loadCitizensWithIssues();
    loadHighRiskCitizens();
    loadAutoRestrictions();

    // Attach form handlers
    document.getElementById('record-action-form').addEventListener('submit', handleRecordAction);
    document.getElementById('issue-restriction-form').addEventListener('submit', handleIssueRestriction);
    document.getElementById('check-eligibility-form').addEventListener('submit', handleCheckEligibility);
    document.getElementById('assign-benefit-form').addEventListener('submit', handleAssignBenefit);

    // Action type preview on change
    document.getElementById('action-type-select').addEventListener('change', showActionPreview);
}

// ─── Stats ────────────────────────────────────────────────────────

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

// ─── Action Types (for Record Action form) ────────────────────────

let actionTypesCache = [];

async function loadActionTypes() {
    try {
        const actionTypes = await apiFetch('/official/action-types');
        actionTypesCache = actionTypes;
        const select = document.getElementById('action-type-select');
        select.innerHTML = '<option value="">-- Select Action --</option>' +
            actionTypes.map(a => {
                const icon = a.ScoreImpact >= 0 ? '▲' : '▼';
                const cls = a.ScoreImpact >= 0 ? '+' : '';
                return `<option value="${a.ActionTypeID}" data-impact="${a.ScoreImpact}" data-severity="${a.Severity}">${a.ActionName} (${cls}${a.ScoreImpact})</option>`;
            }).join('');
    } catch (err) {
        console.error("Failed to load action types:", err);
    }
}

function showActionPreview() {
    const select = document.getElementById('action-type-select');
    const preview = document.getElementById('action-preview');
    const selectedOption = select.options[select.selectedIndex];

    if (!select.value) {
        preview.classList.add('hidden');
        return;
    }

    const impact = parseInt(selectedOption.dataset.impact);
    const severity = parseInt(selectedOption.dataset.severity);
    const isNegative = impact < 0;

    preview.classList.remove('hidden');
    preview.innerHTML = `
        <div class="preview-row">
            <span class="text-muted">Score Impact:</span>
            <span class="${isNegative ? 'text-red' : 'text-green'} font-medium">${isNegative ? '' : '+'}${impact} points</span>
        </div>
        <div class="preview-row">
            <span class="text-muted">Severity:</span>
            <span>${'⬤'.repeat(severity)}${'○'.repeat(5 - severity)}</span>
        </div>
        ${isNegative ? `
        <div class="preview-row preview-warning">
            <span>⚠️ Negative action — may trigger auto-restrictions if repeated 3+ times this month</span>
        </div>
        ` : ''}
    `;
}

// ─── Record Action (Trigger #1: after_action_insert) ──────────────

async function handleRecordAction(e) {
    e.preventDefault();
    const citizenId = document.getElementById('action-citizen-id').value;
    const actionTypeId = document.getElementById('action-type-select').value;
    const btn = e.target.querySelector('button[type="submit"]');
    const feedbackDiv = document.getElementById('trigger-feedback');

    if (!citizenId || !actionTypeId) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Recording...';

    try {
        const result = await apiFetch('/official/action', 'POST', {
            CitizenID: parseInt(citizenId),
            ActionTypeID: parseInt(actionTypeId)
        });

        // Show detailed trigger feedback
        feedbackDiv.classList.remove('hidden');
        let feedbackHTML = `
            <div class="feedback-header">✅ Action Recorded: ${result.action_name}</div>
            <div class="feedback-score">
                <span class="score-change">
                    <span class="old-score">${result.old_score}</span>
                    <span class="score-arrow">→</span>
                    <span class="new-score ${result.new_score > result.old_score ? 'text-green' : result.new_score < result.old_score ? 'text-red' : ''}">${result.new_score}</span>
                </span>
                <span class="score-delta ${result.score_impact >= 0 ? 'text-green' : 'text-red'}">
                    (${result.score_impact >= 0 ? '+' : ''}${result.score_impact})
                </span>
            </div>
        `;

        // Trigger #2: High Risk Flag notification
        if (result.high_risk_flagged) {
            feedbackHTML += `
                <div class="trigger-alert trigger-alert-danger">
                    <strong>🔴 Trigger Fired: auto_flag_high_risk</strong>
                    <p>Score dropped below 40 — citizen has been automatically flagged as HIGH RISK with a 60-day restriction.</p>
                </div>
            `;
            showToast('⚠️ HIGH RISK FLAG auto-applied! Score below 40.', 'error');
        }

        // Trigger #3: Auto restriction for repeated violations
        if (result.auto_restrictions && result.auto_restrictions.length > 0) {
            result.auto_restrictions.forEach(r => {
                if (r.RestrictionType && r.RestrictionType.startsWith('Auto:')) {
                    feedbackHTML += `
                        <div class="trigger-alert trigger-alert-warning">
                            <strong>⚡ Trigger Fired: auto_restrict_repeated_violation</strong>
                            <p>${r.RestrictionType} — 30-day restriction applied for 3+ repeated offenses this month.</p>
                            <small>Valid: ${formatDate(r.StartDate)} → ${formatDate(r.EndDate)}</small>
                        </div>
                    `;
                    showToast(`⚡ Auto-restriction applied: ${r.RestrictionType}`, 'error');
                }
            });
        }

        feedbackDiv.innerHTML = feedbackHTML;

        // Main success toast
        showToast(`Action recorded: ${result.action_name} (${result.old_score} → ${result.new_score})`);

        // Refresh all relevant panels
        e.target.reset();
        document.getElementById('action-preview').classList.add('hidden');
        loadStats();
        loadHighRiskCitizens();
        loadAutoRestrictions();
        loadViolations();
        loadRepeatedViolations();
        loadDepartmentRestrictions();

        // Auto-hide feedback after 15 seconds
        setTimeout(() => {
            feedbackDiv.classList.add('hidden');
        }, 15000);

    } catch (err) {
        showToast(err.message || 'Failed to record action', 'error');
        feedbackDiv.classList.add('hidden');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Record Action';
    }
}

// ─── High Risk Citizens (Trigger #2: auto_flag_high_risk) ─────────

async function loadHighRiskCitizens() {
    try {
        const citizens = await apiFetch('/official/high-risk-citizens');
        const tbody = document.getElementById('high-risk-table-body');
        const statEl = document.getElementById('stat-high-risk');
        const statCard = document.getElementById('stat-high-risk-card');

        statEl.textContent = citizens.length;

        // Highlight the card if there are high-risk citizens
        if (citizens.length > 0) {
            statCard.classList.add('stat-card-danger-active');
        } else {
            statCard.classList.remove('stat-card-danger-active');
        }

        if (citizens.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No high-risk citizens currently flagged.</td></tr>';
            return;
        }

        tbody.innerHTML = citizens.map(c => `
            <tr class="high-risk-row">
                <td>${c.CitizenID}</td>
                <td><strong>${c.FullName}</strong></td>
                <td>${c.City}</td>
                <td><span class="badge badge-red">${c.CurrentScore}</span></td>
                <td>${formatDate(c.FlaggedDate)}</td>
                <td>${formatDate(c.FlagExpiry)}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("High risk citizens error:", err);
        const tbody = document.getElementById('high-risk-table-body');
        if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center text-red">Failed to load</td></tr>';
        document.getElementById('stat-high-risk').textContent = '0';
    }
}

// ─── Auto-Generated Restrictions (Trigger #3) ────────────────────

async function loadAutoRestrictions() {
    try {
        const restrictions = await apiFetch('/official/auto-restrictions');
        const tbody = document.getElementById('auto-restrictions-table-body');

        if (restrictions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No auto-generated restrictions.</td></tr>';
            return;
        }

        tbody.innerHTML = restrictions.map(r => {
            const now = new Date();
            const endDate = new Date(r.EndDate);
            const isActive = endDate >= now;
            const isHighRisk = r.RestrictionType === 'High Risk Flag';
            const badgeClass = isHighRisk ? 'badge-red' : 'badge-orange';
            const statusBadge = isActive
                ? '<span class="badge badge-red">Active</span>'
                : '<span class="badge" style="background:#e2e8f0;color:#64748b;">Expired</span>';

            return `
                <tr>
                    <td>${r.CitizenName} (ID: ${r.CitizenID})</td>
                    <td><span class="badge ${badgeClass}">${r.RestrictionType}</span></td>
                    <td>${r.DepartmentName}</td>
                    <td>${formatDate(r.StartDate)}</td>
                    <td>${formatDate(r.EndDate)}</td>
                    <td>${statusBadge}</td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error("Auto restrictions error:", err);
        const tbody = document.getElementById('auto-restrictions-table-body');
        if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center text-red">Failed to load</td></tr>';
    }
}

// ─── Departments ──────────────────────────────────────────────────

async function loadDepartments() {
    try {
        const select = document.getElementById('restrict-dept');
        if (!select) return;
        const depts = await apiFetch('/official/departments');
        
        select.innerHTML = '<option value="">-- Select Department --</option>' + 
            depts.map(d => `<option value="${d.DepartmentID}">${d.DepartmentName}</option>`).join('');
    } catch(err) {
        console.error("Departments load error", err);
    }
}

// ─── Complaints ───────────────────────────────────────────────────

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

// ─── Violations ───────────────────────────────────────────────────

async function loadViolations() {
    try {
        const violations = await apiFetch('/official/violations');
        
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

// ─── Repeated Violations ──────────────────────────────────────────

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

// ─── Eligibility & Benefits ──────────────────────────────────────

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

// ─── Department Restrictions ──────────────────────────────────────

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

// ─── Citizens with Issues ─────────────────────────────────────────

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

// ─── Issue Restriction Form ───────────────────────────────────────

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
        loadDepartmentRestrictions();
        loadStats();
    } catch (err) {
        showToast(err.message || 'Failed to issue restriction', 'error');
    }
}

// ─── Resolve Complaint Modal ──────────────────────────────────────

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
