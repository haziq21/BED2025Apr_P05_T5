const API_BASE_URL = "http://localhost:3000";

/**
 * @typedef {Object} CCLocation
 * @property {number} lat - Latitude
 * @property {number} lon - Longitude
 */

/**
 * @typedef {Object} CC
 * @property {number} id - CC ID
 * @property {string} name - CC name
 * @property {CCLocation} location - CC location
 */

/**
 * @typedef {Object} Admin
 * @property {number} id - Admin user ID
 * @property {string} name - Admin name
 * @property {string} phoneNumber - Admin phone number
 * @property {string} bio - Admin bio
 * @property {string} profilePhotoURL - Admin profile photo URL
 */

/**
 * @typedef {Object} AutocompleteSuggestion
 * @property {string} name - Place name
 * @property {number} lat - Latitude
 * @property {number} lon - Longitude
 */

// Global variables
/** @type {CC[]} */
let adminCCs = [];
/** @type {AutocompleteSuggestion[]} */
let autocompleteSuggestions = [];
/** @type {number|null} */
let autocompleteTimeoutId = null;

/**
 * Get JWT token from localStorage
 * @returns {string | null} The JWT token or null if not found
 */
function getAuthToken() {
  return localStorage.getItem("token");
}

/**
 * API call helper function
 * @param {string} endpoint - The API endpoint to call
 * @param {RequestInit} [options={}] - Fetch options
 * @returns {Promise<any>} The API response data
 */
async function apiCall(endpoint, options = {}) {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication required. Please log in.");
  }

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...defaultOptions,
    ...options,
    headers: { ...defaultOptions.headers, ...options.headers },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
}

/**
 * Load CCs where the user is an admin
 * @returns {Promise<void>}
 */
async function loadAdminCCs() {
  const loadingElement = document.getElementById("loading");
  const errorElement = document.getElementById("error");
  const emptyStateElement = document.getElementById("emptyState");
  const ccListElement = document.getElementById("ccList");

  try {
    // Show loading state
    if (loadingElement) loadingElement.style.display = "block";
    if (errorElement) errorElement.style.display = "none";
    if (emptyStateElement) emptyStateElement.style.display = "none";
    if (ccListElement) ccListElement.innerHTML = "";

    // Fetch CCs where user is admin using the filterAdmin parameter
    adminCCs = await apiCall("/api/cc?filterAdmin=true");

    // Hide loading
    if (loadingElement) loadingElement.style.display = "none";

    if (adminCCs.length === 0) {
      if (emptyStateElement) emptyStateElement.style.display = "block";
    } else {
      renderCCList();
    }
  } catch (error) {
    console.error("Error loading admin CCs:", error);
    if (loadingElement) loadingElement.style.display = "none";
    if (errorElement) {
      errorElement.textContent =
        error instanceof Error ? error.message : "Unknown error occurred";
      errorElement.style.display = "block";
    }
  }
}

/**
 * Render the CC list
 * @returns {void}
 */
function renderCCList() {
  const ccListElement = document.getElementById("ccList");

  if (!ccListElement) return;

  if (adminCCs.length === 0) {
    ccListElement.innerHTML =
      '<div class="no-results">No community centers found.</div>';
    return;
  }

  ccListElement.innerHTML = adminCCs.map((cc) => createCCCard(cc)).join("");
}

/**
 * Create a CC card HTML
 * @param {CC} cc - The CC object
 * @returns {string} HTML string for the CC card
 */
