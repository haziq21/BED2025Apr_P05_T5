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
      <button class="action-btn update">Update</button>
      <button class="action-btn delete">Delete</button>
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
 * display no repeat,repeat every ()days/weeks
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
//convert binary string '0000011' to sat&sun
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

const formContainer = document.getElementById("form-container");
const formTemplate = document.getElementById("form-template");
/**
 * @param {*} formElement
 */
function attachEvents(formElement) {
  const repeatCheck = formElement.querySelector(".repeat-check");
  const norepeatCheck = formElement.querySelector(".norepeat-check");
  const repeatOptions = formElement.querySelector(".repeat-options");
  const deleteBtn = formElement.querySelector(".delete-btn");
  const end = formElement.querySelector(".ends-check");
  const never = formElement.querySelector(".never-check");

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

  deleteBtn.addEventListener("click", () => {
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

// Load on page
fetchMedications();
