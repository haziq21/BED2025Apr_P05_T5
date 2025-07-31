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
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

/**
 * Update or change details of a previously submitted application
 * @param {}
 * @param {{}}
 */

export async function updateApplication() {
  try {
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

/**
 * Delete an application
 * @param {}
 * @param {{}}
 */

export async function deleteApplication() {
  try {
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

// ADMIN FUNCTIONS

/**
 * View applications of a specific CC
 * @param {}
 * @param {{}}
 */

export async function getPendingApplicationsByCC() {
  try {
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

/**
 * Accept or reject an application
 * @param {}
 * @param {{}}
 */

export async function reviewApplication() {
  try {
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}
