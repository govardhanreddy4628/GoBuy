// src/inngest/handler.ts

import { serve } from "inngest/express";
import { inngest } from "./client.js";
import { functions } from "./functions.js";

export const inngestHandler = serve({
  client: inngest,
  functions,
});