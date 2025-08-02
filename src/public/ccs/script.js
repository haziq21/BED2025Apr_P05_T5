const API_BASE_URL = "http://localhost:3000";

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
 * Handle autocomplete for CC name input
 * @param {string} query - The search query
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

  suggestionsContainer.style.display = "block";
}

/**
 * Hide autocomplete suggestions
 */
function hideAutocompleteSuggestions() {
  const suggestionsContainer = document.getElementById(
    "autocompleteSuggestions"
  );
  if (suggestionsContainer) {
    suggestionsContainer.style.display = "none";
  }
}

/**
 * Show autocomplete suggestions if they exist
 */
function showAutocompleteSuggestions() {
  const suggestionsContainer = document.getElementById(
    "autocompleteSuggestions"
  );
  if (suggestionsContainer && autocompleteSuggestions.length > 0) {
    suggestionsContainer.style.display = "block";
  }
}

/**
 * Select an autocomplete suggestion
 * @param {number} index - Index of the selected suggestion
 * @param {Event} [event] - The event object
 */
function selectSuggestion(index, event) {
  // Prevent event bubbling
  event?.preventDefault();
  event?.stopPropagation();

  const suggestion = autocompleteSuggestions[index];
  if (!suggestion) return;

  const nameInput = /** @type {HTMLInputElement} */ (
    document.getElementById("ccName")
  );
  if (nameInput) {
    nameInput.value = suggestion.name;
    selectedPlaceId = suggestion.placeId;
  }

  // Hide suggestions immediately
  const suggestionsContainer = document.getElementById(
    "autocompleteSuggestions"
  );
  if (suggestionsContainer) {
    suggestionsContainer.style.display = "none";
  }

  // Try to get coordinates from the place ID
  getCoordinatesFromPlaceId(suggestion.placeId);
}

/**
 * Get coordinates from Google Places using place ID
 * @param {string} placeId - The Google Places place ID
 */
async function getCoordinatesFromPlaceId(placeId) {
  try {
    // This would require a separate API endpoint to get place details
    // For now, we'll just clear the lat/lon fields so user can enter manually
    const latInput = /** @type {HTMLInputElement} */ (
      document.getElementById("ccLat")
    );
    const lonInput = /** @type {HTMLInputElement} */ (
      document.getElementById("ccLon")
    );

    if (latInput && lonInput) {
      latInput.value = "";
      lonInput.value = "";
      latInput.focus(); // Focus on lat input to guide user
    }

    console.log(
      "Selected place ID:",
      placeId,
      "- Please enter coordinates manually"
    );
  } catch (error) {
    console.error("Error getting coordinates:", error);
  }
}

// DOM elements
const loadingElement = document.getElementById("loading");
const errorElement = document.getElementById("error");
const ccListElement = document.getElementById("ccList");
const createModalOverlay = document.getElementById("createModalOverlay");
const editModalOverlay = document.getElementById("editModalOverlay");
const createForm = document.getElementById("createCCForm");
const editForm = document.getElementById("editCCForm");

// State
/** @type {Array<{id: number, name: string, location: {lat: number, lon: number}, isAdmin?: boolean}>} */
let currentCCs = [];
let currentSortMode = "alphabetical";
let currentSearchTerm = "";
/** @type {{lat: number, lon: number} | null} */
let userLocation = null;

// Autocomplete state
/** @type {Array<{name: string, placeId: string}>} */
let autocompleteSuggestions = [];
/** @type {ReturnType<typeof setTimeout> | null} */
let autocompleteTimeoutId = null;
/** @type {string | null} */
let selectedPlaceId = null;

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  loadCCs();
  setupEventListeners();
  getUserLocation();
});

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Create form submission
  createForm?.addEventListener("submit", handleCreateSubmit);

  // Edit form submission
  editForm?.addEventListener("submit", handleEditSubmit);

  // Close modals when clicking overlay
  createModalOverlay?.addEventListener("click", (e) => {
    if (e.target === createModalOverlay) {
      closeCreateModal();
    }
  });

  editModalOverlay?.addEventListener("click", (e) => {
    if (e.target === editModalOverlay) {
      closeEditModal();
    }
  });

  // ESC key to close modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeCreateModal();
      closeEditModal();
    }
  });
}

/**
 * Load all CCs with optional sorting
 */
async function loadCCs() {
  try {
    showLoading();
    hideError();

    let apiUrl = "/api/cc?indicateAdmin=true";

    // Add location parameters for distance sorting
    if (currentSortMode === "distance" && userLocation) {
      apiUrl += `&lat=${userLocation.lat}&lon=${userLocation.lon}`;
    }

    const ccs = await apiCall(apiUrl);
    currentCCs = ccs;

    hideLoading();
    applyFiltersAndRender();
  } catch (error) {
    hideLoading();
    showError(/** @type {Error} */ (error).message);
    console.error("Error loading CCs:", error);
  }
}

