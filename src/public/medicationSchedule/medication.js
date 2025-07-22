const apiBaseUrl = "http://localhost:3000";
const token = localStorage.getItem("token");

/**
 * @type {any[]}
 */
let i;
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
  i = data;
  // @ts-ignore
  listContainer.innerHTML = "";

  data.forEach((item) => {
    const li = document.createElement("li");

    li.innerHTML = `
      Medication: ${item.DrugName} - StartTime: ${formatTime(
      item.StartDateXTime
      // @ts-ignore
    )} - EndDate: ${formatTime(item.EndDate)} - ${formatRepeat(item)}
      <button class="action-btn update-btn" id="${i.indexOf(
        item
      )}">Update</button>
      <button class="action-btn delete-btn">Delete</button>
    `;
    // @ts-ignore
    li.id = item.MedicationScheduleId;
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
    const date = getWeekdaysFromBinaryString(item.RepeatWeekDate, 0);
    return `Repeat every ${item.RepeatEveryXWeeks} week(s) on ${date}`;
  }
  return "No Repeat";
}

/**
 * render the datas
 * return the binerary string to exact date - '00000001' to SUN when repeat week is selected and vice versa
 * @param {string | string[]} data
 * @param {number} int
 */
function getWeekdaysFromBinaryString(data, int) {
  const daysOfWeek = ["MON", "TUE", "WED", "THUR", "FRI", "SAT", "SUN"];
  const result = [];
  if (int === 0 && typeof data === "string") {
    for (let i = 0; i < data.length; i++) {
      if (data[i] === "1") {
        result.push(daysOfWeek[i]);
      }
    }
    return result.join(" & ");
  }
  //convert array to bineray string -- sun -> 0000001
  if (int === 1 && Array.isArray(data) && data.length >= 1) {
    const binary = daysOfWeek
      .map((day) => (data.includes(day) ? "1" : "0"))
      .join("");
    return binary;
  }
  return null;
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

  // render datas
  //Toggle Day/Week
  const toggleTypeBtn = formElement.querySelector(".toggle-type-btn");
  const daysDiv = formElement.querySelector(".days");
  toggleTypeBtn.addEventListener("click", () => {
    if (toggleTypeBtn.textContent === "Day") {
      toggleTypeBtn.textContent = "Week";
      // @ts-ignore
      daysDiv.style.display = "flex";
    } else {
      toggleTypeBtn.textContent = "Day";
      daysDiv.style.display = "none";
    }
    toggleTypeBtn.classList.toggle("highlighted");
  });

  //render datas
  // display the weekdays and highlight the chosen days on 2nd form
  const dayButtons = formElement.querySelectorAll(".day-btn");
  dayButtons.forEach(
    (
      /** @type {{ addEventListener: (arg0: string, arg1: () => void) => void; classList: { toggle: (arg0: string) => void; }; }} */
      btn
    ) => {
      // Toggle highlight on click
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

    const completeBtn = newForm.querySelector(".completeBtn");
    const completeBtn2 = newForm.querySelector(".completeBtn2");
    //get updated datas and call UPDATE API
    completeBtn.addEventListener("click", handleCompleteClick);
    completeBtn2.addEventListener("click", handleCompleteClick);
    function handleCompleteClick() {
      const result = getData(null);
      createMedication(result);
    }
  });
} else {
  console.warn("Button with ID 'add-new-form' not found in the DOM.");
}

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
    // const text = form.textContent || "";
    // @ts-ignore
    //retrieve the datas by index
    const index = parseInt(e.target.id);
    const dataSet = i[index];

    let interval;

    const name = dataSet.DrugName;
    const dateTime = dataSet.StartDateXTime;
    const endDate = dataSet.EndDate;
    const matchRepeat = dataSet.RepeatRequest;
    const intervalDays = dataSet.RepeatEveryXDays;
    const intervalWeek = dataSet.RepeatEveryXWeeks;
    const weekDate = dataSet.RepeatWeekDate;
    const mediactionId = form.id;
    if (matchRepeat === 1) {
      interval = intervalDays;
    }
    if (matchRepeat === 2) {
      interval = intervalWeek;
    }

    const { date: startDate, time: startTime } = populateDate(dateTime);
    const weekDays = getWeekdaysFromBinaryString(weekDate, 0);
    const existingData = {
      name: name,
      startDate: startDate,
      startTime: startTime,
      endDate: endDate,
      matchRepeat: matchRepeat,
      interval: interval,
      weekDate: weekDays,
      mediactionId: parseInt(mediactionId),
    };
    openUpdateForm(existingData); //pass the datas and display
  }
});

