let isdeleting = false; // Flag to prevent multiple deletions

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
const createEventModal = document.getElementById("createEventModal");
const closeModalButton = createEventModal?.querySelector(".close");
const createEventForm = createEventModal?.querySelector("form");

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
let selectedEventForAdmin = null; // Global variable to store the selected event for admin actions
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
 * Open the create event modal
 */
function openCreateEventModal() {
  if (createEventModal) {
    createEventModal.style.display = "block";
  }
}

/**
 * Close the create event modal and reset the form
 */
function closeCreateEventModal() {
  if (createEventModal) {
    createEventModal.style.display = "none";
  }
  if (createEventForm) {
    const modalTitle = createEventModal.querySelector("h2");
    const submitButton = createEventForm.querySelector('button[type="submit"]');
    createEventForm.reset();
    createEventForm.dataset.eventId = ""; // Clear the stored event ID
    if (modalTitle) modalTitle.textContent = "Create New Event"; // Reset title
    if (submitButton) submitButton.textContent = "Create"; // Reset button text
  }
}
/**
 * Load community centers from API
 */
async function loadCCs() {
  try {
    showDropdownLoading();

    let endpoint = "/api/cc?indicateAdmin=true";
    if (userLocation && ccSortMode === "distance") {
      endpoint += `&lat=${userLocation.lat}&lon=${userLocation.lon}`;
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

  // Hide update/delete buttons and clear selected event when CC changes
  selectedEventForAdmin = null;
  const updateButton = document.getElementById("updateEventButton");
  const deleteButton = document.getElementById("deleteEventButton");
  if (updateButton) updateButton.style.display = "none";
  if (deleteButton) deleteButton.style.display = "none";

  // Remove \'selected\' class from all events
  const eventElements = eventsListElement.querySelectorAll(".event");
  eventElements.forEach((eventElement) => {
    eventElement.classList.remove("selected");
  });
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
  const adminControlsElement = document.getElementById("adminControls");

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

    // Add admin controls (Edit/Delete buttons) if admin
    if (
      adminControlsElement &&
      adminControlsElement.style.display === "block"
    ) {
      const adminActionsDiv = document.createElement("div");
      adminActionsDiv.classList.add("admin-event-actions");

      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.classList.add("admin-event-button", "edit-btn"); // Use edit-btn class for styling
      editButton.dataset.eventId = event.eventId.toString();
      editButton.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent event selection when clicking button
        // Find the full event object from the currentEvents array
        const eventToEdit = currentEvents.find(
          (e) => e.eventId === event.eventId
        );
        if (eventToEdit) {
          selectedEventForAdmin = eventToEdit; // Set selected event
          openUpdateEventModal(selectedEventForAdmin); // Open modal
        }
      });

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.classList.add("admin-event-button", "delete-btn"); // Use delete-btn class for styling
      deleteButton.dataset.eventId = event.eventId.toString();
      deleteButton.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent event selection when clicking button
        selectedEventForAdmin = event; // Set the selected event for deletion
        deleteEvent(); // Call the delete event function
      });

      adminActionsDiv.appendChild(editButton);
      adminActionsDiv.appendChild(deleteButton);
      eventElement.appendChild(adminActionsDiv);
    }

    // Append the main event div to the events list
    eventsListElement.appendChild(eventElement);

    // Call the function to fetch and display mutual signups
    if (event.eventId) {
      fetchAndDisplayMutualSignups(event.eventId, mutualSignupsElement);
    }
  });

  // Add click listeners to event elements for selection (if admin controls are visible)
  if (adminControlsElement && adminControlsElement.style.display === "block") {
    const eventElements = eventsListElement.querySelectorAll(".event");
    eventElements.forEach((eventElement) => {
      eventElement.addEventListener("click", () => {
        // Remove \'selected\' class from previous selected event
        const previouslySelected =
          eventsListElement.querySelector(".event.selected");
        if (previouslySelected) {
          previouslySelected.classList.remove("selected");
        }
        // Add \'selected\' class to the clicked event
        eventElement.classList.add("selected");

        // Find the full event object and set selectedEventForAdmin
        const clickedEventId = parseInt(
          eventElement.querySelector(".edit-btn")?.dataset.eventId || "0"
        );
        selectedEventForAdmin =
          currentEvents.find((e) => e.eventId === clickedEventId) || null;

        // Show update/delete buttons when an event is selected
        showAdminActionButtons();
      });
    });
  }

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

/**
 * Show update and delete buttons in admin controls
 */
function showAdminActionButtons() {
  const updateButton = document.getElementById("updateEventButton");
  const deleteButton = document.getElementById("deleteEventButton");

  if (updateButton) updateButton.style.display = "inline-block";
  if (deleteButton) deleteButton.style.display = "inline-block";
}

