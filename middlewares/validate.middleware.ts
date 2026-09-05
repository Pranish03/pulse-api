import type { NextFunction, Request, Response } from "express";
import { z, type ZodType } from "zod";

type ValidationTarget = "body" | "query" | "params";

export function validate(schema: ZodType, target: ValidationTarget = "body") {
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
