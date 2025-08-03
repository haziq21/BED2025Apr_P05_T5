/** @type {HTMLInputElement | null} */
const searchInput = /** @type {HTMLInputElement} */ document.getElementById(
  "friend-search-input"
);
const searchResultsContainer = document.getElementById("user-search-results");
const friendsContainer = document.getElementById("friends-container"); // Get the friends container

/** @type {string | null} currentPopupUserId - Stores the user ID of the currently displayed popup user. */
let currentPopupUserId = null;

// Get the popup content element
const popupContent = document.querySelector(".popup-content");

/**
 * Fetches the list of friends for the authenticated user.
 * @returns {Promise<Array<{id: number, name: string, bio: string, profilePhotoURL: string}>>} A promise that resolves to an array of friend objects.
 */
export async function fetchAllFriends() {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("No JWT token found.");
    window.location.href = "/login"; // Redirect to login if no token
    return [];
  }

  try {
    const response = await fetch("/api/friends", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        console.error("Authentication failed. Redirecting to login.");
        localStorage.removeItem("token"); // Clear invalid token
        window.location.href = "/login";
        return [];
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // Assuming the API now returns an array of friend objects with id, name, bio, profilePhotoURL
    return Array.isArray(data) ? data : []; // Ensure data is an array
  } catch (error) {
    console.error("Error fetching friends:", error); // Log the error
    return []; // Return empty array on error
  }
}

/**
 * @param {Array<{id: number, name: string}>} friends - An array of friend objects with id and name.
 */
function renderFriends(friends) {
  const friendsContainer = document.getElementById("friends-container");
  if (!friendsContainer) {
    console.error("Element with id 'friends-container' not found.");
    return;
  }

  // Clear existing list items
  friendsContainer.innerHTML = "";

  if (friends.length === 0) {
    friendsContainer.textContent = "No friends found.";
    return;
  }

  friends.forEach((friend) => {
    const listItem = document.createElement("li");
    listItem.textContent = friend.name; // Use friend.name
    listItem.classList.add("friend-list-item"); // Add a class for identification
    listItem.dataset.userId = String(friend.id); // Store the user ID
    listItem.style.cursor = "pointer"; // Add a pointer cursor to indicate it's clickable
    friendsContainer.appendChild(listItem);
  });
}

/**
 * Debounces a function call.
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The debounce delay in milliseconds.
 * @returns {(this: HTMLElement, ev: KeyboardEvent) => any} The debounced function.
 */
