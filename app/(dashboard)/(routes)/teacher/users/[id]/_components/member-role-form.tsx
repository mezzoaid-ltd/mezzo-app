"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Profile } from "@/lib/supabase/database-types";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Combobox } from "@/components/ui/combobox";

interface MemberRoleFormProps {
  initialData: Profile;
  id: string;
}

const formSchema = z.object({
  role: z.enum(["ADMIN", "TEACHER", "STUDENT"]),
});

const options = [
  { label: "Admin", value: "ADMIN" },
  { label: "Teacher", value: "TEACHER" },
  { label: "Student", value: "STUDENT" },
];

export const MemberRoleForm = ({ initialData, id }: MemberRoleFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: initialData?.role || "STUDENT",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/profile/${id}`, values);
      toast.success("Profile role updated");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Failed to update role");
    }
  };

  // Check if the profile has a selected role
  const selectedOption = options.find(
    (option) => option.value === initialData.role,
  );

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4 dark:bg-gray-800">
      <div className="font-medium flex items-center justify-between">
        User Role
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit role
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <p
          className={cn(
            "text-sm mt-2",
            !initialData.role && "text-slate-500 italic",
          )}
        >
          {selectedOption?.label || "No role"}
        </p>
      )}
      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Combobox
                      options={options}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button disabled={!isValid || isSubmitting} type="submit">
                Save
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