/**
 *format the date from MM/DD/YYYY -> YYYY-MM-DD when update form is selected
 * @param {string} dateTimeString
 */
function populateDate(dateTimeString) {
  const dateObj = new Date(dateTimeString);
  const date = dateObj.toISOString().split("T")[0];
  const time = dateObj.toTimeString().split(":").slice(0, 2).join(":");
  return { date, time };
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
  const completeBtn = newForm.querySelector(".completeBtn");
  const completeBtn2 = newForm.querySelector(".completeBtn2");

  //display the original datas in the 1st half of form
  newForm.querySelector('input[type="text"]').value = existingData.name;
  newForm.querySelector('input[type="date"]').value = existingData.startDate;
  newForm.querySelector('input[type="time"]').value = existingData.startTime;
  newForm.querySelector("#end-date").value = existingData.endDate;
  newForm.querySelector('input[type="number"]').value = existingData.interval;

  //display the original datas in the 2nd half of the form(repeat form)
  //display visual tick marks for the selected checkbox
  const never = newForm.querySelector(".never-check");
  const norepeatCheck = newForm.querySelector(".norepeat-check");
  const repeatCheck = newForm.querySelector(".repeat-check");
  const end = newForm.querySelector(".ends-check");

  //if repeat is selected show the following
  if (existingData.matchRepeat != 0) {
    if (newForm.querySelector("#end-date").value) {
      never.checked = false;
      end.checked = true;
    }

    norepeatCheck.checked = false;
    repeatCheck.checked = true;

    //and show 2nd form if original shcedule is repeated
    const repeatOptions = newForm.querySelector(".repeat-options");
    const completeBtn = newForm.querySelector(".completeBtn");
    repeatOptions.style.display = "block";
    completeBtn.style.display = "none";

    const toggleTypeBtn = newForm.querySelector(".toggle-type-btn");
    const daysDiv = newForm.querySelector(".days");
    if (existingData.matchRepeat === 1) {
      toggleTypeBtn.textContent = "Day";
    }
    if (existingData.matchRepeat === 2) {
      toggleTypeBtn.textContent = "Week";
      daysDiv.style.display = "flex";
    }
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
    //display the latest shceudle
    fetchMedications();
  });

  //get updated datas and call UPDATE API
  completeBtn.addEventListener("click", handleCompleteClick);
  completeBtn2.addEventListener("click", handleCompleteClick);
  function handleCompleteClick() {
    const result = getData(existingData.mediactionId);
    updateMedications(result);
  }
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
/**
 * @param {number} id
 */
async function deleteMedications(id) {
  try {
    const options = {
      method: "DELETE",
    };
    const result = await fetchWithToken(
      `${apiBaseUrl}/api/medicationSchedule/${id}`,
      options
    );
    console.log("Delete result:", result);
    showToast("Medication delete successfully!");
  } catch (error) {
    console.error("Ereting medication:", error);
  }
}

//UPDATE API
// @ts-ignore
async function updateMedications(data) {
  try {
    const options = {
      method: "PUT",
      body: JSON.stringify(data),
    };
    const result = await fetchWithToken(
      `${apiBaseUrl}/api/medicationSchedule`,
      options
    );
    console.log("Update result:", result);
    showToast("Medication updated successfully!");
  } catch (error) {
    console.error("Error updating medication:", error);
  }
}

/**
 * create 
 * @param {any} data
 */
async function createMedication(data) {
  try {
    const options = {
      method: "POST",
      body: JSON.stringify(data),
    };
    const result = await fetchWithToken(
      `${apiBaseUrl}/api/medicationSchedule`,
      options
    );
    console.log("Update result:", result);
    showToast("Medication create successfully!");
    fetchMedications();
  } catch (error) {
    console.error("Error creating medication:", error);
  }
}

//trigger DELETE API if delete btn is clicked
document.addEventListener("click", (e) => {
  //check if e.target is a DOM element
  if (!e.target || !(e.target instanceof Element)) {
    return;
  }

  if (e.target.classList.contains("delete-btn")) {
    const form = e.target.closest("li");
    // @ts-ignore
    const medicationId = parseInt(form.id);

    deleteMedications(medicationId);

    fetchMedications();
  }
});

/**
 *get user input
 * @param {number | null} id
 */
