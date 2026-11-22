import { z } from 'zod';

export const EchoQuerySchema = z.object({
  msg: z.string().min(1).max(200),
});
