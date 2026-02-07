// Global variable to store current project ID
let currentProjectId = null;
let projectDataLoaded = false;

// Calendar functionality - Reused from agency-interface.js
document.addEventListener("DOMContentLoaded", function () {
  // Get project ID from URL FIRST
  const urlParams = new URLSearchParams(window.location.search);
  const projectIdFromUrl = urlParams.get('id') || urlParams.get('project_id');
  if (projectIdFromUrl) {
    currentProjectId = parseInt(projectIdFromUrl);
    console.log('✅ Project ID loaded from URL:', currentProjectId);
  } else {
    console.warn('⚠️ No project ID in URL parameters');
    // Show error immediately
    const projectTitle = document.getElementById('projectTitle');
    if (projectTitle) {
      projectTitle.textContent = 'Error: No project ID in URL';
    }
    const projectDescription = document.getElementById('projectDescription');
    if (projectDescription) {
      projectDescription.textContent = 'Please navigate to this page from your projects list with a project ID.';
    }
  }
  
  const calendarContainer = document.querySelector(".calendar-container");
  const deadlineModal = document.getElementById("deadlineModal");
  const timelineMilestones = document.getElementById("timelineMilestones");
  const timelineFlags = document.getElementById("timelineFlags");
  const progressCircle = document.getElementById("progressCircle");
  const progressPercentage = document.getElementById("progressPercentage");

  if (calendarContainer) {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    // Load deadlines from localStorage or use default sample data
    let deadlines = JSON.parse(localStorage.getItem("calendarDeadlines")) || {
      2026: {
        2: {
          23: {
            title: "Project Review",
            description: "Review project progress",
            time: "",
            isCompleted: false,
          },
          25: {
            title: "Client Meeting",
            description: "Discuss new requirements",
            time: "14:00",
            isCompleted: true,
          },
          28: {
            title: "Deadline Submission",
            description: "Submit final documents",
            time: "17:00",
            isCompleted: false,
          },
        },
      },
    };

    // Save deadlines to localStorage
    function saveDeadlines() {
      localStorage.setItem("calendarDeadlines", JSON.stringify(deadlines));
      updateTimeline();
      // Trigger custom event for same-tab sync
      window.dispatchEvent(new CustomEvent("calendarDeadlinesUpdated"));
    }

    function getDaysInMonth(month, year) {
      return new Date(year, month + 1, 0).getDate();
    }

    function getFirstDayOfMonth(month, year) {
      return new Date(year, month, 1).getDay();
    }

    function isToday(day, month, year) {
      const today = new Date();
      return (
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
      );
    }

    function hasDeadline(day, month, year) {
      if (
        deadlines[year] &&
        deadlines[year][month] &&
        deadlines[year][month][day]
      ) {
        return deadlines[year][month][day];
      }
      return null;
    }

    function getDeadline(day, month, year) {
      if (
        deadlines[year] &&
        deadlines[year][month] &&
        deadlines[year][month][day]
      ) {
        return deadlines[year][month][day];
      }
      return null;
    }

    function setDeadline(day, month, year, deadlineData) {
      if (!deadlines[year]) {
        deadlines[year] = {};
      }
      if (!deadlines[year][month]) {
        deadlines[year][month] = {};
      }
      deadlines[year][month][day] = deadlineData;
      saveDeadlines();
    }

    function deleteDeadline(day, month, year) {
      if (
        deadlines[year] &&
        deadlines[year][month] &&
        deadlines[year][month][day]
      ) {
        delete deadlines[year][month][day];
        // Clean up empty objects
        if (Object.keys(deadlines[year][month]).length === 0) {
          delete deadlines[year][month];
        }
        if (Object.keys(deadlines[year]).length === 0) {
          delete deadlines[year];
        }
        saveDeadlines();
      }
    }

    function renderCalendar() {
      const monthNameEl = calendarContainer.querySelector(".month-name");
      const yearEl = calendarContainer.querySelector(".year");
      const daysContainer = calendarContainer.querySelector(".calendar-days");

      monthNameEl.textContent = monthNames[currentMonth];
      yearEl.textContent = currentYear;

      const daysInMonth = getDaysInMonth(currentMonth, currentYear);
      const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

      daysContainer.innerHTML = "";

      // Empty cells for days before month starts
      for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement("div");
        emptyDay.className = "calendar-day empty";
        daysContainer.appendChild(emptyDay);
      }

      // Days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement("div");
        dayEl.className = "calendar-day";
        dayEl.textContent = day;

        if (isToday(day, currentMonth, currentYear)) {
          dayEl.classList.add("today");
        }

        const deadline = hasDeadline(day, currentMonth, currentYear);
        if (deadline) {
          dayEl.classList.add("deadline");
          dayEl.title = deadline.title || "Deadline";
        }

        dayEl.addEventListener("click", (e) => {
          e.stopPropagation(); // Prevent event bubbling to parent elements
          // Only open modal when clicking on a valid calendar day (not empty)
          if (!dayEl.classList.contains('empty')) {
            openDeadlineModal(day, currentMonth, currentYear);
          }
        });

        daysContainer.appendChild(dayEl);
      }
    }

    // Modal functionality
    const modalTitle = deadlineModal.querySelector(".modal-title");
    const deadlineDateInput = document.getElementById("deadlineDate");
    const deadlineTitleInput = document.getElementById("deadlineTitle");
    const deadlineDescriptionInput = document.getElementById(
      "deadlineDescription"
    );
    const deadlineTimeInput = document.getElementById("deadlineTime");
    const deleteBtn = document.getElementById("deleteDeadline");
    const saveBtn = deadlineModal.querySelector(".btn-save");
    const cancelBtn = deadlineModal.querySelector(".btn-cancel");
    const closeBtn = deadlineModal.querySelector(".modal-close");
    const overlay = deadlineModal.querySelector(".modal-overlay");

    let selectedDay = null;
    let selectedMonth = null;
    let selectedYear = null;

    function openDeadlineModal(day, month, year) {
      selectedDay = day;
      selectedMonth = month;
      selectedYear = year;

      const dateString = `${monthNames[month]} ${day}, ${year}`;
      deadlineDateInput.value = dateString;

      const existingDeadline = getDeadline(day, month, year);
      if (existingDeadline) {
        modalTitle.textContent = "Edit Deadline";
        deadlineTitleInput.value = existingDeadline.title || "";
        deadlineDescriptionInput.value = existingDeadline.description || "";
        deadlineTimeInput.value = existingDeadline.time || "";
        deleteBtn.style.display = "block";
      } else {
        modalTitle.textContent = "Add Deadline";
        deadlineTitleInput.value = "";
        deadlineDescriptionInput.value = "";
        deadlineTimeInput.value = "";
        deleteBtn.style.display = "none";
      }

      deadlineModal.classList.add("active");
    }

    function closeDeadlineModal() {
      deadlineModal.classList.remove("active");
      selectedDay = null;
      selectedMonth = null;
      selectedYear = null;
    }

    saveBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (!selectedDay) return;

      const title = deadlineTitleInput.value.trim();
      if (!title) {
        alert("Please enter a deadline title");
        return;
      }

      const deadlineData = {
        title: title,
        description: deadlineDescriptionInput.value.trim() || "",
        time: deadlineTimeInput.value || "",
        isCompleted: false,
      };

      setDeadline(selectedDay, selectedMonth, selectedYear, deadlineData);
      closeDeadlineModal();
      renderCalendar();
    });

    deleteBtn.addEventListener("click", () => {
      if (!selectedDay) return;
      if (confirm("Are you sure you want to delete this deadline?")) {
        deleteDeadline(selectedDay, selectedMonth, selectedYear);
        closeDeadlineModal();
        renderCalendar();
      }
    });

    cancelBtn.addEventListener("click", closeDeadlineModal);
    closeBtn.addEventListener("click", closeDeadlineModal);
    overlay.addEventListener("click", closeDeadlineModal);

    // Calendar navigation
    const prevMonthBtn = calendarContainer.querySelector(".prev-month");
    const nextMonthBtn = calendarContainer.querySelector(".next-month");

    prevMonthBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent event bubbling
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderCalendar();
    });

    nextMonthBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent event bubbling
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderCalendar();
    });
    
    // Prevent calendar container from triggering modal accidentally
    // Only calendar days should trigger the modal, not other elements
    const calendarHeader = calendarContainer.querySelector(".calendar-header");
    const calendarWeekdays = calendarContainer.querySelector(".calendar-weekdays");
    const calendarLegend = calendarContainer.querySelector(".calendar-legend");
    
    // Prevent clicks on header, weekdays, and legend from doing anything
    if (calendarHeader) {
      calendarHeader.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }
    if (calendarWeekdays) {
      calendarWeekdays.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }
    if (calendarLegend) {
      calendarLegend.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }

    // Extract all deadlines and create timeline
    function extractTimelineData() {
      const timelineData = [];

      for (const year in deadlines) {
        for (const month in deadlines[year]) {
          for (const day in deadlines[year][month]) {
            const deadline = deadlines[year][month][day];
            const date = new Date(
              parseInt(year),
              parseInt(month),
              parseInt(day)
            );
            timelineData.push({
              date: date,
              title: deadline.title,
              description: deadline.description || "",
              time: deadline.time || "",
              isCompleted: deadline.isCompleted || false,
              year: parseInt(year),
              month: parseInt(month),
              day: parseInt(day),
            });
          }
        }
      }

      // Sort by date
      timelineData.sort((a, b) => a.date - b.date);
      return timelineData;
    }

    function formatDate(date) {
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `${monthNames[date.getMonth()]} ${date.getDate()}`;
    }

    function updateTimeline() {
      const timelineData = extractTimelineData();
      timelineMilestones.innerHTML = "";
      timelineFlags.innerHTML = "";

      if (timelineData.length === 0) {
        timelineMilestones.innerHTML =
          '<p style="text-align: center; color: var(--text-light); padding: 40px;">No deadlines added yet. Click on a calendar date to add a deadline.</p>';
        progressCircle.style.setProperty("--progress", "0%");
        progressPercentage.textContent = "0%";
        return;
      }

      // Calculate progress
      const completedCount = timelineData.filter((d) => d.isCompleted).length;
      const totalCount = timelineData.length;
      const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

      progressCircle.style.setProperty("--progress", `${progress}%`);
      progressPercentage.textContent = `${Math.round(progress)}%`;

      // Calculate timeline line progress
      const timelineLine = document.getElementById("timelineLine");
      if (timelineLine) {
        timelineLine.style.setProperty("--progress-line", `${progress}%`);
      }

      // Create milestones
      timelineData.forEach((milestone, index) => {
        const milestoneEl = document.createElement("div");
        milestoneEl.className = "milestone";
        if (milestone.isCompleted) {
          milestoneEl.classList.add("completed");
        }

        milestoneEl.innerHTML = `
          <div class="milestone-date">${formatDate(milestone.date)}</div>
          <div class="milestone-node">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="milestone-content">
            <div class="milestone-title">${milestone.title}</div>
            <div class="milestone-description">${milestone.description || ""}</div>
          </div>
        `;

        // Only open modal when clicking on milestone content, not the circle
        milestoneEl.addEventListener("click", (e) => {
          // Don't open modal if clicking on the milestone node (circle) or SVG inside it
          const clickedOnCircle = e.target.closest(".milestone-node") || 
                                  e.target.classList.contains("milestone-node") ||
                                  (e.target.tagName === "svg" && e.target.closest(".milestone-node")) ||
                                  (e.target.tagName === "path" && e.target.closest(".milestone-node"));
          
          if (!clickedOnCircle) {
            openDeadlineModal(milestone.day, milestone.month, milestone.year);
          }
        });

        timelineMilestones.appendChild(milestoneEl);

        // Create flag if there's a note or it's a meeting
        if (milestone.description && milestone.description.toLowerCase().includes("meeting")) {
          const flagEl = document.createElement("div");
          flagEl.className = `flag ${milestone.isCompleted ? "completed" : "pending"}`;
          flagEl.innerHTML = `
            <div class="flag-marker"></div>
            <div class="flag-text">${milestone.description}</div>
            <div class="flag-date">${formatDate(milestone.date)}</div>
          `;
          timelineFlags.appendChild(flagEl);
        }
      });

      // Position timeline line from center of first circle to center of last circle
      // Ensure first and last circles are at edges with even spacing between all
      // Use requestAnimationFrame to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const milestones = timelineMilestones.querySelectorAll(".milestone");
          const timelineLine = document.getElementById("timelineLine");
          
          if (!timelineLine || milestones.length === 0) {
            if (timelineLine) timelineLine.style.display = "none";
            return;
          }
          
          if (milestones.length === 1) {
            timelineLine.style.display = "none";
            return;
          }
          
          // Ensure all milestones have no inline styles that interfere with flexbox spacing
          milestones.forEach((milestone) => {
            milestone.style.marginLeft = "";
            milestone.style.marginRight = "";
            milestone.style.flex = "";
            milestone.style.width = "";
          });
          
          // Force a reflow to ensure flexbox has calculated positions
          timelineMilestones.offsetHeight;
          
          const firstMilestone = milestones[0];
          const lastMilestone = milestones[milestones.length - 1];
          const firstNode = firstMilestone.querySelector(".milestone-node");
          const lastNode = lastMilestone.querySelector(".milestone-node");
          
          if (firstNode && lastNode) {
            // Calculate line position from first circle center to last circle center
            const firstRect = firstNode.getBoundingClientRect();
            const lastRect = lastNode.getBoundingClientRect();
            const containerRect = timelineMilestones.getBoundingClientRect();
            
            const firstCenterX = firstRect.left + firstRect.width / 2 - containerRect.left;
            const lastCenterX = lastRect.left + lastRect.width / 2 - containerRect.left;
            
            timelineLine.style.left = `${firstCenterX}px`;
            timelineLine.style.width = `${lastCenterX - firstCenterX}px`;
            timelineLine.style.right = "auto";
            timelineLine.style.display = "block";
          }
        });
      });
    }

    // Toggle completion status when clicking on milestone node (circle)
    document.addEventListener("click", (e) => {
      const milestoneNode = e.target.closest(".milestone-node") || 
                           (e.target.classList.contains("milestone-node") ? e.target : null) ||
                           (e.target.closest("svg") && e.target.closest(".milestone-node")) ? e.target.closest(".milestone-node") : null;
      
      if (milestoneNode) {
        e.preventDefault();
        e.stopPropagation(); // Prevent event from bubbling to milestone element
        const milestoneEl = milestoneNode.closest(".milestone");
        if (!milestoneEl) return;
        
        const dateText = milestoneEl
          .querySelector(".milestone-date")
          .textContent.trim();
        const titleText = milestoneEl
          .querySelector(".milestone-title")
          .textContent.trim();

        // Find the deadline in our data
        const timelineData = extractTimelineData();
        const milestone = timelineData.find(
          (m) =>
            formatDate(m.date) === dateText && m.title === titleText
        );

        if (milestone) {
          milestone.isCompleted = !milestone.isCompleted;
          setDeadline(
            milestone.day,
            milestone.month,
            milestone.year,
            {
              title: milestone.title,
              description: milestone.description,
              time: milestone.time,
              isCompleted: milestone.isCompleted,
            }
          );
          updateTimeline();
          // Line position will be recalculated automatically in updateTimeline()
        }
        return false;
      }
    });

    // Function to recalculate line position (for resize events)
    function recalculateLinePosition() {
      const milestones = timelineMilestones.querySelectorAll(".milestone");
      const timelineLine = document.getElementById("timelineLine");
      if (!timelineLine || milestones.length < 2) {
        if (timelineLine && milestones.length < 2) timelineLine.style.display = "none";
        return;
      }
      
      // Ensure all milestones have no inline styles that interfere with flexbox spacing
      milestones.forEach((milestone) => {
        milestone.style.marginLeft = "";
        milestone.style.marginRight = "";
        milestone.style.flex = "";
        milestone.style.width = "";
      });
      
      // Force a reflow to ensure flexbox has calculated positions
      timelineMilestones.offsetHeight;
      
      const firstNode = milestones[0].querySelector(".milestone-node");
      const lastNode = milestones[milestones.length - 1].querySelector(".milestone-node");
      if (firstNode && lastNode) {
        const firstRect = firstNode.getBoundingClientRect();
        const lastRect = lastNode.getBoundingClientRect();
        const containerRect = timelineMilestones.getBoundingClientRect();
        const firstCenterX = firstRect.left + firstRect.width / 2 - containerRect.left;
        const lastCenterX = lastRect.left + lastRect.width / 2 - containerRect.left;
        timelineLine.style.left = `${firstCenterX}px`;
        timelineLine.style.width = `${lastCenterX - firstCenterX}px`;
        timelineLine.style.display = "block";
      }
    }

    // Update line on window resize
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(recalculateLinePosition, 100);
    });

    // Use ResizeObserver to update line when milestones container resizes
    if (window.ResizeObserver && timelineMilestones) {
      const resizeObserver = new ResizeObserver(() => {
        recalculateLinePosition();
      });
      resizeObserver.observe(timelineMilestones);
    }

    // Listen for storage changes (from other tabs/windows)
    window.addEventListener("storage", function (e) {
      if (e.key === "calendarDeadlines") {
        // Reload deadlines from localStorage
        deadlines = JSON.parse(localStorage.getItem("calendarDeadlines")) || deadlines;
        renderCalendar();
        updateTimeline();
      }
    });

    // Also listen for custom storage events (from same tab)
    window.addEventListener("calendarDeadlinesUpdated", function () {
      // Reload deadlines from localStorage
      deadlines = JSON.parse(localStorage.getItem("calendarDeadlines")) || deadlines;
      renderCalendar();
      updateTimeline();
    });

    // Footer Navigation - Smooth scroll to sections
    const footerLinks = document.querySelectorAll(".footer-nav a");
    footerLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.getAttribute("href").substring(1);
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });

    // Load and display client reviews
    function loadClientReviews() {
      const reviewContent = document.querySelector(".client-review-section .review-content");
      if (!reviewContent) return;

      const reviews = JSON.parse(localStorage.getItem("projectReviews")) || [];
      
      if (reviews.length === 0) {
        reviewContent.innerHTML = '<p style="color: var(--text-light);">No reviews yet.</p>';
        return;
      }

      reviewContent.innerHTML = reviews.map((review) => {
        const date = new Date(review.date);
        const formattedDate = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        
        const stars = Array.from({ length: 5 }, (_, i) => {
          const isFilled = i < review.rating;
          return `<span class="review-star ${isFilled ? "filled" : ""}">★</span>`;
        }).join("");

        return `
          <div class="review-item">
            <div class="review-header">
              <div class="review-rating">
                ${stars}
                <span class="rating-number">${review.rating}/5</span>
              </div>
              <div class="review-date">${formattedDate}</div>
            </div>
            <div class="review-text">${review.text}</div>
          </div>
        `;
      }).join("");
    }

    // Initialize
    renderCalendar();
    updateTimeline();
    loadClientReviews();
    initDescriptionEditor();
    
    // Load project data IMMEDIATELY after getting project ID
    // Use setTimeout to ensure DOM is fully ready
    setTimeout(() => {
      if (currentProjectId) {
        console.log('🚀 Loading project data immediately with ID:', currentProjectId);
        loadProjectData(currentProjectId);
      } else {
        console.error('❌ No project ID available to load data');
        // Try to get from URL one more time
        const urlParams = new URLSearchParams(window.location.search);
        const projectIdFromUrl = urlParams.get('id') || urlParams.get('project_id');
        if (projectIdFromUrl) {
          currentProjectId = parseInt(projectIdFromUrl);
          console.log('✅ Got project ID from URL on retry:', currentProjectId);
          loadProjectData(currentProjectId);
        }
      }
    }, 200);
  }
});

