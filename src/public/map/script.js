/**
 * @fileoverview Google Maps integration for location display
 */

// Global declarations for TypeScript linting
/** @type {any} */
// @ts-ignore
const google = window.google;

// Initialize and add the map
/** @type {any} */
let map;

/** @type {any} */
let locationUpdateInterval = null;

/** @type {{lat: number, lng: number}|null} */
let currentUserLocation = null;

/** @type {any[]} */
let serviceMarkers = [];

/** @type {any} */
let userLocationMarker = null;

/** @type {any[]} */
let sharedLocationMarkers = [];

/** @type {any} */
let AdvancedMarkerElementClass = null;

/**
 * Creates a custom label element
 * @param {string} text - Label text
 * @returns {HTMLElement} - Label element
 */
function createCustomLabel(text) {
  const label = document.createElement("div");
  label.style.position = "absolute";
  label.style.bottom = "100%";
  label.style.left = "50%";
  label.style.transform = "translateX(-50%) translateY(-10px)";
  label.style.backgroundColor = "#ffffff";
  label.style.color = "#333333";
  label.style.padding = "6px 10px";
  label.style.borderRadius = "4px";
  label.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
  label.style.fontSize = "12px";
  label.style.fontWeight = "500";
  label.style.whiteSpace = "nowrap";
  label.style.zIndex = "99999";
  label.style.pointerEvents = "none";
  label.style.display = "none";
  label.style.minWidth = "max-content";
  label.textContent = text;
  return label;
}

/**
 * Creates a blue dot element for user location marker
 * @returns {HTMLElement} - Blue dot element with label
 */
function createBlueDotElement() {
  const container = document.createElement("div");
  container.style.position = "relative";
  container.style.zIndex = "1000";

  const blueDot = document.createElement("div");
  blueDot.style.width = "20px";
  blueDot.style.height = "20px";
  blueDot.style.backgroundColor = "#4285F4";
  blueDot.style.borderRadius = "50%";
  blueDot.style.border = "4px solid #ffffff";
  blueDot.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
  blueDot.style.cursor = "pointer";

  const label = createCustomLabel("Your Location");

  container.appendChild(blueDot);
  container.appendChild(label);

  // Show/hide label on hover
  container.addEventListener("mouseenter", () => {
    label.style.display = "block";
  });

  container.addEventListener("mouseleave", () => {
    label.style.display = "none";
  });

  return container;
}

/**
 * Creates a green dot element for shared location markers
 * @param {string} name - Name of the person sharing location
 * @returns {HTMLElement} - Green dot element with label
 */
function createGreenDotElement(name = "Shared Location") {
  const container = document.createElement("div");
  container.style.position = "relative";
  container.style.zIndex = "1000";

  const greenDot = document.createElement("div");
  greenDot.style.width = "20px";
  greenDot.style.height = "20px";
  greenDot.style.backgroundColor = "#34A853";
  greenDot.style.borderRadius = "50%";
  greenDot.style.border = "4px solid #ffffff";
  greenDot.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
  greenDot.style.cursor = "pointer";

  const label = createCustomLabel(`${name}'s Location`);

  container.appendChild(greenDot);
  container.appendChild(label);

  // Show/hide label on hover
  container.addEventListener("mouseenter", () => {
    label.style.display = "block";
  });

  container.addEventListener("mouseleave", () => {
    label.style.display = "none";
  });

  return container;
}

/**
 * Fetches local services from the server
 * @returns {Promise<Array<{id: number, name: string, type: string, location: {lat: number, lon: number}}>|null>}
 */
async function fetchLocalServices() {
  try {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    /** @type {Record<string, string>} */
    const headers = {
      "Content-Type": "application/json",
    };

    // Add authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch("/api/map/services", {
      method: "GET",
      headers: headers,
    });

    if (response.ok) {
      const services = await response.json();
      console.log(
        "Local services fetched successfully:",
        services.length,
        "services"
      );
      return services;
    } else {
      console.error(
        "Failed to fetch local services:",
        response.status,
        response.statusText
      );
      return null;
    }
  } catch (error) {
    console.error("Error fetching local services:", error);
    return null;
  }
}

