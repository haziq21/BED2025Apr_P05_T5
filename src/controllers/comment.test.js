import { jest, it, expect, describe } from "@jest/globals";
import controller from "./comment";
import model from "../models/comment";

it("should get comments by ID", async () => {
  /** @type {any} */
  const req = {
    userId: 1
  };
  /** @type {any} */
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  const mockFn = jest.fn((id) => {
    return Promise.resolve({
      recordset: [{ PostId: 1,
    UserId:1,
    TimeStamp:"2025-08-03 15:21:35.493",
    Comment:"Test",
    ParentPostId:-1,
    name: "Test CC",
    AnalysisStatus:true,
    SentimentType:"positive",
    UserName:"Test Name" }],
      recordsets: [],
      rowsAffected: [],
      output: {}
    });
  });

  // @ts-ignore
  model.getComment = mockFn;
  

  await controller.getComment(req, res);

 

  expect(res.status).toHaveBeenCalledWith(200);
 
});

it("should get comments by ID", async () => {
  /** @type {any} */
  const req = {
    userId: 1
  };
  /** @type {any} */
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  const mockFn = jest.fn((id,PostID) => {
    return Promise.resolve({
      recordset: [{ PostId: 1,
    UserId:1,
    TimeStamp:"2025-08-03 15:21:35.493",
    Comment:"Test",
    ParentPostId:-1,
    name: "Test CC",
    AnalysisStatus:true,
    SentimentType:"positive",
    UserName:"Test Name" }],
      recordsets: [],
      rowsAffected: [],
      output: {}
    });
  });

  // @ts-ignore
  model.updateComment = mockFn;
  

  await controller.updateComment(req, res);

  

  expect(res.status).toHaveBeenCalledWith(200);
 
});