// Description Editor Functionality
function initDescriptionEditor() {
  const descriptionElement = document.getElementById('projectDescription');
  const descriptionEdit = document.getElementById('projectDescriptionEdit');
  const editButton = document.getElementById('btnEditDescription');
  const doneButton = document.getElementById('btnDone');
  const cancelButton = document.getElementById('btnCancelEdit');
  const descriptionActions = document.getElementById('descriptionActions');
  const descriptionButtons = document.querySelector('.description-buttons');

  // Check if all required elements exist
  if (!descriptionElement || !descriptionEdit || !editButton || !doneButton || !cancelButton || !descriptionActions || !descriptionButtons) {
    console.warn('Some description editor elements not found, skipping initialization');
    return;
  }

  // Load saved description from localStorage
  const savedDescription = localStorage.getItem('projectDescription');
  if (savedDescription && descriptionElement) {
    descriptionElement.textContent = savedDescription;
  }

  // Edit button click handler
  editButton.addEventListener('click', function() {
    // Hide the description text and buttons container
    descriptionElement.style.display = 'none';
    descriptionButtons.style.display = 'none';
    
    // Show the textarea and action buttons
    descriptionEdit.style.display = 'block';
    descriptionActions.style.display = 'flex';
    
    // Set the current description text in the textarea
    descriptionEdit.value = descriptionElement.textContent;
    
    // Focus on the textarea
    descriptionEdit.focus();
  });

  // Done button click handler
  doneButton.addEventListener('click', function() {
    const newDescription = descriptionEdit.value.trim();
    
    if (newDescription) {
      // Update the description text
      descriptionElement.textContent = newDescription;
      
      // Save to localStorage
      localStorage.setItem('projectDescription', newDescription);
    } else {
      // If empty, use default or keep current
      const defaultDescription = 'A comprehensive architectural project focusing on modern design principles and sustainable building practices.';
      descriptionElement.textContent = descriptionElement.textContent || defaultDescription;
    }
    
    // Hide the textarea and action buttons
    descriptionEdit.style.display = 'none';
    descriptionActions.style.display = 'none';
    
    // Show the description text and buttons container
    descriptionElement.style.display = 'block';
    descriptionButtons.style.display = 'flex';
  });

  // Cancel button click handler
  cancelButton.addEventListener('click', function() {
    // Reset textarea to current description
    descriptionEdit.value = descriptionElement.textContent;
    
    // Hide the textarea and action buttons
    descriptionEdit.style.display = 'none';
    descriptionActions.style.display = 'none';
    
    // Show the description text and buttons container
    descriptionElement.style.display = 'block';
    descriptionButtons.style.display = 'flex';
  });

  // Allow Enter key to save (Ctrl+Enter or Cmd+Enter)
  descriptionEdit.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      doneButton.click();
    }
  });
}

