import Joi from 'joi';
const scheduleSchema = Joi.object({
  DrugName: Joi.string().min(1).max(50).required().messages({
    "string.base": "Drug Name must be a string",
    "string.empty": "Drug Name cannot be empty",
    "string.min": "Drug Name must be at least 1 character long",
    "string.max": "Drug Name cannot exceed 50 characters",
    "any.required": "Drug Name is required",
  }),
  StartDateXTime: Joi.string().required().messages({
    "string.base": "StartDateXTime must be a string",
    "string.empty": "StartDateXTime cannot be empty",
    "string.isoDate": "StartDateXTime must be in ISO 8601 format (e.g., 2025-07-04T10:00)",
    "any.required": "StartDateXTime is required"
  }),
  
  EndDate: Joi.string().messages({
    "string.base": "StartDateXTime must be a string",
    "string.isoDate": "StartDateXTime must be in ISO 8601 format (e.g., 2025-07-04T10:00)"
  })
});

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */

export function validateSchedule(req, res, next) {
  const { error } = scheduleSchema.validate(req.body, { abortEarly: false }); // abortEarly: false collects all errors

  if (error) {
    // If validation fails, format the error messages and send a 400 response
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    return res.status(400).json({ error: errorMessage });
  }
  next();
}

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export function validateBookId(req, res, next) {
  const id = parseInt(req.params.id);

  if (isNaN(id) || id <= 0) {
    return res
      .status(400)
      .json({ error: "Invalid book ID. ID must be a positive number" });
  }
  next();
}