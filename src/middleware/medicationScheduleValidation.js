import Joi from 'joi';
const scheduleSchema = Joi.object({
  DrugName: Joi.string().min(1).max(50).required().messages({
    "string.base": "Drug Name must be a string",
    "string.empty": "Drug Name cannot be empty",
    "string.min": "Drug Name must be at least 1 character long",
    "string.max": "Drug Name cannot exceed 50 characters",
    "any.required": "Drug Name is required",
  }),
  StartDateXTime: Joi.date().iso().required().messages({
    "date.base": "StartDateXTime must be a valid date",
    "date.format": "StartDateXTime must be in ISO format",
    "any.required": "StartDateXTime is required"
  }),

  EndDate: Joi.date().greater(Joi.ref('StartDateXTime')).messages({
    "date.base": "EndDate must be a valid date",
    "date.greater": "EndDate must be later than StartDateXTime",
    "any.required": "EndDate is required"
  }),

  RepeatRequest: Joi.number().integer().valid(0, 1, 2).required().messages({
    "number.base": "RepeatRequest must be a number",
    "number.integer": "RepeatRequest must be an integer",
    "any.only": "RepeatRequest must be one of 0 (None), 1 (Daily), or 2 (Weekly)",
    "any.required": "RepeatRequest is required"
  }),

  RepeatEveryXDays: Joi.number().integer().messages({
    "number.base": "RepeatEveryXDays must be a number",
    "number.integer": "RepeatEveryXDays must be an integer"
  }),

  RepeatEveryXWeeks: Joi.number().integer().messages({
    "number.base": "RepeatEveryXWeeks must be a number",
    "number.integer": "RepeatEveryXWeeks must be an integer"
  }),

  RepeatWeekDate: Joi.number().integer().messages({
    "number.base": "RepeatWeekDate must be a number",
    "number.integer": "RepeatWeekDate must be an integer"
  }),

  MedicationScheduleId: Joi.number().integer().positive().messages({
    "number.base": "MedicationScheduleId must be a number",
    "number.integer": "MedicationScheduleId must be an integer",
    "number.positive": "MedicationScheduleId must be positive"
  })
});

/**
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
    res.status(400).json({ error: errorMessage });
    return;
  }
  next();
}

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export function validateScheduleId(req, res, next) {
  const id = parseInt(req.body.MedicationScheduleId);

  if (isNaN(id) || id <= 0) {
    res
      .status(400)
      .json({ error: "Invalid schedule ID. ID must be a positive number" });
    return; 
  }
  next();
}