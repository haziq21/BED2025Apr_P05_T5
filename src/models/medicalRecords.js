import sql from "mssql";
import fs from "fs";
import pool from "../db.js";

/**
 * Upload a file with its complete information
 * @param {number} UserId
 * @param {{originalName: string, fileName: string, mimeType: string, filePath?: string}} file
 */

export async function uploadFile(UserId, file) {
  try {
    const request = pool
      .request()
      .input("UserId", UserId)
      .input("originalName", file.originalName)
      .input("fileName", file.fileName)
      .input("mimeType", file.mimeType)
      .input("filePath", file.filePath);

    const result = await request.query(
      ` INSERT INTO MedicalRecord (UserId, originalName, fileName, mimeType, filePath)
        OUTPUT INSERTED.*
        VALUES (@UserId, @originalName, @fileName, @mimeType, @filePath)
            `
    );
    return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

/**
 * View all files uploaded by the user
 * @param {number} UserId
 * @param {{MedicalRecordId: number, originalName: string, fileName: string, mimeType: string, filePath: string}} file
 */

export async function getFiles(UserId, file) {
  try {
    const request = pool.request().input("UserId", UserId);

    const result = await request.query(
      `SELECT MedicalRecordId, originalName, fileName, mimeType, uploadedAt FROM MedicalRecord WHERE UserId = @UserId`
    );
    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

/**
 * Delete a file by its ID and UserId
 * @param {number} MedicalRecordId
 * @param {number} UserId
 */

export async function deleteFile(MedicalRecordId, UserId) {
  try {
    // fetch the file info first
    const selectResult = await pool
      .request()
      .input("MedicalRecordId", MedicalRecordId)
      .input("UserId", UserId).query(`
        SELECT filePath, fileName FROM MedicalRecord
        WHERE MedicalRecordId = @MedicalRecordId AND UserId = @UserId
      `);

    const file = selectResult.recordset[0];
    if (!file) {
      return null; // file doesn't exist or not owned by user
    }

    // delete from the database
    await pool
      .request()
      .input("MedicalRecordId", MedicalRecordId)
      .input("UserId", UserId).query(`
        DELETE FROM MedicalRecord WHERE MedicalRecordId = @MedicalRecordId AND UserId = @UserId
      `);

    // delete the file from disk if it exists
    if (file.filePath && fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    return { message: `${file.fileName} has been deleted.` };
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

/**
 * Update the name of a file by its ID
 * @param {number} MedicalRecordId
 * @param {{UserId: number, fileName: string}} file
 */

export async function updateFileName(MedicalRecordId, file) {
  try {
    const request = pool
      .request()
      .input("MedicalRecordId", MedicalRecordId)
      .input("UserId", file.UserId)
      .input("fileName", file.fileName);

    const result = await request.query(`
      UPDATE MedicalRecord SET fileName = @fileName
      WHERE MedicalRecordId = @MedicalRecordId AND UserId = @UserId
    `);
    if (result.rowsAffected[0] === 0) {
      return { message: `No file with such ID ${MedicalRecordId}` };
    }

    return {
      message: `Your file has been updated to ${file.fileName}.`,
    };
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}
