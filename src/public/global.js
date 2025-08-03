/**
 * indicate which page the user chooses from navigation bar
 */
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".topnav a");

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
    });
  });
});


// slide show
let slideIndex = 1;
showSlides(slideIndex);

/**
 * @param {number} n
 */
function plusSlides(n) {
  showSlides(slideIndex += n);
}

/**
 * @param {number} n
 */
function currentSlide(n) {
  showSlides(slideIndex = n);
}

/**
 * @param {number} n
 */
function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) {slideIndex = 1}    
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
    // @ts-ignore
    slides[i].style.display = "none";  
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  // @ts-ignore
  slides[slideIndex-1].style.display = "block";  
  dots[slideIndex-1].className += " active";
}