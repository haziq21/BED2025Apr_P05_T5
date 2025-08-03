/** @type {HTMLInputElement | null} */
const searchInput = /** @type {HTMLInputElement} */ document.getElementById(
  "friend-search-input"
);
const searchResultsContainer = document.getElementById("user-search-results");

export async function displayUserInfo(userId) {
  if (!userId) {
    console.error("No user ID provided.");
    return;
  }
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No JWT token found.");
    window.location.href = "/login"; // Redirect to login if no token
    return;
  }
  const response = await fetch(`/api/friends/${userId}/public`);
  if (!response.ok) {
    console.error(
      `Error fetching user info: ${response.status} ${response.statusText}`
    );
    return;
  }
  const userInfo = await response.json();
  if (!userInfo) {
    console.error("No user info found for the given ID.");
    return;
  }
}

/**
 * Fetches the list of friends for the authenticated user.
 * @returns {Promise<string[]>} A promise that resolves to an array of friend names or identifiers.
 */
export async function fetchAllFriends() {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("No JWT token found.");
    window.location.href = "/login"; // Redirect to login if no token
    return [];
  }

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
  // Assuming the API returns an array of strings (friend names or identifiers)
  return data || [];
}

/**
 * @param {string[]} friends - An array of friend names or identifiers.
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
    listItem.textContent = friend;
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
    // Removed type annotation
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

const popupContent = document.querySelector(".popup-content");

// Function to handle clicks outside the popup
function handleOutsideClick(event) {
  if (popupContent && !popupContent.contains(event.target)) {
    popupContent.style.display = "none"; // Hide the popup
    removeHidePopupOnClickOutside(); // Remove the event listener
  }
}

// Function to add the event listener
function hidePopupOnClickOutside() {
  document.addEventListener("click", handleOutsideClick);
}

// Function to remove the event listener
function removeHidePopupOnClickOutside() {
  document.removeEventListener("click", handleOutsideClick);
}

/**
 * @type {string | null} currentPopupUserId - Stores the user ID of the currently displayed popup user.
 */
let currentPopupUserId = null;

// Function to update the toggle friend button based on friendship status
async function updateToggleFriendButton(friendshipStatus, otherUserId) {
  const toggleFriendButton = document.getElementById("toggle-friend-btn");
  if (!toggleFriendButton) {
    console.error("Toggle friend button not found.");
    return;
  }

  // Remove any existing click listeners from the toggle friend button
  const oldToggleFriendButton = toggleFriendButton;
  const newToggleFriendButton = oldToggleFriendButton.cloneNode(true);
  oldToggleFriendButton.parentNode.replaceChild(
    newToggleFriendButton,
    oldToggleFriendButton
  );
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
        document.querySelector(".popup-content").style.display = "none"; // Hide popup after removing friend
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
        document.querySelector(".popup-content").style.display = "none"; // Hide popup after sending request
        // Optionally update the UI to reflect the change
      }
    });
  }
}

/**
 * Adds click event listeners to user search result buttons to toggle popup content.
 * This function should be called ONCE after the initial rendering and whenever the search results are updated.
 */
function addPopupToggleListeners() {
  // Get all the user search result buttons that are currently in the DOM
  const userButtons = document.querySelectorAll(".user-search-result-button");
  // Get the existing popup content element
  const popupContent = document.querySelector(".popup-content");
  const popupUsername = document.getElementById("popup-username");
  const popupBio = document.getElementById("popup-bio");
  const popupProfilePicture = document.querySelector("#pfp-div img"); // Select the image using querySelector

  if (!popupContent || !popupUsername) {
    console.error("Required popup elements not found.");
    return;
  }

  userButtons.forEach((button) => {
    // Remove any existing listeners before adding new ones to prevent duplicates
    const clonedButton = button.cloneNode(true);
    button.parentNode.replaceChild(clonedButton, button);
    const newButton = clonedButton;

    newButton.addEventListener("click", async () => {
      const otherUserId = newButton.dataset.userId;
      currentPopupUserId = otherUserId; // Store the user ID

      if (!otherUserId) {
        console.error("User ID not found on the button.");
        return;
      }

      // Fetch the specific user's data
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No JWT token found.");
        window.location.href = "/login"; // Redirect to login if no token
        return;
      }

      try {
        const response = await fetch(`/api/friends/${otherUserId}/public`, {
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
        const statusResponse = await fetch(
          `/api/friends/status/${otherUserId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const friendshipStatus = await statusResponse.json();

        // Update the toggle friend button based on the fetched status
        updateToggleFriendButton(friendshipStatus, otherUserId);

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

          const currentDisplay = popupContent.style.display;
          popupContent.style.display =
            currentDisplay === "none" ? "flex" : "none"; // Toggle between 'flex' and 'none'
          if (popupContent.style.display === "flex") {
            // Only add listener when showing
            hidePopupOnClickOutside();
          } else {
            // Remove listener when hiding
            removeHidePopupOnClickOutside();
          }
        } else {
          console.error("No user data received for ID:", otherUserId); // Changed userId to otherUserId
          popupContent.style.display = "none";
        }
      } catch (error) {
        console.error("Error fetching user data for popup:", error);
        // Optionally hide the popup on error
        popupContent.style.display = "none";
      }
    });
  });
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
  renderFriends(friends.map((friend) => friend.name)); // Map to names for renderFriends

  // Attach the debounced searchUsers function to the input's keyup event
  if (searchInput && searchResultsContainer) {
    searchInput.addEventListener(
      "keyup",
      debounce(async () => {
        await searchUsers(); // Perform the search
        addPopupToggleListeners(); // Add listeners after search results are rendered
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
