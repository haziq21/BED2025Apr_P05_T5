import sql from "mssql";
import fs from "fs";
import pool from "../db.js";

/**
 * Upload a file with its complete information
 * @param {number} UserId
 * @param {{originalName: string, fileName: string, mimeType: string, filePath: string}} file
 */

export async function uploadFile(UserId, file) {
  // const d =  { originalname, filename, mimetype, path: filePath } = ;
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
 * @param {{originalname: string, filename: string, mimetype: string, filePath: string}} file
 */

export async function getFiles(UserId, file) {
  try {
    const request = pool.request().input("UserId", UserId);

    const result = await request.query(
      `SELECT , originalName, fileName, mimeType, uploadedAt FROM MedicalRecords WHERE UserId = @UserId`
    );
    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

/**
 *
 * @param {number} MedicalRecordId
 * @param {{UserId: number, originalname: string, filename: string, mimetype: string, filePath: string}} file
 */

export async function deleteFile(MedicalRecordId, file) {
  try {
    const request = pool
      .request()
      .input("MedicalRecordId", MedicalRecordId)
      .input("UserId", file.UserId);

    const result = await request.query(
      `DELETE FROM MedicalRecords WHERE id = @recordId`
    );
    if (result.recordset.length === 0) {
      return { message: `No file with such ID ${MedicalRecordId}` };
    }
    fs.unlinkSync(file.filePath); // ??

    return { message: `${file.filename} has been deleted.` };
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

// // Update the name of a file
// const updateFileName = async (req, res) => {
//   const UserId = req.params.userId;
//   const MedicalRecordId = req.params.id;
//   const { newName } = req.body;

//   await pool
//     .request()
//     .input("MedicalRecordId", MedicalRecordId)
//     .input("UserId", UserId)
//     .input("newName", newName).query(`
//       UPDATE MedicalRecord SET originalName = @newName
//       WHERE MedicalRecordId = @MedicalRecordId AND UserId = UserId
//     `);

//   res.json({ message: "File name updated" });
// };