// Add event listeners to admin buttons
document.addEventListener("DOMContentLoaded", () => {
  const createButton = document.getElementById("createEventButton");
  const updateButton = document.getElementById("updateEventButton");
  const deleteButton = document.getElementById("deleteEventButton");
  const adminControlsElement = document.getElementById("adminControls");

  if (createButton) {
    createButton.addEventListener("click", createEvent);
  }

  // Event listener for the modal close button
  if (closeModalButton) {
    closeModalButton.addEventListener("click", closeCreateEventModal);
  }

  // Event listener to close modal when clicking outside content
  if (createEventModal) {
    createEventModal.addEventListener("click", (e) => {
      if (e.target === createEventModal) {
        closeCreateEventModal();
      }
    });
  }

  // Event listener for the create event form submission
  if (createEventForm) {
    createEventForm.addEventListener("submit", async (e) => {
      e.preventDefault(); // Prevent default form submission

      const name = document.getElementById("eventName").value.trim();
      const description = document
        .getElementById("eventDescription")
        .value.trim();
      const location = document.getElementById("eventLocation").value.trim();
      const startDateTime = document.getElementById("eventStartDateTime").value;
      const endDateTime = document.getElementById("eventEndDateTime").value;

      // Determine if we are creating or updating
      const eventId = e.target.dataset.eventId; // Get eventId from form\'s data attribute
      const isUpdate = !!eventId; // If eventId exists, it\'s an update
      // Basic validation
      if (
        !name ||
        !description ||
        !location ||
        !startDateTime ||
        !endDateTime
      ) {
        alert("Please fill in all fields.");
        return;
      }
      try {
        const eventData = {
          name,
          description,
          location,
          startDate: new Date(startDateTime).toISOString(), // Ensure ISO format
          endDate: new Date(endDateTime).toISOString(), // Ensure ISO format
        };
        let endpoint = "/api/events/create";
        let method = "POST";

        if (isUpdate) {
          endpoint = `/api/events/${eventId}`;
          method = "PUT";
          // CCId is not needed for update, as it\'s included in the path
        } else {
          eventData.CCId = selectedCCId; // Include CCId only for creation
        }
        // Corrected API call for both create and update
        await apiCall(endpoint, {
          method: method,
          body: JSON.stringify(eventData),
        });

        alert(`Event ${isUpdate ? "updated" : "created"} successfully!`);
        closeCreateEventModal();
        // Clear selected event and hide update/delete buttons after update/create
        selectedEventForAdmin = null;
        const updateButton = document.getElementById("updateEventButton");
        const deleteButton = document.getElementById("deleteEventButton");
        if (updateButton) updateButton.style.display = "none";
        if (deleteButton) deleteButton.style.display = "none";

        if (selectedCCId !== null) {
          // Ensure a CC is selected before loading events
          loadEventsForCC(selectedCCId);
        }
      } catch (error) {
        console.error(
          `Error ${isUpdate ? "updating" : "creating"} event:`,
          error
        );
        alert(
          `Failed to ${isUpdate ? "update" : "create"} event: ` + error.message
        );
      }
    });
  }

  // Add event listener for Update button
  if (updateButton) {
    updateButton.addEventListener("click", updateEvent);
    // Hide initially
    updateButton.style.display = "none";
  }

  // Add event listener for Delete button
  if (deleteButton) {
    deleteButton.addEventListener("click", deleteEvent);
    // Hide initially
    deleteButton.style.display = "none";
  }

  // Note: Update and Delete buttons will likely require selecting an event first
  // Their event listeners might be added dynamically when events are rendered,
  // or the placeholder functions might handle event selection logic.
});

// Add this function to open the modal for updating
function openUpdateEventModal(event) {
  const modal = document.getElementById("createEventModal"); // Reuse the create event modal
  const form = document.getElementById("createEventForm");
  const modalTitle = modal?.querySelector("h2");
  const submitButton = form?.querySelector('button[type="submit"]');

  // Set modal title and button text for updating
  if (modalTitle) modalTitle.textContent = "Update Event";
  if (submitButton) submitButton.textContent = "Update";

  // Populate the form with existing event data
  if (form) {
    form.querySelector("#eventName").value = event.name;
    form.querySelector("#eventDescription").value = event.description;
    form.querySelector("#eventLocation").value = event.location;

    // Format dates for datetime-local input (YYYY-MM-DDTHH:mm)
    const startDate = new Date(event.StartDateTime);
    const endDate = new Date(event.EndDateTime);
    const formatDateTimeLocal = (date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    form.querySelector("#eventStartDateTime").value =
      formatDateTimeLocal(startDate);
    form.querySelector("#eventEndDateTime").value =
      formatDateTimeLocal(endDate);

    // Store the event ID on the form for easy access during submission
    form.dataset.eventId = event.eventId;
  }
  openCreateEventModal(); // Show the modal using the existing function
}
// Placeholder functions for admin actions
async function createEvent() {
  console.log("Create Event clicked");
  openCreateEventModal(); // Open the modal when the create button is clicked
}
async function updateEvent() {
  console.log("Update Event clicked");
  if (!selectedEventForAdmin) {
    alert("Please select an event to update.");
    return;
  }
  console.log("Updating event:", selectedEventForAdmin);
  openUpdateEventModal(selectedEventForAdmin); // Open the modal with pre-filled data
}
async function deleteEvent() {
  if (isdeleting) {
    return;
  }
  if (!selectedEventForAdmin) {
    alert("Please select an event to delete.");
    return;
  }

  if (
    !confirm(
      `Are you sure you want to delete the event "${selectedEventForAdmin.name}"?`
    )
  ) {
    return; // User cancelled the deletion
  }

  try {
    isdeleting = true; // Set flag to prevent multiple deletions
    // Make the DELETE API call
    await apiCall(`/api/events/${selectedEventForAdmin.eventId}`, {
      method: "DELETE",
    });

    // Handle successful deletion
    alert("Event deleted successfully!");
    selectedEventForAdmin = null; // Clear the selected event
    // Hide the update and delete buttons
    const updateButton = document.getElementById("updateEventButton");
    const deleteButton = document.getElementById("deleteEventButton");
    if (updateButton) updateButton.style.display = "none";
    if (deleteButton) deleteButton.style.display = "none";

    // Refresh the event list
    if (selectedCCId !== null) {
      loadEventsForCC(selectedCCId);
    }
  } catch (error) {
    console.error("Error deleting event:", error);
    alert("Failed to delete event: " + error.message);
  } finally {
    isdeleting = false; // Reset the flag after deletion attempt
  }
}

// Export functions for global access
window.toggleDropdown = toggleDropdown;
window.selectCC = selectCC;
window.handleCCSearch = handleCCSearch;
window.handleCCSort = handleCCSort;
