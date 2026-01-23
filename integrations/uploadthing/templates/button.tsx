// UploadThing Button Component

"use client";

import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "./init";

export function UploadBtn() {
  return (
    <UploadButton<OurFileRouter, "imageUploader">
      endpoint="imageUploader"
      onClientUploadComplete={(res) => {
        console.log("Files:", res);
        alert("Upload complete!");
      }}
      onUploadError={(error: Error) => {
        alert(`ERROR: ${error.message}`);
      }}
    />
  );
}
