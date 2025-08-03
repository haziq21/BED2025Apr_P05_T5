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

export async function StartGoogleAuth() {
  const token = localStorage.getItem("token"); // Get your JWT token

  if (!token) {
    console.error("No JWT token found.");
    return;
  }

  // Make a fetch request to  get the Google Auth URL
  const response = await fetch("/api/calendar/google/auth/url", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.error(
      "Error from backend when getting Google Auth URL:",
      response.status,
      response.statusText
    );
    if (response.status === 401 || response.status === 403) {
      window.location.href = "/login"; // Redirect if unauthorized/forbidden
    }
    return;
  }

  const data = await response.json();

  // Redirect the user to the Google Auth URL received from the backend
  if (data && data.authUrl) {
    window.location.href = data.authUrl;
  } else {
    console.error("Backend did not provide a valid authUrl in the response.");
  }
}

// Add event listener for the Google Calendar button
const linkButton = document.getElementById("linkGoogleCalendar");
if (linkButton) {
  linkButton.addEventListener("click", StartGoogleAuth);
}

