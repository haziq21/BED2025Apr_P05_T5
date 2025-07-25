import * as model from "../models/medicalRecords.js";
import fs from "fs";

/**
 * upload a file containing medical info to project root
 * @typedef {import('express').Request & { userId?: any }} AuthenticatedRequest
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 * @type {import("express").RequestHandler}
 */

export async function uploadFile(req, res) {
  try {
    // const UserId = parseInt(req.params.UserId);
    const userId = req.userId;
    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    const file = await model.uploadFile(userId, req.body);

    if (!file) {
      res.status(404).json({ error: "File upload failed" });
      return;
    }

    res.status(200).json(file);
  } catch {}
}

/**
 * view all files that user has uploaded
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 * @type {import("express").RequestHandler}
 */

export async function getFiles(req, res) {
  // const UserId = parseInt(req.params.UserId);
  const userId = req.userId;

  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  const file = await model.getFiles(userId, req.body);

  if (!file) {
    res.status(404).json({ error: "Cannot view files." });
    return;
  }

  res.status(200).json(file);
}

/**
 * delete an uploaded file
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 * @type {import("express").RequestHandler}
 */

export async function deleteFile(req, res) {
  // const UserId = parseInt(req.params.UserId);
  const userId = req.userId;
  const MedicalRecordId = parseInt(req.params.MedicalRecordId);
  if (isNaN(MedicalRecordId)) {
    res.status(400).json({ error: "Unable to find medical record." });
    return;
  }

  const file = await model.deleteFile(MedicalRecordId, userId);

  if (!file) {
    res.status(404).json({ error: "Cannot view files." });
    return;
  }

  res.status(200).json(file);
}

/**
 * update/change the name of a selected file
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 * @type {import("express").RequestHandler}
 */

export async function updateFileName(req, res) {
  // const UserId = parseInt(req.params.UserId);
  const userId = req.userId;
  const MedicalRecordId = parseInt(req.params.MedicalRecordId);
  const originalName = req.params.originalName;
  if (isNaN(MedicalRecordId)) {
    res.status(400).json({ error: "Unable to find medical record." });
    return;
  }

  try {
    const file = await model.updateFileName(MedicalRecordId, {
      // @ts-ignore
      userId,
      fileName: req.body.fileName,
      originalName: req.body.originalName,
    });

    if (!file) {
      res.status(404).json({ error: "Cannot update file name." });
    }

    res.status(200).json(file);
  } catch (err) {}
}
