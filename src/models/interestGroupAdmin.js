import sql from "mssql";
import fs from "fs";
import pool from "../db.js";

// ADMIN FUNCTIONS

/**
 * View applications of a specific CC (by default all 'pending' status)
 * @param {number} CCId
 */

export async function getPendingApplicationsByCC(CCId) {
  try {
    const request = pool.request().input("CCId", CCId);

    const result = await request.query(`
      SELECT * FROM InterestGroupProposals 
      WHERE CCId = @CCId AND Status = 'pending'
      `);

    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

/**
 * Accept or reject an application
 * @param {number} ProposalId
 * @param {string} Status
 */

export async function reviewApplication(ProposalId, Status) {
  try {
    const request = pool
      .request()
      .input("ProposalId", ProposalId)
      .input("Status", Status);

    const result = await request.query(`
      UPDATE InterestGroupProposals
      SET Status = @Status,
      WHERE ProposalId = @ProposalId
      `);

    const updatedApp = await getApplicationById(ProposalId);
    return updatedApp.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

/**
 * Get a application by ProposalId
 * @param {number} ProposalId
 */

export async function getApplicationById(ProposalId) {
  try {
    const request = pool.request().input("ProposalId", ProposalId);

    const result = await request.query(`
      SELECT * FROM InterestGroupProposals 
      WHERE 
      ProposalId = @ProposalId
      `);
    return result;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}
