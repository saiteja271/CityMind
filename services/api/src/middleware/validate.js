/**
 * Zod Schema Validation Middleware for Express
 * @param {import('zod').ZodSchema} schema 
 */
export const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });

      req.body = parsed.body || req.body;
      req.query = parsed.query || req.query;
      req.params = parsed.params || req.params;

      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        const issueList = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message
        }));

        return res.status(400).json({
          success: false,
          error: 'Validation failed.',
          details: issueList
        });
      }
      next(error);
    }
  };
};

export default validateRequest;
