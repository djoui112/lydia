// Calendar functionality - Reused from agency-interface.js
document.addEventListener("DOMContentLoaded", function () {
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

  // Load saved description from localStorage
  const savedDescription = localStorage.getItem('projectDescription');
  if (savedDescription) {
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
