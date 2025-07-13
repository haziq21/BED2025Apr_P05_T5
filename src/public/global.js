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
