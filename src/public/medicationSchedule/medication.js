const apiBaseUrl = "http://localhost:3000";
const token = localStorage.getItem("token");

//one list is one schedule
const listContainer = document.getElementById("medicationList");
/**
 * render schedule if GET API is called
 * @typedef {Object} Medication
 * @property {number} MedicationScheduleId
 * @property {string} DrugName
 * @property {number} UserId
 * @property {Date} StartDateXTime
 * @property {Date|null} EndDate
 * @property {number} RepeatRequest
 * @property {number|null} RepeatEveryXDays
 * @property {number|null} RepeatEveryXWeeks
 * @property {string|null} RepeatWeekDate
 * @param {Medication[]} data
 */
function renderMedications(data) {
  // @ts-ignore
  listContainer.innerHTML = "";

  data.forEach((item) => {
    const li = document.createElement("li");

    li.innerHTML = `
      Medication: ${item.DrugName} - StartTime: ${formatTime(
      item.StartDateXTime
      // @ts-ignore
    )} - EndDate: ${formatTime(item.EndDate)} - ${formatRepeat(item)}
      <button class="action-btn update-btn">Update</button>
      <button class="action-btn delete-btn">Delete</button>
    `;

    // @ts-ignore
    listContainer.appendChild(li);
  });
}

/**
 * render the datas
 * formatting the date
 * @param {Date} iso
 * @returns {string}
 */
