requireAuth();

// Configuration for active tab context
let currentTab = 'action-types';
let currentEndpoint = '/admin/action-types';
let currentIdKey = 'ActionTypeID';
let dataMap = {}; // store data for easy editing

const resources = {
    'action-types': {
        endpoint: '/admin/action-types',
        idKey: 'ActionTypeID',
        fields: ['ActionName', 'ScoreImpact', 'Severity'],
        mapper: (item, editFn, delFn) => {
            const ags = item.AgeGroupIDs && item.AgeGroupIDs.length ? item.AgeGroupIDs.join(', ') : 'None';
            const depts = item.DepartmentIDs && item.DepartmentIDs.length ? item.DepartmentIDs.join(', ') : 'None';
            return `
            <tr>
                <td>${item.ActionTypeID}</td>
                <td>${item.ActionName}</td>
                <td class="${item.ScoreImpact >= 0 ? 'text-green' : 'text-red'} font-bold">
                    ${item.ScoreImpact > 0 ? '+'+item.ScoreImpact : item.ScoreImpact}
                </td>
                <td>${item.Severity || '-'}</td>
                <td>${ags}</td>
                <td>${depts}</td>
                <td>
                    <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; margin-right: 0.5rem;" onclick="${editFn}">Edit</button>
                    <button class="btn btn-danger" style="padding: 0.25rem 0.5rem;" onclick="${delFn}">Delete</button>
                </td>
            </tr>
            `;
        }
    },
    'benefits': {
        endpoint: '/admin/benefits',
        idKey: 'BenefitID',
        fields: ['BenefitName', 'MinScoreRequired'],
        mapper: (item, editFn, delFn) => `
            <tr>
                <td>${item.BenefitID}</td>
                <td>${item.BenefitName}</td>
                <td>${item.MinScoreRequired}</td>
                <td>
                    <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; margin-right: 0.5rem;" onclick="${editFn}">Edit</button>
                    <button class="btn btn-danger" style="padding: 0.25rem 0.5rem;" onclick="${delFn}">Delete</button>
                </td>
            </tr>
        `
    },
    'citizens': {
        endpoint: '/admin/citizens',
        idKey: 'CitizenID',
        fields: ['AadhaarNumber', 'Password', 'FirstName', 'LastName', 'DateOfBirth', 'City', 'ContactNo', 'AgeGroupID'],
        mapper: (item, editFn, delFn) => {
            return `
            <tr>
                <td>${item.CitizenID}</td>
                <td>${item.AadhaarNumber}</td>
                <td>${item.FirstName} ${item.LastName}</td>
                <td>${item.City}</td>
                <td>${item.CurrentScore}</td>
                <td>
                    <button class="btn btn-danger" style="padding: 0.25rem 0.5rem;" onclick="${delFn}">Delete</button>
                </td>
            </tr>
            `;
        }
    },
    'officials': {
        endpoint: '/admin/officials',
        idKey: 'OfficialID',
        fields: ['FirstName', 'LastName', 'Email', 'Password', 'Designation', 'DepartmentID'],
        mapper: (item, editFn, delFn) => {
            return `
            <tr>
                <td>${item.OfficialID}</td>
                <td>${item.FirstName} ${item.LastName}</td>
                <td>${item.Designation}</td>
                <td>${item.Email}</td>
                <td>
                    <button class="btn btn-danger" style="padding: 0.25rem 0.5rem;" onclick="${delFn}">Delete</button>
                </td>
            </tr>
            `;
        }
    },
    'departments': {
        endpoint: '/admin/departments',
        idKey: 'DepartmentID',
        fields: ['DepartmentID', 'DepartmentName'],
        mapper: (item, editFn, delFn) => `
            <tr>
                <td>${item.DepartmentID}</td>
                <td>${item.DepartmentName}</td>
                <td>
                    <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; margin-right: 0.5rem;" onclick="${editFn}">Edit</button>
                    <button class="btn btn-danger" style="padding: 0.25rem 0.5rem;" onclick="${delFn}">Delete</button>
                </td>
            </tr>
        `
    },
    'age-groups': {
        endpoint: '/admin/agegroups',
        idKey: 'AgeGroupID',
        fields: ['GroupName', 'MinAge', 'MaxAge'],
        mapper: (item, editFn, delFn) => `
            <tr>
                <td>${item.AgeGroupID}</td>
                <td>${item.GroupName}</td>
                <td>${item.MinAge}</td>
                <td>${item.MaxAge}</td>
                <td>
                    <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; margin-right: 0.5rem;" onclick="${editFn}">Edit</button>
                    <button class="btn btn-danger" style="padding: 0.25rem 0.5rem;" onclick="${delFn}">Delete</button>
                </td>
            </tr>
        `
    }
};


