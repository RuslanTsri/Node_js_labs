import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validate = (schema: z.ZodSchema) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Валідуємо тіло запиту [cite: 575, 577]
            await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                // У Zod список помилок доступний через issues
                return res.status(400).json({
                    status: 'error',
                    errors: error.issues.map(issue => ({
                        path: issue.path,
                        message: issue.message
                    }))
                });
            }
            next(error);
        }
    };