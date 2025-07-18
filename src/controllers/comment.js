import * as model from "../models/comment.js";

/**
 * retrieve all comments from the user
 * @type {import("express").RequestHandler}
 */

export async function getCommentById(req, res) {
  const userId = parseInt(req.params.userId);

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
 * retrieve all comments on comment page
 * @type {import("express").RequestHandler}
 */

export async function getComment(req, res) {
  const comment = await model.getComment();

  if (!comment) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }

  res.status(200).json(comment);
}

/**
 * update the comment by postId
 * @type {import("express").RequestHandler}
 */

export async function updateComment(req, res) {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }
  const comment = await model.updateComment(userId, req.body);
  if (!comment) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }
  res.status(200).json(comment);
}

/**
 * create the comment
 * @type {import("express").RequestHandler}
 */
export async function createComment(req, res) {
  const userId = +req.params.userId;
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid User ID" });
    return;
  }
  const newComment = await model.createComment(userId, req.body);
  res.status(201).json(newComment);
}

/**
 * delete the comment
 * @type {import("express").RequestHandler}
 */
export async function deleteComment(req, res) {
  const postId = parseInt(req.params.postId);
  const userId = parseInt(req.params.userId);
  if (isNaN(postId)) {
    res.status(400).json({ error: "Invalid post ID" });
    return;
  }

  const comment = await model.deleteComment(userId, postId);
  if (!comment) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }
  res.json(comment);
}
