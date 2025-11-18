document.addEventListener("DOMContentLoaded", () => {
    loadArchitectData();
    initImageLoader();
});

// Load architect data based on URL parameter
function loadArchitectData() {
    const urlParams = new URLSearchParams(window.location.search);
    const architectId = urlParams.get('id') || '1';

    // Sample data - in a real application, this would come from an API
    const architects = {
        '1': {
            name: 'ZAHA HADID',
            title: 'Senior Architect',
            location: 'Algeria, Algiers',
            bio: 'Passionate architect with a focus on modern and sustainable design. Skilled in blending functionality with aesthetics to create innovative spaces. Experienced in 3D modeling, urban design, and construction project management.',
            projects: [
                {
                    id: 1,
                    name: 'Modern Residential Complex',
                    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=300&fit=crop',
                    type: 'Residential'
                },
                {
                    id: 2,
                    name: 'Sustainable Office Building',
                    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
                    type: 'Commercial'
                },
                {
                    id: 3,
                    name: 'Urban Park Design',
                    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
                    type: 'Public Space'
                }
            ]
        },
        '2': {
            name: 'ZAHA HADID',
            title: 'CEO AND FOUNDER',
            location: 'Algeria, Algiers',
            bio: 'Visionary architect and founder with over 15 years of experience in creating groundbreaking architectural designs. Specializes in sustainable architecture and innovative building solutions.',
            projects: [
                {
                    id: 1,
                    name: 'Luxury High-Rise',
                    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
                    type: 'Residential'
                },
                {
                    id: 2,
                    name: 'Cultural Center',
                    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop',
                    type: 'Cultural'
                }
            ]
        },
        '3': {
            name: 'ZAHA HADID',
            title: 'Lead Architect',
            location: 'Algeria, Algiers',
            bio: 'Creative architect specializing in residential and commercial projects. Expert in 3D visualization and sustainable design practices.',
            projects: [
                {
                    id: 1,
                    name: 'Eco-Friendly Housing',
                    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop',
                    type: 'Residential'
                },
                {
                    id: 2,
                    name: 'Shopping Mall',
                    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
                    type: 'Commercial'
                }
            ]
        }
    };

    const architect = architects[architectId] || architects['1'];

    // Update page content
    document.getElementById('architectName').textContent = architect.name;
    document.getElementById('architectTitle').textContent = architect.title;
    document.getElementById('architectLocation').textContent = architect.location;
    document.getElementById('architectBio').textContent = architect.bio;

    // Load projects
    loadProjects(architect.projects);
}

// Load projects into the grid
function loadProjects(projects) {
    const projectsGrid = document.getElementById('projectsGrid');
    if (!projectsGrid) return;

    projectsGrid.innerHTML = '';

    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.onclick = () => {
            window.location.href = `projectdetails.html?id=${project.id}`;
        };

        projectCard.innerHTML = `
            <img src="${project.image}" alt="${project.name}">
            <div class="project-card-content">
                <h3>${project.name}</h3>
                <p>${project.type}</p>
            </div>
        `;

        projectsGrid.appendChild(projectCard);
    });
}

// Image loader with fade-in effect
function initImageLoader() {
    const images = document.querySelectorAll("img");
    if (!images.length) return;

    images.forEach((img) => {
        img.addEventListener("load", function () {
            this.style.opacity = "1";
        });

        img.style.opacity = "0";
        img.style.transition = "opacity 0.3s ease";

        if (img.complete) {
            img.style.opacity = "1";
        }
    });
}


