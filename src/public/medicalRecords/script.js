const BASE_API_URL = "http://localhost:3000";
const token6 = localStorage.getItem("token6");
console.log(token6);

/**
 * fetch APIs with token
 * @param {string} url
 * @param {Object} [options={}]
 * @param {Object.<string, string>} [options.headers]
 * @param {string} [options.method]
 * @param {string|FormData|Blob} [options.body]
 * @returns {Promise<any>}
 */
async function fetchWithToken(url, options = {}) {
  if (!token6) throw new Error("Token is missing. Please login first.");

  const defaultHeaders = {
    Authorization: `Bearer ${token6}`,
    "Content-Type": "application/json",
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };

  const res = await fetch(url, config);
  return res.json();
}

/** @typedef {Object} MedicalRecord
 * @property {number} MedicalRecordId
 * @property {string} originalName
 * @property {string} fileName
 * @property {string} mimeType
 * @property {string} filePath
 * @property {string} uploadedAt
 */

/**
 * @type {MedicalRecord[]}
 */
let medicalRecords = [];

const uploadTrigger = document.getElementById("uploadTrigger");
/**
 * @type {HTMLInputElement}
 */
// @ts-ignore
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");

/**
 * Helper to calculate "X days ago" from an ISO date
 * @param {string} isoDate
 * @returns {string}
 */
function getDaysAgo(isoDate) {
  const uploaded = new Date(isoDate);
  const now = new Date();
  const diffTime = now.getTime() - uploaded.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays === 0 ? "Today" : `${diffDays} day(s) ago`}`;
}

/**
 * Fetch and render all uploaded files
 */
async function fetchMedicalRecords() {
  try {
    const res = await fetch(`${BASE_API_URL}/api/medicalRecords`, {
      headers: {
        Authorization: `Bearer ${token6}`,
      },
    });

    const result = await res.json();
    console.log("Fetched medical records:", result);

    medicalRecords = Array.isArray(result) ? result : result.data;
    renderFileList(medicalRecords);
  } catch (err) {
    console.error("Error fetching medical records:", err);
  }
}

/**
 * Renders the uploaded files as vertical list
 * @param {MedicalRecord[]} files
 */
function renderFileList(files) {
  if (!fileList) return;
  fileList.innerHTML = "";

  files.forEach((file) => {
    const item = document.createElement("div");
    item.classList.add("file-item");

    const nameSpan = document.createElement("span");
    nameSpan.textContent = file.fileName;

    const daysSpan = document.createElement("span");
    daysSpan.textContent = getDaysAgo(file.uploadedAt);

    const iconContainer = document.createElement("div");

    const renameBtn = document.createElement("button");
    renameBtn.textContent = "✏️";
    renameBtn.classList.add("rename-btn");
    renameBtn.title = "Rename";
    renameBtn.onclick = () => handleRename(file);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.title = "Delete";
    deleteBtn.onclick = () => handleDelete(file);

    iconContainer.appendChild(renameBtn);
    iconContainer.appendChild(deleteBtn);

    item.appendChild(nameSpan);
    item.appendChild(daysSpan);
    item.appendChild(iconContainer);

    fileList.appendChild(item);
  });
}

/**
 * Prompts user to select file for upload
 */
uploadTrigger?.addEventListener("click", () => {
  fileInput?.click();
});

/**
 * On file selected, upload it
 * @param {Event} e
 */
fileInput?.addEventListener("change", async (e) => {
  const target = /** @type {HTMLInputElement} */ (e.target);
  const file = target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${BASE_API_URL}/api/medicalRecords`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token6}`,
      },
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");
    await fetchMedicalRecords(); // Refresh list
    fileInput.value = ""; // Reset input
  } catch (err) {
    console.error("Upload error:", err);
  }
});

/**
 * Deletes a file by ID
 * @param {MedicalRecord} file
 */
async function handleDelete(file) {
  try {
    const res = await fetch(
      `${BASE_API_URL}/api/medicalRecords/${file.MedicalRecordId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token6}`,
        },
      }
    );
    if (!res.ok) throw new Error("Delete failed");
    fetchMedicalRecords();
  } catch (err) {
    console.error("Delete error:", err);
  }
}

/**
 * Prompts user to rename a file and sends PUT request
 * @param {MedicalRecord} file
 */
async function handleRename(file) {
  const newName = prompt("Enter new name for this file:", file.fileName);
  if (!newName || newName === file.fileName) return;

  try {
    const res = await fetch(
      `${BASE_API_URL}/api/medicalRecords/${file.MedicalRecordId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token6}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileName: newName }),
      }
    );
    if (!res.ok) throw new Error("Rename failed");
    fetchMedicalRecords();
  } catch (err) {
    console.error("Rename error:", err);
  }
}

// On page load
fetchMedicalRecords();
