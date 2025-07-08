import * as model from "../models/cc.js";

/**
 * Create a CC from the JSON body.
 * @type {import("express").RequestHandler}
 */
export async function createCC(req, res) {
  const createdCC = await model.createCC(req.body);
  res.status(201).json(createdCC);
}

/**
 * Retrieve the CC specified by the `id` path parameter.
 * @type {import("express").RequestHandler}
 */
export async function getCCById(req, res) {
  const ccId = +req.params.id;
  if (isNaN(ccId)) {
    res.status(400).json({ error: "Invalid CC ID" });
    return;
  }

  const cc = await model.getCCById(ccId);
  if (!cc) {
    res.status(404).json({ error: "CC not found" });
    return;
  }
  res.status(200).json(cc);
}

/**
 * Retrieve all CCs.
 * - If both `lat` and `lon` query parameters are provided,
 *   the CCs will be sorted by distance from that point.
 * - If the `admin` query parameter is provided, only CCs
 *   where the specified user is an admin will be returned.
 * @type {import("express").RequestHandler}
 */
export async function getAllCCs(req, res) {
  const lat = req.query.lat ? +req.query.lat : null;
  const lon = req.query.lon ? +req.query.lon : null;
  if ((lat !== null && isNaN(lat)) || (lon !== null && isNaN(lon))) {
    res.status(400).json({ error: "Invalid lat or lon parameter" });
    return;
  }

  const admin = req.query.admin ? +req.query.admin : null;
  if (admin !== null && isNaN(admin)) {
    res.status(400).json({ error: "Invalid admin parameter" });
    return;
  }

  const ccs = await model.getAllCCs({
    locationSort: lat !== null && lon !== null ? { lat, lon } : null,
    adminFilter: admin,
  });

  res.status(200).json(ccs);
}

/**
 * Update the name or location of the CC specified by the `id` path parameter.
 * @type {import("express").RequestHandler}
 */
export async function updateCC(req, res) {
  const ccId = +req.params.id;
  if (isNaN(ccId)) {
    res.status(400).json({ error: "Invalid CC ID" });
    return;
  }

  const updatedCC = await model.updateCC(ccId, req.body);
  if (!updatedCC) {
    res.status(404).json({ error: "CC not found" });
    return;
  }

  res.status(200).json(updatedCC);
}

/**
 * Delete the CC specified by the `id` path parameter.
 * @type {import("express").RequestHandler}
 */
export async function deleteCC(req, res) {
  const ccId = +req.params.id;
  if (isNaN(ccId)) {
    res.status(400).json({ error: "Invalid CC ID" });
    return;
  }

  const deletedCC = await model.deleteCC(ccId);
  if (!deletedCC) {
    res.status(404).json({ error: "CC not found" });
    return;
  }

  res.status(200).json(deletedCC);
}

/**
 * Retrieve all admins of the CC specified by the `id` path parameter.
 * @type {import("express").RequestHandler}
 */
export async function getAdmins(req, res) {
  const ccId = +req.params.id;
  if (isNaN(ccId)) {
    res.status(400).json({ error: "Invalid CC ID" });
    return;
  }

  const admins = await model.getAdmins(ccId);
  res.status(200).json(admins);
}

/**
 * Make the specified user (`userId` path parameter) an admin of the CC (`id` path parameter).
 * @type {import("express").RequestHandler}
 */
export async function makeAdmin(req, res) {
  const ccId = +req.params.id;
  const userId = +req.params.userId;
  if (isNaN(ccId) || isNaN(userId)) {
    res.status(400).json({ error: "Invalid CC ID or User ID" });
    return;
  }

  await model.makeAdmin(ccId, userId);
  res.status(204).send();
}

/**
 * Remove the specified user (`userId` path parameter) as an admin of the CC (`id` path parameter).
 * @type {import("express").RequestHandler}
 */
export async function removeAdmin(req, res) {
  const ccId = +req.params.id;
  const userId = +req.params.userId;
  if (isNaN(ccId) || isNaN(userId)) {
    res.status(400).json({ error: "Invalid CC ID or User ID" });
    return;
  }

  const adminExists = await model.removeAdmin(ccId, userId);
  if (!adminExists) {
    res.status(404).json({ error: "Admin not found" });
    return;
  }

  res.status(204).send();
}