/**
 * Creates a container with default pin styling and custom label
 * @param {string} name - Service name
 * @param {string} type - Service type
 * @returns {HTMLElement} - Container with default pin and label
 */
function createServiceMarkerWithLabel(name, type) {
  const container = document.createElement("div");
  container.style.position = "relative";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.alignItems = "center";
  container.style.zIndex = "1000";

  // Use the default Google Maps pin icon
  const pin = document.createElement("div");
  pin.innerHTML = `
    <svg width="27" height="43" viewBox="0 0 27 43" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" fill-rule="evenodd">
        <path d="M13.5 0C6.044 0 0 6.044 0 13.5 0 23.975 13.5 43 13.5 43S27 23.975 27 13.5C27 6.044 20.956 0 13.5 0z" fill="#EA4335"/>
        <circle cx="13.5" cy="13.5" r="4.5" fill="#fff"/>
      </g>
    </svg>
  `;
  pin.style.cursor = "pointer";

  const label = createCustomLabel(`${name} (${type})`);

  container.appendChild(pin);
  container.appendChild(label);

  // Show/hide label on hover
  container.addEventListener("mouseenter", () => {
    label.style.display = "block";
  });

  container.addEventListener("mouseleave", () => {
    label.style.display = "none";
  });

  return container;
}

/**
 * Displays local services as markers on the map
 * @param {any} AdvancedMarkerElement - The Google Maps AdvancedMarkerElement class
 */
async function displayLocalServices(AdvancedMarkerElement) {
  const services = await fetchLocalServices();

  if (!services || services.length === 0) {
    console.log("No local services to display");
    return;
  }

  // Clear existing service markers
  serviceMarkers.forEach((marker) => {
    marker.map = null;
  });
  serviceMarkers = [];

  // Create markers for each service
  services.forEach((service) => {
    const marker = new AdvancedMarkerElement({
      map: map,
      position: { lat: service.location.lat, lng: service.location.lon },
      content: createServiceMarkerWithLabel(service.name, service.type),
    });

    serviceMarkers.push(marker);
  });

  console.log(`Displayed ${serviceMarkers.length} local service markers`);
}

/**
 * Shows all service markers on the map
 */
function showServiceMarkers() {
  serviceMarkers.forEach((marker) => {
    marker.map = map;
  });
}

/**
 * Hides all service markers from the map
 */
function hideServiceMarkers() {
  serviceMarkers.forEach((marker) => {
    marker.map = null;
  });
}

/**
 * Toggles the visibility of service markers based on checkbox state
 */
function toggleServiceMarkers() {
  /** @type {HTMLInputElement|null} */
  const checkbox = /** @type {HTMLInputElement|null} */ (
    document.getElementById("toggleServices")
  );
  if (checkbox && checkbox.checked) {
    showServiceMarkers();
  } else {
    hideServiceMarkers();
  }
}

/**
 * Shows all shared location markers on the map
 */
function showSharedLocationMarkers() {
  sharedLocationMarkers.forEach((marker) => {
    marker.map = map;
  });
}

/**
 * Hides all shared location markers from the map
 */
function hideSharedLocationMarkers() {
  sharedLocationMarkers.forEach((marker) => {
    marker.map = null;
  });
}

/**
 * Toggles the visibility of shared location markers based on checkbox state
 */
function toggleSharedLocationMarkers() {
  /** @type {HTMLInputElement|null} */
  const checkbox = /** @type {HTMLInputElement|null} */ (
    document.getElementById("toggleSharedLocations")
  );
  if (checkbox && checkbox.checked) {
    showSharedLocationMarkers();
  } else {
    hideSharedLocationMarkers();
  }
}

/**
 * Fetches locations shared with the current user
 * @returns {Promise<Array<{userId: number, name: string, profilePhotoUrl: string, location: {lat: number, lon: number}, time: Date}>|null>}
 */
async function fetchSharedLocations() {
  try {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    /** @type {Record<string, string>} */
    const headers = {
      "Content-Type": "application/json",
    };

    // Add authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch("/api/map/shared-with-me", {
      method: "GET",
      headers: headers,
    });

    if (response.ok) {
      const locations = await response.json();
      console.log(
        "Shared locations fetched successfully:",
        locations.length,
        "locations"
      );
      return locations;
    } else {
      console.error(
        "Failed to fetch shared locations:",
        response.status,
        response.statusText
      );
      return null;
    }
  } catch (error) {
    console.error("Error fetching shared locations:", error);
    return null;
  }
}

