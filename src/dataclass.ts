import { z } from 'zod';

const GmailMessageSchema = z.object({
  id: z.string(),
  internalDate: z.string().transform(str => parseInt(str, 10)), // convert to number
  snippet: z.string().optional(),
  payload: z.object({
    headers: z.array(
      z.object({
        name: z.string(),
        value: z.string(),
      })
    ),
  }),
});

export {
  GmailMessageSchema,
};
