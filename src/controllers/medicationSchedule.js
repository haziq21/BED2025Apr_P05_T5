import * as model from "../models/medicationSchedule.js";

/**
 * retrieve all schedules from the user
 * @type {import("express").RequestHandler}
 */

export async function getMediSchedule(req, res) {
  const userId = parseInt(req.params.userId);

  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return
  }

  const schedule = await model.getMediSchedule(userId);

  if (!schedule) {
    res.status(404).json({ error: "Medication schedule not found" });
    return
  }

  res.status(200).json(schedule);
}

/**
 * update the schedule by scheduleId
 * @type {import("express").RequestHandler}
 */

export async function updateSchedule(req,res) {
    try{
        const scheduleId = parseInt(req.params.scheduleId);
        if (isNaN(scheduleId)) {
        res.status(400).json({ error: "Invalid schedule ID" });
        return
    }
        const schedule = await model.updateSchedule(scheduleId,req.body);
        if (!schedule) {
        res.status(404).json({ error: "Medication schedule not found" });
        return
    }
     res.status(200).json(schedule);
    }
    catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving schedule" });
    }
}


/**
 * create the schedule
 * @type {import("express").RequestHandler}
 */
export async function createSchedule(req,res) {
    try{
        const userId = +req.params.userId;
    if (isNaN(userId)) {
        res.status(400).json({ error: "Invalid User ID" });
        return;
    }
        const newSchedule = await model.createSchedule(userId,req.body);
        res.status(201).json(newSchedule);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error creating schedule" });
        return
    }
}

/**
 * delete the schedule
 * @type {import("express").RequestHandler}
 */
export async function deleteSchedule(req,res) {
    try{
        const scheduleID = parseInt(req.params.scheduleId)
        if (isNaN(scheduleID)) {
        res.status(400).json({ error: "Invalid schedule ID" })
        return 
        }

        const schedule = await model.deleteSchedule(scheduleID);
        if (!schedule) {
        res.status(404).json({ error: "Medication schedule not found" });
        return
        }
        res.json(schedule);
    }catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving book" });
  }
};