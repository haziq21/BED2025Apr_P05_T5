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
  let fileName;
  try {
    const userId = req.userId;
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    try {
      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;

      const updated = await model.uploadFile(userId, {
        originalName: req.file.originalname,
        fileName: req.file.filename,
        mimeType: req.file.mimetype,
        filePath: fileUrl,
      });

      if (!updated) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.status(200).json({ filePath: fileUrl });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } finally {
    if (fileName) {
      console.log(`Uploaded ${fileName} at ${new Date().toISOString()}`);
    } else {
      console.log(
        `Upload for ${fileName} failed at ${new Date().toISOString()}`
      );
    }
  }
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
      UserId: userId,
      fileName: req.body.fileName,
    });

    if (!file) {
      res.status(404).json({ error: "Cannot update file name." });
    }

    res.status(200).json(file);
  } catch (err) {}
}
