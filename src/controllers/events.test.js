import { jest } from "@jest/globals";
import * as eventsController from "./events.js";

const mockGetEventsByCCId = jest.fn();
const mockGetEventById = jest.fn();
const mockGetMutualRegistrations = jest.fn();
const mockRegisterForEvent = jest.fn();
const mockGetGoogleTokens = jest.fn();
const mockAddEventToGoogleCalendar = jest.fn();
const mockSaveGoogleCalendarEventId = jest.fn();
const mockUnregisterFromEvent = jest.fn();
const mockGetGoogleCalendarEventId = jest.fn();
const mockRemoveEventFromGoogleCalendar = jest.fn();
const mockDeleteGoogleCalendarEventId = jest.fn();
const mockCreateEvent = jest.fn();
const mockUpdateEvent = jest.fn();
const mockDeleteEvent = jest.fn();
const mockGetRegistrationsForEvent = jest.fn();
const mockGetEventsByUserId = jest.fn();

jest.mock("../models/events.js", () => ({
  __esModule: true,
  getEventsByCCId: mockGetEventsByCCId,
  getEventById: mockGetEventById,
  getMutualRegistrations: mockGetMutualRegistrations,
  registerForEvent: mockRegisterForEvent,
  saveGoogleCalendarEventId: mockSaveGoogleCalendarEventId,
  unregisterFromEvent: mockUnregisterFromEvent,
  getGoogleCalendarEventId: mockGetGoogleCalendarEventId,
  deleteGoogleCalendarEventId: mockDeleteGoogleCalendarEventId,
  createEvent: mockCreateEvent,
  updateEvent: mockUpdateEvent,
  deleteEvent: mockDeleteEvent,
  getRegistrationsForEvent: mockGetRegistrationsForEvent,
  getEventsByUserId: mockGetEventsByUserId,
}));

jest.mock("../models/googleAuth.js", () => ({
  __esModule: true,
  getGoogleTokens: mockGetGoogleTokens,
}));

jest.mock("../services/googleCalendarService.js", () => ({
  __esModule: true,
  addEventToGoogleCalendar: mockAddEventToGoogleCalendar,
  removeEventFromGoogleCalendar: mockRemoveEventFromGoogleCalendar,
}));

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("Events Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("getEventsByCCId returns events", async () => {
    mockGetEventsByCCId.mockResolvedValue([{ id: 1 }]);
    const req = { params: { CCId: "1" } };
    const res = mockRes();
    await eventsController.getEventsByCCId(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  // test("getEventById returns event", async () => {
  //   mockGetEventById.mockResolvedValue({ id: 2 });
  //   const req = { params: { eventId: "2" } };
  //   const res = mockRes();
  //   await eventsController.getEventById(req, res);
  //   expect(res.status).toHaveBeenCalledWith(200);
  //   expect(res.json).toHaveBeenCalledWith({ id: 2 });
  // });

  // test("getMutualRegistrations returns mutual registrations", async () => {
  //   mockGetMutualRegistrations.mockResolvedValue(["userA", "userB"]);
  //   const req = { userId: 1, params: { eventId: "3" } };
  //   const res = mockRes();
  //   await eventsController.getMutualRegistrations(req, res);
  //   expect(res.status).toHaveBeenCalledWith(200);
  //   expect(res.json).toHaveBeenCalledWith(["userA", "userB"]);
  // });

  // test("registerForEvent registers and adds to calendar", async () => {
  //   mockRegisterForEvent.mockResolvedValue();
  //   mockGetEventById.mockResolvedValue({
  //     name: "Event",
  //     description: "desc",
  //     location: "loc",
  //     StartDateTime: new Date(),
  //     EndDateTime: new Date(),
  //   });
  //   mockGetGoogleTokens.mockResolvedValue({});
  //   mockAddEventToGoogleCalendar.mockResolvedValue("googleEventId");
  //   mockSaveGoogleCalendarEventId.mockResolvedValue();

  //   const req = { userId: 1, params: { eventId: "4" } };
  //   const res = mockRes();
  //   await eventsController.registerForEvent(req, res);
  //   expect(res.status).toHaveBeenCalledWith(200);
  //   expect(res.json).toHaveBeenCalledWith({
  //     message: "Registered and added to calendar.",
  //   });
  // });

  // test("unregisterFromEvent unregisters and removes from calendar", async () => {
  //   mockUnregisterFromEvent.mockResolvedValue();
  //   mockGetGoogleTokens.mockResolvedValue({});
  //   mockGetGoogleCalendarEventId.mockResolvedValue("googleEventId");
  //   mockRemoveEventFromGoogleCalendar.mockResolvedValue();
  //   mockDeleteGoogleCalendarEventId.mockResolvedValue();

  //   const req = { userId: 1, params: { eventId: "4" } };
  //   const res = mockRes();
  //   await eventsController.unregisterFromEvent(req, res);
  //   expect(res.status).toHaveBeenCalledWith(200);
  //   expect(res.json).toHaveBeenCalledWith({
  //     message: "Unregistered and removed from calendar.",
  //   });
  // });

  // test("createEvent creates event", async () => {
  //   mockCreateEvent.mockResolvedValue({ id: 5 });
  //   const req = {
  //     body: {
  //       CCId: 1,
  //       name: "n",
  //       description: "d",
  //       location: "l",
  //       startDate: "s",
  //       endDate: "e",
  //     },
  //   };
  //   const res = mockRes();
  //   await eventsController.createEvent(req, res);
  //   expect(res.status).toHaveBeenCalledWith(201);
  //   expect(res.json).toHaveBeenCalledWith({ id: 5 });
  // });

  // test("updateEvent updates event", async () => {
  //   mockUpdateEvent.mockResolvedValue(true);
  //   const req = {
  //     params: { eventId: "6" },
  //     body: {
  //       name: "n",
  //       description: "d",
  //       location: "l",
  //       startDate: "s",
  //       endDate: "e",
  //     },
  //   };
  //   const res = mockRes();
  //   await eventsController.updateEvent(req, res);
  //   expect(res.status).toHaveBeenCalledWith(200);
  //   expect(res.json).toHaveBeenCalledWith({
  //     message: "Event successfully updated",
  //   });
  // });

  // test("deleteEvent deletes event", async () => {
  //   mockDeleteEvent.mockResolvedValue(true);
  //   const req = { params: { eventId: "7" } };
  //   const res = mockRes();
  //   await eventsController.deleteEvent(req, res);
  //   expect(res.status).toHaveBeenCalledWith(200);
  //   expect(res.json).toHaveBeenCalledWith({
  //     message: "Event successfully deleted",
  //   });
  // });

  // test("getRegistrationsByEventId returns registrations", async () => {
  //   mockGetRegistrationsForEvent.mockResolvedValue(["userA"]);
  //   const req = { params: { eventId: "8" } };
  //   const res = mockRes();
  //   await eventsController.getRegistrationsByEventId(req, res);
  //   expect(res.status).toHaveBeenCalledWith(200);
  //   expect(res.json).toHaveBeenCalledWith(["userA"]);
  // });

  // test("getEventsByUserId returns events", async () => {
  //   mockGetEventsByUserId.mockResolvedValue([{ id: 9 }]);
  //   const req = { userId: 1 };
  //   const res = mockRes();
  //   await eventsController.getEventsByUserId(req, res);
  //   expect(res.status).toHaveBeenCalledWith(200);
  //   expect(res.json).toHaveBeenCalledWith([{ id: 9 }]);
  // });
});
