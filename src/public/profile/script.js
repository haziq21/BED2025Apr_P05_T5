const BASE_API_URL = "http://localhost:3000";

// Get token from localStorage
const token3 = localStorage.getItem("token");

// Redirect if no token
if (!token3) {
  alert("You are not logged in.");
  window.location.href = "/login";
}
// Get DOM elements
const nameInput = document.getElementById("Name");
const phoneInput = document.getElementById("Phone");
const bioInput = document.getElementById("Bio");
const profileImage = document.getElementById("profileImage");
const uploadInput = document.getElementById("uploadImage");
const editButtons = document.getElementById("editButtons");
const saveButtons = document.getElementById("saveButtons");
const deleteButton = document.getElementById("deleteButton");

// Load profile when page loads
window.addEventListener("DOMContentLoaded", loadProfile);

//  Load profile data
async function loadProfile() {
  console.log("check check");
  try {
    const res = await fetch(`${BASE_API_URL}/api/profile/`, {
      headers: {
        Authorization: `Bearer ${token3}`,
      },
    });

    if (!res.ok) throw new Error("Failed to load profile");

    const data = await res.json();
    console.log("testing");
    console.log(data);
    // @ts-ignore
    nameInput.value = data.Name || "";
    // @ts-ignore
    phoneInput.value = data.PhoneNumber || "";
    // @ts-ignore
    bioInput.value = data.Bio || "";
    // @ts-ignore
    if (data.ProfilePhotoURL) {
      // If user has photo, show it
      // @ts-ignore
      profileImage.style.display = "block";
      // @ts-ignore
      profileImage.src = data.ProfilePhotoURL;
      // @ts-ignore
      document.getElementById("profileInitials").style.display = "none";
    } else {
      // @ts-ignore
      profileImage.style.display = "none";
      // @ts-ignore
      document.getElementById("profileInitials").style.display = "inline-block";
    }
  } catch (err) {
    console.error("Error loading profile:", err);
    alert("Failed to load profile. Please login again.");
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
    const res = await fetch(`${BASE_API_URL}/api/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token3}`,
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

  const reader = new FileReader();
  reader.onload = function (e) {
    // @ts-ignore
    profileImage.src = e.target.result;
  };
  reader.readAsDataURL(file);

  const formData = new FormData();
  formData.append("image", file);
  try {
    const res = await fetch(`${BASE_API_URL}/api/profile/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token3}`,
      },
      body: formData,
    });

    const result = await res.json();

    if (res.ok && result.ProfilePhotoURL) {
      // @ts-ignore
      profileImage.src = result.ProfilePhotoURL;
      alert("Profile picture updated!");
      loadProfile(); // Reload profile to update image
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
  try {
    const res = await fetch(`${BASE_API_URL}/api/profile/picture`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token3}`,
      },
    });

    const result = await res.json();

    if (res.ok) {
      // @ts-ignore
      profileImage.src = "";
      alert("Profile picture deleted.");
      loadProfile(); // Reload profile to update image
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
  if (
    !confirm(
      "Are you sure you want to delete your account? This action is permanent."
    )
  )
    return;

  try {
    const res = await fetch(`${BASE_API_URL}/api/profile/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token3}`,
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
  localStorage.setItem("profilePopupCount", "0");
  localStorage.setItem("profilePopupCount", "0");
  window.location.href = "/login";
}

loadProfile();
