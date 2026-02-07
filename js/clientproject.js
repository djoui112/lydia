// Timeline and Review functionality for Client Project
const API_BASE = '../php/api';

// Function to load project data from database
async function loadProjectData(projectId) {
  try {
    console.log('Loading project data for ID:', projectId);
    const response = await fetch(`${API_BASE}/projects/preview.php?id=${projectId}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Project data response:', result);
    
    if (!result.success || !result.data || !result.data.project) {
      throw new Error(result.message || 'Failed to load project data');
    }
    
    const project = result.data.project;
    console.log('Project object:', project);
    console.log('Project name:', project.project_name);
    
    // Update page title (header) - this is the main title at the top
    updatePageTitle(project.project_name);
    
    // Update project title
    const projectTitle = document.getElementById('projectTitle');
    if (projectTitle) {
      projectTitle.textContent = project.project_name || 'Project';
    }
    
    // Update project description
    const projectDescription = document.getElementById('projectDescription');
    if (projectDescription) {
      projectDescription.textContent = project.description || 'No description available.';
    }
    
    // Update timeline project name
    const timelineProjectName = document.getElementById('timelineProjectName');
    if (timelineProjectName) {
      timelineProjectName.textContent = project.project_name || 'Project';
    }
    
    // Load milestones from API if available
    if (result.data.milestones && Array.isArray(result.data.milestones)) {
      loadMilestonesFromAPI(result.data.milestones);
    }
    
    console.log('Project data loaded successfully');
  } catch (error) {
    console.error('Error loading project data:', error);
    // Update page title on error
    updatePageTitle('Error Loading Project');
    const projectTitle = document.getElementById('projectTitle');
    if (projectTitle) {
      projectTitle.textContent = 'Error loading project';
    }
    const projectDescription = document.getElementById('projectDescription');
    if (projectDescription) {
      projectDescription.textContent = 'Failed to load project data. Please try again.';
    }
  }
}

// Function to load milestones from API
function loadMilestonesFromAPI(milestones) {
  if (!milestones || milestones.length === 0) return;
  
  // Store milestones in a way that the existing code can access
  const timelineData = milestones.map(milestone => ({
    date: new Date(milestone.due_date || milestone.created_at),
    title: milestone.title || milestone.milestone_name || 'Milestone',
    description: milestone.description || milestone.notes || '',
    isCompleted: milestone.status === 'completed' || milestone.is_completed === 1
  }));
  
  // Store in localStorage so the existing loadTimelineFromLocalStorage can use it
  // Format it to match the expected structure
  const formattedDeadlines = {};
  timelineData.forEach(item => {
    const date = item.date;
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    if (!formattedDeadlines[year]) formattedDeadlines[year] = {};
    if (!formattedDeadlines[year][month]) formattedDeadlines[year][month] = {};
    
    formattedDeadlines[year][month][day] = {
      title: item.title,
      description: item.description,
      isCompleted: item.isCompleted
    };
  });
  
  localStorage.setItem('calendarDeadlines', JSON.stringify(formattedDeadlines));
  
  // Trigger a custom event to reload timeline
  window.dispatchEvent(new Event('calendarDeadlinesUpdated'));
}

// Function to update page title
function updatePageTitle(projectName) {
  // Try multiple selectors to find the page title element
  const selectors = [
    '.page-title',
    'h1.page-title',
    '.page-header .page-title',
    '.page-header h1',
    'header .page-title',
    'header h1.page-title'
  ];
  
  let pageTitle = null;
  for (const selector of selectors) {
    pageTitle = document.querySelector(selector);
    if (pageTitle) {
      console.log(`Found page title with selector: ${selector}`);
      break;
    }
  }
  
  if (pageTitle) {
    // Remove placeholder attribute if it exists
    if (pageTitle.hasAttribute('placeholder')) {
      pageTitle.removeAttribute('placeholder');
    }
    
    if (projectName) {
      // Set the text content
      pageTitle.textContent = projectName;
      // Also set innerHTML as backup
      if (pageTitle.textContent !== projectName) {
        pageTitle.innerHTML = projectName;
      }
      
      // Force a reflow
      void pageTitle.offsetHeight;
      
      console.log('✅ Updated page title to:', projectName);
      console.log('Verified - page title textContent is now:', pageTitle.textContent);
    } else {
      pageTitle.textContent = 'Project';
      console.warn('⚠️ Project name not provided, using default');
    }
  } else {
    console.error('❌ Page title element not found with any selector');
    console.log('Available elements:', {
      'h1 elements': document.querySelectorAll('h1').length,
      '.page-header': document.querySelector('.page-header'),
      'header': document.querySelector('header')
    });
  }
}

// Function to show error message
function showError(message) {
  updatePageTitle('Error Loading Project');
  const projectTitle = document.getElementById('projectTitle');
  if (projectTitle) {
    projectTitle.textContent = 'Error';
  }
  const projectDescription = document.getElementById('projectDescription');
  if (projectDescription) {
    projectDescription.textContent = message;
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  console.log('DOM Content Loaded - initializing clientproject.js');
  
  // Get project ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("project_id");
  console.log('Project ID from URL:', projectId);
  
  // Verify page title element exists
  const pageTitleCheck = document.querySelector('.page-title');
  console.log('Initial page title element check:', pageTitleCheck);
  if (pageTitleCheck) {
    console.log('Initial page title content:', pageTitleCheck.textContent);
    console.log('Initial page title innerHTML:', pageTitleCheck.innerHTML);
  }
  
  // Load project data from database
  if (projectId) {
    console.log('Calling loadProjectData with ID:', projectId);
    await loadProjectData(projectId);
    
    // Double-check page title was updated after API call
    setTimeout(() => {
      const pageTitleAfter = document.querySelector('.page-title');
      if (pageTitleAfter) {
        console.log('Page title after API call:', pageTitleAfter.textContent);
        if (!pageTitleAfter.textContent || pageTitleAfter.textContent.trim() === '') {
          console.warn('⚠️ Page title is still empty after API call, attempting to update again...');
          // Try to get project name from the projectTitle element as fallback
          const projectTitleEl = document.getElementById('projectTitle');
          if (projectTitleEl && projectTitleEl.textContent) {
            updatePageTitle(projectTitleEl.textContent);
          }
        }
      }
    }, 500);
  } else {
    console.error('No project ID provided in URL');
    showError('No project ID provided. Please go back and try again.');
  }
  
  const timelineMilestones = document.getElementById("timelineMilestones");
  const timelineFlags = document.getElementById("timelineFlags");
  const progressCircle = document.getElementById("progressCircle");
  const progressPercentage = document.getElementById("progressPercentage");
  const reviewForm = document.getElementById("reviewForm");
  const starRating = document.getElementById("starRating");
  const ratingValue = document.getElementById("ratingValue");
  const reviewText = document.getElementById("reviewText");
  let selectedRating = 0;
  let editingReviewId = null;  // Sample timeline data (read-only, loaded from localStorage if available)  let timelineData = [];  function loadTimelineFromLocalStorage() {    try {      const savedDeadlines = JSON.parse(localStorage.getItem("calendarDeadlines"));      if (savedDeadlines) {        timelineData = extractTimelineDataFromDeadlines(savedDeadlines);        updateTimeline();      } else {        // Default sample data if no saved data        timelineData = [          {            date: new Date(2026, 2, 23),            title: "Project Review",            description: "Review project progress",            isCompleted: false,          },          {            date: new Date(2026, 2, 25),            title: "Client Meeting",            description: "Discuss new requirements",            isCompleted: true,          },          {            date: new Date(2026, 2, 28),            title: "Deadline Submission",            description: "Submit final documents",            isCompleted: false,          },          {            date: new Date(2026, 3, 5),            title: "Final Review",            description: "Final project review meeting",            isCompleted: false,          },        ];        updateTimeline();      }    } catch (e) {      console.log("Error loading timeline data:", e);    }  }  // Load timeline data from localStorage  loadTimelineFromLocalStorage();  // Listen for storage changes (from other tabs/windows)  window.addEventListener("storage", function (e) {    if (e.key === "calendarDeadlines") {      loadTimelineFromLocalStorage();    }  });  // Also listen for custom storage events (from same tab)  window.addEventListener("calendarDeadlinesUpdated", function () {    loadTimelineFromLocalStorage();  });  function extractTimelineDataFromDeadlines(deadlines) {    const data = [];    for (const year in deadlines) {      for (const month in deadlines[year]) {        for (const day in deadlines[year][month]) {          const deadline = deadlines[year][month][day];          data.push({            date: new Date(parseInt(year), parseInt(month), parseInt(day)),            title: deadline.title || "Deadline",            description: deadline.description || "",            isCompleted: deadline.isCompleted || false,          });        }      }    }    return data.sort((a, b) => a.date - b.date);  }  function formatDate(date) {    const monthNames = [      "Jan",      "Feb",      "Mar",      "Apr",      "May",      "Jun",      "Jul",      "Aug",      "Sep",      "Oct",      "Nov",      "Dec",    ];    return `${monthNames[date.getMonth()]} ${date.getDate()}`;  }  function updateTimeline() {    if (!timelineMilestones) return;    timelineMilestones.innerHTML = "";    if (timelineFlags) timelineFlags.innerHTML = "";    if (timelineData.length === 0) {      timelineMilestones.innerHTML =        '<p style="text-align: center; color: var(--text-light); padding: 40px;">No timeline data available.</p>';      if (progressCircle) progressCircle.style.setProperty("--progress", "0%");      if (progressPercentage) progressPercentage.textContent = "0%";      return;    }    // Sort by date    timelineData.sort((a, b) => a.date - b.date);    // Calculate progress    const completedCount = timelineData.filter((d) => d.isCompleted).length;    const totalCount = timelineData.length;    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;    if (progressCircle) {      progressCircle.style.setProperty("--progress", `${progress}%`);    }    if (progressPercentage) {      progressPercentage.textContent = `${Math.round(progress)}%`;    }    // Calculate timeline line progress    const timelineLine = document.getElementById("timelineLine");    if (timelineLine) {      timelineLine.style.setProperty("--progress-line", `${progress}%`);    }    // Create milestones (read-only, no click handlers)    timelineData.forEach((milestone) => {      const milestoneEl = document.createElement("div");      milestoneEl.className = "milestone";      if (milestone.isCompleted) {        milestoneEl.classList.add("completed");      }      milestoneEl.innerHTML = `        <div class="milestone-date">${formatDate(milestone.date)}</div>        <div class="milestone-node">          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">            <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>          </svg>        </div>        <div class="milestone-content">          <div class="milestone-title">${milestone.title}</div>          <div class="milestone-description">${milestone.description || ""}</div>        </div>      `;      timelineMilestones.appendChild(milestoneEl);      // Create flag if there's a note or it's a meeting      if (timelineFlags && milestone.description && milestone.description.toLowerCase().includes("meeting")) {        const flagEl = document.createElement("div");        flagEl.className = `flag ${milestone.isCompleted ? "completed" : "pending"}`;        flagEl.innerHTML = `          <div class="flag-marker"></div>          <div class="flag-text">${milestone.description}</div>          <div class="flag-date">${formatDate(milestone.date)}</div>        `;        timelineFlags.appendChild(flagEl);      }    });    // Position timeline line from center of first circle to center of last circle    requestAnimationFrame(() => {      requestAnimationFrame(() => {        const milestones = timelineMilestones.querySelectorAll(".milestone");        const timelineLine = document.getElementById("timelineLine");                if (!timelineLine || milestones.length === 0) {          if (timelineLine) timelineLine.style.display = "none";          return;        }                if (milestones.length === 1) {          timelineLine.style.display = "none";          return;        }                milestones.forEach((milestone) => {          milestone.style.marginLeft = "";          milestone.style.marginRight = "";          milestone.style.flex = "";          milestone.style.width = "";        });                timelineMilestones.offsetHeight;                const firstMilestone = milestones[0];        const lastMilestone = milestones[milestones.length - 1];        const firstNode = firstMilestone.querySelector(".milestone-node");        const lastNode = lastMilestone.querySelector(".milestone-node");                if (firstNode && lastNode) {          const firstRect = firstNode.getBoundingClientRect();          const lastRect = lastNode.getBoundingClientRect();          const containerRect = timelineMilestones.getBoundingClientRect();                    const firstCenterX = firstRect.left + firstRect.width / 2 - containerRect.left;          const lastCenterX = lastRect.left + lastRect.width / 2 - containerRect.left;                    timelineLine.style.left = `${firstCenterX}px`;          timelineLine.style.width = `${lastCenterX - firstCenterX}px`;          timelineLine.style.right = "auto";          timelineLine.style.display = "block";        }      });    });  }  // Star Rating Functionality  if (starRating) {    const stars = starRating.querySelectorAll(".star");        stars.forEach((star) => {      star.addEventListener("click", () => {        selectedRating = parseInt(star.getAttribute("data-rating"));        updateStarDisplay();        if (ratingValue) {          ratingValue.textContent = selectedRating;        }      });      star.addEventListener("mouseenter", () => {        const rating = parseInt(star.getAttribute("data-rating"));        highlightStars(rating);      });    });    starRating.addEventListener("mouseleave", () => {      updateStarDisplay();    });  }  function highlightStars(rating) {    const stars = starRating.querySelectorAll(".star");    stars.forEach((star, index) => {      if (index < rating) {        star.classList.add("active");      } else {        star.classList.remove("active");      }    });  }  function updateStarDisplay() {    const stars = starRating.querySelectorAll(".star");    stars.forEach((star, index) => {      if (index < selectedRating) {        star.classList.add("active");      } else {        star.classList.remove("active");      }    });  }  // Form Validation Functions  function validateReviewText() {    const reviewTextValue = reviewText.value.trim();    const errorElement = document.getElementById("reviewTextError");        // Remove previous validation classes    reviewText.classList.remove("error", "valid");        if (!reviewTextValue) {      showError(errorElement, "Please enter your review");      reviewText.classList.add("error");      return false;    }        if (reviewTextValue.length < 10) {      showError(errorElement, "Review must be at least 10 characters long");      reviewText.classList.add("error");      return false;    }        if (reviewTextValue.length > 1000) {      showError(errorElement, "Review must be less than 1000 characters");      reviewText.classList.add("error");      return false;    }        clearError(errorElement);    reviewText.classList.add("valid");    return true;  }  function validateRating() {    const errorElement = document.getElementById("ratingError");        if (selectedRating === 0) {      showError(errorElement, "Please select a rating");      return false;    }        clearError(errorElement);    return true;  }  function showError(errorElement, message) {    if (errorElement) {      errorElement.textContent = message;      errorElement.style.display = "block";    }  }  function clearError(errorElement) {    if (errorElement) {      errorElement.textContent = "";      errorElement.style.display = "none";    }  }  function clearAllErrors() {    clearError(document.getElementById("reviewTextError"));    clearError(document.getElementById("ratingError"));  }  // Real-time validation for review text  if (reviewText) {    reviewText.addEventListener("blur", validateReviewText);    reviewText.addEventListener("input", () => {      const reviewTextValue = reviewText.value.trim();      if (reviewTextValue.length > 0) {        validateReviewText();      } else {        clearError(document.getElementById("reviewTextError"));        reviewText.classList.remove("error", "valid");      }    });  }  // Real-time validation for rating  if (starRating) {    const stars = starRating.querySelectorAll(".star");    stars.forEach((star) => {      star.addEventListener("click", () => {        validateRating();      });    });  }  // Review Form Submission  if (reviewForm) {    reviewForm.addEventListener("submit", (e) => {      e.preventDefault();            // Clear previous errors      clearAllErrors();            // Validate all fields      const isReviewTextValid = validateReviewText();      const isRatingValid = validateRating();            if (!isReviewTextValid || !isRatingValid) {        // Focus on first invalid field        if (!isReviewTextValid && reviewText) {          reviewText.focus();        } else if (!isRatingValid && starRating) {          starRating.scrollIntoView({ behavior: "smooth", block: "center" });        }        return;      }      const reviewTextValue = reviewText.value.trim();      if (projectId) {        submitReviewToApi(reviewTextValue);        return;      }      // Create review object      const review = {        id: Date.now(),        text: reviewTextValue,        rating: selectedRating,        date: new Date().toISOString(),        projectName: document.getElementById("projectTitle")?.textContent || "Project",      };      // Save review to localStorage      let reviews = JSON.parse(localStorage.getItem("projectReviews")) || [];      reviews.push(review);      localStorage.setItem("projectReviews", JSON.stringify(reviews));      // Reset form      reviewText.value = "";      selectedRating = 0;      updateStarDisplay();      if (ratingValue) {        ratingValue.textContent = "0";      }            // Clear all errors      clearAllErrors();      // Show success message      showSuccessMessage("Review submitted successfully!");      // Reload and display reviews      loadAndDisplayReviews();    });  }  function showSuccessMessage(message) {    // Create success message element    const successMsg = document.createElement("div");    successMsg.className = "success-message";    successMsg.textContent = message;        // Insert before the form    if (reviewForm && reviewForm.parentElement) {      reviewForm.parentElement.insertBefore(successMsg, reviewForm);            // Remove after 3 seconds      setTimeout(() => {        successMsg.style.opacity = "0";        successMsg.style.transform = "translateY(-10px)";        setTimeout(() => {          if (successMsg.parentElement) {            successMsg.parentElement.removeChild(successMsg);          }        }, 300);      }, 3000);    }  }  // Function to recalculate line position (for resize events)  function recalculateLinePosition() {    if (!timelineMilestones) return;    const milestones = timelineMilestones.querySelectorAll(".milestone");    const timelineLine = document.getElementById("timelineLine");    if (!timelineLine || milestones.length < 2) {      if (timelineLine && milestones.length < 2) timelineLine.style.display = "none";      return;    }        milestones.forEach((milestone) => {      milestone.style.marginLeft = "";      milestone.style.marginRight = "";      milestone.style.flex = "";      milestone.style.width = "";    });        timelineMilestones.offsetHeight;        const firstNode = milestones[0].querySelector(".milestone-node");    const lastNode = milestones[milestones.length - 1].querySelector(".milestone-node");    if (firstNode && lastNode) {      const firstRect = firstNode.getBoundingClientRect();      const lastRect = lastNode.getBoundingClientRect();      const containerRect = timelineMilestones.getBoundingClientRect();      const firstCenterX = firstRect.left + firstRect.width / 2 - containerRect.left;      const lastCenterX = lastRect.left + lastRect.width / 2 - containerRect.left;      timelineLine.style.left = `${firstCenterX}px`;      timelineLine.style.width = `${lastCenterX - firstCenterX}px`;      timelineLine.style.display = "block";    }  }  // Update line on window resize  let resizeTimeout;  window.addEventListener("resize", () => {    clearTimeout(resizeTimeout);    resizeTimeout = setTimeout(recalculateLinePosition, 100);  });  // Use ResizeObserver to update line when milestones container resizes  if (window.ResizeObserver && timelineMilestones) {    const resizeObserver = new ResizeObserver(() => {      recalculateLinePosition();    });    resizeObserver.observe(timelineMilestones);  }  // Footer Navigation - Smooth scroll to sections  const footerLinks = document.querySelectorAll(".footer-nav a");  footerLinks.forEach((link) => {    link.addEventListener("click", (e) => {      e.preventDefault();      const targetId = link.getAttribute("href").substring(1);      const targetSection = document.getElementById(targetId);      if (targetSection) {        targetSection.scrollIntoView({ behavior: "smooth", block: "start" });      }    });  });  // Function to load and display saved reviews  function loadAndDisplayReviews() {    const reviewsContainer = document.getElementById("reviewsContainer");    if (!reviewsContainer) return;    if (projectId) {      fetch(`${API_BASE}/projects/preview.php?id=${projectId}`, { credentials: "include" })        .then((res) => res.json())        .then((result) => {          const review = result?.data?.review;          if (!review) {            reviewsContainer.innerHTML = '<p class="no-reviews-message">No reviews yet. Be the first to add a review!</p>';            return;          }          renderSingleReview(review);        })        .catch(() => {          reviewsContainer.innerHTML = '<p class="no-reviews-message">No reviews yet. Be the first to add a review!</p>';        });      return;    }    const reviews = JSON.parse(localStorage.getItem("projectReviews")) || [];    const currentProjectName = document.getElementById("projectTitle")?.textContent || "Project";    // Filter reviews for current project    const projectReviews = reviews.filter(review =>       review.projectName === currentProjectName    ).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, newest first    if (projectReviews.length === 0) {      reviewsContainer.innerHTML = '<p class="no-reviews-message">No reviews yet. Be the first to add a review!</p>';      return;    }    reviewsContainer.innerHTML = projectReviews.map(review => {      const reviewDate = new Date(review.date);      const formattedDate = reviewDate.toLocaleDateString('en-US', {        year: 'numeric',        month: 'long',        day: 'numeric',        hour: '2-digit',        minute: '2-digit'      });      // Create star rating display      let starsHTML = '';      for (let i = 1; i <= 5; i++) {        starsHTML += `<span class="review-star ${i <= review.rating ? 'active' : ''}">?</span>`;      }      return `        <div class="review-card">          <div class="review-header">            <div class="review-rating">              ${starsHTML}              <span class="rating-number">${review.rating}/5</span>            </div>            <div class="review-date">${formattedDate}</div>          </div>          <div class="review-text">${escapeHtml(review.text)}</div>        </div>      `;    }).join('');  }  // Helper function to escape HTML  function escapeHtml(text) {    const div = document.createElement('div');    div.textContent = text;    return div.innerHTML;  }  // Update "See Details" link to navigate to project-details.html
  const seeDetailsLink = document.getElementById('seeDetailsLink');
  if (seeDetailsLink && projectId) {
    // Set the href directly to project-details.html with the project ID
    seeDetailsLink.href = `project-details.html?id=${projectId}`;
    console.log('Updated See Details link to:', seeDetailsLink.href);
  } else if (seeDetailsLink) {
    // If no projectId, disable the link
    seeDetailsLink.href = '#';
    seeDetailsLink.style.pointerEvents = 'none';
    seeDetailsLink.style.opacity = '0.5';
  }

  // Initialize
  updateTimeline();
  loadAndDisplayReviews();
});