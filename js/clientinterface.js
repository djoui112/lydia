document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '../php/api';
    const track = document.getElementById('projectSliderTrack');
    if (!track) {
        return;
    }

    const setEmptyState = (message) => {
        track.innerHTML = `
            <p style="width:100%; text-align:center; margin:40px 0;">${message}</p>
        `;
    };

    const normalizeImagePath = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const clean = path.replace(/^\/+/, '');
        if (clean.startsWith('assets/')) return `../${clean}`;
        if (clean.startsWith('uploads/')) return `../assets/${clean}`;
        return `../${clean}`;
    };

    const formatDate = (dateValue) => {
        if (!dateValue) return '';
        const dt = new Date(dateValue);
        if (Number.isNaN(dt.getTime())) return '';
        const day = String(dt.getDate()).padStart(2, '0');
        const month = String(dt.getMonth() + 1).padStart(2, '0');
        const year = dt.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const renderProjects = (projects) => {
        track.innerHTML = '';
        projects.forEach((project, index) => {
            const agencyName = project.agency_name || '--';
            const architectName = project.architect_name || '--';
            const tags = project.project_type ? project.project_type.replace(/_/g, ' ') : 'project';
            const dateLabel = formatDate(project.display_date);
            const imageUrl = normalizeImagePath(project.project_photo_url);

            const card = document.createElement('div');
            card.className = 'project-slider-card';
            card.dataset.index = String(index);
            card.innerHTML = `
                <div class="project-content">
                    <div class="project-info">
                        <h3 class="project-name">${project.project_name || 'Project'}</h3>
                        <div class="project-details">
                            <p class="project-agency">Agency: ${agencyName}</p>
                            <p class="project-architect">Architect: ${architectName}</p>
                            <p class="project-tags">${tags}</p>
                            ${dateLabel ? `
                            <div class="project-date">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                                    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2" />
                                </svg>
                                <span>${dateLabel}</span>
                            </div>` : ''}
                        </div>
                        <a href="clientproject.html?project_id=${project.project_id}" class="btn-view-project">view project</a>
                    </div>
                    <div class="project-image">
                        <img src="${imageUrl || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop'}" alt="Client project" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop';" />
                    </div>
                </div>
            `;
            track.appendChild(card);
        });
    };

    const loadProjects = async () => {
        try {
            const res = await fetch(`${API_BASE}/projects/client.php`, {
                method: 'GET',
                credentials: 'include',
            });

            if (res.status === 401) {
                setEmptyState('No project yet');
                return;
            }

            const data = await res.json();
            if (!res.ok || !data.success) {
                setEmptyState('No project yet');
                return;
            }

            const projects = Array.isArray(data.data) ? data.data : [];
            if (projects.length === 0) {
                setEmptyState('No project yet');
                return;
            }

            renderProjects(projects);
        } catch (err) {
            setEmptyState('No project yet');
        }
    };

    loadProjects();
});