// Assign Architect functionality - separate handler to ensure it's always set up
document.addEventListener("DOMContentLoaded", function() {
  // Assign Architect functionality
  const assignArchiBtn = document.getElementById('assignArchiBtn');
  if (assignArchiBtn) {
    assignArchiBtn.addEventListener('click', function() {
      openAssignArchitectModal();
    });
  }
});

// Load project data to get request_id for "More Details" link
async function loadProjectData(projectId) {
  try {
    console.log('🚀 Loading project data for ID:', projectId);
    
    // Wait a tiny bit to ensure DOM is ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const response = await fetch(`../php/agency/projects.php?project_id=${projectId}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('❌ Failed to load project data, status:', response.status);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      
      // Show error on page
      const projectTitle = document.getElementById('projectTitle');
      if (projectTitle) {
        projectTitle.textContent = 'Error loading project';
      }
      const projectDescription = document.getElementById('projectDescription');
      if (projectDescription) {
        projectDescription.textContent = `Failed to load project (HTTP ${response.status}). Please refresh the page.`;
      }
      return;
    }

    const result = await response.json();
    console.log('📦 Full API response:', JSON.stringify(result, null, 2));
    
    if (result.success && result.data) {
      const project = result.data;
      console.log('✅ Project data received:', project);
      console.log('📝 Project name:', project.project_name);
      console.log('📝 Project description:', project.description);
      console.log('📝 Project request_id:', project.request_id);
      console.log('📝 All project keys:', Object.keys(project));
      
      // Update ALL project data fields immediately
      // Update page header title
      const pageTitle = document.querySelector('.page-title');
      if (pageTitle) {
        if (project.project_name) {
          pageTitle.textContent = project.project_name;
          console.log('✅ Updated page title to:', project.project_name);
        } else {
          pageTitle.textContent = 'Project';
        }
      } else {
        console.warn('⚠️ Page title element not found');
      }
      
      // Update project title
      const projectTitle = document.getElementById('projectTitle');
      if (projectTitle) {
        if (project.project_name) {
          projectTitle.textContent = project.project_name;
          console.log('✅ Updated project title to:', project.project_name);
        } else {
          projectTitle.textContent = 'Untitled Project';
        }
      } else {
        console.warn('⚠️ Project title element not found');
      }
      
      // Update project description
      const projectDescription = document.getElementById('projectDescription');
      if (projectDescription) {
        if (project.description && project.description.trim()) {
          projectDescription.textContent = project.description;
          console.log('✅ Updated project description');
        } else {
          projectDescription.textContent = 'No description available.';
          console.log('⚠️ No description in project data');
        }
      } else {
        console.warn('⚠️ Project description element not found');
      }
      
      // Update description edit textarea
      const descriptionEdit = document.getElementById('projectDescriptionEdit');
      if (descriptionEdit) {
        if (project.description) {
          descriptionEdit.value = project.description;
          console.log('✅ Updated description edit textarea');
        } else {
          descriptionEdit.value = '';
        }
      }
      
      // Update timeline project name
      const timelineProjectName = document.getElementById('timelineProjectName');
      if (timelineProjectName) {
        if (project.project_name) {
          timelineProjectName.textContent = project.project_name;
          console.log('✅ Updated timeline project name');
        } else {
          timelineProjectName.textContent = 'project';
        }
      }
      
      // Update "More Details" link to navigate to project-details.html
      const moreDetailsLink = document.getElementById('moreDetailsLink');
      if (moreDetailsLink && projectId) {
        const projectDetailsUrl = `project-details.html?id=${projectId}`;
        moreDetailsLink.href = projectDetailsUrl;
        moreDetailsLink.removeAttribute('onclick');
        moreDetailsLink.onclick = function(e) {
          e.preventDefault();
          window.location.href = projectDetailsUrl;
        };
        console.log('✅ More Details link set to:', projectDetailsUrl);
      }
      
      projectDataLoaded = true;
      console.log('✅ Project data loaded and displayed successfully!');
    } else {
      console.error('❌ Invalid project data response:', result);
      // Show error on page
      const projectTitle = document.getElementById('projectTitle');
      if (projectTitle) {
        projectTitle.textContent = 'Error loading project';
      }
      const projectDescription = document.getElementById('projectDescription');
      if (projectDescription) {
        projectDescription.textContent = 'Failed to load project data. Please refresh the page.';
      }
      projectDataLoaded = true; // Mark as loaded even on error
    }
  } catch (error) {
    console.error('❌ Error loading project data:', error);
    console.error('Error stack:', error.stack);
    // Show error on page
    const projectTitle = document.getElementById('projectTitle');
    if (projectTitle) {
      projectTitle.textContent = 'Error loading project';
    }
    const projectDescription = document.getElementById('projectDescription');
    if (projectDescription) {
      projectDescription.textContent = 'Error: ' + error.message;
    }
    projectDataLoaded = true; // Mark as loaded even on error
  }
}

