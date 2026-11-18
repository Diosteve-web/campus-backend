import { ApiError } from "../utils/ApiError.js";

export const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const first = result.error.issues[0];
    return next(new ApiError(400, first.message));
  }

  req[source] = result.data;
  next();
};