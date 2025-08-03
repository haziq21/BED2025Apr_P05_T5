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
    console.error("No JWT token found.");
    // Redirect to login if no token
    window.location.href = "/login";
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
      endpoint += `?lat=${userLocation.lat}&lon=${userLocation.lon}&indicateAdmin=true`;
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
      )}', ${cc.isAdmin})">

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
 * @param {boolean} isAdmin - Whether the user is an admin of this CC
 */
function selectCC(ccId, ccName, isAdmin) {
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

  // Show or hide admin controls
  const adminControlsElement = document.getElementById("adminControls");
  if (adminControlsElement) {
    adminControlsElement.style.display = isAdmin ? "block" : "none";
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

    const data = await apiCall(`/api/events/cc/${ccId}`);
    currentEvents = data || [];

    // Fetch events the user is registered for
    const registeredEvents = await fetchUserRegisteredEvents();

    // Add a flag to each event indicating if the user is registered
    const eventsWithRegistrationStatus = currentEvents.map((event) => ({
      eventId: event.eventId,
      name: event.name,
      description: event.description,
      location: event.location, // Ensure location is included
      StartDateTime: event.StartDateTime,
      EndDateTime: event.EndDateTime,
      isRegistered: registeredEvents.some(
        (regEvent) => regEvent.eventId === event.eventId
      ), // Check against event.eventId
    }));

    renderEvents(eventsWithRegistrationStatus);
    hideLoading();
  } catch (error) {
    console.error("Error loading events:", error);
    showError(/** @type {Error} */ (error).message);
    hideLoading();
  }
}

/**
 * Fetch and display mutual signups for an event
 * @param {number} eventId - The ID of the event
 * @param {HTMLElement} mutualSignupsElement - The element to display the mutual signups in
 */
async function fetchAndDisplayMutualSignups(eventId, mutualSignupsElement) {
  if (!mutualSignupsElement) {
    console.error("Mutual signups element not found.");
    return;
  }

  // Initial text while loading
  mutualSignupsElement.textContent = "Loading mutual signups...";
  // Set data attribute for the event ID - Ensure this is correct
  mutualSignupsElement.dataset.eventId = eventId;

  try {
    const mutualSignups = await apiCall(`/api/events/${eventId}/mutual`);
    if (mutualSignups && mutualSignups.length > 0) {
      mutualSignupsElement.innerHTML = `<strong>Mutual friends attending:</strong> ${mutualSignups.length}`; // You can customize this message
    } else {
      mutualSignupsElement.innerHTML = "No mutual friends attending.";
    }
  } catch (error) {
    console.error(`Error fetching mutual signups for event ${eventId}:`, error);
    mutualSignupsElement.innerHTML = "Error loading mutual signups.";
  }
}

/**
 * Fetch events the current user is registered for.
 * @returns {Promise<Array<{eventId: number}>>} An array of registered event objects with eventId.
 */
async function fetchUserRegisteredEvents() {
  return apiCall("/api/events/registered");
}

/**
 * Render events list
 * @param {Array<{eventId: number, name: string, description: string, location: string, StartDateTime: Date, EndDateTime: Date, isRegistered: boolean}>} events - Array of events with registration status

 */