// Get project ID from URL or from project data
function getProjectId() {
  if (currentProjectId) return currentProjectId;
  
  const urlParams = new URLSearchParams(window.location.search);
  const idFromUrl = urlParams.get('id') || urlParams.get('project_id');
  
  if (idFromUrl) {
    currentProjectId = parseInt(idFromUrl);
    return currentProjectId;
  }
  
  // Try to get from project data if loaded
  // This would be set when project is loaded from API
  return null;
}

function openAssignArchitectModal() {
  const modal = document.getElementById('assignArchitectModal');
  if (modal) {
    modal.style.display = 'flex';
    loadArchitectsForProjectAssignment();
  }
}

function closeAssignArchitectModal() {
  const modal = document.getElementById('assignArchitectModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

async function loadArchitectsForProjectAssignment() {
  const select = document.getElementById('assignArchitectSelect');
  const noArchitectsNote = document.getElementById('noArchitectsNoteAssign');
  
  if (!select) {
    console.error('assignArchitectSelect element not found');
    return;
  }
  
  select.innerHTML = '<option value="">Loading architects...</option>';
  
  try {
    // Get agency ID from session - try the session endpoint first
    let agencyId = null;
    
    try {
      const sessionResponse = await fetch('../php/api/get-session-agency.php', {
        credentials: 'include'
      });
      
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        if (sessionData && sessionData.agency_id) {
          agencyId = sessionData.agency_id;
          console.log('✅ Got agency ID from session:', agencyId);
        }
      }
    } catch (sessionError) {
      console.warn('Session endpoint failed, trying alternative method:', sessionError);
    }
    
    // If we don't have agency ID, try to get it from the current project
    if (!agencyId && currentProjectId) {
      try {
        const projectResponse = await fetch(`../php/agency/projects.php?project_id=${currentProjectId}`, {
          credentials: 'include'
        });
        if (projectResponse.ok) {
          const projectData = await projectResponse.json();
          if (projectData.success && projectData.data && projectData.data.agency_id) {
            agencyId = projectData.data.agency_id;
            console.log('✅ Got agency ID from project:', agencyId);
          }
        }
      } catch (projectError) {
        console.warn('Failed to get agency ID from project:', projectError);
      }
    }
    
    if (!agencyId) {
      select.innerHTML = '<option value="">Error: Could not determine agency</option>';
      if (noArchitectsNote) {
        noArchitectsNote.style.display = 'block';
        noArchitectsNote.textContent = 'Unable to load team members. Please make sure you are logged in as an agency.';
      }
      return;
    }
    
    // Fetch team members (architects) for this agency
    console.log('Fetching team members for agency ID:', agencyId);
    const response = await fetch(`../php/api/search/team-members.php?agency_id=${agencyId}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch team members:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Team members API response:', result);
    
    if (result.success && result.data && result.data.length > 0) {
      select.innerHTML = '<option value="">-- Select an architect --</option>';
      
      result.data.forEach(architect => {
        const fullName = `${architect.first_name || ''} ${architect.last_name || ''}`.trim();
        const role = architect.role ? ` - ${architect.role}` : '';
        const option = document.createElement('option');
        option.value = architect.architect_id;
        option.textContent = `${fullName}${role}`;
        select.appendChild(option);
      });
      
      console.log(`✅ Loaded ${result.data.length} architects`);
      if (noArchitectsNote) {
        noArchitectsNote.style.display = 'none';
      }
    } else {
      select.innerHTML = '<option value="">No team members available</option>';
      if (noArchitectsNote) {
        noArchitectsNote.style.display = 'block';
        noArchitectsNote.textContent = 'You don\'t have any team members yet. You can assign an architect later, or add team members from the Team Management section first.';
      }
      console.warn('No team members found for agency:', agencyId);
    }
  } catch (error) {
    console.error('❌ Error loading architects:', error);
    console.error('Error details:', error.message, error.stack);
    select.innerHTML = '<option value="">Error loading architects</option>';
    if (noArchitectsNote) {
      noArchitectsNote.style.display = 'block';
      noArchitectsNote.textContent = 'Error loading team members. Please check the console (F12) for details.';
    }
  }
}

async function confirmAssignArchitect() {
  const projectId = getProjectId();
  
  if (!projectId) {
    alert('Error: Project ID not found. Please refresh the page and try again.');
    return;
  }
  
  const select = document.getElementById('assignArchitectSelect');
  const assignedArchitectId = select.value || null;
  
  if (!assignedArchitectId) {
    alert('Please select an architect to assign.');
    return;
  }
  
  try {
    const response = await fetch('../php/agency/projects.php', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        project_id: projectId,
        assigned_architect_id: parseInt(assignedArchitectId)
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      alert('Architect assigned successfully!');
      closeAssignArchitectModal();
      // Reload the page to show updated architect
      window.location.reload();
    } else {
      alert(result.message || 'Failed to assign architect');
    }
  } catch (error) {
    console.error('Error assigning architect:', error);
    alert('Error assigning architect: ' + error.message);
  }
}
