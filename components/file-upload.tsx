// "use client";

// import toast from "react-hot-toast";

// import { UploadDropzone } from "@/lib/uploadthing";
// import { ourFileRouter } from "@/app/api/uploadthing/core";

// interface FileUploadProps {
//   onChange: (url?: string, originalFilename?: string) => void;
//   endpoint: keyof typeof ourFileRouter;
// };

// export const FileUpload = ({
//   onChange,
//   endpoint
// }: FileUploadProps) => {

//   return (
//     <UploadDropzone
//       endpoint={endpoint}
//       onClientUploadComplete={(res) => {
//         console.log("onClientUploadComplete res:", res);
//         onChange(res?.[0].url, res?.[0].name);
//       }}
//       onUploadError={(error: Error) => {
//         toast.error(`${error?.message}`);
//       }}
//     />
//   );
// }

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
