import Joi from "joi";

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
