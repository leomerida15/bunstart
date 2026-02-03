import { z } from "zod";
import { logger } from "./logger";

const EnvSchema = z.object({
    PORT: z.string().default('3000').transform(Number),
    NODE_ENV: z.enum(['development', 'production']).default('development'),
});

export const { success, data, error } = EnvSchema.safeParse(process.env);

if (!success) {
    logger.error(error?.message);
    process.exit(1);
}

export const Env = data!;