requireAuth();
const role = localStorage.getItem('role');

document.addEventListener('DOMContentLoaded', () => {
    // Inject correct sidebar based on role
    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar';
    
    let dashboardLink = '#';
    if (role === 'admin') dashboardLink = 'admin.html';
    else if (role === 'official') dashboardLink = 'official.html';
    else if (role === 'citizen') dashboardLink = 'citizen.html';

    sidebar.innerHTML = `
        <div class="sidebar-title">🏛 TrustScore</div>
        <ul class="nav-links">
            <li><a href="${dashboardLink}">Dashboard</a></li>
            <li><a href="profile.html" class="active">My Profile</a></li>
        </ul>
        <div class="logout-container">
            <button class="logout-btn" onclick="logout()">Log Out</button>
        </div>
    `;
    document.body.insertBefore(sidebar, document.body.firstChild);
    
    loadProfile();
});

async function loadProfile() {
    try {
        const data = await apiFetch('/auth/me');
        const roleStr = data.Role.toUpperCase();
        document.getElementById('profile-role-badge').textContent = roleStr;
        
        let initial = 'U';
        let fullName = 'Unknown User';
        const detailsContainer = document.getElementById('profile-details-container');
        let detailsHtml = '';

        const makeRow = (label, val) => `
            <div style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border);">
                <span class="text-muted" style="font-weight: 500;">${label}</span>
                <span style="font-weight: 600;">${val}</span>
            </div>
        `;

        if (data.Role === 'admin') {
            fullName = `${data.Profile.FirstName} ${data.Profile.LastName}`;
            detailsHtml += makeRow('Email', data.Email);
            detailsHtml += makeRow('Permissions', 'Full Access');
            
        } else if (data.Role === 'citizen') {
            fullName = `${data.Profile.FirstName} ${data.Profile.LastName}`;
            detailsHtml += makeRow('Aadhaar Number', data.Profile.AadhaarNumber);
            detailsHtml += makeRow('Date of Birth', new Date(data.Profile.DOB).toLocaleDateString());
            detailsHtml += makeRow('City', data.Profile.City);
            detailsHtml += makeRow('Contact', data.Profile.ContactNo);
            detailsHtml += makeRow('Trust Score', data.Profile.CurrentScore);
            
        } else if (data.Role === 'official' || data.Role === 'analyst') {
            fullName = `${data.Profile.FirstName} ${data.Profile.LastName}`;
            detailsHtml += makeRow('Email', data.Profile.Email);
            detailsHtml += makeRow('Designation', data.Profile.Designation);
            detailsHtml += makeRow('Department', data.Profile.DepartmentName || `ID: ${data.Profile.DepartmentID}`);
        }
        
        if (fullName.trim()) {
            initial = fullName.charAt(0).toUpperCase();
        }

        document.getElementById('profile-name').innerHTML = fullName;
        document.getElementById('profile-initials').innerHTML = initial;
        detailsContainer.innerHTML = detailsHtml;

    } catch (err) {
        console.error("Profile load err", err);
        showToast('Failed to load profile details', 'error');
        document.getElementById('profile-name').innerHTML = "Error Loading Profile";
    }
}
