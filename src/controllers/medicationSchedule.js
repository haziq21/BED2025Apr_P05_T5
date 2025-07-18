import * as model from "../models/medicationSchedule.js";

/**
 * retrieve all schedules from the user
 * @typedef {import('express').Request & { user?: any }} AuthenticatedRequest
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 */

export async function getMediSchedule(req, res) {
  // const userId = parseInt(req.params.userId);
  const userId = req.user.userId;
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
 * update the schedule by scheduleId
 * @type {import("express").RequestHandler}
 */

export async function updateSchedule(req, res) {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }
  const schedule = await model.updateSchedule(userId, req.body);
  if (!schedule) {
    res.status(404).json({ error: "Medication schedule not found" });
    return;
  }
  res.status(200).json(schedule);
}

/**
 * create the schedule
 * @type {import("express").RequestHandler}
 */
export async function createSchedule(req, res) {
  const userId = +req.params.userId;
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid User ID" });
    return;
  }
  const newSchedule = await model.createSchedule(userId, req.body);
  res.status(201).json(newSchedule);
}

/**
 * delete the schedule
 * @type {import("express").RequestHandler}
 */
export async function deleteSchedule(req, res) {
  const scheduleID = parseInt(req.params.scheduleId);
  const userId = parseInt(req.params.userId);
  if (isNaN(scheduleID)) {
    res.status(400).json({ error: "Invalid schedule ID" });
    return;
  }

  const schedule = await model.deleteSchedule(userId, scheduleID);
  if (!schedule) {
    res.status(404).json({ error: "Medication schedule not found" });
    return;
  }
  res.json(schedule);
}
