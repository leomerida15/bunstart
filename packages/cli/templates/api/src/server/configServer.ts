import { Env } from "@/utils/env";
import { createConfig } from "express-zod-api";

export const configServer = createConfig({
	http: { listen: Env.PORT }, // port, UNIX socket or Net::ListenOptions
	cors: false, // decide whether to enable CORS
});