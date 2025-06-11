/**
 * Middleware to send standardized error responses.
 * This must be registered after the application stack.
 * @type {import('express').ErrorRequestHandler}
 */
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  console.error(err);
  res.status(500).send({
    error: "An unexpected error occurred",
    details: err.message,
  });
}