/**
 * Displays shared locations as green dots on the map
 * @param {any} AdvancedMarkerElement - The Google Maps AdvancedMarkerElement class
 */
async function displaySharedLocations(AdvancedMarkerElement) {
  const locations = await fetchSharedLocations();

  // Clear existing shared location markers
  sharedLocationMarkers.forEach((marker) => {
    marker.map = null;
  });
  sharedLocationMarkers = [];

  if (!locations || locations.length === 0) {
    console.log("No shared locations to display");
    return;
  }

  // Create markers for each shared location
  locations.forEach((location) => {
    const marker = new AdvancedMarkerElement({
      map: map,
      position: { lat: location.location.lat, lng: location.location.lon },
      content: createGreenDotElement(location.name),
    });

    sharedLocationMarkers.push(marker);
  });

  console.log(
    `Displayed ${sharedLocationMarkers.length} shared location markers`
  );
}

/**
 * Fetches users who have access to the current user's location
 * @returns {Promise<Array<{userId: number, name: string, profilePhotoUrl: string}>|null>}
 */
async function fetchViewers() {
  try {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    /** @type {Record<string, string>} */
    const headers = {
      "Content-Type": "application/json",
    };

    // Add authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch("/api/map/shared-by-me", {
      method: "GET",
      headers: headers,
    });

    if (response.ok) {
      const viewers = await response.json();
      console.log("Viewers fetched successfully:", viewers.length, "viewers");
      return viewers;
    } else {
      console.error(
        "Failed to fetch viewers:",
        response.status,
        response.statusText
      );
      return null;
    }
  } catch (error) {
    console.error("Error fetching viewers:", error);
    return null;
  }
}

/**
 * Displays the list of viewers in the sidebar
 */
async function displayViewers() {
  const viewersList = document.getElementById("viewersList");
  if (!viewersList) return;

  // Show loading state
  viewersList.innerHTML = '<div class="loading">Loading...</div>';

  const viewers = await fetchViewers();

  if (!viewers) {
    viewersList.innerHTML = '<div class="loading">Failed to load viewers</div>';
    return;
  }

  if (viewers.length === 0) {
    viewersList.innerHTML =
      '<div class="no-viewers">No users have access to your location</div>';
    return;
  }

  // Create viewer items
  viewersList.innerHTML = viewers
    .map(
      (viewer) => `
    <div class="viewer-item">
      <div class="viewer-info">
        <div class="viewer-name">${viewer.name}</div>
      </div>
      <button class="revoke-btn" data-user-id="${viewer.userId}" onclick="revokeAccess(${viewer.userId})">
        Revoke
      </button>
    </div>
  `
    )
    .join("");
}

/**
 * Revokes access for a user to view the current user's location
 * @param {number} userId - ID of the user to revoke access from
 */
async function revokeAccess(userId) {
  try {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    /** @type {Record<string, string>} */
    const headers = {
      "Content-Type": "application/json",
    };

    // Add authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Disable the button to prevent multiple clicks
    /** @type {HTMLButtonElement|null} */
    const button = /** @type {HTMLButtonElement|null} */ (
      document.querySelector(`[data-user-id="${userId}"]`)
    );
    if (button) {
      button.disabled = true;
      button.textContent = "Revoking...";
    }

    const response = await fetch(`/api/map/shared-by-me/${userId}`, {
      method: "DELETE",
      headers: headers,
    });

    if (response.ok) {
      console.log(`Access revoked for user ID: ${userId}`);
      // Refresh the viewers list to show updated state
      await displayViewers();
    } else {
      console.error(
        "Failed to revoke access:",
        response.status,
        response.statusText
      );

      // Re-enable button on error
      if (button) {
        button.disabled = false;
        button.textContent = "Revoke";
      }

      // Show error message to user
      alert("Failed to revoke access. Please try again.");
    }
  } catch (error) {
    console.error("Error revoking access:", error);

    // Re-enable button on error
    /** @type {HTMLButtonElement|null} */
    const button = /** @type {HTMLButtonElement|null} */ (
      document.querySelector(`[data-user-id="${userId}"]`)
    );
    if (button) {
      button.disabled = false;
      button.textContent = "Revoke";
    }

    // Show error message to user
    alert("An error occurred while revoking access. Please try again.");
  }
}