function formatTime(iso) {
  if (iso) {
    const date = new Date(iso);
    return date.toLocaleString([], {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    return "Nil";
  }
}

/**
 * render the datas
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
 * render the datas
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
 * display a visual tick mark for the selected checkbox
 * display the 2nd half of the form(repeat form) after repeat checkbox is checked
 * @param {*} formElement
 */
function attachEvents(formElement) {
  //1st half of the form
  const repeatCheck = formElement.querySelector(".repeat-check");
  const norepeatCheck = formElement.querySelector(".norepeat-check");
  const completeBtn = formElement.querySelector(".completeBtn");
  const closeBtn = formElement.querySelector(".close-btn");

  //2nd half of the form
  const end = formElement.querySelector(".ends-check");
  const never = formElement.querySelector(".never-check");
  const completeBtn2 = formElement.querySelector(".completeBtn2");

  // display 2nd half of the form(only display when repeat is selected)
  const repeatOptions = formElement.querySelector(".repeat-options");
  completeBtn2.style.display = "block";

  // display a visual tick mark for the selected checkbox if user clicks the btns
  //no-repeat(1st form) & never(2nd form) checked by default
  //2nd form
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

  //1st form
  repeatCheck.addEventListener("change", () => {
    if (repeatCheck.checked) {
      norepeatCheck.checked = false;
      repeatOptions.style.display = "block"; //display 2nd form
      completeBtn.style.display = "none"; //display complete btn on 2nd form
    } else {
      repeatOptions.style.display = "none";
    }
  });
  norepeatCheck.addEventListener("change", () => {
    if (norepeatCheck.checked) {
      repeatCheck.checked = false;
      repeatOptions.style.display = "none";
      completeBtn.style.display = "block";
    }
  });

  //render datas
  // display the weekdays and highlight the chosen days on 2nd form
  const dayButtons = formElement.querySelectorAll(".day-btn");
  dayButtons.forEach(
    (
      /** @type {{ addEventListener: (arg0: string, arg1: () => void) => void; classList: { toggle: (arg0: string) => void; }; }} */
      btn
    ) => {
      btn.addEventListener("click", () => {
        btn.classList.toggle("highlighted");
      });
    }
  );

  //close the form bt clicking close btn
  closeBtn.addEventListener("click", () => {
    formElement.remove();
  });
}

/**
 * add new schedule form
 * @type {?HTMLElement}
 */
const addNewBtn = document.getElementById("add-new-form");
if (addNewBtn) {
  addNewBtn.addEventListener("click", () => {
    // @ts-ignore
    const clone = formTemplate.content.cloneNode(true); //copy the contents inside the template(shedule form)
    const newForm = clone.querySelector(".form-section");
    // @ts-ignore
    formContainer.appendChild(newForm); //display form when user add new schedule
    attachEvents(newForm);
    newForm.scrollIntoView({ behavior: "smooth" }); //auto scrolls the page to bring the newForm element into view
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

/**
 * update
 * Add listener to existing update buttons
 * retrieve the datas from original schedule and display them in the form when update btn is clicked
 */
document.addEventListener("click", (e) => {
  // @ts-ignore
  if (e.target.classList.contains("update-btn")) {
    // @ts-ignore
    const form = e.target.closest("li");
    const text = form.textContent || "";

    let startDate = "",
      startTime = "",
      endDate = "";

    const nameMatch = text.match(/Medication: \s*(.+?) -/); //extract the text between "Medication: " and " -" [0] the full element,eg:medication:name [1]:panadol
    const start = text.match(/StartTime: \s*(.+?) -/);
    const end = text.match(/EndDate: \s*(.+?) -/);

    //retrieve date and time seperately
    if ((start && start[1]) || (end && end[1])) {
      const [stDate, stTime] = start[1]
        .split(",")
        .map((/** @type {string} */ s) => s.trim());
      startDate = stDate;
      startTime = stTime;

      if (end[1] === "Nil") {
        endDate = "Nil";
      } else {
        endDate = populateDate(
          end[1].split(",").map((/** @type {string} */ s) => s.trim())[0]
        );
      }
    }

    // const date = start[1].split(",");
    // const startDate = date[0];
    // const startTime = date[1];

    // const repeatMatch = text.match(/ - ([^ -]+)$/);

    const existingData = {
      name: nameMatch[1],
      startDate: populateDate(startDate),
      startTime: populateTime(startTime),
      endDate: endDate,
    };
    openUpdateForm(existingData); //pass the datas and display
  }
});

/**
 *format the date from MM/DD/YYYY -> YYYY-MM-DD when update form is selected
 * @param {string} date
 */
function populateDate(date) {
  const [month, day, year] = date.split("/");
  const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
    2,
    "0"
  )}`;
  return formattedDate;
}

/**
 * format the time
 * @param {string} time
 */
function populateTime(time) {
  const timeParts = new Date(`01/01/2000 ${time}`).toTimeString().split(":");
  const formattedTime = `${timeParts[0]}:${timeParts[1]}`; // "19:30"
  return formattedTime;
}

/**
 * update
 * display overlay form with shedule detailes to update
 */
const overlay = document.getElementById("overlay");
const modal = document.getElementById("update-modal");
const updateFormContainer = document.getElementById("update-form-container");
/**
 * @param {*} existingData
 */
function openUpdateForm(existingData) {
  // @ts-ignore
  updateFormContainer.innerHTML = "";

  // Clone the same form
  // @ts-ignore
  const clone = formTemplate.content.cloneNode(true);
  const newForm = clone.querySelector(".form-section");
  const closeBtn = clone.querySelector(".close-btn");

  //display the original datas in the 1st half of form
  newForm.querySelector('input[type="text"]').value = existingData.name;
  newForm.querySelector('input[type="date"]').value = existingData.startDate;
  newForm.querySelector('input[type="time"]').value = existingData.startTime;
  newForm.querySelector("#end-date").value = existingData.endDate;

  //display the original datas in the 2nd half of the form(repeat form)
  //display visual tick marks for the selected checkbox
  const never = newForm.querySelector(".never-check");
  const norepeatCheck = newForm.querySelector(".norepeat-check");
  const repeatCheck = newForm.querySelector(".repeat-check");
  const end = newForm.querySelector(".ends-check");
  if (newForm.querySelector("#end-date").value) {
    never.checked = false;
    norepeatCheck.checked = false;
    end.checked = true;
    repeatCheck.checked = true;

    //and show 2nd form if original shcedule is repeated
    const repeatOptions = newForm.querySelector(".repeat-options");
    const completeBtn = newForm.querySelector(".completeBtn");
    repeatOptions.style.display = "block";
    completeBtn.style.display = "none";
  }

  attachEvents(newForm); //enable ticking the checkbox

  // Append to modal
  // @ts-ignore
  updateFormContainer.appendChild(newForm);

  // Show modal and overlay
  // @ts-ignore
  modal.style.display = "block";
  // @ts-ignore
  overlay.style.display = "block";

  //close the form and overlay div
  // @ts-ignore
  closeBtn.addEventListener("click", () => {
    // @ts-ignore
    modal.style.display = "none";
    // @ts-ignore
    overlay.style.display = "none";
  });
}

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
  if (!token) throw new Error("Token is missing. Please login first.");

  const defaultHeaders = {
    Authorization: `Bearer ${token}`,
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

//GET API
async function fetchMedications() {
  try {
    const options = {
      method: "GET",
    };
    const result = await fetchWithToken(
      `${apiBaseUrl}/api/medicationSchedule`,
      options
    );
    console.log("Get result:", result);
    renderMedications(result);
  } catch (error) {
    console.error("Error fetching medications:", error);
  }
}

//DELETE API
async function deleteMedications() {
  try {
    const options = {
      method: "DELETE",
      body: JSON.stringify({ MedicationScheduleId: 5 }),
    };
    const result = await fetchWithToken(
      `${apiBaseUrl}/api/medicationSchedule`,
      options
    );
    console.log("Delete result:", result);
  } catch (error) {
    console.error("Error deleting medication:", error);
  }
}

/**
 * trigger DELETE API if delete btn is clicked
 */
document.addEventListener("click", (e) => {
  //check if e.target is a DOM element
  if (!e.target || !(e.target instanceof Element)) {
    return;
  }

  if (e.target.classList.contains("delete-btn")) {
    deleteMedications();
  }
});

// trigger GET API once page loaded
fetchMedications();