function debounce(func, delay) {
  /**
   * @type {ReturnType<typeof setTimeout> | null}
   */
  let timeoutId;
  return function (ev) {
    const context = this;
    const args = [ev];

    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

/**
 * Searches for users based on the input and displays results.
 */
async function searchUsers() {
  // Ensure searchInput and searchResultsContainer exist
  if (!searchInput || !searchResultsContainer) {
    console.error("Required elements for search not found.");
    return;
  }

  const searchTerm = searchInput.value.trim();

  if (searchTerm === "") {
    // If search is empty, clear and hide search results, then return early.
    searchResultsContainer.innerHTML = "";
    searchResultsContainer.style.display = "none";
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No JWT token found.");
    window.location.href = "/login"; // Redirect to login if no token
    return;
  }

  try {
    const response = await fetch(
      `/api/friends/search?query=${encodeURIComponent(searchTerm)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error(
        `Error searching users: ${response.status} ${response.statusText}`
      );
      if (searchResultsContainer) {
        try {
          const errorData = await response.json();
          searchResultsContainer.textContent = `Error: ${
            errorData.error || response.statusText
          }`;
        } catch (jsonError) {
          searchResultsContainer.textContent = `Error: ${response.statusText}`;
        }
        searchResultsContainer.style.display = "block"; // Show error in dropdown
      }
      return;
    }

    const users = await response.json();

    console.log("Received data from API:", users);

    if (Array.isArray(users)) {
      // Clear previous search results and render new ones
      searchResultsContainer.innerHTML = "";
      renderSearchResults(users);
      searchResultsContainer.style.display = "block"; // Show dropdown with results
    } else {
      // If the data is not an array, log an error and display a message
      console.error("Received data is not an array:", users);
      searchResultsContainer.innerHTML =
        "Unexpected data format from search API.";
      searchResultsContainer.style.display = "block"; // Show message in dropdown
    }
  } catch (error) {
    console.error("Error during user search:", error);
    if (searchResultsContainer) {
      searchResultsContainer.innerHTML = "An error occurred during the search.";
      searchResultsContainer.style.display = "block"; // Show error in dropdown
    }
  }
}

/**
 * Renders the search results in the designated HTML element.
 * @param {Array<{id: number, name: string}>} users - An array of user objects with id and name.
 */
function renderSearchResults(users) {
  if (!searchResultsContainer) {
    console.error("Element with id 'user-search-results' not found.");
    return;
  }

  // Clear existing results before rendering new ones
  searchResultsContainer.innerHTML = "";

  if (users.length === 0) {
    searchResultsContainer.innerHTML = "No users found.";
    return;
  }

  users.forEach((user) => {
    // Create a button for each user result
    const userButton = document.createElement("button");
    userButton.textContent = user.name;
    userButton.classList.add("user-search-result-button");
    // Add a data attribute to link the button to the user ID
    userButton.dataset.userId = String(user.id);

    // Append the button to the search results container
    searchResultsContainer.appendChild(userButton);
  });
}

// Function to handle clicks outside the popup
function handleOutsideClick(event) {
  if (
    popupContent &&
    !popupContent.contains(event.target) &&
    popupContent.style.display === "flex"
  ) {
    popupContent.style.display = "none"; // Hide the popup
    removeHidePopupOnClickOutside(); // Remove the event listener
  }
}

// Function to add the event listener
function hidePopupOnClickOutside() {
  // Remove any existing listener first to prevent duplicates
  document.removeEventListener("click", handleOutsideClick);
  document.addEventListener("click", handleOutsideClick);
}

// Function to remove the event listener
function removeHidePopupOnClickOutside() {
  document.removeEventListener("click", handleOutsideClick);
}

// Function to update the toggle friend button based on friendship status
async function updateToggleFriendButton(friendshipStatus, otherUserId) {
  const toggleFriendButton = document.getElementById("toggle-friend-btn");
  if (!toggleFriendButton) {
    console.error("Toggle friend button not found.");
    return;
  }

  // Remove any existing click listeners from the toggle friend button by cloning and replacing
  const oldToggleFriendButton = toggleFriendButton;
  const newToggleFriendButton = oldToggleFriendButton.cloneNode(true);
  if (oldToggleFriendButton.parentNode) {
    oldToggleFriendButton.parentNode.replaceChild(
      newToggleFriendButton,
      oldToggleFriendButton
    );
  }
  const updatedToggleFriendButton = newToggleFriendButton;

  if (friendshipStatus.status === "friends") {
    updatedToggleFriendButton.textContent = "Remove friend";
    updatedToggleFriendButton.addEventListener("click", async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No JWT token found.");
        window.location.href = "/login";
        return;
      }
      const removeResponse = await fetch(
        `/api/friends/${currentPopupUserId}`, // Use the stored user ID
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!removeResponse.ok) {
        console.error(
          `Error removing friend: ${removeResponse.status} ${removeResponse.statusText}`
        );
      } else {
        if (popupContent) {
          popupContent.style.display = "none"; // Hide popup after removing friend
        }
        // Optionally update the UI to reflect the change (e.g., re-fetch friend list)
      }
    });
  } else if (friendshipStatus.status === "pending") {
    updatedToggleFriendButton.textContent = "Request Pending";
    // No click listener needed for pending state
  } else {
    // Not friends
    updatedToggleFriendButton.textContent = "Send friend request";
    updatedToggleFriendButton.addEventListener("click", async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No JWT token found.");
        window.location.href = "/login";
        return;
      }
      const sendResponse = await fetch(
        `/api/friends/${currentPopupUserId}`, // Use the stored user ID
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!sendResponse.ok) {
        console.error(
          `Error sending friend request: ${sendResponse.status} ${sendResponse.statusText}`
        );
      } else {
        updatedToggleFriendButton.textContent = "Request Sent";
        if (popupContent) {
          popupContent.style.display = "none"; // Hide popup after sending request
        }
        // Optionally update the UI to reflect the change
      }
    });
  }
}

// Function to hide the search results dropdown
function hideSearchResults() {
  if (searchResultsContainer) {
    searchResultsContainer.style.display = "none";
  }
}

// Add event listeners after the DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  // Show a loading indicator (optional)
  const friendsContainer = document.getElementById("friends-container");
  if (friendsContainer) {
    friendsContainer.textContent = "Loading friends...";
  }

  // Fetch and render the initial list of friends
  const friends = await fetchAllFriends();
  renderFriends(friends); // Pass the full array to renderFriends

  // Use event delegation for search results container
  if (searchResultsContainer) {
    searchResultsContainer.addEventListener("click", async (event) => {
      const target = event.target;

      // Check if the clicked element is a user search result button
      if (target && target.classList.contains("user-search-result-button")) {
        const otherUserId = target.dataset.userId;
        currentPopupUserId = otherUserId; // Store the user ID

        if (!otherUserId) {
          console.error("User ID not found on the button.");
          return;
        }

        // Fetch the specific user's data and display the popup
        await fetchUserDataAndDisplayPopup(otherUserId);
      }
    });
  }

  // Use event delegation for the friends container
  if (friendsContainer) {
    friendsContainer.addEventListener("click", async (event) => {
      const target = event.target;

      // Check if the clicked element is a friend list item
      if (target && target.classList.contains("friend-list-item")) {
        const otherUserId = target.dataset.userId;
        currentPopupUserId = otherUserId; // Store the user ID

        if (!otherUserId) {
          console.error("User ID not found on the list item.");
          return;
        }

        // Fetch the specific user's data and display the popup
        await fetchUserDataAndDisplayPopup(otherUserId);
      }
    });
  }

  // Attach the debounced searchUsers function to the input's keyup event
  if (searchInput && searchResultsContainer) {
    searchInput.addEventListener(
      "keyup",
      debounce(async () => {
        await searchUsers(); // Perform the search
        // addPopupToggleListeners() is no longer needed here due to event delegation
      }, 400)
    );

    // Show dropdown on focus
    searchInput.addEventListener("focus", () => {
      // Only show if there are current results or if search term is not empty
      if (
        searchResultsContainer.innerHTML !== "" ||
        searchInput.value.trim() !== ""
      ) {
        searchResultsContainer.style.display = "block";
      }
    });
  }

  // Hide dropdown when clicking outside the search dropdown wrapper
  document.addEventListener("click", (event) => {
    const searchDropdownWrapper = searchInput
      ? searchInput.closest(".search-dropdown-wrapper")
      : null;
    if (
      searchDropdownWrapper &&
      event.target instanceof Node && // Add this line
      !searchDropdownWrapper.contains(event.target)
    ) {
      hideSearchResults();
    }
  });

  // Hide dropdown when pressing Escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hideSearchResults();
    }
  });
});

// Helper function to fetch user data and display the popup
async function fetchUserDataAndDisplayPopup(userId) {
  const popupContent = document.querySelector(".popup-content");
  const popupUsername = document.getElementById("popup-username");
  const popupBio = document.getElementById("popup-bio");
  const popupProfilePicture = document.querySelector("#pfp-div img"); // Select the image using querySelector

  if (!popupContent || !popupUsername) {
    console.error("Required popup elements not found.");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No JWT token found.");
    window.location.href = "/login"; // Redirect to login if no token
    return;
  }

  try {
    const response = await fetch(`/api/friends/${userId}/public`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error(
        `Error fetching user info: ${response.status} ${response.statusText}`
      );
      return;
    }

    const userDataArray = await response.json();

    console.log("Fetched user data array for popup:", userDataArray);
    const statusResponse = await fetch(`/api/friends/status/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const friendshipStatus = await statusResponse.json();

    // Update the toggle friend button based on the fetched status
    updateToggleFriendButton(friendshipStatus, userId);

    if (Array.isArray(userDataArray) && userDataArray.length > 0) {
      const userData = userDataArray[0];

      console.log("Processing user data object:", userData);

      // Populate the popup with the fetched user data
      if (popupUsername && userData.name) {
        popupUsername.textContent = userData.name;
      } else if (popupUsername) {
        popupUsername.textContent = "Username not available";
      }

      if (popupBio && userData.bio) {
        popupBio.textContent = userData.bio;
      } else if (popupBio) {
        popupBio.textContent = "No bio available.";
      }

      if (popupProfilePicture && userData.profilePhotoURL) {
        popupProfilePicture.src = userData.profilePhotoURL;
      } else if (popupProfilePicture) {
        popupProfilePicture.src = "../../uploads/default.jpg";
      }

      // Show the popup
      popupContent.style.display = "flex";

      // Add the outside click listener when showing the popup
      hidePopupOnClickOutside();
    } else {
      console.error("No user data received for ID:", userId);
      popupContent.style.display = "none";
    }
  } catch (error) {
    console.error("Error fetching user data for popup:", error);
    // Optionally hide the popup on error
    popupContent.style.display = "none";
  }
}
