import * as model from "../models/cc.js";

/**
 * Create a CC from the JSON body.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function createCC(req, res) {
  try {
    const createdCC = await model.createCC(req.body);
    res.status(201).json(createdCC);
  } catch (err) {
    res.status(500).json({
      error: "Failed to create CC",
      details: err,
    });
    throw err;
  }
}

/**
 * Retrieve all CCs. If the `lat` and `lon` query parameters are
 * provided, the CCs will be sorted by distance from that point.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function getAllCCs(req, res) {
  const lat = req.query.lat ? +req.query.lat : null;
  const lon = req.query.lon ? +req.query.lon : null;
  if (lat !== null && isNaN(lat)) {
    res.status(400).json({ error: "Invalid lat parameter" });
    return;
  }
  if (lon !== null && isNaN(lon)) {
    res.status(400).json({ error: "Invalid lon parameter" });
    return;
  }

  try {
    let ccs;
    if (lat && lon) ccs = await model.getAllCCsByDistance({ lat, lon });
    else ccs = await model.getAllCCs();

    res.status(200).json(ccs);
  } catch (err) {
    res.status(500).json({
      error: "Failed to retrieve CCs",
      details: err,
    });
    throw err;
  }
}

/**
 * Update the name or location of a CC specified by an `id` path parameter.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function updateCC(req, res) {
  const ccId = +req.params.id;
  if (isNaN(ccId)) {
    res.status(400).json({ error: "Invalid CC ID" });
    return;
  }

  try {
    const updatedCC = await model.updateCC(ccId, req.body);
    if (!updatedCC) {
      res.status(404).json({ error: "CC not found" });
      return;
    }

    res.status(200).json(updatedCC);
  } catch (err) {
    res.status(500).json({
      error: "Failed to update CC",
      details: err,
    });
    throw err;
  }
}

/**
 * Delete a CC specified by an `id` path parameter.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function deleteCC(req, res) {
  const ccId = +req.params.id;
  if (isNaN(ccId)) {
    res.status(400).json({ error: "Invalid CC ID" });
    return;
  }

  try {
    const deletedCC = await model.deleteCC(ccId);
    if (!deletedCC) {
      res.status(404).json({ error: "CC not found" });
      return;
    }

    res.status(200).json(deletedCC);
  } catch (err) {
    res.status(500).json({
      error: "Failed to delete CC",
      details: err,
    });
    throw err;
  }
}
