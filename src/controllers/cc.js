/** @import { AuthenticatedRequestHandler } from "../types.js" */
import model from "../models/cc.js";
import * as userModel from "../models/user.js";

class CCController {
  /**
   * Create a CC from the JSON body, making the authenticated user an admin.
   * @type {AuthenticatedRequestHandler}
   */
  static async createCC(req, res) {
    if (!req.userId) {
      res.status(401).send();
      return;
    }

    const createdCC = await model.createCC(req.body);
    const adminSuccessful = await model.makeAdmin(createdCC.id, req.userId);
    res.status(201).json(createdCC);
  }

  /**
   * Retrieve the CC specified by the `id` path parameter.
   * @type {AuthenticatedRequestHandler}
   */
  static async getCCById(req, res) {
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
   * - If the `indicateAdmin` query parameter is "true", an `isAdmin` field
   *   will be added to each CC indicating if the authenticated user is an admin.
   * - If the `filterAdmin` query parameter is "true", only CCs
   *   where the authenticated user is an admin will be returned.
   * @type {AuthenticatedRequestHandler}
   */
  static async getAllCCs(req, res) {
    const lat = req.query.lat ? +req.query.lat : null;
    const lon = req.query.lon ? +req.query.lon : null;
    if ((lat !== null && isNaN(lat)) || (lon !== null && isNaN(lon))) {
      res.status(400).json({ error: "Invalid lat or lon parameter" });
      return;
    }

    const indicateAdmin = req.query.indicateAdmin === "true";
    const filterAdmin = req.query.filterAdmin === "true";

    const ccs = await model.getAllCCs({
      locationSort: lat !== null && lon !== null ? { lat, lon } : null,
      indicateAdmin: indicateAdmin ? req.userId : undefined,
      filterAdmin: filterAdmin ? req.userId : undefined,
    });

    res.status(200).json(ccs);
  }

  /**
   * Update the name or location of the CC specified by the `id` path parameter.
   * @type {AuthenticatedRequestHandler}
   */
  static async updateCC(req, res) {
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
   * @type {AuthenticatedRequestHandler}
   */
  static async deleteCC(req, res) {
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
   * @type {AuthenticatedRequestHandler}
   */
  static async getAdmins(req, res) {
    const ccId = +req.params.id;
    if (isNaN(ccId)) {
      res.status(400).json({ error: "Invalid CC ID" });
      return;
    }

    const admins = await model.getAdmins(ccId);
    res.status(200).json(admins);
  }

  /**
   * Make the specified user (`phoneNumber` path parameter) an admin of the CC (`id` path parameter).
   * @type {AuthenticatedRequestHandler}
   */
  static async makeAdmin(req, res) {
    const ccId = +req.params.id;
    if (isNaN(ccId)) {
      res.status(400).json({ error: "Invalid CC ID" });
      return;
    }

    if (req.userId && !(await model.isAdmin(req.userId, ccId))) {
      res.status(403).send();
      return;
    }

    const phoneNumber = req.params.phoneNumber;
    const user = await userModel.getUserByPhoneNumber(phoneNumber);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const adminUpdated = await model.makeAdmin(ccId, user.UserId);
    if (!adminUpdated) {
      res.status(409).json({ error: "User is already an admin" });
      return;
    }
    res.status(200).json(user);
  }

  /**
   * Remove the specified user (`userId` path parameter) as an admin of the CC (`id` path parameter).
   * @type {AuthenticatedRequestHandler}
   */
  static async removeAdmin(req, res) {
    const ccId = +req.params.id;
    const userId = +req.params.userId;
    if (isNaN(ccId) || isNaN(userId)) {
      res.status(400).json({ error: "Invalid CC ID or User ID" });
      return;
    }

    if (req.userId && !(await model.isAdmin(req.userId, ccId))) {
      res.status(401).send();
      return;
    }

    const adminExists = await model.removeAdmin(ccId, userId);
    if (!adminExists) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }

    res.status(204).send();
  }
}

export default CCController;
