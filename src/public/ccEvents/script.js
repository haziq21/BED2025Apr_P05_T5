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

  const response = await fetch(endpoint, {
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

// DOM elements
const loadingElement = document.getElementById("loading");
const errorElement = document.getElementById("error");
const eventsListElement = document.getElementById("eventsList");
const eventsControlsElement = document.getElementById("eventsControls");
const customDropdownElement = document.getElementById("customDropdown");
const dropdownContentElement = document.getElementById("dropdownContent");
const dropdownOptionsElement = document.getElementById("dropdownOptions");
const selectedCCTextElement = document.getElementById("selectedCCText");

// State
/** @type {Array<{id: number, name: string, location: {lat: number, lon: number}}>} */
let allCCs = [];
/** @type {Array<{id: number, name: string, location: {lat: number, lon: number}}>} */
let filteredCCs = [];
/** @type {Array<any>} */
let currentEvents = [];
let ccSearchTerm = "";
let ccSortMode = "alphabetical";
let eventSearchTerm = "";
/** @type {number | null} */
let selectedCCId = null;
/** @type {{lat: number, lon: number} | null} */
let userLocation = null;
let isDropdownOpen = false;

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  loadCCs();
  getUserLocation();
  setupEventListeners();
});

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    const target = /** @type {Node} */ (e.target);
    if (!customDropdownElement?.contains(target)) {
      closeDropdown();
    }
  });

  // Prevent dropdown from closing when clicking inside
  dropdownContentElement?.addEventListener("click", (e) => {
    e.stopPropagation();
  });
}

/**
 * Load community centers from API
 */
async function loadCCs() {
  try {
    showDropdownLoading();

    let endpoint = "/api/cc";
    if (userLocation && ccSortMode === "distance") {
      endpoint += `?lat=${userLocation.lat}&lon=${userLocation.lon}`;
    }

    const data = await apiCall(endpoint);
    allCCs = data || [];

    applyFiltersAndRenderCCs();
  } catch (error) {
    console.error("Error loading community centers:", error);
    showDropdownError(/** @type {Error} */ (error).message);
  }
}

/**
 * Apply search and sort filters to CCs and render them
 */
function applyFiltersAndRenderCCs() {
  let filtered = [...allCCs];

  // Apply search filter
  if (ccSearchTerm) {
    filtered = filtered.filter((cc) =>
      cc.name.toLowerCase().includes(ccSearchTerm.toLowerCase())
    );
  }

  // Apply sorting
  if (ccSortMode === "alphabetical") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }
  // Distance sorting is handled by the API

  filteredCCs = filtered;
  renderCCOptions();
}

/**
 * Render CC options in the dropdown
 */
function renderCCOptions() {
  if (!dropdownOptionsElement) return;

  if (filteredCCs.length === 0) {
    const emptyMessage = ccSearchTerm
      ? `No community centers found matching "${ccSearchTerm}"`
      : "No community centers available";

    dropdownOptionsElement.innerHTML = `
      <div class="dropdown-option empty-option">
        ${emptyMessage}
      </div>
    `;
    return;
  }

  dropdownOptionsElement.innerHTML = filteredCCs
    .map(
      (cc) => `
      <div class="dropdown-option" onclick="selectCC(${cc.id}, '${escapeHtml(
        cc.name
      )}')">
        <div class="cc-name">${escapeHtml(cc.name)}</div>
        <div class="cc-location">📍 ${cc.location.lat.toFixed(
          4
        )}, ${cc.location.lon.toFixed(4)}</div>
      </div>
    `
    )
    .join("");
}

/**
 * Toggle dropdown open/close
 */
function toggleDropdown() {
  if (isDropdownOpen) {
    closeDropdown();
  } else {
    openDropdown();
  }
}

/**
 * Open dropdown
 */
function openDropdown() {
  if (!dropdownContentElement) return;

  dropdownContentElement.style.display = "block";
  customDropdownElement?.classList.add("open");
  isDropdownOpen = true;

  // Focus search input
  const searchInput = document.getElementById("ccSearchInput");
  if (searchInput) {
    setTimeout(() => searchInput.focus(), 100);
  }
}

/**
 * Close dropdown
 */
function closeDropdown() {
  if (!dropdownContentElement) return;

  dropdownContentElement.style.display = "none";
  customDropdownElement?.classList.remove("open");
  isDropdownOpen = false;
}

/**
 * Select a community center
 * @param {number} ccId - The ID of the community center
 * @param {string} ccName - The name of the community center
 */
function selectCC(ccId, ccName) {
  selectedCCId = ccId;

  if (selectedCCTextElement) {
    selectedCCTextElement.textContent = ccName;
  }

  closeDropdown();
  loadEventsForCC(ccId);

  // Show events controls
  if (eventsControlsElement) {
    eventsControlsElement.style.display = "flex";
  }
}

/**
 * Handle CC search input
 */
function handleCCSearch() {
  const searchInput = /** @type {HTMLInputElement} */ (
    document.getElementById("ccSearchInput")
  );
  if (!searchInput) return;

  ccSearchTerm = searchInput.value.trim();
  applyFiltersAndRenderCCs();
}

/**
 * Handle CC sort change
 */
