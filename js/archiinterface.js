document.addEventListener('DOMContentLoaded', function() {
    const archiMenuToggle = document.querySelector('.archi-menu-icon');
    const archiMenu = document.querySelector('.archi-menu');

    if (archiMenuToggle && archiMenu) {
        archiMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            archiMenu.classList.toggle('active');
            console.log('Menu toggled');
        });

        document.addEventListener('click', function(event) {
            if (!archiMenuToggle.contains(event.target) && !archiMenu.contains(event.target)) {
                archiMenu.classList.remove('active');
            }
        });

        archiMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    } else {
        console.error('Menu elements not found');
    }
})

    document.addEventListener('DOMContentLoaded', function() {
    const clientMenuToggle = document.querySelector('.client-menu-icon');
    const clientMenu = document.querySelector('.client-menu');

    if (clientMenuToggle && clientMenu) {
        clientMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            clientMenu.classList.toggle('active');
            console.log('Menu toggled');
        });

        document.addEventListener('click', function(event) {
            if (!clientMenuToggle.contains(event.target) && !clientMenu.contains(event.target)) {
                clientMenu.classList.remove('active');
            }
        });

        clientMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    } else {
        console.error('Menu elements not found');
    }

    // Project Management - Vertical Project Card Stack - Click to bring to top with smooth animation
    // Link "view project" buttons to project review page
    const viewProjectButtons = document.querySelectorAll(".btn-view-project");
    viewProjectButtons.forEach((button) => {
        button.addEventListener("click", function (e) {
            e.stopPropagation(); // Prevent card click event
            // Only prevent default and redirect if it's not already a link
            if (this.tagName !== 'A') {
                e.preventDefault();
                // Try to get project ID from data attribute or parent
                const projectId = this.dataset.projectId || this.closest('[data-project-id]')?.dataset.projectId;
                if (projectId) {
                    window.location.href = `projectpreview.html?id=${projectId}`;
                } else {
                    window.location.href = "projectpreview.html";
                }
            }
        });
    });

    const projectSliderTrack = document.getElementById("projectSliderTrack");

    if (projectSliderTrack) {
        // Clear any placeholder cards immediately
        projectSliderTrack.innerHTML = '';
        console.log('🧹 Cleared placeholder project cards');
        
        // Load real projects from API
        loadArchitectProjects();
        
        const cards = projectSliderTrack.querySelectorAll(".project-slider-card");

        // Initialize: Set first card as active
        let currentActiveCard = cards.length > 0 ? cards[0] : null;
        if (currentActiveCard) {
            currentActiveCard.classList.add("active");
        }

        // Function to bring a card to the top with smooth animation
        function bringCardToTop(card) {
            // Remove active from all cards with smooth transition
            cards.forEach((c) => {
                if (c !== card && c.classList.contains("active")) {
                    c.style.transition = "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
                    c.classList.remove("active");
                }
            });

            // Reorder cards: move card to the front of the DOM
            projectSliderTrack.insertBefore(card, projectSliderTrack.firstChild);

            // Activate the card with smooth sliding animation
            setTimeout(() => {
                card.style.transition = "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
                card.classList.add("active");
                currentActiveCard = card;

                // Reset transition after animation
                setTimeout(() => {
                    card.style.transition = "";
                    // Reset transitions for other cards too
                    cards.forEach((c) => {
                        if (c !== card) {
                            c.style.transition = "";
                        }
                    });
                }, 800);
            }, 50);
        }

        // Function to get next card in sequence
        function getNextCard() {
            const allCards = Array.from(
                projectSliderTrack.querySelectorAll(".project-slider-card")
            );
            const currentIndex = allCards.indexOf(currentActiveCard);

            // Get the next card (wrap around to first if at end)
            if (currentIndex < allCards.length - 1) {
                return allCards[currentIndex + 1];
            } else {
                return allCards[0];
            }
        }

        // Click handler for cards
        projectSliderTrack.addEventListener("click", function (e) {
            const card = e.target.closest(".project-slider-card");

            // Don't trigger if clicking on the button
            if (!card || e.target.closest(".btn-view-project")) {
                return;
            }

            // If clicking on active card, advance to next card
            if (card.classList.contains("active")) {
                const nextCard = getNextCard();
                if (nextCard && nextCard !== currentActiveCard) {
                    bringCardToTop(nextCard);
                }
            } else {
                // If clicking on inactive card, bring it to top
                bringCardToTop(card);
            }
        });

        // Touch swipe support for mobile project cards (horizontal on mobile, vertical on desktop)
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        projectSliderTrack.addEventListener(
            "touchstart",
            (e) => {
                touchStartX = e.changedTouches[0].screenX;
                touchStartY = e.changedTouches[0].screenY;
            },
            { passive: true }
        );

        projectSliderTrack.addEventListener(
            "touchend",
            (e) => {
                touchEndX = e.changedTouches[0].screenX;
                touchEndY = e.changedTouches[0].screenY;
                const swipeThreshold = 50;
                const diffX = touchStartX - touchEndX;
                const diffY = touchStartY - touchEndY;

                // Vertical swipe for both mobile and desktop
                if (
                    Math.abs(diffY) > swipeThreshold &&
                    Math.abs(diffY) > Math.abs(diffX)
                ) {
                    if (diffY > 0) {
                        // Swipe up - next card
                        const nextCard = getNextCard();
                        if (nextCard && nextCard !== currentActiveCard) {
                            bringCardToTop(nextCard);
                            // Scroll to card on mobile
                            if (window.innerWidth <= 768) {
                                nextCard.scrollIntoView({
                                    behavior: "smooth",
                                    block: "center",
                                });
                            }
                        }
                    } else {
                        // Swipe down - previous card
                        const allCards = Array.from(
                            projectSliderTrack.querySelectorAll(".project-slider-card")
                        );
                        const currentIndex = allCards.indexOf(currentActiveCard);
                        const prevCard =
                            currentIndex > 0
                                ? allCards[currentIndex - 1]
                                : allCards[allCards.length - 1];
                        if (prevCard && prevCard !== currentActiveCard) {
                            bringCardToTop(prevCard);
                            // Scroll to card on mobile
                            if (window.innerWidth <= 768) {
                                prevCard.scrollIntoView({
                                    behavior: "smooth",
                                    block: "center",
                                });
                            }
                        }
                    }
                }
            },
            { passive: true }
        );
    }

    // Smooth scroll to project management section when clicking menu link
    const projectManagementLinks = document.querySelectorAll('a[href="#project-management"]');
    projectManagementLinks.forEach((link) => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = document.getElementById('project-management');
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Close menu if open
                if (archiMenu) {
                    archiMenu.classList.remove('active');
                }
            }
        });
    });

    // Footer Navigation - Smooth scroll to sections
    const footerLinks = document.querySelectorAll(".footer-nav a");
    footerLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");
            // Only handle anchor links (starting with #)
            if (href && href.startsWith("#")) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }
            // For non-anchor links (like ./edirprofile-architect.html), let the browser handle it normally
        });
    });
});
// Function to load and display projects for architect
async function loadArchitectProjects() {
  try {
    console.log('🚀 Loading architect projects...');
    
    const container = document.getElementById('projectSliderTrack');
    if (!container) {
      console.error('❌ Project slider track not found!');
      return;
    }
    
    const response = await fetch('../php/api/projects/architect.php', {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('❌ Response is not JSON. Content-Type:', contentType);
      return;
    }

    const result = await response.json();
    console.log('📦 Architect projects API result:', result);
    
    if (result.success && result.data && result.data.length > 0) {
      // Create project cards from real data
      result.data.forEach((project, index) => {
        const card = createArchitectProjectCard(project, index);
        container.appendChild(card);
      });
      
      console.log(`✅ Loaded ${result.data.length} real projects`);
      
      // Re-initialize the slider animation after cards are loaded
      setTimeout(() => {
        // The existing slider code will handle the cards
        const cards = container.querySelectorAll(".project-slider-card");
        if (cards.length > 0) {
          cards[0].classList.add("active");
        }
      }, 100);
    } else {
      console.log('⚠️ No projects found - showing empty state');
    }
  } catch (error) {
    console.error('❌ Error loading architect projects:', error);
    const container = document.getElementById('projectSliderTrack');
    if (container) {
      container.innerHTML = '';
    }
  }
}

// Function to create a project card for architect
function createArchitectProjectCard(project, index) {
  const card = document.createElement('div');
  card.className = 'project-slider-card';
  card.setAttribute('data-index', index);
  card.setAttribute('data-project-id', project.id);
  
  const projectName = project.project_name || 'Unnamed Project';
  const clientName = `${project.first_name || ''} ${project.last_name || ''}`.trim() || 'Unknown Client';
  const agencyName = project.agency_name || 'No agency';
  
  // Format date
  let displayDate = 'N/A';
  if (project.start_date) {
    const date = new Date(project.start_date);
    displayDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } else if (project.created_at) {
    const date = new Date(project.created_at);
    displayDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  
  // Get project photo or use placeholder
  const projectPhoto = project.photos && project.photos.length > 0
    ? project.photos[0].photo_path || project.photos[0].photo_url
    : 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=600&fit=crop';
  
  // Get project tags/type from description
  const projectType = project.description || 'general';
  const tags = projectType.split(',').slice(0, 3).join(', ').substring(0, 50) || 'general';
  
  card.innerHTML = `
    <div class="project-content">
      <div class="project-info">
        <h3 class="project-name">${projectName}</h3>
        <div class="project-details">
          <p class="project-agency">Agency: ${agencyName}</p>
          <p class="project-architect">Client: ${clientName}</p>
          <p class="project-tags">${tags}</p>
          <div class="project-date">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="3"
                y="4"
                width="18"
                height="18"
                rx="2"
                stroke="currentColor"
                stroke-width="2"
              />
              <line
                x1="16"
                y1="2"
                x2="16"
                y2="6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <line
                x1="8"
                y1="2"
                x2="8"
                y2="6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <line
                x1="3"
                y1="10"
                x2="21"
                y2="10"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
            <span>${displayDate}</span>
          </div>
        </div>
        <a href="projectpreview.html?id=${project.id}" class="btn-view-project">view project</a>
      </div>
      <div class="project-image">
        <img
          src="${projectPhoto}"
          alt="${projectName}"
        />
      </div>
    </div>
  `;
  
  return card;
}

document.addEventListener('DOMContentLoaded', async () => {
  const link = document.querySelector('#portfolioLink');
  
  if (!link) {
    console.error('Portfolio link element not found');
    return;
  }

  // Function to get architect ID and navigate
  async function navigateToPortfolio(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Try to get architect ID first
    try {
      const response = await fetch('../php/api/get-session-architect.php', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.architect_id) {
          window.location.href = `architect-portfolio.html?architect_id=${data.architect_id}`;
          return;
        }
      }
    } catch (err) {
      console.error('Error getting architect ID:', err);
    }
    
    // Fallback: try to get from user profile
    try {
      const profileRes = await fetch('../php/api/users/profile.php', {
        credentials: 'include'
      });
      
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData && profileData.success && profileData.data && profileData.data.user) {
          window.location.href = `architect-portfolio.html?architect_id=${profileData.data.user.id}`;
          return;
        }
      }
    } catch (profileErr) {
      console.error('Error getting profile:', profileErr);
    }
    
    // If all else fails, show error
    alert('Error: Could not load architect ID. Please try logging in again.');
  }

  // Set up click handler on the link
  link.addEventListener('click', navigateToPortfolio);
  
  // Also handle button clicks inside the link
  const button = link.querySelector('button');
  if (button) {
    button.addEventListener('click', navigateToPortfolio);
  }

  // Also set the href attribute for display purposes (for right-click, etc.)
  try {
    const res = await fetch('../php/api/get-session-architect.php', { 
      credentials: 'include' 
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log('Session architect data:', data);

      if (data && data.architect_id) {
        const portfolioUrl = `architect-portfolio.html?architect_id=${data.architect_id}`;
        link.href = portfolioUrl;
        console.log('✅ Portfolio link set to:', portfolioUrl);
      } else {
        console.error('No architect ID in session response:', data);
        // Try to get from user profile as fallback
        try {
          const profileRes = await fetch('../php/api/users/profile.php', {
            credentials: 'include'
          });
          
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            if (profileData && profileData.success && profileData.data && profileData.data.user) {
              const userId = profileData.data.user.id;
              const portfolioUrl = `architect-portfolio.html?architect_id=${userId}`;
              link.href = portfolioUrl;
              console.log('✅ Portfolio link set from profile:', portfolioUrl);
            }
          }
        } catch (profileErr) {
          console.error('Failed to get architect ID from profile:', profileErr);
        }
      }
    }
  } catch (err) {
    console.error('Failed to get architect ID:', err);
    // Try to get from user profile as fallback
    try {
      const profileRes = await fetch('../php/api/users/profile.php', {
        credentials: 'include'
      });
      
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData && profileData.success && profileData.data && profileData.data.user) {
          const userId = profileData.data.user.id;
          const portfolioUrl = `architect-portfolio.html?architect_id=${userId}`;
          link.href = portfolioUrl;
          console.log('✅ Portfolio link set from profile (fallback):', portfolioUrl);
        }
      }
    } catch (profileErr) {
      console.error('Failed to get architect ID from profile:', profileErr);
    }
  }
});
