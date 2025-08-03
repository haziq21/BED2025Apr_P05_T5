/**
 * @file Loads a single Interest Group application by ID and allows admin to accept/reject.
 * After review, it sends a Gmail notification to the applicant.
 */

// @ts-ignore
import { sendApprovalEmail } from "../services/gmailService.js";

/**
 * Gets query param from URL
 * @param {string} key
 * @returns {string | null}
 */
function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

const proposalId = getParam("proposalId");
const token = localStorage.getItem("token");
const detailsContainer = document.getElementById("applicationDetails");

/**
 * Fetches application data and renders it
 */
async function loadApplication() {
  try {
    const res = await fetch(`/api/interestGroupAdmin/${proposalId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch application");

    const app = await res.json();

    // @ts-ignore
    detailsContainer.innerHTML = `
      <h2>${app.Title}</h2>
      <p><strong>Description:</strong> ${app.Description}</p>
      <p><strong>Scope:</strong> ${app.Scope}</p>
      <p><strong>Frequency:</strong> ${app.MeetingFrequency}</p>
      <p><strong>Budget:</strong> $${app.BudgetEstimateStart} – $${
      app.BudgetEstimateEnd
    }</p>
      <p><strong>Equipment:</strong> ${app.Equipment || "None"}</p>
      <p><strong>Accessibility:</strong> ${app.AccessibilityConsideration}</p>
      <p><strong>Health/Safety:</strong> ${app.HealthSafetyPrecaution}</p>
      <p><strong>Email:</strong> ${app.Email}</p>
      <p><strong>User:</strong> ${app.UserName || "XXXX XXXXX"}</p>
    `;
  } catch (err) {
    console.error(err);
    // @ts-ignore
    detailsContainer.textContent = "Could not load application.";
  }
}

/**
 * Updates application status and sends email
 * @param {"Accepted" | "Rejected"} status
 */
async function reviewApplication(status) {
  try {
    const res = await fetch(`/api/interestGroupAdmin/${proposalId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ Status: status }),
    });

    if (!res.ok) throw new Error("Failed to update status");

    // Mocked send email
    await sendApprovalEmail(status, proposalId);

    alert(`Application ${status.toLowerCase()}!`);
    window.location.href = "admin-dashboard.html";
  } catch (err) {
    console.error(err);
    alert("Error updating status.");
  }
}

// @ts-ignore
document.getElementById("acceptBtn").onclick = () =>
  reviewApplication("Accepted");
// @ts-ignore
document.getElementById("rejectBtn").onclick = () =>
  reviewApplication("Rejected");

loadApplication();