/**
 * Shares the current user's location with another user via phone number
 */
async function shareLocation() {
  try {
    // Get phone number from input
    /** @type {HTMLInputElement|null} */
    const phoneInput = /** @type {HTMLInputElement|null} */ (
      document.getElementById("phoneNumber")
    );
    if (!phoneInput) return;

    const phoneNumber = phoneInput.value.trim();
    if (!phoneNumber) {
      alert("Please enter a phone number");
      return;
    }

    // Basic phone number validation
    if (!/^\+?[\d\s\-\(\)]+$/.test(phoneNumber)) {
      alert("Please enter a valid phone number");
      return;
    }

    // Get token from localStorage
    const token = localStorage.getItem("token");

    /** @type {Record<string, string>} */
    const headers = {
      "Content-Type": "application/json",
    };

    // Add authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Disable the button to prevent multiple clicks
    /** @type {HTMLButtonElement|null} */
    const shareBtn = /** @type {HTMLButtonElement|null} */ (
      document.getElementById("shareBtn")
    );
    if (shareBtn) {
      shareBtn.disabled = true;
      shareBtn.textContent = "Sharing...";
    }

    const response = await fetch(
      `/api/map/shared-by-me/${encodeURIComponent(phoneNumber)}`,
      {
        method: "POST",
        headers: headers,
      }
    );

    if (response.ok) {
      console.log(`Location shared with: ${phoneNumber}`);

      // Clear the input field
      phoneInput.value = "";

      // Show success message
      alert("Location share request sent successfully!");

      // Refresh the viewers list to show updated state
      await displayViewers();

      // Refresh shared locations in case the other user already shared their location
      await displaySharedLocations(AdvancedMarkerElementClass);
    } else {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || "Failed to share location";

      console.error(
        "Failed to share location:",
        response.status,
        response.statusText
      );
      alert(`Failed to share location: ${errorMessage}`);
    }
  } catch (error) {
    console.error("Error sharing location:", error);
    alert("An error occurred while sharing location. Please try again.");
  } finally {
    // Re-enable button
    /** @type {HTMLButtonElement|null} */
    const shareBtn = /** @type {HTMLButtonElement|null} */ (
      document.getElementById("shareBtn")
    );
    if (shareBtn) {
      shareBtn.disabled = false;
      shareBtn.textContent = "Share";
    }
  }
}

/**
 * Updates the user's location on the server
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<boolean>} - Success status
 */
async function updateUserLocationOnServer(lat, lon) {
  try {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    /** @type {Record<string, string>} */
    const headers = {
      "Content-Type": "application/json",
    };

    // Add authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch("/api/map/my-location", {
      method: "PUT",
      headers: headers,
      body: JSON.stringify({ lat, lon }),
    });

    if (response.ok) {
      console.log("Location updated successfully");
      return true;
    } else {
      console.error(
        "Failed to update location:",
        response.status,
        response.statusText
      );
      return false;
    }
  } catch (error) {
    console.error("Error updating location:", error);
    return false;
  }
}

/**
 * Starts periodic location updates to the server
 */
function startLocationUpdates() {
  // Clear any existing interval
  if (locationUpdateInterval) {
    clearInterval(locationUpdateInterval);
  }

  // Set up new interval to update location every 30 seconds
  locationUpdateInterval = setInterval(async () => {
    if (currentUserLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          // Update stored location
          currentUserLocation = newLocation;

          // Update user location marker position
          if (userLocationMarker) {
            userLocationMarker.position = newLocation;
          }

          // Send to server
          await updateUserLocationOnServer(newLocation.lat, newLocation.lng);
        },
        (error) => {
          console.warn(
            "Failed to get current location for update:",
            error.message
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000, // 1 minute cache for periodic updates
        }
      );
    }
  }, 30000); // 30 seconds
}

