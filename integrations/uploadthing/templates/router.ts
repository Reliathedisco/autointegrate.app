// UploadThing Route Handler
import { createRouteHandler } from "uploadthing/next";
import { uploadRouter } from "./init";

export const { GET, POST } = createRouteHandler({
  router: uploadRouter,
});
