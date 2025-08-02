import * as model from "../models/interestGroup.js";
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

    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    const application = await model.updateApplication(userId, req.body);

    if (!application) {
      res.status(500).json({ error: "Failed to update details." });
      return;
    }

    res.status(200).json(application);
  } catch (error) {
    console.log(error);
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

    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    const application = await model.deleteApplication(userId);

    if (!application) {
      res.status(500).json({ error: "Failed to delete application." });
      return;
    }

    res.status(200).json(application);
  } catch (error) {
    console.log(error);
  }
}

// ADMIN FUNCTIONS

/**
 * View applications of a specific CC (by default all 'pending' status)
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 * @type {import("express").RequestHandler}
 */

export async function getPendingApplicationsByCC(req, res, next) {
  try {
    const userId = req.userId;

    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    const application = await model.getPendingApplicationsByCC(userId);

    if (!application) {
      res.status(500).json({ error: "Failed to retrieve applications." });
      return;
    }

    res.status(200).json(application);
  } catch (error) {
    console.log(error);
  }
}

/**
 * Accept or reject an application
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 * @type {import("express").RequestHandler}
 */

export async function reviewApplication(req, res, next) {
  try {
    const userId = req.userId;
    const Status = req.body; // will either be 'accepted' or 'rejected'

    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    const application = await model.reviewApplication(userId, Status);

    if (!application) {
      res.status(500).json({ error: "Failed to retrieve applications." });
      return;
    }
  } catch (error) {
    console.log(error);
  }
}

/**
 * Get an application by ProposalId
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @type {import("express").RequestHandler}
 */

export async function getApplicationById(req, res, next) {
  try {
    const ProposalId = Number(req.params.ProposalId);

    if (isNaN(ProposalId)) {
      res.status(400).json({ error: "Invalid ProposalId" });
      return;
    }

    const result = await model.getApplicationById(Number(ProposalId));

    if (!result?.recordset || result.recordset.length === 0) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    next(error);
  }
}
