import * as model from "../models/interestGroupAdmin.js";
import { sendApprovalEmail } from "../services/gmailService.js";

// ADMIN FUNCTIONS

/**
 * View applications of a specific CC (by default all 'pending' status)
 * @typedef {import('express').Request & { userId?: any }} AuthenticatedRequest
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 * @type {import("express").RequestHandler}
 */

export async function getPendingApplicationsByCC(req, res, next) {
  try {
    const userId = req.userId;

    const ccId = parseInt(req.params.CCId);

    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    const application = await model.getPendingApplicationsByCC(ccId);

    if (!application) {
      res.status(500).json({ error: "Failed to retrieve applications." });
      return;
    }

    res.status(200).json(application);
  } catch (error) {
    console.log(error);
    next(error);
  }
}

// /**
//  * Accept or reject an application
//  * @param {AuthenticatedRequest} req
//  * @param {import("express").Response} res
//  * @type {import("express").RequestHandler}
//  */

// export async function reviewApplication(req, res, next) {
//   try {
//     const proposalId = parseInt(req.params.ProposalId);
//     const status = req.body.Status; // will either be "accepted" or "rejected"

//     if (isNaN(proposalId)) {
//       res.status(400).json({ error: "Invalid Proposal ID" });
//       return;
//     }

//     // 1. Update status + fetch application data
//     const application = await model.reviewApplication(proposalId, status);
//     if (!application) {
//       res.status(500).json({ error: "Failed to update application." });
//       return;
//     }

//     await sendApprovalEmail(
//       application.Email,
//       application.Title,
//       status === "accepted" // boolean
//     );

//     res.status(200).json({ success: true });
//   } catch (error) {
//     next(error);
//   }
// }

/**
 * Accept or reject an application
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 * @type {import("express").RequestHandler}
 */
export async function reviewApplication(req, res, next) {
  try {
    const proposalId = parseInt(req.params.ProposalId);
    const status = req.body.Status?.toLowerCase(); // "accepted" or "rejected"

    if (isNaN(proposalId)) {
      res.status(400).json({ error: "Invalid Proposal ID" });
      return;
    }

    if (status !== "accepted" && status !== "rejected") {
      res
        .status(400)
        .json({ error: "Status must be 'accepted' or 'rejected'" });
      return;
    }

    // 1. Update status + fetch application data
    const application = await model.reviewApplication(proposalId, status);
    if (!application) {
      res.status(500).json({ error: "Failed to update application." });
      return;
    }

    // 2. Send email
    // const isApproved = status === "accepted";
    await sendApprovalEmail(
      application.Email,
      application.Title,
      application.Status
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    next(error);
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
