const apiBaseUrl1 = "http://localhost:3000";
const token4 = localStorage.getItem("token");

if (!token4) {
  alert("You are not logged in. Please login first.");
  window.location.href = "login.html";
  } else {
  // Try to load
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
    document.getElementById("welcomeMsg").textContent = `Welcome, ${data.name}!`;
    

  } catch (err) {
    console.error(err);
    alert("Session expired or invalid. Please login again.");
    localStorage.removeItem("token");
    window.location.href = "login.html";
  }
}