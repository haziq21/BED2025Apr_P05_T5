/**
 * @file Fetches and displays pending interest group applications for a CC.
 * Requires JWT token in localStorage and a valid CCId.
 */

/**
 * Calculates time since submission.
 * @param {string} isoDate - ISO 8601 datetime string
 * @returns {string} - e.g., "3 days ago"
 */
function getTimeSince(isoDate) {
  const submitted = new Date(isoDate);
  const now = new Date();
  // @ts-ignore
  const diffMs = now - submitted;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return `${days === 0 ? "Today" : `${days} day${days > 1 ? "s" : ""} ago`}`;
}

/**
 * Fetches pending applications and renders them as cards.
 * @returns {Promise<void>}
 */
async function loadApplications() {
  const container = document.getElementById("cardContainer");
  // @ts-ignore
  container.innerHTML = "Loading...";

  const token = localStorage.getItem("token");
  const CCId = localStorage.getItem("ccId"); // change if you use query param instead

  try {
    const res = await fetch(`/api/interestGroupAdmin/${CCId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch");

    const data = await res.json();
    // @ts-ignore
    container.innerHTML = "";

    // @ts-ignore
    data.forEach((app) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h2>${app.Title}</h2>
        <small>${getTimeSince(app.createdAt)} · ${app.Scope}</small>
        <p>${app.Description}</p>
        <p><strong>${app.UserName || "XXXX XXXXX"}</strong></p>
      `;

      card.onclick = () => {
        window.location.href = `admin-application.html?proposalId=${app.ProposalId}`;
      };

      // @ts-ignore
      container.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    // @ts-ignore
    container.innerHTML = "Error loading applications.";
  }
}

loadApplications();
