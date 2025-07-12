const apiBaseUrl = "http://localhost:3000";

//navigation bar
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".topnav a");

  navLinks.forEach(link => {
  link.addEventListener("click", () => {
    navLinks.forEach(l => l.classList.remove("active"));
    link.classList.add("active"); 
  });
});
});

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

  data.forEach(item => {
    const li = document.createElement("li"); 

    li.innerHTML = `
      Medication: ${item.DrugName} - StartTime: ${formatTime(item.StartDateXTime)} - ${formatRepeat(item)}
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
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * display no repeat,repeat every ()days/weeks 
 * @param {Medication} item
 * @returns {string}
 */
function formatRepeat(item) {
//   if (item.RepeatRequest === 0) return "No Repeat";
  if (item.RepeatEveryXDays) return `Repeat every ${item.RepeatEveryXDays} day(s)`;
  if (item.RepeatEveryXWeeks) {
    // @ts-ignore
    const date = getWeekdaysFromBinaryString(item.RepeatWeekDate);
    return `Repeat every ${item.RepeatEveryXWeeks} week(s) on ${date}`
  };
  return "No Repeat";
} 

/**
 * return the binerary string to exact date - '00000001' to SUN when repeat week is selected
 * @param {string} binaryString 
 */
//convert binary string '0000011' to sat&sun
function getWeekdaysFromBinaryString(binaryString){
    const daysOfWeek = ['MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT', 'SUN'];
    const result = [];
    
    for (let i = 0; i < binaryString.length; i++) {
        if(binaryString[i] === '1'){
            result.push(daysOfWeek[i])
        }    
    }
    
    return result.join(' & ');
}


function addSchedule(){

}

function updateBtn(){
  
}


// Load on page
fetchMedications();
