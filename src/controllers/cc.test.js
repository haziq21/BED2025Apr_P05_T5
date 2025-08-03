import { jest, it, expect, beforeAll, describe } from "@jest/globals";
import controller from "./cc.js";
import model from "../models/cc.js";
import * as userModel from "../models/user.js";

describe("CC controller", () => {
  it("should create a new CC", async () => {
    /** @type {any} */
    const req = {
      userId: 1,
      body: { name: "Test CC", location: { lat: 12.34, lon: 56.78 } },
    };
    /** @type {any} */
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    model.createCC = jest.fn(async () => ({
      id: 1,
      name: "Test CC",
      location: { lat: 12.34, lon: 56.78 },
    }));
    model.makeAdmin = jest.fn(async () => true);

    await controller.createCC(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: 1,
      name: "Test CC",
      location: { lat: 12.34, lon: 56.78 },
    });
  });

  it("should get a CC by id", async () => {
    const req = /** @type {any} */ ({ params: { id: "1" } });
    const res = /** @type {any} */ ({
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    });

    const cc = { id: 1, name: "Test CC", location: { lat: 12.34, lon: 56.78 } };
    model.getCCById = jest.fn(async () => cc);

    await controller.getCCById(req, res);

    expect(model.getCCById).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(cc);
  });

  it("should return 404 when getting a non-existent CC by id", async () => {
    /** @type {any} */
    const req = { params: { id: "99" } };
    /** @type {any} */
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    model.getCCById = jest.fn(async () => null);

    await controller.getCCById(req, res);

    expect(model.getCCById).toHaveBeenCalledWith(99);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "CC not found" });
  });

  it("should get all CCs", async () => {
    /** @type {any} */
    const req = { query: {} };
    /** @type {any} */
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const ccs = [
      { id: 1, name: "Test CC", location: { lat: 12.34, lon: 56.78 } },
    ];
    model.getAllCCs = jest.fn(async () => ccs);

    await controller.getAllCCs(req, res);

    expect(model.getAllCCs).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(ccs);
  });

  it("should update a CC", async () => {
    /** @type {any} */
    const req = { params: { id: "1" }, body: { name: "Updated CC" } };
    /** @type {any} */
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const updatedCC = {
      id: 1,
      name: "Updated CC",
      location: { lat: 12.34, lon: 56.78 },
    };
    model.updateCC = jest.fn(async () => updatedCC);

    await controller.updateCC(req, res);

    expect(model.updateCC).toHaveBeenCalledWith(1, { name: "Updated CC" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updatedCC);
  });

  it("should return 404 when updating a non-existent CC", async () => {
    /** @type {any} */
    const req = { params: { id: "99" }, body: { name: "Updated CC" } };
    /** @type {any} */
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    model.updateCC = jest.fn(async () => null);

    await controller.updateCC(req, res);

    expect(model.updateCC).toHaveBeenCalledWith(99, { name: "Updated CC" });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "CC not found" });
  });

  it("should delete a CC", async () => {
    /** @type {any} */
    const req = { params: { id: "1" } };
    /** @type {any} */
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const deletedCC = {
      id: 1,
      name: "Test CC",
      location: { lat: 12.34, lon: 56.78 },
    };
    model.deleteCC = jest.fn(async () => deletedCC);

    await controller.deleteCC(req, res);

    expect(model.deleteCC).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(deletedCC);
  });

  it("should return 404 when deleting a non-existent CC", async () => {
    /** @type {any} */
    const req = { params: { id: "99" } };
    /** @type {any} */
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    model.deleteCC = jest.fn(async () => null);

    await controller.deleteCC(req, res);

    expect(model.deleteCC).toHaveBeenCalledWith(99);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "CC not found" });
  });

  it("should get admins of a CC", async () => {
    /** @type {any} */
    const req = { params: { id: "1" } };
    /** @type {any} */
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const admins = [
      {
        id: 1,
        name: "Admin",
        phoneNumber: "12345678",
        profilePhotoURL: "/path/to/photo.jpg",
        bio: "My bio",
      },
    ];
    model.getAdmins = jest.fn(async () => admins);

    await controller.getAdmins(req, res);

    expect(model.getAdmins).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(admins);
  });

  it("should remove an admin", async () => {
    /** @type {any} */
    const req = { params: { id: "1", userId: "2" }, userId: 1 };
    /** @type {any} */
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    model.isAdmin = jest.fn(async () => true);
    model.removeAdmin = jest.fn(async () => true);

    await controller.removeAdmin(req, res);

    expect(model.isAdmin).toHaveBeenCalledWith(1, 1);
    expect(model.removeAdmin).toHaveBeenCalledWith(1, 2);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});