function getData(id) {
  console.log(id);
  const newForm = document.querySelector(".form-section");
  let repeat;
  let intervalDay;
  let intervalWeek;
  let endDate;
  if (newForm) {
    // Medication name
    /** @type {HTMLInputElement | null} */
    const medNameInput = newForm.querySelector('input[type="text"]');
    /** @type {string|null} */
    const medName = medNameInput?.value ?? null;
    if (!medName) {
      alert("Please enter the medication name.");
      medNameInput?.focus();
      return;
    }

    // Date and Time
    /** @type {HTMLInputElement|null} */
    const startDateInput = newForm.querySelector('input[type="date"]');
    /** @type {string|null} */
    const startDate = startDateInput?.value ?? null;

    /** @type {HTMLInputElement|null} */
    const startTimeInput = newForm.querySelector('input[type="time"]');
    /** @type {string|null} */
    const startTime = startTimeInput?.value ?? null;

    const transDate = new Date(`${startDate}T${startTime}`);
    const StartDateXTime = transDate.toISOString();
    if (!startDate || !startTime) {
      alert("Please enter the date and time.");
      startDateInput?.focus();
      return;
    }

    // Repeat status
    /** @type {HTMLInputElement|null} */
    const repeatCheck = newForm.querySelector(".repeat-check");
    /** @type {boolean|null} */
    const repeatChecked = repeatCheck?.checked ?? null;
    /** @type {HTMLInputElement|null} */
    const noRepeatCheck = newForm.querySelector(".norepeat-check");
    /** @type {boolean|null} */
    const noRepeatChecked = noRepeatCheck?.checked ?? null;
    if (noRepeatChecked) {
      repeat = 0;
    }

    // Repeat type (Day/Week)
    /** @type {HTMLElement|null} */
    const repeatTypeBtn = newForm.querySelector(".toggle-type-btn");
    /** @type {string|null} */
    const repeatType = repeatTypeBtn?.textContent?.trim() ?? null;
    if (repeatChecked) {
      if (repeatType == "Day") {
        repeat = 1;
      } else {
        repeat = 2;
      }
    }

    // Repeat frequency
    /** @type {HTMLInputElement|null} */
    const repeatIntervalInput = newForm.querySelector('input[type="number"]');
    /** @type {string|null} */
    if (repeat === 1) {
      intervalDay = repeatIntervalInput?.value ?? null;
      intervalWeek = null;
    } else if (repeat === 2) {
      intervalWeek = repeatIntervalInput?.value ?? null;
      intervalDay = null;
    } else {
      intervalDay = null;
      intervalWeek = null;
    }

    // Selected days (only if type is Week)
    /** @type {string[]} */
    const selectedDays = Array.from(
      /** @type {NodeListOf<HTMLElement>} */ (
        newForm.querySelectorAll(".days .day-btn.highlighted")
      )
    )
      .map((btn) => btn.textContent ?? "")
      .filter((text) => text !== "");
    const days = getWeekdaysFromBinaryString(selectedDays, 1);

    /** @type {HTMLInputElement|null} */
    const endCheck = newForm.querySelector(".ends-check");
    /** @type {boolean|null} */
    const endChecked = endCheck?.checked ?? null;

    /** @type {HTMLInputElement|null} */
    const endDateInput = newForm.querySelector("#end-date");
    /** @type {string|null} */
    if (endChecked) {
      endDate = endDateInput?.value ?? null;
      if (!endDate) {
        alert("Please select an end date.");
        endDateInput?.focus();
        return;
      }
    } else {
      endDate = null;
    }

    const updatedData = {
      DrugName: medName,
      StartDateXTime: StartDateXTime,
      EndDate: endDate,
      RepeatRequest: repeat,
      // @ts-ignore
      RepeatEveryXDays: intervalDay !== null ? parseInt(intervalDay) : null,
      // @ts-ignore
      RepeatEveryXWeeks: intervalWeek !== null ? parseInt(intervalWeek) : null,
      RepeatWeekDate: days,
      MedicationScheduleId: id,
    };
    return updatedData;
  }
}
// trigger GET API once page loaded
fetchMedications();

/**
 * @param {string | null} message
 */
function showToast(message, duration = 3000) {
  const toast = document.getElementById("toast");
  // @ts-ignore
  toast.textContent = message;
  // @ts-ignore
  toast.style.display = "block";

  setTimeout(() => {
    // @ts-ignore
    toast.style.display = "none";
  }, duration);
}
