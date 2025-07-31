import { jest } from "@jest/globals";
import * as googleCalendarController from "./googleCalendar.js";
import * as googleAuthUtil from "../utils/googleAuth.js";
import * as googleAuthModel from "../models/googleAuth.js";
import * as calendarService from "../services/googleCalendarService.js";

jest.mock("../utils/googleAuth.js");
jest.mock("../models/googleAuth.js");
jest.mock("../services/googleCalendarService.js");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  return res;
}

describe("Google Calendar Controller", () => {
  afterEach(() => jest.clearAllMocks());

  test("redirectToGoogleOAuth redirects to Google", () => {
    googleAuthUtil.getOAuthClient.mockReturnValue({});
    googleAuthUtil.getAuthUrl.mockReturnValue("http://google.com/auth");
    const req = {};
    const res = mockRes();
    googleCalendarController.redirectToGoogleOAuth(req, res);
    expect(res.redirect).toHaveBeenCalledWith("http://google.com/auth");
  });

  test("oauthCallback saves tokens and returns success", async () => {
    const fakeClient = {
      getToken: jest
        .fn()
        .mockResolvedValue({ tokens: { access_token: "abc" } }),
      setCredentials: jest.fn(),
    };
    googleAuthUtil.getOAuthClient.mockReturnValue(fakeClient);
    googleAuthModel.saveGoogleTokens.mockResolvedValue();
    const req = { query: { code: "123" }, userId: 1 };
    const res = mockRes();
    await googleCalendarController.oauthCallback(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Google account linked successfully",
    });
  });

  test("addCalendarEvent adds event to Google Calendar", async () => {
    googleAuthModel.getGoogleTokens.mockResolvedValue({});
    calendarService.addEventToGoogleCalendar.mockResolvedValue();
    const req = { userId: 1, body: { summary: "Test" } };
    const res = mockRes();
    await googleCalendarController.addCalendarEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Event added to Google Calendar!",
    });
  });
});
