import * as model from "../models/friends.js";
/**
 * Get all friends of a user.
 * @typedef {import('express').Request & { userId?: any }} AuthenticatedRequest
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 * */
export async function getAllFriends(req, res) {
  const userId = +req.userId;
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }
  const friends = await model.getAllFriends(userId);
  res.status(200).json(friends);
}

/**
 * Delete a friend by their ID.
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 * */
export async function deleteFriend(req, res) {
  const userId = +req.userId;
  const friendId = +req.params.friendId;
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }
  const deleted = await model.deleteFriend(userId, friendId);
  if (!deleted) {
    res.status(404).json({ error: "Delete unsuccessful" });
    return;
  }
  res.status(200).json({ message: "Deleted successfully" });
}

/**
 * Send a friend request to another user.
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 * */
export async function sendFriendRequest(req, res) {
  const userId = +req.userId;
  const friendId = +req.params.friendId;
  if (isNaN(userId) || isNaN(friendId)) {
    res.status(400).json({ error: "Invalid user or friend ID" });
    return;
  }
  const success = await model.sendFriendRequest(userId, friendId);
  if (!success) {
    res.status(404).json({ error: "Friend request already sent or failed" });
    return;
  }
  res.status(200).json({ message: "Friend request sent successfully" });
}

/** * Accept a friend request from another user.
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 * */
export async function acceptFriendRequest(req, res) {
  const userId = +req.userId;
  const friendId = +req.params.friendId;
  if (isNaN(userId) || isNaN(friendId)) {
    res.status(400).json({ error: "Invalid user or friend ID" });
    return;
  }
  const success = await model.acceptFriendRequest(userId, friendId);
  if (!success) {
    res
      .status(404)
      .json({ error: "Friend request not found or already accepted" });
    return;
  }
  res.status(200).json({ message: "Friend request accepted successfully" });
}

/** get all users who have sent a friend request to a user
 * @param {AuthenticatedRequest} req
 * @param {import("express").Response} res
 * */
export async function getPendingFriendRequests(req, res) {
  const userId = +req.userId;
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }
  const requests = await model.getPendingFriendRequests(userId);
  res.status(200).json(requests);
}

/** Search for users by name.
 * @type {import("express").RequestHandler}
 */
export async function searchUsers(req, res) {
  const query = req.query.query;
  if (typeof query !== "string") {
    res.status(400).json({ error: "Invalid search query" });
    return;
  }
  const users = await model.searchUsers(query);
  res.status(200).json(users);
}

/** * Get a user's public profile by their ID.
 * @type {import("express").RequestHandler}
 */
export async function getPublicProfile(req, res) {
  const userId = +req.params.friendId;
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }
  const profile = await model.getPublicProfile(userId);
  if (!profile) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.status(200).json(profile);
}

/** * Get the friendship status between two users.
 * @type {import("express").RequestHandler}
 * @param {AuthenticatedRequest} req
 */
export async function getFriendStatus(req, res) {
  const userId = +req.userId;
  const friendId = +req.params.friendId;
  if (isNaN(userId) || isNaN(friendId)) {
    res.status(400).json({ error: "Invalid user or friend ID" });
    return;
  }
  const status = await model.getFriendStatus(userId, friendId);
  if (status === null) {
    res.status(200).json({ status: "not_friends" });
    return;
  }
  res.status(200).json({ status });
}
