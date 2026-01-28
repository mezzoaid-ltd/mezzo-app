import { createClient } from "@/lib/supabase/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const handleAuth = async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new UploadThingError("Unauthorized");
  }

  return { userId: user.id };
};

export const ourFileRouter = {
  profileImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(() => handleAuth())
    .onUploadComplete(({ file }) => {
      console.log("✅ Profile image uploaded:", file.url);
    }),

  courseImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(() => handleAuth())
    .onUploadComplete(({ file }) => {
      console.log("✅ Course image uploaded:", file.url);
    }),

  courseAttachment: f(["text", "image", "video", "audio", "pdf"])
    .middleware(() => handleAuth())
    .onUploadComplete(({ file }) => {
      console.log("✅ Attachment uploaded:", file.url);
    }),

  chapterVideo: f({
    video: { maxFileCount: 1, maxFileSize: "512MB" },
  })
    .middleware(() => handleAuth())
    .onUploadComplete(({ file }) => {
      console.log("✅ Video uploaded:", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
