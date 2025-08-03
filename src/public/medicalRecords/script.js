// const BASE_API_URL2 = "http://localhost:3000/api";
// const token6 = localStorage.getItem("token");

// /** @type {HTMLElement|null} */
// const uploadTrigger = document.getElementById("uploadTrigger");
// /** @type {HTMLInputElement|null} */
// // @ts-ignore
// const fileInput = document.getElementById("fileInput");
// /** @type {HTMLElement|null} */
// const fileList = document.getElementById("fileList");

// if (!uploadTrigger || !fileInput || !fileList) {
//   console.error("Missing DOM elements for upload UI.");
// }

// const userId = parseJwt(token)?.userId;

// /**
//  * Decode JWT token to extract payload (for userId)
//  * @param {string|null} token
//  * @returns {any}
//  */
// function parseJwt(token) {
//   if (!token) return null;
//   const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
//   return JSON.parse(atob(base64));
// }

// // Event Listener to open file dialog
// uploadTrigger?.addEventListener("click", () => {
//   fileInput?.click();
// });

// // When a file is chosen
// fileInput?.addEventListener("change", async (e) => {
//   const file = e.target?.files?.[0];
//   if (!file || !userId) return;

//   const formData = new FormData();
//   formData.append("file", file);

//   try {
//     await fetch(`${apiBaseUrl}/api/medicalRecords/${userId}`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//       body: formData,
//     });
//     await fetchFiles(); // Refresh list
//   } catch (error) {
//     console.error("Upload failed:", error);
//   }
// });

// /**
//  * Fetch uploaded medical files for user
//  */
// async function fetchFiles() {
//   if (!userId || !fileList) return;
//   try {
//     const res = await fetch(`${apiBaseUrl}/api/medicalRecords/${userId}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     const data = await res.json();
//     renderFiles(data);
//   } catch (err) {
//     console.error("Error fetching files:", err);
//   }
// }

// /**
//  * Render file list in carousel
//  * @param {Array<Object>} files
//  */
// function renderFiles(files) {
//   if (!fileList) return;
//   fileList.innerHTML = "";

//   files.forEach((file) => {
//     const container = document.createElement("div");
//     container.className = "file-item";

//     const daysAgo = calcDaysAgo(file.uploadedAt);
//     const fileNameDisplay = document.createElement("span");
//     fileNameDisplay.textContent = `${file.fileName} (${daysAgo} day${
//       daysAgo !== 1 ? "s" : ""
//     } ago)`;

//     const actions = document.createElement("div");

//     const renameBtn = document.createElement("button");
//     renameBtn.innerHTML = "✏️";
//     renameBtn.className = "rename-btn";
//     renameBtn.addEventListener("click", () =>
//       handleRename(file.MedicalRecordId, file.fileName)
//     );

//     const deleteBtn = document.createElement("button");
//     deleteBtn.innerHTML = "🗑️";
//     deleteBtn.className = "delete-btn";
//     deleteBtn.addEventListener("click", () =>
//       handleDelete(file.MedicalRecordId)
//     );

//     actions.append(renameBtn, deleteBtn);
//     container.append(fileNameDisplay, actions);
//     fileList.appendChild(container);
//   });
// }

// /**
//  * Calculate how many days ago a file was uploaded
//  * @param {string} dateStr
//  * @returns {number}
//  */
// function calcDaysAgo(dateStr) {
//   const uploadedDate = new Date(dateStr);
//   const now = new Date();
//   const diffTime = Math.abs(now - uploadedDate);
//   return Math.floor(diffTime / (1000 * 60 * 60 * 24));
// }

// /**
//  * Handle deleting a file by ID
//  * @param {number} recordId
//  */
// async function handleDelete(recordId) {
//   if (!userId || !confirm("Are you sure you want to delete this file?")) return;

//   try {
//     await fetch(`${apiBaseUrl}/api/medicalRecords/${userId}/${recordId}`, {
//       method: "DELETE",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     await fetchFiles(); // Refresh
//   } catch (err) {
//     console.error("Delete failed:", err);
//   }
// }

// /**
//  * Handle renaming a file
//  * @param {number} recordId
//  * @param {string} currentName
//  */
// async function handleRename(recordId, currentName) {
//   const newName = prompt("Enter new name:", currentName);
//   if (!newName || newName === currentName || !userId) return;

//   try {
//     await fetch(`${apiBaseUrl}/api/medicalRecords/${userId}/${recordId}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ fileName: newName }),
//     });
//     await fetchFiles(); // Refresh
//   } catch (err) {
//     console.error("Rename failed:", err);
//   }
// }

// // Auto-run on load
// fetchFiles();
