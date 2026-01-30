"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import toast from "react-hot-toast";

interface FileUploadProps {
  onChange: (url?: string, originalFilename?: string) => void;
  endpoint:
    | "courseImage"
    | "courseAttachment"
    | "chapterVideo"
    | "profileImage";
}

export const FileUpload = ({ onChange, endpoint }: FileUploadProps) => {
  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        if (res?.[0]) {
          onChange(res[0].url, res[0].name);
        }
      }}
      onUploadError={(error: Error) => {
        toast.error(`Upload failed: ${error.message}`);
      }}
    />
  );
};
