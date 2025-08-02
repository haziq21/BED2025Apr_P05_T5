const apiBaseUrl1 = "http://localhost:3000";
const token4 = localStorage.getItem("token");

if (!token4) {
  alert("You are not logged in. Please login first.");
  window.location.href = "../login/login.html";
} else {
  loadHomepageUser();
}
async function loadHomepageUser() {
  try {
    const res = await fetch(`${apiBaseUrl1}/api/profile/`, {
      headers: {
        Authorization: `Bearer ${token4}`,
      },
    });
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("Unauthorized");
      }
      throw new Error("Failed to load profile");
    }

    const data = await res.json();
    // @ts-ignore
    document.getElementById(
      "welcomeMsg"
    ).textContent = `Welcome, ${data.Name}!`;
  } catch (err) {
    console.error(err);
    alert("Session expired or invalid. Please login again.");
    localStorage.removeItem("token");
    window.location.href = "../login/login.html";
  }
}
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(checkProfileCompletion, 3000);
});

async function checkProfileCompletion() {
  if (!token4) return;

  try {
    const res = await fetch(`${apiBaseUrl1}/api/profile`, {
      headers: {
        Authorization: `Bearer ${token4}`,
      },
    });

    if (!res.ok) {
      console.error("Failed to load profile");
      return;
    }

    const data = await res.json();
    const count = parseInt(localStorage.getItem("profilePopupCount") || "0");

    const profileIncomplete = !data.Bio || !data.ProfilePhotoURL;

    if (profileIncomplete && count < 2) {
      localStorage.setItem("profilePopupCount", String(count + 1));

      // Show popup
      const popup = document.getElementById("completeProfilePopup");
      const closeBtn = document.getElementById("closeCompleteProfile");

      if (popup && closeBtn) {
        popup.style.display = "block";

        closeBtn.onclick = () => {
          popup.style.display = "none";
        };

        window.onclick = (e) => {
          if (e.target === popup) {
            popup.style.display = "none";
          }
        };
      } else {
        console.warn("Popup elements not found in DOM");
      }
    }
  } catch (err) {
    console.error("Error checking profile:", err);
  }
}
