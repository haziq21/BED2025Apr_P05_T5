import sql from "mssql";
import fs from "fs";
import pool from "../db.js";

// USER FUNCTIONS

/**
 * Fill out the application form
 * @param {number} UserId
 * @param {{CCId: number, Title: string, Description: string, Email: string, Scope: string, MeetingFrequency: string, BudgetEstimateStart: number, BudgetEstimateEnd: number, AccessibilityConsideration: string, HealthSafetyPrecaution: string}} details
 */

export async function fillApplication(UserId, details) {
  try {
    const request = pool
      .request()
      .input("UserId", UserId)
      .input("CCId", details.CCId)
      .input("Title", details.Title)
      .input("Description", details.Description)
      .input("Email", details.Email)
      .input("Scope", details.Scope)
      .input("MeetingFrequency", details.MeetingFrequency)
      .input("BudgetEstimateStart", details.BudgetEstimateStart)
      .input("BudgetEstimateEnd", details.BudgetEstimateEnd)
      .input("AccessibilityConsideration", details.AccessibilityConsideration)
      .input("HealthSafetyPrecaution", details.HealthSafetyPrecaution);

    const result = await request.query(`
        INSERT INTO InterestGroupProposals (
          UserId, CCId, Title, Description, Email,
          Scope, MeetingFrequency,
          BudgetEstimateStart, BudgetEstimateEnd,
          AccessibilityConsideration, HealthSafetyPrecaution
        )
        OUTPUT INSERTED.*
        VALUES (
          @UserId, @CCId, @Title, @Description, @Email,
          @Scope, @MeetingFrequency,
          @BudgetEstimateStart, @BudgetEstimateEnd,
          @AccessibilityConsideration, @HealthSafetyPrecaution
        )
      `);

    return result.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

/**
 * View all applications submitted by a user
 * @param {number} UserId
 */

export async function getApplications(UserId) {
  try {
    const request = pool.request().input("UserId", UserId);

    const result = await request.query(
      ` SELECT * FROM InterestGroupProposals WHERE UserId = @UserId
      `
    );

    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

/**
 * Update or change details of a previously submitted application
 * @param {number} ProposalId
 * @param {{CCId: number, Title: string, Description: string, Email: string, Scope: string, MeetingFrequency: string, BudgetEstimateStart: number, BudgetEstimateEnd: number, AccessibilityConsideration: string, HealthSafetyPrecaution: string}} details
 */

export async function updateApplication(ProposalId, details) {
  try {
    const request = pool
      .request()
      .input("ProposalId", ProposalId)
      .input("Title", details.Title ?? null)
      .input("Description", details.Description ?? null)
      .input("Email", details.Email ?? null)
      .input("Scope", details.Scope ?? null)
      .input("MeetingFrequency", details.MeetingFrequency ?? null)
      .input("BudgetEstimateStart", details.BudgetEstimateStart ?? null)
      .input("BudgetEstimateEnd", details.BudgetEstimateEnd ?? null)
      .input(
        "AccessibilityConsideration",
        details.AccessibilityConsideration ?? null
      )
      .input("HealthSafetyPrecaution", details.HealthSafetyPrecaution ?? null);

    const result = await request.query(`
    UPDATE InterestGroupProposals
    SET
        Title = ISNULL(@Title, Title),
        Description = ISNULL(@Description, Description),
        Email = ISNULL(@Email, Email),
        Scope = ISNULL(@Scope, Scope),
        MeetingFrequency = ISNULL(@MeetingFrequency, MeetingFrequency),
        BudgetEstimateStart = ISNULL(@BudgetEstimateStart, BudgetEstimateStart),
        BudgetEstimateEnd = ISNULL(@BudgetEstimateEnd, BudgetEstimateEnd),
        AccessibilityConsideration = ISNULL(@AccessibilityConsideration, AccessibilityConsideration),
        HealthSafetyPrecaution = ISNULL(@HealthSafetyPrecaution, HealthSafetyPrecaution),
        UpdatedAt = GETDATE()
    WHERE ProposalId = @ProposalId
      `);

    return result;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

/**
 * Delete an application
 * @param {number} ProposalId
 */

export async function deleteApplication(ProposalId) {
  try {
    const request = pool.request().input("ProposalId", ProposalId);

    const result = await request.query(`
      DELETE FROM InterestGroupProposals 
      WHERE ProposalId = @ProposalId
      `);
    return result;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

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
    return result.recordset[0];
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
    // .input("Name", relevantInformation.Name)
    // .input("Email", relevantInformation.Email)
    // .input("Status", relevantInformation.Status);

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
