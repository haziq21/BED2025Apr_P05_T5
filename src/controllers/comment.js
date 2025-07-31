import * as model from "../models/comment.js";
// import { getCommentAndAnalyze } from "../services/sentimentService.js";
/**
 * get the comments by user id
 * @typedef {import('express').Request & { userId?: any }} AuthenticatedRequest
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 */
export async function getCommentById(req, res) {
  const userId = req.userId;
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  const comment = await model.getCommentById(userId);

  if (!comment) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }

  res.status(200).json(comment);
}

/**
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 */

export async function getComment(req, res) {
  const userId = req.userId;
  const comment = await model.getComment(userId);

  if (!comment) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }

  res.status(200).json(comment);
}

/**
 * update the comment by postId
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 */

export async function updateComment(req, res) {
  const userId = req.userId;
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }
  const comment = await model.updateComment(userId, req.body);
  if (!comment) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }
  // check the sentiment of updated comment
  // getCommentAndAnalyze();
  res.status(200).json(comment);
}

/**
 * create the comment
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 */
export async function createComment(req, res) {
  const userId = req.userId;
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid User ID" });
    return;
  }
  const newComment = await model.createComment(userId, req.body);
  res.status(201).json(newComment);
}

/**
 * delete the comment
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 */
export async function deleteComment(req, res) {
  const postId = parseInt(req.params.postId);
  const userId = req.userId;
  if (isNaN(postId)) {
    res.status(400).json({ error: "Invalid post ID" });
    return;
  }
  const comment = await model.deleteComment(userId, postId);
  if (!comment) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }
  //
  // getCommentAndAnalyze();
  res.json(comment);
}

/**
 * retrieve all comments from the user
 * @type {import("express").RequestHandler}
 */
export async function getCommentByOthers(req, res) {
  const postId = parseInt(req.params.postId);
  if (isNaN(postId)) {
    res.status(400).json({ error: "Invalid post ID" });
    return;
  }

  const comments = await model.getCommentByOthers(postId);

  if (!comments) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }
  res.status(200).json(comments);
}
