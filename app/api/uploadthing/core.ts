import { createClient } from "@/lib/supabase/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// Auth handler
const handleAuth = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");
  return { userId: user.id };
};

export const ourFileRouter = {
  profileImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => await handleAuth())
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Profile image upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
    }),
  courseImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => await handleAuth())
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Course image upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
    }),
  courseAttachment: f(["text", "image", "video", "audio", "pdf"])
    .middleware(async () => await handleAuth())
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(
        "Course attachment upload complete for userId:",
        metadata.userId,
      );
      console.log("file url", file.url);
    }),
  chapterVideo: f({ video: { maxFileCount: 1, maxFileSize: "512GB" } })
    .middleware(async () => await handleAuth())
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Chapter video upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