/**
 * Stops periodic location updates
 */
function stopLocationUpdates() {
  if (locationUpdateInterval) {
    clearInterval(locationUpdateInterval);
    locationUpdateInterval = null;
  }
}

/**
 * Initializes the Google Maps and centers it on user's current location
 * @async
 * @function initMap
 * @returns {Promise<void>}
 */
async function initMap() {
  // Default location (Singapore) in case geolocation fails
  /** @type {{lat: number, lng: number}} */
  const defaultPosition = { lat: 1.3521, lng: 103.8198 };

  // Request needed libraries.
  //@ts-ignore
  /** @type {any} */
  const { Map } = await google.maps.importLibrary("maps");
  //@ts-ignore
  /** @type {any} */
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  // Store the AdvancedMarkerElement class for later use
  AdvancedMarkerElementClass = AdvancedMarkerElement;

  // Initialize map with default location first
  map = new Map(document.getElementById("map"), {
    zoom: 15,
    center: defaultPosition,
    mapId: "DEMO_MAP_ID",
  });

  // Start all data fetching operations in parallel (don't await them)
  const servicesPromise = displayLocalServices(AdvancedMarkerElement);
  const sharedLocationsPromise = displaySharedLocations(AdvancedMarkerElement);
  const viewersPromise = displayViewers();

  // Set up checkbox event listeners immediately
  /** @type {HTMLInputElement|null} */
  const toggleCheckbox = /** @type {HTMLInputElement|null} */ (
    document.getElementById("toggleServices")
  );
  if (toggleCheckbox) {
    toggleCheckbox.addEventListener("change", toggleServiceMarkers);
  }

  /** @type {HTMLInputElement|null} */
  const toggleSharedCheckbox = /** @type {HTMLInputElement|null} */ (
    document.getElementById("toggleSharedLocations")
  );
  if (toggleSharedCheckbox) {
    toggleSharedCheckbox.addEventListener(
      "change",
      toggleSharedLocationMarkers
    );
  }

  /** @type {HTMLInputElement|null} */
  const phoneInput = /** @type {HTMLInputElement|null} */ (
    document.getElementById("phoneNumber")
  );
  if (phoneInput) {
    phoneInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        shareLocation();
      }
    });
  }

  // Try to get user's current location immediately (in parallel with data fetching)
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      /**
       * @param {GeolocationPosition} position - User's current position
       */
      (position) => {
        // Success callback
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // Store current location
        currentUserLocation = userLocation;

        // Center map on user's location
        map.setCenter(userLocation);
        map.setZoom(15);

        // Remove existing user location marker if it exists
        if (userLocationMarker) {
          userLocationMarker.map = null;
        }

        // Add blue dot marker at user's location
        /** @type {any} */
        userLocationMarker = new AdvancedMarkerElement({
          map: map,
          position: userLocation,
          content: createBlueDotElement(),
        });

        // Send initial location to server
        updateUserLocationOnServer(userLocation.lat, userLocation.lng);

        // Start periodic location updates
        startLocationUpdates();
      },
      /**
       * Error callback for geolocation
       * @param {GeolocationPositionError} error - Geolocation error
       */
      (error) => {
        // Error callback
        console.warn("Geolocation error:", error.message);

        // Add marker at default location since geolocation failed
        /** @type {any} */
        const marker = new AdvancedMarkerElement({
          map: map,
          position: defaultPosition,
        });
      },
      /** @type {PositionOptions} */
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000, // 10 minutes
      }
    );
  } else {
    // Geolocation not supported
    console.warn("Geolocation is not supported by this browser.");

    // Add marker at default location
    /** @type {any} */
    const marker = new AdvancedMarkerElement({
      map: map,
      position: defaultPosition,
    });
  }

  // Optionally wait for all data operations to complete (for error handling)
  try {
    await Promise.all([
      servicesPromise,
      sharedLocationsPromise,
      viewersPromise,
    ]);
    console.log("All map data loaded successfully");
  } catch (error) {
    console.warn("Some map data failed to load:", error);
    // Map still functions even if some data fails to load
  }
}

initMap();

// Clean up location updates when page is unloaded
window.addEventListener("beforeunload", () => {
  stopLocationUpdates();
});
