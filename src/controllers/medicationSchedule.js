import * as model from "../models/medicationSchedule.js";
import { checkExistance } from "../cron/reminderCron.js";

/**
 * retrieve all schedules from the user
 * @typedef {import('express').Request & { userId?: any }} AuthenticatedRequest
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 */

export async function getMediSchedule(req, res) {
  const userId = req.userId;
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  const schedule = await model.getMediSchedule(userId);

  if (!schedule) {
    res.status(404).json({ error: "Medication schedule not found" });
    return;
  }

  res.status(200).json(schedule);
}

/**
 * retrieve all schedules from the user
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 */

export async function updateSchedule(req, res) {
  const userId = req.userId;
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }
  await checkExistance(req.body.MedicationScheduleId, req.body, 0);
  const schedule = await model.updateSchedule(userId, req.body);
  if (!schedule) {
    res.status(404).json({ error: "Medication schedule not found" });
    return;
  }
  //import update function for cron
  res.status(200).json(schedule);
}

/**
 * create the schedule
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 */
export async function createSchedule(req, res) {
  const userId = req.userId;
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid User ID" });
    return;
  }
  await checkExistance(req.body.MedicationScheduleId, req.body, 2);
  const newSchedule = await model.createSchedule(userId, req.body);
  res.status(201).json(newSchedule);
}

/**
 * delete the schedule
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 */
export async function deleteSchedule(req, res) {
  const scheduleID = parseInt(req.params.scheduleId);
  const userId = req.userId;
  if (isNaN(scheduleID)) {
    res.status(400).json({ error: "Invalid schedule ID" });
    return;
  }
  await checkExistance(scheduleID, req.body, 1);
  const schedule = await model.deleteSchedule(userId, scheduleID);
  if (!schedule) {
    res.status(404).json({ error: "Medication schedule not found" });
    return;
  }
  res.json(schedule);
}


