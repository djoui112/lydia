
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