function handleCCSort() {
  const sortSelect = /** @type {HTMLSelectElement} */ (
    document.getElementById("ccSortSelect")
  );
  if (!sortSelect) return;

  ccSortMode = sortSelect.value;

  if (ccSortMode === "distance") {
    if (userLocation) {
      // Reload with distance sorting
      loadCCs();
    } else {
      alert(
        "Location access is required for distance sorting. Please enable location access and try again."
      );
      sortSelect.value = "alphabetical";
      ccSortMode = "alphabetical";
      applyFiltersAndRenderCCs();
    }
  } else {
    applyFiltersAndRenderCCs();
  }
}

/**
 * Load events for a specific community center
 * @param {number} ccId - The ID of the community center
 */
async function loadEventsForCC(ccId) {
  try {
    showLoading();
    hideError();

    // TODO: Replace with actual events API call when available
    // const data = await apiCall(`/api/cc/${ccId}/events`);
    // currentEvents = data.events || [];

    // For now, show placeholder
    currentEvents = [];

    applyFiltersAndRenderEvents();
    hideLoading();
  } catch (error) {
    console.error("Error loading events:", error);
    showError(/** @type {Error} */ (error).message);
    hideLoading();
  }
}

/**
 * Handle event search input
 */
function handleEventSearch() {
  const searchInput = /** @type {HTMLInputElement} */ (
    document.getElementById("eventSearchInput")
  );
  if (!searchInput) return;

  eventSearchTerm = searchInput.value.toLowerCase().trim();
  applyFiltersAndRenderEvents();
}

/**
 * Apply search and sort filters to events and render them
 */
function applyFiltersAndRenderEvents() {
  if (!selectedCCId) {
    hideLoading();
    renderPlaceholder();
    return;
  }

  let filteredEvents = [...currentEvents];

  // Apply search filter
  if (eventSearchTerm) {
    filteredEvents = filteredEvents.filter(
      (event) =>
        event.name?.toLowerCase().includes(eventSearchTerm) ||
        event.description?.toLowerCase().includes(eventSearchTerm)
    );
  }

  renderEvents(filteredEvents);
}

/**
 * Render events list
 * @param {Array<any>} events - Array of events
 */
function renderEvents(events) {
  if (!eventsListElement) return;

  if (!events || events.length === 0) {
    const selectedCC = allCCs.find((cc) => cc.id === selectedCCId);
    const ccName = selectedCC ? selectedCC.name : "this community center";

    const emptyMessage = eventSearchTerm
      ? `No events found matching "${eventSearchTerm}". Try a different search term.`
      : `No events are currently available for ${ccName}.`;

    eventsListElement.innerHTML = `
      <div class="empty-state">
        <h3>No Events Found</h3>
        <p>${emptyMessage}</p>
        ${
          eventSearchTerm
            ? '<button class="clear-search-btn" onclick="clearEventSearch()">Clear Search</button>'
            : ""
        }
      </div>
    `;
    return;
  }

  // TODO: Render actual events when available
  // For now, just show empty state
  const selectedCC = allCCs.find((cc) => cc.id === selectedCCId);
  const ccName = selectedCC ? selectedCC.name : "this community center";

  eventsListElement.innerHTML = `
    <div class="empty-state">
      <h3>No Events Found</h3>
      <p>No events are currently available for ${ccName}.</p>
    </div>
  `;
}

/**
 * Render placeholder when no CC is selected
 */
function renderPlaceholder() {
  if (!eventsListElement) return;

  eventsListElement.innerHTML = `
    <div class="placeholder">
      <h3>Select a Community Center</h3>
      <p>Choose a community center from the dropdown above to view its events.</p>
    </div>
  `;
}

/**
 * Clear event search
 */
function clearEventSearch() {
  const searchInput = /** @type {HTMLInputElement} */ (
    document.getElementById("eventSearchInput")
  );
  if (searchInput) {
    searchInput.value = "";
  }
  eventSearchTerm = "";
  applyFiltersAndRenderEvents();
}

/**
 * Show loading state in dropdown
 */
function showDropdownLoading() {
  if (dropdownOptionsElement) {
    dropdownOptionsElement.innerHTML =
      '<div class="dropdown-option loading-option">Loading...</div>';
  }
}

/**
 * Show error state in dropdown
 * @param {string} message - Error message to display
 */
function showDropdownError(message) {
  if (dropdownOptionsElement) {
    dropdownOptionsElement.innerHTML = `<div class="dropdown-option error-option">Error: ${escapeHtml(
      message
    )}</div>`;
  }
}

/**
 * Get user's current location
 */
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
      }
    );
  }
}

/**
 * Show loading state
 */
function showLoading() {
  // Only show loading if a CC is selected
  if (selectedCCId && loadingElement) {
    loadingElement.style.display = "block";
  }
  if (eventsListElement) eventsListElement.style.display = "none";
}

/**
 * Hide loading state
 */
function hideLoading() {
  if (loadingElement) loadingElement.style.display = "none";
  if (eventsListElement) eventsListElement.style.display = "block";
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
window.toggleDropdown = toggleDropdown;
window.selectCC = selectCC;
window.handleCCSearch = handleCCSearch;
window.handleCCSort = handleCCSort;
window.handleEventSearch = handleEventSearch;
window.clearEventSearch = clearEventSearch;
