import * as model from "../models/interestGroupUser.js";
// import { sendEmail } from "../service/gmailService.js";

// USER FUNCTIONS

/**
 * fill out the fields an application
 * @typedef {import('express').Request & { userId?: any }} AuthenticatedRequest
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 * @type {import("express").RequestHandler}
 */

export async function fillApplication(req, res) {
  try {
    const userId = req.userId;

    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    const application = await model.fillApplication(userId, req.body);

    if (!application) {
      res.status(500).json({ error: "Application submission failed." });
      return;
    }

    res.status(200).json(application);
  } catch (error) {
    console.log(error);
  }
}

/**
 * view all applications submitted by a user
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 * @type {import("express").RequestHandler}
 */

export async function getApplications(req, res, next) {
  try {
    const userId = req.userId;

    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    const application = await model.getApplications(userId);

    if (!application) {
      res.status(500).json({ error: "Unable to view past applications" });
      return;
    }

    res.status(200).json(application);
  } catch (error) {
    next(error);
  }
}

/**
 * user can edit/update any parts of the form, if no changes, the values will stay the same
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 * @type {import("express").RequestHandler}
 */

export async function updateApplication(req, res, next) {
  try {
    const userId = req.userId;

    const proposalId = parseInt(req.params.ProposalId);

    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    const application = await model.updateApplication(proposalId, req.body);

    if (application.rowsAffected[0] === 0) {
      res
        .status(404)
        .json({ error: "Proposal not found or nothing was updated." });
      return;
    }

    res.status(200).json(application);
  } catch (error) {
    console.log(error);
    next(error);
  }
}

/**
 * delete an application
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 * @type {import("express").RequestHandler}
 */

export async function deleteApplication(req, res, next) {
  try {
    const userId = req.userId;

    const proposalId = parseInt(req.params.ProposalId);

    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    const application = await model.deleteApplication(proposalId);

    if (!application) {
      res.status(500).json({ error: "Failed to delete application." });
      return;
    }

    res.status(200).json(application);
  } catch (error) {
    console.log(error);
    next(error);
  }
}
