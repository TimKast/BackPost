import { Router } from "./server/router.ts";

const router = new Router();

Deno.serve(async (req) => {
  return await router.route(req);
});
