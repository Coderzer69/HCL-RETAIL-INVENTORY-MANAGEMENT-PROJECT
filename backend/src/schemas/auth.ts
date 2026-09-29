import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  roles: z.array(z.string()).optional(), // names of roles
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
