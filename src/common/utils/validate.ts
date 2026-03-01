import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from './response';

/**
 * Express middleware that validates req.body against a Zod schema.
 * Compatible with Zod v4 (.issues) and v3 (.errors).
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        // Zod v4 uses .issues, v3 uses .errors
        const issues = (err as any).issues ?? (err as any).errors ?? [];
        const messages = issues.map((e: any) => `${e.path?.join('.') ?? ''}: ${e.message}`);
        return sendError(res, messages.join(', '), 422);
      }
      next(err);
    }
  };
}