document.addEventListener('DOMContentLoaded', () => {
    // Render sidebar
    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar';
    sidebar.innerHTML = `
        <div class="sidebar-title">🏛 TrustScore</div>
        <ul class="nav-links">
            <li><a href="admin.html" class="active">Management</a></li>
            <li><a href="profile.html">My Profile</a></li>
        </ul>
        <div class="logout-container">
             <button class="logout-btn" onclick="logout()">Log Out</button>
        </div>
    `;
    document.body.insertBefore(sidebar, document.body.firstChild);
    
    // Load initial tab
    loadTab('action-types');
});

function switchTab(event, targetId) {
    // Update active tab styling
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    // Update active content
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(targetId).classList.add('active');
    
    // Parse which resource it is
    const resourceName = targetId.replace('tab-', '');
    loadTab(resourceName);
}

async function loadTab(resourceName) {
    currentTab = resourceName;
    const config = resources[resourceName];
    currentEndpoint = config.endpoint;
    currentIdKey = config.idKey;
    dataMap[resourceName] = {};
    
    const tbody = document.getElementById(`table-${resourceName}`);
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Loading...</td></tr>';
    
    try {
        const data = await apiFetch(currentEndpoint);
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No records found.</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.map(item => {
            const id = item[config.idKey];
            dataMap[resourceName][id] = item;
            
            return config.mapper(
                item, 
                `openEditModal('${id}')`, 
                `confirmDelete('${id}')`
            );
        }).join('');
        
    } catch (err) {
        console.error(`Failed to load ${resourceName}`, err);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-red">Failed to load data.</td></tr>';
    }
}

function openAddModal() {
    const config = resources[currentTab];
    const template = document.getElementById(`form-${currentTab}`).innerHTML;
    
    const title = "Add " + currentTab.split('-').map(str => str.charAt(0).toUpperCase() + str.slice(1)).join(' ');
    
    openModal(title, template, async () => {
        await doFormSubmit();
    });

    if (currentTab === 'action-types') {
        populateAgeGroupCheckboxes();
        populateDepartmentCheckboxes();
    }
}

async function populateDepartmentCheckboxes(selectedIds = []) {
    const container = document.getElementById('DepartmentContainer');
    if (!container) return;
    try {
        const depts = await apiFetch('/admin/departments');
        container.innerHTML = depts.map(d => `
            <label style="display: flex; align-items: center; gap: 0.5rem;">
                <input type="checkbox" name="departments" value="${d.DepartmentID}" ${selectedIds.includes(d.DepartmentID) ? 'checked' : ''}>
                ${d.DepartmentName}
            </label>
        `).join('');
    } catch (e) {
        console.error('Failed to load departments', e);
    }
}

async function populateAgeGroupCheckboxes(selectedIds = []) {
    const container = document.getElementById('AgeGroupContainer');
    if (!container) return;
    try {
        const ags = await apiFetch('/admin/agegroups');
        container.innerHTML = ags.map(ag => `
            <label style="display: flex; align-items: center; gap: 0.5rem;">
                <input type="checkbox" name="age_groups" value="${ag.AgeGroupID}" ${selectedIds.includes(ag.AgeGroupID) ? 'checked' : ''}>
                ${ag.GroupName} (${ag.MinAge}-${ag.MaxAge})
            </label>
        `).join('');
    } catch (e) {
        console.error('Failed to load age groups', e);
    }
}

