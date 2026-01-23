// UploadThing Client Example

import { UploadButton } from "@uploadthing/react";

export function ImageUploaderUI() {
  return (
    <UploadButton endpoint="imageUploader" onClientUploadComplete={(files) => {
      console.log(files);
    }} />
  );
}
