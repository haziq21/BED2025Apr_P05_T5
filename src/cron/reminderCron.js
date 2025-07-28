import cron from "node-cron";
import moment from "moment-timezone";
import { getAllMediSchedule } from "../models/medicationSchedule.js";

// In-memory store of all jobs
/**
 * @param {Map<number,import("node-cron").ScheduledTask>} scheduledJobs
 */
const scheduledJobs = new Map();

export async function getDates() {
  //call GET API to get datas
  const result = await getAllMediSchedule();
  //Convert startTime to a cron expression for the cron job
  convertTimer(result);
}

/**
 * @typedef {Object} Medication
 * @property {number} MedicationScheduleId
 * @property {string} DrugName
 * @property {number} UserId
 * @property {string} StartDateXTime //string 2025-07-11T11:30:00.000Z
 * @property {Date|null} EndDate
 * @property {number} RepeatRequest
 * @property {number|null} RepeatEveryXDays
 * @property {number|null} RepeatEveryXWeeks
 * @property {string|null} RepeatWeekDate
 * @param {Medication[]} datas
 * Convert startTime to a cron expression for the cron job: startDate to '* * * * *'
 */
async function convertTimer(datas) {
  datas.forEach((element) => {
    formatData(element);
  });
}

/**
 * @property {number} MedicationScheduleId
 * @property {string} DrugName
 * @property {number} UserId
 * @property {string} StartDateXTime //string 2025-07-11T11:30:00.000Z
 * @property {Date|null} EndDate
 * @property {number} RepeatRequest
 * @property {number|null} RepeatEveryXDays
 * @property {number|null} RepeatEveryXWeeks
 * @property {string|null} RepeatWeekDate
 * @param {Medication} element
 */
function formatData(element) {
  // let formattedEnd; //formatted endDate: Thu Jul 17 2025 16:40:00 GMT+0800 or 2025-07-23
  let reminderDate;

  //endDate from database
  const endDate = element.EndDate;
  //formatted end date (to local time)

  let endDate2;
  if (endDate) {
    //if endDate from database, convert it to local time | string type
    endDate2 = moment.utc(endDate).tz("Asia/Singapore").format("YYYY-MM-DD");
  } else {
    //if null endDate from database, keep the value as null
    endDate2 = endDate;
  }

  //convert utc time string to a moment object
  const startDateTime = moment.utc(element.StartDateXTime); //Moment<2025-07-11T11:30:00Z> (exact same as database)
  //convert start moment object to local time
  const localStart = startDateTime.tz("Asia/Singapore"); //Moment<2025-07-11T19:30:00+08:00>  local time startDateTime + 8hr

  //send reminder 30mins earlier
  const reminderTime = localStart.subtract(30, "minutes");
  const minutes = reminderTime.minutes();
  const hours = reminderTime.hours();
  const dayOfTheMonth = reminderTime.date(); //get 22 from 22/7
  const month = reminderTime.month() + 1; // JS months are 0-based
  const repeat = element.RepeatRequest;
  const scheduleId = element.MedicationScheduleId;

  //no repeat
  if (repeat === 0) {
    reminderDate = `${minutes} ${hours} ${dayOfTheMonth} ${month} *`;
    //no repeat - no endDate by default - set it as 10 mins later than startDate to stop the cron job once it triggered next time
    endDate2 = localStart.clone().add(10, "minutes");
    // creatCron(scheduleId, reminderDate, localStart, endDate2, null, null);
  }
  //repeat by day
  else if (element.RepeatRequest === 1) {
    const repeatedEvDay = element.RepeatEveryXDays;
    reminderDate = `${minutes} ${hours} */${repeatedEvDay} * *`;
    // creatCron(scheduleId, reminderDate, localStart, endDate2, null, null);
  }
  //repeat by week
  else if (element.RepeatRequest === 2) {
    const binaryString = element.RepeatWeekDate;
    const selectedDays = [];
    // @ts-ignore
    //find the index no of each 1 from the string: '0000011' -> 6,7
    for (let i = 0; i < binaryString.length; i++) {
      // @ts-ignore
      if (binaryString[i] === "1") {
        selectedDays.push(i + 1);
      }
    }
    const weekDays = selectedDays.join(","); //"6,7"
    reminderDate = `${minutes} ${hours} * * ${weekDays}`;
    // creatCron(
    //   scheduleId,
    //   reminderDate,
    //   localStart,
    //   endDate2,
    //   selectedDays,
    //   element.RepeatEveryXWeeks
    // );
  }
}

/**
 * @param {string} reminderDate
 * @param {import("moment-timezone").Moment} startDate
 * @param {string | import("moment-timezone").Moment | null} endDate
 * @param {number} scheduleId
 * @param {any[number]} weekDays
 * @param {number | null} weekInterval
 */
function creatCron(
  scheduleId,
  reminderDate,
  startDate,
  endDate,
  weekDays,
  weekInterval
) {
  //see if the first startweek is executed
  let w;

  const job = cron.schedule(reminderDate, () => {
    //get the current week
    const today = moment().tz("Asia/Singapore");

    //convert the stat date to weekday: Moment<2025-07-11T11:30:00Z> to 1(Mon)
    const dayNum = startDate.isoWeekday();

    const currentWeek = today.isoWeek();

    if (today.isBefore(startDate)) {
      return;
    }
    if (endDate && today.isAfter(moment.utc(endDate))) {
      return;
    }
    //check if the start week is executed
    if (dayNum <= weekDays.at(-1)) {
      w = 1;
    } else {
      w = 2;
    }

    //check for correct weeks
    if (weekInterval) {
      const weekDiff = (currentWeek - w) % weekInterval;
      if (w === 1 && weekDiff != 0) {
        return;
      } else if (w === 2 && weekDiff != 0) {
        return;
      }
    }
    //call whats app api
  });
  scheduledJobs.set(scheduleId, job);
}

/**
 * @param {number} id
 * @param {* | null} data
 * @param {number} action //0 means update, 1 means delete, 2 means add new
 */
export function checkExistance(id, data, action) {
  if (scheduledJobs.has(id)) {
    scheduledJobs.get(id).stop();
    scheduledJobs.delete(id);
    if (action === 0) {
      formatData(data);
    }
  }
  formatData(data);
  console.log("successful");
}
