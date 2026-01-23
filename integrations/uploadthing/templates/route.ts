// UploadThing Route Example

import { f } from "./init";

export const uploadRouter = {
  imageUploader: f({
    image: { maxFileSize: "4MB" },
  }).onUploadComplete(async ({ file }) => {
    console.log("Uploaded file:", file.url);
  }),
};
