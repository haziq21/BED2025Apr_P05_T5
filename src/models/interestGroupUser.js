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
      .input("CCId", details.CCId ?? null)
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
        Title = CASE WHEN @Title IS NULL THEN Title ELSE @Title END,
        Description = CASE WHEN @Description IS NULL THEN Description ELSE @Description END,
        Email = CASE WHEN @Email IS NULL THEN Email ELSE @Email END,
        Scope = CASE WHEN @Scope IS NULL THEN Scope ELSE @Scope END,
        MeetingFrequency = CASE WHEN @MeetingFrequency IS NULL THEN MeetingFrequency ELSE @MeetingFrequency END,
        BudgetEstimateStart = CASE WHEN @BudgetEstimateStart IS NULL THEN BudgetEstimateStart ELSE @BudgetEstimateStart END,
        BudgetEstimateEnd = CASE WHEN @BudgetEstimateEnd IS NULL THEN BudgetEstimateEnd ELSE @BudgetEstimateEnd END,
        AccessibilityConsideration = CASE WHEN @AccessibilityConsideration IS NULL THEN AccessibilityConsideration ELSE @AccessibilityConsideration END,
        HealthSafetyPrecaution = CASE WHEN @HealthSafetyPrecaution IS NULL THEN HealthSafetyPrecaution ELSE @HealthSafetyPrecaution END,
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
