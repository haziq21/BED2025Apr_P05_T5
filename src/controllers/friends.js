import * as model from "../models/friends.js";
/**
 * Get all friends of a user.
 * @type {import("express").RequestHandler}
 */
export async function getAllFriends(req, res) {
  const userId = +req.params.id;
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }
  const friends = await model.getAllFriends(userId);
  res.status(200).json(friends);
}

/**
 * Delete a friend by their ID.
 * @type {import("express").RequestHandler}
 * */
export async function deleteFriend(req, res) {
  const userId = +req.params.id;
  const friendId = +req.params.friendId;
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }
  try {
    const deleted = await model.deleteFriend(userId, friendId);
    if (!deleted) {
      res.status(404).json({ error: "Delete unsuccessful" });
      return;
    }
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting friend:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Send a friend request to another user.
 * @type {import("express").RequestHandler}
 */
export async function sendFriendRequest(req, res) {
  const userId = +req.params.id;
  const friendId = +req.params.friendId;
  if (isNaN(userId) || isNaN(friendId)) {
    res.status(400).json({ error: "Invalid user or friend ID" });
    return;
  }
  try {
    const success = await model.sendFriendRequest(userId, friendId);
    if (!success) {
      res.status(404).json({ error: "Friend request already sent or failed" });
      return;
    }
    res.status(200).json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/** * Accept a friend request from another user.
 * @type {import("express").RequestHandler}
 */
export async function acceptFriendRequest(req, res) {
  const userId = +req.params.id;
  const friendId = +req.params.friendId;
  if (isNaN(userId) || isNaN(friendId)) {
    res.status(400).json({ error: "Invalid user or friend ID" });
    return;
  }
  try {
    const success = await model.acceptFriendRequest(userId, friendId);
    if (!success) {
      res
        .status(404)
        .json({ error: "Friend request not found or already accepted" });
      return;
    }
    res.status(200).json({ message: "Friend request accepted successfully" });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/** get all users who have sent a friend request to a user
 * @type {import("express").RequestHandler}
 */
export async function getPendingFriendRequests(req, res) {
  const userId = +req.params.id;
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }
  try {
    const requests = await model.getPendingFriendRequests(userId);
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching pending friend requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/** Search for users by name.
 * @type {import("express").RequestHandler}
 */
export async function searchUsers(req, res) {
  const query = req.query.q;
  if (typeof query !== "string") {
    res.status(400).json({ error: "Invalid search query" });
    return;
  }
  try {
    const users = await model.searchUsers(query);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error searching for users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/** * Get a user's public profile by their ID.
 * @type {import("express").RequestHandler}
 */
export async function getPublicProfile(req, res) {
  const userId = +req.params.id;
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }
  try {
    const profile = await model.getPublicProfile(userId);
    if (!profile) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error("Error fetching public profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
