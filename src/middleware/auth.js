import jwt from "jsonwebtoken";
import Joi from "joi";

/**
 * @typedef {import('express').Request & { user?: any }} AuthenticatedRequest
 */

const createUserSchema = Joi.object({
  Name: Joi.string().min(1).max(50).required().messages({
    "string.base": "Name must be a string",
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least 1 character",
    "string.max": "Name cannot exceed 50 characters",
    "any.required": "Name is required",
  }),
  PhoneNumber: Joi.string()
    .pattern(/^\d{8}$/)
    .required()
    .messages({
      "string.base": "PhoneNumber must be a string",
      "string.empty": "PhoneNumber cannot be empty",
      "string.pattern.base": "PhoneNumber must be 8 digits",
      "any.required": "PhoneNumber is required",
    }),
  Bio: Joi.string().max(255).messages({
    "string.base": "Bio must be a string",
    "string.empty": "Bio cannot be empty",
    "string.max": "Bio cannot exceed 255 characters",
  }),
  Image: Joi.string().uri().messages({
    "string.base": "Image must be a string",
    "string.empty": "Image cannot be empty",
    "string.uri": "Image must be a valid URL",
  }),
});
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function validateUser(req, res, next) {
  const { error } = createUserSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
}
/**
 * @param {AuthenticatedRequest} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function verifyJWT(req, res, next) {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    res.status(500).json({ message: "JWT secret key is not configured" });
    return;
  }
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  if (!secretKey) {
    res.status(500).json({ message: "JWT secret key is not configured" });
    return;
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    console.log(err, decoded);
    if (err) {
      res.status(403).json({ message: "Invalid or expired token" });
      return;
    }
    req.user = decoded;
    next();
  });
}
