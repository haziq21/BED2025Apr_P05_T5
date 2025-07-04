import sql from "mssql";
import pool from "../db.js";

/**
 * @param {number} userId
 */
export async function getMediSchedule(userId){
    try {
      const result = await pool
        .request()
        .input("userId", userId)
        .query(
          "SELECT * FROM MedicationSchedules WHERE UserId = @userId"
        );

    if (result.recordset.length === 0) {
      return null; // schedule not found
    }

    return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

/**
 * 
 * @param {number} scheduleId 
 * @param {{MedicationScheduleId : number, DrugName?: string, StartDateXTime?: string, EndDate?: string, RepeatRequest: number, RepeatEveryXDays?: number, RepeatEveryXWeeks?: number, RepeatWeekDate?: number }} scheduleData
 */
export async function updateSchedule(scheduleId,scheduleData) {
    try {
        const request = pool.request()
        .input("scheduleId", scheduleId)
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
        WHERE MedicationScheduleId = @scheduleId

        
    `);
        if (result.recordset.length === 0) {
        return { message: `No schedule found with ID ${scheduleId}.` };
        }

        return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};

/**
 * 
 * @param {number} userId
 * @param {{DrugName?: string, StartDateXTime?: string, EndDate?: string, RepeatRequest: number, RepeatEveryXDays?: number, RepeatEveryXWeeks?: number, RepeatWeekDate?: number }} newSchedule 
 */
export async function createSchedule(userId,newSchedule){
    try{
        const request = pool.request()
        .input("DrugName", newSchedule.DrugName)
        .input("StartDateXTime", newSchedule.StartDateXTime)
        .input("EndDate", newSchedule.EndDate)
        .input("RepeatRequest", newSchedule.RepeatRequest)
        .input("RepeatEveryXDays", newSchedule.RepeatEveryXDays)
        .input("RepeatEveryXWeeks", newSchedule.RepeatEveryXWeeks)
        .input("RepeatWeekDate", newSchedule.RepeatWeekDate)
        .input("userId",userId);

        const result = await request.query(`
        INSERT INTO MedicationSchedules (UserId,DrugName,StartDateXTime,EndDate,RepeatRequest,RepeatEveryXDays,RepeatEveryXWeeks,RepeatWeekDate)
        OUTPUT INSERTED.*
        VALUES(@userId,@DrugName,@StartDateXTime,@EndDate,@RepeatRequest,@RepeatEveryXDays,@RepeatEveryXWeeks,@RepeatWeekDate)  
            `);
        return result.recordset[0];
    }catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};


/**
 * 
 * @param {number} scheduleID 
 */
export async function deleteSchedule(scheduleID) {
    try{
        const request = pool.request()
        .input("scheduleID",scheduleID)

        const result = await request.query(`
        DELETE FROM MedicationSchedules 
        OUTPUT DELETED.*
        WHERE MedicationScheduleId = @scheduleID
            `);

        if (result.recordset.length === 0) {
        return { message: `No schedule found with ID ${scheduleID}.` };
        }

        return { message: `Schedule with ID ${scheduleID} has been deleted.` };
    }catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}