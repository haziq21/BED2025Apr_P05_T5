const apiBaseUrl = "http://localhost:3000";

/**
 * call get api to retrieve all the shedules by user ID
 */
async function fetchMedications() {
  try {
    const res = await fetch(`${apiBaseUrl}/api/medicationSchedule/1`);
    const data = await res.json();
    renderMedications(data);
  } catch (error) {
    console.error("Error fetching medications:", error);
  }
}

const listContainer = document.getElementById("medicationList");
/**
 * display schedule if it's called
 * @typedef {Object} Medication
 * @property {number} MedicationScheduleId
 * @property {string} DrugName
 * @property {number} UserId
 * @property {Date} StartDateXTime
 * @property {string|null} EndDate
 * @property {number} RepeatRequest
 * @property {number|null} RepeatEveryXDays
 * @property {number|null} RepeatEveryXWeeks
 * @property {string|null} RepeatWeekDate
 * @param {Medication[]} data
 *
 */
function renderMedications(data) {
  // @ts-ignore
  listContainer.innerHTML = "";

  data.forEach((item) => {
    const li = document.createElement("li");

    li.innerHTML = `
      Medication: ${item.DrugName} - StartTime: ${formatTime(
      item.StartDateXTime
    )} - ${formatRepeat(item)}
      <button class="action-btn update-btn">Update</button>
      <button class="action-btn delete-btn">Delete</button>
    `;

    // @ts-ignore
    listContainer.appendChild(li);
  });
}

/**
 * formatting the date
 * @param {Date} iso
 * @returns {string}
 */
function formatTime(iso) {
  const date = new Date(iso);
  return date.toLocaleString([], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * check if it's no repeat,repeat every ()days/weeks
 * @param {Medication} item
 * @returns {string}
 */
function formatRepeat(item) {
  //   if (item.RepeatRequest === 0) return "No Repeat";
  if (item.RepeatEveryXDays)
    return `Repeat every ${item.RepeatEveryXDays} day(s)`;
  if (item.RepeatEveryXWeeks) {
    // @ts-ignore
    const date = getWeekdaysFromBinaryString(item.RepeatWeekDate);
    return `Repeat every ${item.RepeatEveryXWeeks} week(s) on ${date}`;
  }
  return "No Repeat";
}

/**
 * return the binerary string to exact date - '00000001' to SUN when repeat week is selected
 * @param {string} binaryString
 */
function getWeekdaysFromBinaryString(binaryString) {
  const daysOfWeek = ["MON", "TUE", "WED", "THUR", "FRI", "SAT", "SUN"];
  const result = [];

  for (let i = 0; i < binaryString.length; i++) {
    if (binaryString[i] === "1") {
      result.push(daysOfWeek[i]);
    }
  }

  return result.join(" & ");
}

//display schedule form if add new schedule button is clicked
const formContainer = document.getElementById("form-container");
const formTemplate = document.getElementById("form-template");

/**
 * display tick of the ticked checkbox
 * display the repeat form after repeat checkbox is ticked
 * @param {*} formElement
 */
function attachEvents(formElement) {
  const repeatCheck = formElement.querySelector(".repeat-check");
  const norepeatCheck = formElement.querySelector(".norepeat-check");
  const closeBtn = formElement.querySelector(".close-btn");
  const end = formElement.querySelector(".ends-check");
  const never = formElement.querySelector(".never-check");
  // only display when repeat is selected
  const repeatOptions = formElement.querySelector(".repeat-options");

  end.addEventListener("change", () => {
    if (end.checked) {
      never.checked = false;
    }
  });

  never.addEventListener("change", () => {
    if (never.checked) {
      end.checked = false;
    }
  });

  repeatCheck.addEventListener("change", () => {
    if (repeatCheck.checked) {
      norepeatCheck.checked = false;
      repeatOptions.style.display = "block";
    } else {
      repeatOptions.style.display = "none";
    }
  });

  norepeatCheck.addEventListener("change", () => {
    if (norepeatCheck.checked) {
      repeatCheck.checked = false;
      repeatOptions.style.display = "none";
    }
  });

  // display the weekdays and highlight the chosen days  
  const dayButtons = formElement.querySelectorAll(".day-btn");
  dayButtons.forEach(
    (
      /** @type {{ addEventListener: (arg0: string, arg1: () => void) => void; classList: { toggle: (arg0: string) => void; }; }} */ btn
    ) => {
      btn.addEventListener("click", () => {
        btn.classList.toggle("highlighted");
      });
    }
  );

  closeBtn.addEventListener("click", () => {
    formElement.remove();
  });
}

/**
 * @type {?HTMLElement}
 */
const addNewBtn = document.getElementById("add-new-form");
if (addNewBtn) {
  addNewBtn.addEventListener("click", () => {
    // @ts-ignore
    const clone = formTemplate.content.cloneNode(true);
    const newForm = clone.querySelector(".form-section");
    // @ts-ignore
    formContainer.appendChild(newForm);
    attachEvents(newForm);
    newForm.scrollIntoView({ behavior: "smooth" });
  });
} else {
  console.warn("Button with ID 'add-new-form' not found in the DOM.");
}

// const updateBtn = document.getElementById("update-btn");
// if (updateBtn) {
//   updateBtn.addEventListener("click", () => {

//   });
// }

// async function updateSchedule() {
//   try {
//     fetch(`${apiBaseUrl}/api/medicationSchedule/1`),
//       {
//         method: "PUT",
//         Headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           medicationName: "Panadol",
//           startDate: "2025-07-08",
//           startTime: "07:00",
//           repeat: true,
//           frequency: 2,
//         }),
//       };
//     // const data = await res.json();
//     // renderMedications(data);
//   } catch (error) {
//     console.error("Error fetching medications:", error);
//   }
// }

const overlay = document.getElementById("overlay");
const modal = document.getElementById("update-modal");
const updateFormContainer = document.getElementById("update-form-container");

// @ts-ignore
function openUpdateForm(existingData) {
  // Clear previous modal content
  // @ts-ignore
  updateFormContainer.innerHTML = "";

  // Clone the same form
  // @ts-ignore
  const clone = formTemplate.content.cloneNode(true);
  const newForm = clone.querySelector(".form-section");

  // Pre-fill fields
  newForm.querySelector('input[type="text"]').value = existingData.name;
  newForm.querySelector('input[type="date"]').value = existingData.date;
  newForm.querySelector('input[type="time"]').value = existingData.time;

  // Attach event listeners again
  attachEvents(newForm);

  // Append to modal
  // @ts-ignore
  updateFormContainer.appendChild(newForm);

  // Show modal and overlay
  // @ts-ignore
  modal.style.display = "block";
  // @ts-ignore
  overlay.style.display = "block";
}

// Close modal
// @ts-ignore
overlay.addEventListener("click", () => {
  // @ts-ignore
  modal.style.display = "none";
  // @ts-ignore
  overlay.style.display = "none";
});

// Add listener to existing update buttons
document.addEventListener("click", (e) => {
  // @ts-ignore
  if (e.target.classList.contains("update-btn")) {
    // @ts-ignore
    const form = e.target.closest("li");

    const existingData = {
      name: form.textContent.match(/Medication: (.+?) -/)[1],
      date: "2025-07-08", // replace this with actual parsed data
      time: "07:00",       // replace this with actual parsed time
    };

    openUpdateForm(existingData);
  }
});



// Load on page
fetchMedications();
