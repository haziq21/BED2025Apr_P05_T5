const BASE_API_URL = "http://localhost:3000";

// Get token and userId from localStorage
const token1 = localStorage.getItem("token");
const userId = localStorage.getItem("userId");

// Get DOM elements
const nameInput = document.getElementById("Name");
const phoneInput = document.getElementById("Phone");
const bioInput = document.getElementById("Bio");
const profileImage = document.getElementById("profileImage");
const uploadInput = document.getElementById("uploadImage");
const editButtons = document.getElementById("editButtons");
const saveButtons = document.getElementById("saveButtons");

// Redirect if no token
if (!token || !userId) {
  alert("You are not logged in.");
  window.location.href = "login.html";
}

// Load profile when page loads
window.addEventListener("DOMContentLoaded", loadProfile);

//  Load profile data
async function loadProfile() {
  try {
    const res = await fetch(`${BASE_API_URL}/api/profile/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch profile");

    const data = await res.json();
    // @ts-ignore
    nameInput.value = data.name || "";
    // @ts-ignore
    phoneInput.value = data.phoneNumber || "";
    // @ts-ignore
    bioInput.value = data.bio || "";
    // @ts-ignore
    profileImage.src = data.image || "images/default-avatar.png";
  } catch (err) {
    console.error("Error loading profile:", err);
    alert("Failed to load profile. Please login again.");
    logout();
  }
}

//  Enable Edit

function enableEdit() {
  // @ts-ignore
  nameInput.removeAttribute("readonly");
  // @ts-ignore
  phoneInput.removeAttribute("readonly");
  // @ts-ignore
  bioInput.removeAttribute("readonly");
  // @ts-ignore
  editButtons.style.display = "none";
  // @ts-ignore
  saveButtons.style.display = "flex";
}

//  Save changes

async function saveChanges() {
  const updated = {
    // @ts-ignore
    name: nameInput.value,
    // @ts-ignore
    phoneNumber: phoneInput.value,
    // @ts-ignore
    bio: bioInput.value,
  };

  try {
    const res = await fetch(`${BASE_API_URL}/api/profile/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updated),
    });

    const result = await res.json();

    if (res.ok) {
      alert("Profile updated successfully.");
      // @ts-ignore
      nameInput.setAttribute("readonly", true);
      // @ts-ignore
      phoneInput.setAttribute("readonly", true);
      // @ts-ignore
      bioInput.setAttribute("readonly", true);
      // @ts-ignore
      saveButtons.style.display = "none";
      // @ts-ignore
      editButtons.style.display = "flex";
    } else {
      alert(result.error || "Failed to update profile.");
    }
  } catch (err) {
    console.error("Error saving profile:", err);
    alert("Something went wrong while saving.");
  }
}

//  Upload profile picture
// @ts-ignore
uploadInput.addEventListener("change", async () => {
  // @ts-ignore
  const file = uploadInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await fetch(`${BASE_API_URL}/api/profile/${userId}/upload`, {
      method: "POST", // or PUT depending on your backend
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await res.json();

    if (res.ok && result.imageUrl) {
      // @ts-ignore
      profileImage.src = result.imageUrl;
      alert("Profile picture updated!");
    } else {
      alert(result.error || "Image upload failed.");
    }
  } catch (err) {
    console.error("Upload error:", err);
    alert("Failed to upload image.");
  }
});

//  Delete profile picture
async function deleteProfilePicture() {
  if (!confirm("Are you sure you want to delete your profile picture?")) return;

  try {
    const res = await fetch(`${BASE_API_URL}/api/profile/${userId}/picture`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();

    if (res.ok) {
      // @ts-ignore
      profileImage.src = "images/default-avatar.png";
      alert("Profile picture deleted.");
    } else {
      alert(result.error || "Failed to delete picture.");
    }
  } catch (err) {
    console.error("Delete picture error:", err);
    alert("Error deleting profile picture.");
  }
}

//  Delete account
async function deleteUser() {
  if (!confirm("Are you sure you want to delete your account? This action is permanent.")) return;

  try {
    const res = await fetch(`${BASE_API_URL}/api/profile/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      alert("Account deleted.");
      logout();
    } else {
      const result = await res.json();
      alert(result.error || "Failed to delete user.");
    }
  } catch (err) {
    console.error("Delete user error:", err);
    alert("Error deleting account.");
  }
}

//  Logout
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  window.location.href = "login.html";
}

loadProfile() 