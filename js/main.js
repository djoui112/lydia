
  const menuBtn = document.querySelector(".menu")
  const landingText =document.querySelector(".landing-text");
  const landingPic = document.querySelector(".landing-pic");
  const menu = document.querySelector(".main-menu")
  
  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle("cancel");
    landingText.classList.toggle('active');
    landingPic.classList.toggle('active');
    menu.classList.toggle('active');
  });
;

const portfolios = document.querySelectorAll(".port-card");
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");

let currentIndex = 0;

function updateActivePortfolio(index) {
  portfolios.forEach((card, i) => {
    const userName = card.querySelector(".user-name");
    const numb = card.querySelector(".numb");
    const seeMore = card.querySelector(".see-more");

    if (i === index) {
      // Add .current to all parts of the active card
      card.classList.add("current");
      userName.classList.add("current");
      numb.classList.add("current");
      seeMore.classList.add("current");
    } else {
      // Remove .current from all others
      card.classList.remove("current");
      userName.classList.remove("current");
      numb.classList.remove("current");
      seeMore.classList.remove("current");
    }
  });
}

// Initial state
updateActivePortfolio(currentIndex);

nextBtn.addEventListener("click", () => {
  currentIndex++;
  if (currentIndex >= portfolios.length) currentIndex = 0;
  updateActivePortfolio(currentIndex);
});

prevBtn.addEventListener("click", () => {
  currentIndex--;
  if (currentIndex < 0) currentIndex = portfolios.length - 1;
  updateActivePortfolio(currentIndex);
});