function openEditModal(id) {
    const item = dataMap[currentTab][id];
    const config = resources[currentTab];
    const template = document.getElementById(`form-${currentTab}`).innerHTML;
    
    openModal('Edit Record', template, async () => {
        await doFormSubmit();
    });
    
    // Populate form data
    document.getElementById('form-id').value = id;
    config.fields.forEach(field => {
        const input = document.getElementById(field);
        if (input && item[field] !== undefined && item[field] !== null) {
            // Reformat Date fields implicitly if any
            let val = item[field];
            if (field.includes('Date') && val.includes('T')) val = val.split('T')[0];
            input.value = val;
        }
    });

    if (currentTab === 'action-types') {
        populateAgeGroupCheckboxes(item.AgeGroupIDs || []);
        populateDepartmentCheckboxes(item.DepartmentIDs || []);
    }
}

async function doFormSubmit() {
    const config = resources[currentTab];
    const formId = document.getElementById('form-id').value;
    
    const payload = {};
    config.fields.forEach(field => {
        const val = document.getElementById(field).value;
        // Parse numbers if necessary
        if (field.includes('Score') || field.includes('Severity') || field.includes('Age') || field === 'DepartmentID') {
            payload[field] = parseInt(val, 10);
        } else {
            payload[field] = val;
        }
    });

    if (currentTab === 'action-types') {
        const agCheckboxes = document.querySelectorAll('input[name="age_groups"]:checked');
        payload.AgeGroupIDs = Array.from(agCheckboxes).map(cb => parseInt(cb.value, 10));

        const deptCheckboxes = document.querySelectorAll('input[name="departments"]:checked');
        payload.DepartmentIDs = Array.from(deptCheckboxes).map(cb => parseInt(cb.value, 10));
    }

    if (formId) {
        // Update
        if (currentTab === 'citizens' || currentTab === 'officials') {
             throw new Error("Editing accounts from Admin UI is currently unsupported.");
        }
        await apiFetch(`${currentEndpoint}/${formId}`, 'PUT', payload);
        showToast('Record updated successfully');
    } else {
        // Create overriding registration endpoint
        let endpoint = currentEndpoint;
        if (currentTab === 'citizens') endpoint = '/auth/register';
        else if (currentTab === 'officials') endpoint = '/auth/register/official';
        
        await apiFetch(endpoint, 'POST', payload);
        showToast('Record created successfully');
    }
    
    loadTab(currentTab); // refresh table
}

// Keep this for the HTML onsubmit attribute as a fallback
async function handleFormSubmit(event) {
    event.preventDefault();
    try {
        await doFormSubmit();
        closeModal();
    } catch (err) {
        showToast(err.message || 'Error saving record', 'error');
    }
}

function confirmDelete(id) {
    const template = document.getElementById('modal-delete').innerHTML;
    
    // openModal won't find a <form> in the delete template, so submit callback is unused.
    // Instead, we wire the confirm button manually after modal is open.
    openModal('Confirm Deletion', template, () => {});
    
    const confirmBtn = document.getElementById('confirm-delete-btn');
    if (confirmBtn) {
        confirmBtn.onclick = async () => {
            confirmBtn.disabled = true;
            try {
                let delEndpoint = currentEndpoint;
                if (currentTab === 'citizens') delEndpoint = '/admin/citizen';
                if (currentTab === 'officials') delEndpoint = '/admin/official';
                
                await apiFetch(`${delEndpoint}/${id}`, 'DELETE');
                showToast('Record deleted successfully');
                closeModal();
                loadTab(currentTab);
            } catch (err) {
                showToast(err.message || 'Error deleting record', 'error');
                confirmBtn.disabled = false;
            }
        };
    }
}