// Get user's location for distance sorting
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
      },
      (error) => {
        console.warn("Could not get user location:", error.message);
        // Don't show error to user, distance sorting just won't be available
      }
    );
  }
}

/**
 * Handle sort dropdown change
 */
function handleSortChange() {
  const sortSelect = /** @type {HTMLSelectElement} */ (
    document.getElementById("sortSelect")
  );
  if (!sortSelect) return;

  const newSortMode = sortSelect.value;

  if (newSortMode === "distance" && !userLocation) {
    alert(
      "Location access is required for distance sorting. Please enable location access and refresh the page."
    );
    sortSelect.value = currentSortMode; // Reset to previous value
    return;
  }

  currentSortMode = newSortMode;
  loadCCs(); // Reload with new sorting
}

/**
 * Handle search input change
 */
function handleSearchInput() {
  const searchInput = /** @type {HTMLInputElement} */ (
    document.getElementById("searchInput")
  );
  if (!searchInput) return;

  currentSearchTerm = searchInput.value.toLowerCase().trim();
  applyFiltersAndRender();
}

/**
 * Clear search input and show all results
 */
function clearSearch() {
  const searchInput = /** @type {HTMLInputElement} */ (
    document.getElementById("searchInput")
  );
  if (searchInput) {
    searchInput.value = "";
  }
  currentSearchTerm = "";
  applyFiltersAndRender();
}

/**
 * Apply current search and sort filters and render the filtered results
 */
function applyFiltersAndRender() {
  let filteredCCs = [...currentCCs];

  // Apply search filter
  if (currentSearchTerm) {
    filteredCCs = filteredCCs.filter((cc) =>
      cc.name.toLowerCase().includes(currentSearchTerm)
    );
  }

  // Apply sorting
  if (currentSortMode === "alphabetical") {
    filteredCCs.sort((a, b) => a.name.localeCompare(b.name));
  }
  // Distance sorting is handled by the backend

  renderCCs(filteredCCs);
}

/**
 * Render CCs list
 * @param {Array<{id: number, name: string, location: {lat: number, lon: number}, isAdmin?: boolean}>} ccs - Array of community centers
 */
function renderCCs(ccs) {
  if (!ccListElement) return;

  if (!ccs || ccs.length === 0) {
    const emptyMessage = currentSearchTerm
      ? `No community centers found matching "${currentSearchTerm}". Try a different search term.`
      : "Be the first to add a community center to your area!";

    ccListElement.innerHTML = `
      <div class="empty-state">
        <h3>No Community Centers Found</h3>
        <p>${emptyMessage}</p>
        ${
          currentSearchTerm
            ? '<button class="clear-search-btn" onclick="clearSearch()">Clear Search</button>'
            : ""
        }
      </div>
    `;
    return;
  }

  ccListElement.innerHTML = ccs
    .map(
      (cc) => `
        <div class="cc-card" data-id="${cc.id}">
          <div class="cc-card-header">
            <h3>${escapeHtml(cc.name)}</h3>
            ${
              cc.isAdmin
                ? `
            <div class="cc-actions">
              <button class="edit-btn" onclick="openEditModal(${cc.id})">Edit</button>
              <button class="delete-btn" onclick="deleteCC(${cc.id})">Delete</button>
            </div>
            `
                : ""
            }
          </div>
        </div>
      `
    )
    .join("");
}

/**
 * Create CC form submission handler
 * @param {Event} e - Form submission event
 */
async function handleCreateSubmit(e) {
  e.preventDefault();

  if (!createForm) return;
  const formData = new FormData(/** @type {HTMLFormElement} */ (createForm));
  const ccData = {
    name: /** @type {string} */ (formData.get("name") || "").trim(),
    location: {
      lat: parseFloat(/** @type {string} */ (formData.get("lat") || "0")),
      lon: parseFloat(/** @type {string} */ (formData.get("lon") || "0")),
    },
  };

  // Validation
  if (!ccData.name) {
    alert("Please enter a name for the community center.");
    return;
  }

  if (isNaN(ccData.location.lat) || isNaN(ccData.location.lon)) {
    alert("Please enter valid latitude and longitude coordinates.");
    return;
  }

  if (ccData.location.lat < -90 || ccData.location.lat > 90) {
    alert("Latitude must be between -90 and 90 degrees.");
    return;
  }

  if (ccData.location.lon < -180 || ccData.location.lon > 180) {
    alert("Longitude must be between -180 and 180 degrees.");
    return;
  }

  try {
    await apiCall("/api/cc", {
      method: "POST",
      body: JSON.stringify(ccData),
    });

    closeCreateModal();
    /** @type {HTMLFormElement} */ (createForm).reset();
    loadCCs(); // Refresh the list

    alert("Community center created successfully!");
  } catch (error) {
    alert(
      `Error creating community center: ${/** @type {Error} */ (error).message}`
    );
    console.error("Error creating CC:", error);
  }
}

