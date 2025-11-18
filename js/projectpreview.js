// Timeline functionality for Project Preview
document.addEventListener("DOMContentLoaded", function () {
  const timelineMilestones = document.getElementById("timelineMilestones");
  const timelineFlags = document.getElementById("timelineFlags");
  const progressCircle = document.getElementById("progressCircle");
  const progressPercentage = document.getElementById("progressPercentage");

  // Timeline data - will be loaded from localStorage
  let timelineData = [];

  function loadTimelineFromLocalStorage() {
    try {
      const savedDeadlines = JSON.parse(localStorage.getItem("calendarDeadlines"));
      if (savedDeadlines) {
        timelineData = extractTimelineDataFromDeadlines(savedDeadlines);
        updateTimeline();
      } else {
        // Default sample data if no saved data
        timelineData = [
          {
            date: new Date(2026, 2, 23),
            title: "Project Review",
            description: "Review project progress",
            isCompleted: false,
            year: 2026,
            month: 2,
            day: 23,
          },
          {
            date: new Date(2026, 2, 25),
            title: "Client Meeting",
            description: "Discuss new requirements",
            isCompleted: true,
            year: 2026,
            month: 2,
            day: 25,
          },
          {
            date: new Date(2026, 2, 28),
            title: "Deadline Submission",
            description: "Submit final documents",
            isCompleted: false,
            year: 2026,
            month: 2,
            day: 28,
          },
          {
            date: new Date(2026, 3, 5),
            title: "Final Review",
            description: "Final project review meeting",
            isCompleted: false,
            year: 2026,
            month: 3,
            day: 5,
          },
        ];
        updateTimeline();
      }
    } catch (e) {
      console.log("Error loading timeline data:", e);
    }
  }

  // Load timeline data from localStorage
  loadTimelineFromLocalStorage();

  // Listen for storage changes (from other tabs/windows)
  window.addEventListener("storage", function (e) {
    if (e.key === "calendarDeadlines") {
      loadTimelineFromLocalStorage();
    }
  });

  // Also listen for custom storage events (from same tab)
  window.addEventListener("calendarDeadlinesUpdated", function () {
    loadTimelineFromLocalStorage();
  });

  function extractTimelineDataFromDeadlines(deadlines) {
    const data = [];
    for (const year in deadlines) {
      for (const month in deadlines[year]) {
        for (const day in deadlines[year][month]) {
          const deadline = deadlines[year][month][day];
          data.push({
            date: new Date(parseInt(year), parseInt(month), parseInt(day)),
            title: deadline.title || "Deadline",
            description: deadline.description || "",
            isCompleted: deadline.isCompleted || false,
            year: parseInt(year),
            month: parseInt(month),
            day: parseInt(day),
          });
        }
      }
    }
    return data.sort((a, b) => a.date - b.date);
  }

  function saveTimelineToLocalStorage() {
    // Load current deadlines from localStorage
    let deadlines = JSON.parse(localStorage.getItem("calendarDeadlines")) || {};
    
    // Update deadlines with current timeline data
    timelineData.forEach((milestone) => {
      if (milestone.year && milestone.month !== undefined && milestone.day) {
        if (!deadlines[milestone.year]) {
          deadlines[milestone.year] = {};
        }
        if (!deadlines[milestone.year][milestone.month]) {
          deadlines[milestone.year][milestone.month] = {};
        }
        if (!deadlines[milestone.year][milestone.month][milestone.day]) {
          deadlines[milestone.year][milestone.month][milestone.day] = {};
        }
        
        deadlines[milestone.year][milestone.month][milestone.day].isCompleted = milestone.isCompleted;
        if (milestone.title) {
          deadlines[milestone.year][milestone.month][milestone.day].title = milestone.title;
        }
        if (milestone.description !== undefined) {
          deadlines[milestone.year][milestone.month][milestone.day].description = milestone.description;
        }
      }
    });
    
    // Save back to localStorage
    localStorage.setItem("calendarDeadlines", JSON.stringify(deadlines));
    
    // Trigger custom event for same-tab sync (storage event only fires in other tabs)
    window.dispatchEvent(new CustomEvent("calendarDeadlinesUpdated"));
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
    if (!timelineMilestones) return;

    timelineMilestones.innerHTML = "";
    if (timelineFlags) timelineFlags.innerHTML = "";

    if (timelineData.length === 0) {
      timelineMilestones.innerHTML =
        '<p style="text-align: center; color: var(--text-light); padding: 40px;">No timeline data available.</p>';
      if (progressCircle) progressCircle.style.setProperty("--progress", "0%");
      if (progressPercentage) progressPercentage.textContent = "0%";
      return;
    }

    // Sort by date
    timelineData.sort((a, b) => a.date - b.date);

    // Calculate progress
    const completedCount = timelineData.filter((d) => d.isCompleted).length;
    const totalCount = timelineData.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    if (progressCircle) {
      progressCircle.style.setProperty("--progress", `${progress}%`);
    }
    if (progressPercentage) {
      progressPercentage.textContent = `${Math.round(progress)}%`;
    }

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

      // Toggle completion on click
      milestoneEl.addEventListener("click", (e) => {
        if (e.target.closest(".milestone-node")) {
          milestone.isCompleted = !milestone.isCompleted;
          // Save to localStorage
          saveTimelineToLocalStorage();
          updateTimeline();
        }
      });

      timelineMilestones.appendChild(milestoneEl);

      // Create flag if there's a note or it's a meeting
      if (timelineFlags && milestone.description && milestone.description.toLowerCase().includes("meeting")) {
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
  updateTimeline();
  loadClientReviews();
});

