import pool from "../db.js";

/**
 * get the schedule by userId
 * @param {number} userId
 */
export async function getMediSchedule(userId) {
  try {
    const result = await pool
      .request()
      .input("userId", userId)
      .query("SELECT * FROM MedicationSchedules WHERE UserId = @userId");

    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}


/**
 * update the schedule by userId
 * @param {number} userId
 * @param {{MedicationScheduleId : number, DrugName?: string, StartDateXTime?: string, EndDate?: string, RepeatRequest?: number, RepeatEveryXDays?: number, RepeatEveryXWeeks?: number, RepeatWeekDate?: number }} scheduleData
 */
export async function updateSchedule(userId, scheduleData) {
  try {
    const request = pool
      .request()
      .input("scheduleId", scheduleData.MedicationScheduleId)
      .input("userId", userId)
      .input("DrugName", scheduleData.DrugName)
      .input("StartDateXTime", scheduleData.StartDateXTime)
      .input("EndDate", scheduleData.EndDate)
      .input("RepeatRequest", scheduleData.RepeatRequest)
      .input("RepeatEveryXDays", scheduleData.RepeatEveryXDays)
      .input("RepeatEveryXWeeks", scheduleData.RepeatEveryXWeeks)
      .input("RepeatWeekDate", scheduleData.RepeatWeekDate);

    const result = await request.query(`
        UPDATE MedicationSchedules
        SET 
            DrugName = @DrugName,
            StartDateXTime = @StartDateXTime,
            EndDate = @EndDate,
            RepeatRequest = @RepeatRequest,
            RepeatEveryXDays = @RepeatEveryXDays,
            RepeatEveryXWeeks = @RepeatEveryXWeeks,
            RepeatWeekDate = @RepeatWeekDate
        OUTPUT INSERTED.*
        WHERE MedicationScheduleId = @scheduleId AND UserId = @userId
    `);
    if (result.recordset.length === 0) {
      return {
        message: `No schedule found with ID ${scheduleData.MedicationScheduleId}.`,
      };
    }

    return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

/**
 * create schedule by userId and scheduleId
 * @param {number} userId
 * @param {{DrugName: string, StartDateXTime: string, EndDate?: string, RepeatRequest: number, RepeatEveryXDays?: number, RepeatEveryXWeeks?: number, RepeatWeekDate?: number }} newSchedule
 */
export async function createSchedule(userId, newSchedule) {
  try {
    const request = pool
      .request()
      .input("DrugName", newSchedule.DrugName)
      .input("StartDateXTime", newSchedule.StartDateXTime)
      .input("EndDate", newSchedule.EndDate)
      .input("RepeatRequest", newSchedule.RepeatRequest)
      .input("RepeatEveryXDays", newSchedule.RepeatEveryXDays)
      .input("RepeatEveryXWeeks", newSchedule.RepeatEveryXWeeks)
      .input("RepeatWeekDate", newSchedule.RepeatWeekDate)
      .input("userId", userId);

    const result = await request.query(`
        INSERT INTO MedicationSchedules (UserId,DrugName,StartDateXTime,EndDate,RepeatRequest,RepeatEveryXDays,RepeatEveryXWeeks,RepeatWeekDate)
        OUTPUT INSERTED.*
        VALUES(@userId,@DrugName,@StartDateXTime,@EndDate,@RepeatRequest,@RepeatEveryXDays,@RepeatEveryXWeeks,@RepeatWeekDate)  
            `);
    return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

/**
 * delete the schedule by userId and scheduleId
 * @param {number} scheduleID
 * @param {number} userId
 */
export async function deleteSchedule(userId, scheduleID) {
  try {
    const request = pool
      .request()
      .input("scheduleID", scheduleID)
      .input("userId", userId);

    const result = await request.query(`
        DELETE FROM MedicationSchedules 
        OUTPUT DELETED.*
        WHERE MedicationScheduleId = @scheduleID AND UserId = @userId
            `);

    if (result.recordset.length === 0) {
      // return { message: `No schedule found with ID ${scheduleID}.` };
      return null;
    }

    return { message: `Schedule with ID ${scheduleID} has been deleted.` };
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

/**
 * get all scheduled starttime and endtime for cron job
 */
export async function getAllMediSchedule() {
  try {
    const result = await pool
      .request()
      .query(`SELECT m.MedicationScheduleId,m.DrugName,m.UserId,m.StartDateXTime,m.EndDate,m.RepeatRequest,m.RepeatEveryXDays,m.RepeatEveryXWeeks,m.RepeatWeekDate,u.PhoneNumber as PhoneNumber
        FROM MedicationSchedules m
        JOIN Users u ON m.UserId = u.UserId 
        `);
    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}