function createCCCard(cc) {
  return `
    <div class="cc-card">
      <div class="cc-card-header">
        <h3>${escapeHtml(cc.name)}</h3>
      </div>
      <div class="cc-details">
        <!-- No location details displayed -->
      </div>
      <div class="cc-actions">
        <button class="edit-btn" onclick="openEditModal(${cc.id})">Edit</button>
        <button class="admins-btn" onclick="openAdminsModal(${
          cc.id
        })">View Admins</button>
        <button class="delete-btn" onclick="deleteCC(${cc.id})">Delete</button>
      </div>
    </div>
  `;
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Open the create CC modal
 * @returns {void}
 */
function openCreateModal() {
  const modalElement = document.getElementById("createModalOverlay");
  const formElement = document.getElementById("createCCForm");

  if (modalElement) modalElement.classList.add("active");
  if (formElement && formElement instanceof HTMLFormElement) {
    formElement.reset();
  }
  hideAutocompleteSuggestions();
}

/**
 * Close the create CC modal
 * @returns {void}
 */
function closeCreateModal() {
  const modalElement = document.getElementById("createModalOverlay");
  if (modalElement) modalElement.classList.remove("active");
  hideAutocompleteSuggestions();
}

/**
 * Open the edit CC modal
 * @param {number} ccId - The CC ID to edit
 * @returns {void}
 */
function openEditModal(ccId) {
  const cc = adminCCs.find((c) => c.id === ccId);
  if (!cc) return;

  const editCCIdElement = document.getElementById("editCCId");
  const editCCNameElement = document.getElementById("editCCName");
  const editCCLatElement = document.getElementById("editCCLat");
  const editCCLonElement = document.getElementById("editCCLon");
  const modalElement = document.getElementById("editModalOverlay");

  if (editCCIdElement && editCCIdElement instanceof HTMLInputElement) {
    editCCIdElement.value = cc.id.toString();
  }
  if (editCCNameElement && editCCNameElement instanceof HTMLInputElement) {
    editCCNameElement.value = cc.name;
  }
  if (editCCLatElement && editCCLatElement instanceof HTMLInputElement) {
    editCCLatElement.value = cc.location.lat.toString();
  }
  if (editCCLonElement && editCCLonElement instanceof HTMLInputElement) {
    editCCLonElement.value = cc.location.lon.toString();
  }
  if (modalElement) modalElement.classList.add("active");
}

/**
 * Close the edit CC modal
 * @returns {void}
 */
function closeEditModal() {
  const modalElement = document.getElementById("editModalOverlay");
  if (modalElement) modalElement.classList.remove("active");
}

/**
 * Open the admins modal and display administrators for a CC
 * @param {number} ccId - The CC ID to view admins for
 * @returns {Promise<void>}
 */
async function openAdminsModal(ccId) {
  try {
    const admins = await apiCall(`/api/cc/${ccId}/admins`);
    const adminsList = document.getElementById("adminsList");

    if (!adminsList) return;

    if (admins.length === 0) {
      adminsList.innerHTML =
        "<p>No administrators found for this community center.</p>";
    } else {
      adminsList.innerHTML = admins
        .map(
          (admin) => `
        <div class="admin-item">
          <div class="admin-info">
            <div class="admin-name">${escapeHtml(admin.name)}</div>
            <div class="admin-details">
              <div class="admin-phone">📞 ${escapeHtml(admin.phoneNumber)}</div>
              ${
                admin.bio
                  ? `<div class="admin-bio">"${escapeHtml(admin.bio)}"</div>`
                  : ""
              }
            </div>
          </div>
          <div class="admin-actions">
            <button class="remove-admin-btn" onclick="removeAdmin(${ccId}, ${
            admin.id
          }, '${escapeHtml(admin.name).replace(
            /'/g,
            "\\'"
          )}')" title="Remove as admin">
              Remove
            </button>
          </div>
        </div>
      `
        )
        .join("");
    }

    const modalElement = document.getElementById("adminsModalOverlay");
    if (modalElement) modalElement.classList.add("active");
  } catch (error) {
    console.error("Error loading admins:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    alert("Error loading administrators: " + errorMessage);
  }
}

/**
 * Close the admins modal
 * @returns {void}
 */
function closeAdminsModal() {
  const modalElement = document.getElementById("adminsModalOverlay");
  if (modalElement) modalElement.classList.remove("active");
}

/**
 * Remove a user as an admin from a CC
 * @param {number} ccId - The CC ID
 * @param {number} userId - The user ID to remove as admin
 * @param {string} userName - The user name for confirmation
 * @returns {Promise<void>}
 */
async function removeAdmin(ccId, userId, userName) {
  if (
    !confirm(
      `Are you sure you want to remove "${userName}" as an admin? This action cannot be undone.`
    )
  ) {
    return;
  }

  try {
    await apiCall(`/api/cc/${ccId}/admins/${userId}`, {
      method: "DELETE",
    });

    // Refresh the admins list
    await openAdminsModal(ccId);
    alert(`"${userName}" has been removed as an admin successfully!`);
  } catch (error) {
    console.error("Error removing admin:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    alert("Error removing admin: " + errorMessage);
  }
}

/**
 * Handle autocomplete for CC name input
 * @param {string} query - The search query
 * @returns {Promise<void>}
 */
async function handleNameAutocomplete(query) {
  // Clear any existing timeout
  if (autocompleteTimeoutId) {
    clearTimeout(autocompleteTimeoutId);
  }

  // Don't search for very short queries
  if (query.trim().length < 2) {
    hideAutocompleteSuggestions();
    return;
  }

  // Debounce API calls
  autocompleteTimeoutId = setTimeout(async () => {
    try {
      const suggestions = await apiCall(
        `/api/map/autocomplete?query=${encodeURIComponent(query.trim())}`
      );
      autocompleteSuggestions = suggestions;
      renderAutocompleteSuggestions();
    } catch (error) {
      console.error("Error fetching autocomplete suggestions:", error);
      hideAutocompleteSuggestions();
    }
  }, 300);
}

/**
 * Render autocomplete suggestions
 * @returns {void}
 */
function renderAutocompleteSuggestions() {
  const suggestionsContainer = document.getElementById(
    "autocompleteSuggestions"
  );
  if (!suggestionsContainer) return;

  if (autocompleteSuggestions.length === 0) {
    hideAutocompleteSuggestions();
    return;
  }

  suggestionsContainer.innerHTML = autocompleteSuggestions
    .map(
      (suggestion, index) => `
        <div class="autocomplete-suggestion" 
             onclick="selectSuggestion(${index}, event)" 
             ontouchend="selectSuggestion(${index}, event)"
             onmousedown="selectSuggestion(${index}, event)"
             data-index="${index}">
          <div class="suggestion-name">${escapeHtml(suggestion.name)}</div>
        </div>
      `
    )
    .join("");

  showAutocompleteSuggestions();
}

/**
 * Select an autocomplete suggestion
 * @param {number} index - Index of the suggestion
 * @param {Event} event - The event object
 * @returns {void}
 */
function selectSuggestion(index, event) {
  event.preventDefault();
  event.stopPropagation();

  const suggestion = autocompleteSuggestions[index];
  if (!suggestion) return;

  // Fill form fields
  const nameElement = document.getElementById("ccName");
  const latElement = document.getElementById("ccLat");
  const lonElement = document.getElementById("ccLon");

  if (nameElement && nameElement instanceof HTMLInputElement) {
    nameElement.value = suggestion.name;
  }
  if (
    latElement &&
    latElement instanceof HTMLInputElement &&
    "lat" in suggestion
  ) {
    latElement.value = suggestion.lat.toString();
  }
  if (
    lonElement &&
    lonElement instanceof HTMLInputElement &&
    "lon" in suggestion
  ) {
    lonElement.value = suggestion.lon.toString();
  }

  hideAutocompleteSuggestions();
}

/**
 * Show autocomplete suggestions
 * @returns {void}
 */
function showAutocompleteSuggestions() {
  const suggestionsContainer = document.getElementById(
    "autocompleteSuggestions"
  );
  if (suggestionsContainer) {
    suggestionsContainer.classList.add("active");
  }
}

/**
 * Hide autocomplete suggestions
 * @returns {void}
 */
function hideAutocompleteSuggestions() {
  const suggestionsContainer = document.getElementById(
    "autocompleteSuggestions"
  );
  if (suggestionsContainer) {
    suggestionsContainer.classList.remove("active");
  }
}

// Form submission handlers
const createCCFormElement = document.getElementById("createCCForm");
if (createCCFormElement) {
  createCCFormElement.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!e.target || !(e.target instanceof HTMLFormElement)) return;

    const formData = new FormData(e.target);
    const nameValue = formData.get("name");
    const latValue = formData.get("lat");
    const lonValue = formData.get("lon");

    if (!nameValue || !latValue || !lonValue) return;

    const ccData = {
      name: nameValue.toString(),
      location: {
        lat: parseFloat(latValue.toString()),
        lon: parseFloat(lonValue.toString()),
      },
    };

    try {
      await apiCall("/api/cc", {
        method: "POST",
        body: JSON.stringify(ccData),
      });

      closeCreateModal();
      await loadAdminCCs();
      alert("Community center created successfully!");
    } catch (error) {
      console.error("Error creating CC:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      alert("Error creating community center: " + errorMessage);
    }
  });
}

const editCCFormElement = document.getElementById("editCCForm");
if (editCCFormElement) {
  editCCFormElement.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!e.target || !(e.target instanceof HTMLFormElement)) return;

    const formData = new FormData(e.target);
    const ccIdElement = document.getElementById("editCCId");

    if (!ccIdElement || !(ccIdElement instanceof HTMLInputElement)) return;

    const ccId = ccIdElement.value;
    const nameValue = formData.get("name");
    const latValue = formData.get("lat");
    const lonValue = formData.get("lon");

    if (!nameValue || !latValue || !lonValue) return;

    const ccData = {
      name: nameValue.toString(),
      location: {
        lat: parseFloat(latValue.toString()),
        lon: parseFloat(lonValue.toString()),
      },
    };

    try {
      await apiCall(`/api/cc/${ccId}`, {
        method: "PUT",
        body: JSON.stringify(ccData),
      });

      closeEditModal();
      await loadAdminCCs();
      alert("Community center updated successfully!");
    } catch (error) {
      console.error("Error updating CC:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      alert("Error updating community center: " + errorMessage);
    }
  });
}

/**
 * Delete a CC by ID
 * @param {number} ccId - The CC ID to delete
 * @returns {Promise<void>}
 */
async function deleteCC(ccId) {
  const cc = adminCCs.find((c) => c.id === ccId);
  if (!cc) return;

  if (
    !confirm(
      `Are you sure you want to delete "${cc.name}"? This action cannot be undone.`
    )
  ) {
    return;
  }

  try {
    await apiCall(`/api/cc/${ccId}`, {
      method: "DELETE",
    });

    await loadAdminCCs();
    alert("Community center deleted successfully!");
  } catch (error) {
    console.error("Error deleting CC:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    alert("Error deleting community center: " + errorMessage);
  }
}

// Close modals when clicking outside
document.addEventListener("click", (e) => {
  if (
    e.target &&
    e.target instanceof HTMLElement &&
    e.target.classList.contains("modal-overlay")
  ) {
    closeCreateModal();
    closeEditModal();
    closeAdminsModal();
  }
});

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  loadAdminCCs();
});
