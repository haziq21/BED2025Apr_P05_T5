document.addEventListener("DOMContentLoaded", async () => {
  const requestsList = document.getElementById("requests-list");

  const fetchRequests = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No JWT token found.");
      window.location.href = "/login"; // Redirect to login if no token
      return;
    }
    try {
      const response = await fetch("/api/friends/requests", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const requests = await response.json();

      requestsList.innerHTML = ""; // Clear existing requests

      requests.forEach((request) => {
        const listItem = document.createElement("li");
        listItem.classList.add("request-item"); // Add class to list item

        const requestName = document.createElement("span"); // Wrap name in span
        requestName.textContent = `${request.name}`;

        const buttonContainer = document.createElement("div"); // Container for buttons
        buttonContainer.classList.add("button-container"); // Optional: Add a class to the button container

        const acceptButton = document.createElement("button");
        acceptButton.textContent = "Accept";
        acceptButton.classList.add("accept-button"); // Add class to accept button
        acceptButton.addEventListener("click", async () => {
          try {
            const acceptResponse = await fetch(
              `/api/friends/requests/${request.id}`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
            if (acceptResponse.ok) {
              listItem.remove();
            } else {
              console.error("Failed to accept friend request");
            }
          } catch (error) {
            console.error("Error accepting friend request:", error);
          }
        });

        const rejectButton = document.createElement("button");
        rejectButton.textContent = "Reject";
        rejectButton.classList.add("reject-button"); // Add class to reject button
        rejectButton.addEventListener("click", async () => {
          try {
            const rejectResponse = await fetch(`/api/friends/${request.id}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });
            if (rejectResponse.ok) {
              listItem.remove();
            } else {
              console.error("Failed to reject friend request");
            }
          } catch (error) {
            console.error("Error rejecting friend request:", error);
          }
        });

        buttonContainer.appendChild(acceptButton); // Append buttons to container
        buttonContainer.appendChild(rejectButton);

        listItem.appendChild(requestName); // Append name and button container to list item
        listItem.appendChild(buttonContainer);

        requestsList.appendChild(listItem);
      });
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  };

  fetchRequests();
});
