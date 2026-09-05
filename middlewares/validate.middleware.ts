import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { ZodType } from "zod";
import { z } from "zod";

type ValidationTarget = "body" | "query" | "params";

export function validate<T extends ZodType>(
  schema: T,
  target: ValidationTarget = "body",
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsedData = z.safeParse(schema, req[target]);

    if (!parsedData.success)
      return res.status(400).json({
        message: "Validation error",
        error: z.prettifyError(parsedData.error),
      });

    req[target] = parsedData.data;
    next();
  };
}
