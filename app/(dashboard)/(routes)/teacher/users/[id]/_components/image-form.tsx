"use client";

import * as z from "zod";
import axios from "axios";
import { Pencil, PlusCircle, ImageIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Profile } from "@/lib/supabase/database-types";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";

interface ImageFormProps {
  initialData: Profile;
  id: string;
}

const formSchema = z.object({
  image_url: z.string().min(1, {
    message: "Image is required",
  }),
});

export const ImageForm = ({ initialData, id }: ImageFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/profile/${id}`, values);
      toast.success("Profile image updated");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Failed to update profile image");
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4 dark:bg-gray-800">
      <div className="font-medium flex items-center justify-between">
        Profile image
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing && <>Cancel</>}
          {!isEditing && !initialData.image_url && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add image
            </>
          )}
          {!isEditing && initialData.image_url && (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit image
            </>
          )}
        </Button>
      </div>
      {!isEditing &&
        (!initialData.image_url ? (
          <div className="flex items-center justify-center h-60 bg-slate-200 dark:bg-slate-700 rounded-md">
            <ImageIcon className="h-10 w-10 text-slate-500 dark:text-slate-400" />
          </div>
        ) : (
          <div className="relative aspect-video mt-2">
            <Image
              alt="Profile image"
              fill
              className="object-cover rounded-md"
              src={initialData.image_url}
            />
          </div>
        ))}
      {isEditing && (
        <div>
          <FileUpload
            endpoint="profileImage"
            onChange={(url) => {
              if (url) {
                onSubmit({ image_url: url });
              }
            }}
          />
          <div className="text-xs text-muted-foreground mt-4">
            Square image (1:1) recommended for profile pictures
          </div>
        </div>
      )}
    </div>
  );
};