function renderEvents(events) {
  if (!eventsListElement) return;

  if (!events || events.length === 0) {
    const selectedCC = allCCs.find((cc) => cc.id === selectedCCId);
    const ccName = selectedCC ? selectedCC.name : "this community center";

    const emptyMessage = `No events are currently available for ${ccName}.`;

    eventsListElement.innerHTML = `
      <div class="empty-state">
        <h3>No Events Found</h3>
        <p>${emptyMessage}</p>
      </div>
    `;
    return;
  }

  // Clear previous events
  eventsListElement.innerHTML = "";

  // Render actual events
  events.forEach((event) => {
    // Create the main event div
    const eventElement = document.createElement("div");
    eventElement.classList.add("event"); // Use the 'event' class for styling as requested earlier

    // Create a div for event details
    const eventDetailsElement = document.createElement("div");
    eventDetailsElement.classList.add("event-details"); // Optional: for specific styling of details
    eventDetailsElement.innerHTML = `
      <h3>${escapeHtml(event.name)}</h3>
      <p><strong>Date:</strong> ${
        event.StartDateTime
          ? new Date(event.StartDateTime).toLocaleDateString()
          : "N/A"
      }</p>
      <p><strong>Time:</strong> ${
        event.StartDateTime && event.EndDateTime
          ? `${new Date(event.StartDateTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })} - ${new Date(event.EndDateTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}`
          : "N/A"
      }</p>
      <p><strong>Location:</strong> ${escapeHtml(event.location || "N/A")}</p>
      <p><strong>Description:</strong> ${escapeHtml(
        event.description || "No description provided."
      )}</p>
    `;

    // Create a div for mutual signups
    const mutualSignupsElement = document.createElement("div");
    mutualSignupsElement.classList.add("mutual-signups");
    mutualSignupsElement.dataset.eventId = event.eventId; // Set data attribute for fetching

    // Create the register/unregister button
    const registerButton = document.createElement("button");
    registerButton.classList.add("register-toggle-btn");
    registerButton.dataset.eventId = event.eventId; // Set data attribute for event ID

    // Set initial state based on isRegistered flag
    if (event.isRegistered) {
      registerButton.textContent = "Unregister";
      registerButton.classList.add("registered");
    } else {
      registerButton.textContent = "Register";
    }

    // Append the elements to the main event div
    eventElement.appendChild(eventDetailsElement);
    eventElement.appendChild(mutualSignupsElement);
    eventElement.appendChild(registerButton);

    // Append the main event div to the events list
    eventsListElement.appendChild(eventElement);

    // Call the function to fetch and display mutual signups
    if (event.eventId) {
      fetchAndDisplayMutualSignups(event.eventId, mutualSignupsElement);
    }
  });

  // After all events are rendered, set up button listeners
  setupRegistrationButtons();
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
 * Setup event listeners for registration buttons
 */
function setupRegistrationButtons() {
  const buttons = eventsListElement?.querySelectorAll(".register-toggle-btn");
  if (!buttons) return;

  buttons.forEach((button) => {
    const eventId = button.dataset.eventId;
    if (!eventId) return;

    button.addEventListener("click", () => {
      if (button.textContent === "Register") {
        registerForEvent(eventId, button);
      } else {
        unregisterFromEvent(eventId, button);
      }
    });
  });
}

/**
 * Register for an event
 * @param {string} eventId - The ID of the event
 * @param {HTMLButtonElement} buttonElement - The button element
 */
async function registerForEvent(eventId, buttonElement) {
  try {
    await apiCall(`/api/events/${eventId}/register`, { method: "POST" });
    buttonElement.textContent = "Unregister";
    buttonElement.classList.add("registered"); // Add a class for styling
  } catch (error) {
    console.error(`Error registering for event ${eventId}:`, error);
    alert("Failed to register for event."); // Provide user feedback
  }
}

/**
 * Unregister from an event
 * @param {string} eventId - The ID of the event
 * @param {HTMLButtonElement} buttonElement - The button element
 */
async function unregisterFromEvent(eventId, buttonElement) {
  try {
    await apiCall(`/api/events/${eventId}/unregister`, { method: "DELETE" });
    buttonElement.textContent = "Register";
    buttonElement.classList.remove("registered"); // Remove the class
  } catch (error) {
    console.error(`Error unregistering from event ${eventId}:`, error);
    alert("Failed to unregister from event."); // Provide user feedback
  }
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
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Add event listeners to admin buttons
document.addEventListener("DOMContentLoaded", () => {
  const createButton = document.getElementById("createEventButton");
  const updateButton = document.getElementById("updateEventButton");
  const deleteButton = document.getElementById("deleteEventButton");

  if (createButton) {
    createButton.addEventListener("click", createEvent);
  }
  // Note: Update and Delete buttons will likely require selecting an event first
  // Their event listeners might be added dynamically when events are rendered,
  // or the placeholder functions might handle event selection logic.
});

// Placeholder functions for admin actions
async function createEvent() {
  console.log("Create Event clicked");
  // Implement event creation logic here
  // This will involve getting input from the user (e.g., through a modal or form)
  // and calling the API endpoint to create the event.
}

async function updateEvent() {
  console.log("Update Event clicked");
  // Implement event update logic here
  // This will involve selecting an event to update, getting new details,
  // and calling the API endpoint to update the event.
}

async function deleteEvent() {
  console.log("Delete Event clicked");
  // Implement event deletion logic here
  // This will involve selecting an event to delete and calling the API endpoint.
}

// Export functions for global access
window.toggleDropdown = toggleDropdown;
window.selectCC = selectCC;
window.handleCCSearch = handleCCSearch;
window.handleCCSort = handleCCSort;
