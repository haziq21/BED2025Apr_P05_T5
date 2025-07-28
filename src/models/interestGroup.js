import sql from "mssql";
import fs from "fs";
import pool from "../db.js";

// USER FUNCTIONS

/**
 * Fill out the application form
 * @param {number} UserId
 * @param {{CCId: number, Title: string, Description: string, Email: string}} details
 */

export async function fillApplication(UserId, details) {
  try {
    const request = pool.request();
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

/**
 * View all applications submitted by a user
 * @param {}
 * @param {{}}
 */

export async function getApplications() {
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