/**
 * Edit CC modal opener
 * @param {number} ccId - The ID of the CC to edit
 */
function openEditModal(ccId) {
  const cc = currentCCs.find((c) => c.id === ccId);
  if (!cc) {
    alert("Community center not found.");
    return;
  }

  // Populate form
  /** @type {HTMLInputElement} */ (document.getElementById("editCCId")).value =
    cc.id.toString();
  /** @type {HTMLInputElement} */ (
    document.getElementById("editCCName")
  ).value = cc.name;
  /** @type {HTMLInputElement} */ (document.getElementById("editCCLat")).value =
    cc.location.lat.toString();
  /** @type {HTMLInputElement} */ (document.getElementById("editCCLon")).value =
    cc.location.lon.toString();

  editModalOverlay?.classList.add("active");
}

/**
 * Edit CC form submission handler
 * @param {Event} e - Form submission event
 */
async function handleEditSubmit(e) {
  e.preventDefault();

  const ccId = parseInt(
    /** @type {HTMLInputElement} */ (document.getElementById("editCCId")).value
  );
  if (!editForm) return;
  const formData = new FormData(/** @type {HTMLFormElement} */ (editForm));
  const ccData = {
    name: /** @type {string} */ (formData.get("name") || "").trim(),
    location: {
      lat: parseFloat(/** @type {string} */ (formData.get("lat") || "0")),
      lon: parseFloat(/** @type {string} */ (formData.get("lon") || "0")),
    },
  };

  // Validation
  if (!ccData.name) {
    alert("Please enter a name for the community center.");
    return;
  }

  if (isNaN(ccData.location.lat) || isNaN(ccData.location.lon)) {
    alert("Please enter valid latitude and longitude coordinates.");
    return;
  }

  if (ccData.location.lat < -90 || ccData.location.lat > 90) {
    alert("Latitude must be between -90 and 90 degrees.");
    return;
  }

  if (ccData.location.lon < -180 || ccData.location.lon > 180) {
    alert("Longitude must be between -180 and 180 degrees.");
    return;
  }

  try {
    await apiCall(`/api/cc/${ccId}`, {
      method: "PATCH",
      body: JSON.stringify(ccData),
    });

    closeEditModal();
    loadCCs(); // Refresh the list

    alert("Community center updated successfully!");
  } catch (error) {
    alert(
      `Error updating community center: ${/** @type {Error} */ (error).message}`
    );
    console.error("Error updating CC:", error);
  }
}

/**
 * Delete CC
 * @param {number} ccId - The ID of the CC to delete
 */
async function deleteCC(ccId) {
  const cc = currentCCs.find((c) => c.id === ccId);
  if (!cc) {
    alert("Community center not found.");
    return;
  }

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

    loadCCs(); // Refresh the list
    alert("Community center deleted successfully!");
  } catch (error) {
    alert(
      `Error deleting community center: ${/** @type {Error} */ (error).message}`
    );
    console.error("Error deleting CC:", error);
  }
}

/**
 * Open create modal
 */
function openCreateModal() {
  createModalOverlay?.classList.add("active");
  /** @type {HTMLInputElement} */ (document.getElementById("ccName"))?.focus();
}

/**
 * Close create modal
 */
function closeCreateModal() {
  createModalOverlay?.classList.remove("active");
  /** @type {HTMLFormElement} */ (createForm)?.reset();
}

/**
 * Close edit modal
 */
function closeEditModal() {
  editModalOverlay?.classList.remove("active");
  /** @type {HTMLFormElement} */ (editForm)?.reset();
}

/**
 * Show loading state
 */
function showLoading() {
  if (loadingElement) loadingElement.style.display = "block";
  if (ccListElement) ccListElement.style.display = "none";
}

/**
 * Hide loading state
 */
function hideLoading() {
  if (loadingElement) loadingElement.style.display = "none";
  if (ccListElement) ccListElement.style.display = "block";
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
  if (errorElement) {
    errorElement.textContent = `Error: ${message}`;
    errorElement.style.display = "block";
  }
}

/**
 * Hide error message
 */
function hideError() {
  if (errorElement) errorElement.style.display = "none";
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Export functions for global access
window.loadCCs = loadCCs;
window.openCreateModal = openCreateModal;
window.closeCreateModal = closeCreateModal;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.deleteCC = deleteCC;
window.handleSortChange = handleSortChange;
window.handleSearchInput = handleSearchInput;
window.clearSearch = clearSearch;
window.handleNameAutocomplete = handleNameAutocomplete;
window.hideAutocompleteSuggestions = hideAutocompleteSuggestions;
window.showAutocompleteSuggestions = showAutocompleteSuggestions;
window.selectSuggestion = selectSuggestion;
