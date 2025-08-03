import { jest, it, expect, beforeAll } from "@jest/globals";
import controller from "./cc.js";
import model from "../models/cc.js";

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
    location: {
      lat: 12.34,
      lon: 56.78,
    },
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
