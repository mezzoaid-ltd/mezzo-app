"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Loader2, User, Mail, Globe, Briefcase } from "lucide-react";
import Image from "next/image";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { Database } from "@/lib/supabase/types"; // Changed from database-types
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Use the Profile type from Supabase types
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  image_url: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  headline: z.string().optional().nullable(),
  website_url: z.string().url().optional().or(z.literal("")).nullable(),
  social_links: z
    .object({
      linkedin: z.string().optional(),
      twitter: z.string().optional(),
      github: z.string().optional(),
    })
    .optional()
    .nullable(),
});

interface ProfileFormProps {
  initialData: Profile;
}

export const ProfileForm = ({ initialData }: ProfileFormProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse social links safely
  const parseSocialLinks = (
    links: any,
  ): { linkedin?: string; twitter?: string; github?: string } => {
    if (!links) return {};
    if (typeof links === "object") {
      return links as { linkedin?: string; twitter?: string; github?: string };
    }
    return {};
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name || "",
      image_url: initialData.image_url || "",
      bio: initialData.bio || "",
      title: initialData.title || "",
      headline: initialData.headline || "",
      website_url: initialData.website_url || "",
      social_links: parseSocialLinks(initialData.social_links),
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      await axios.patch("/api/profile", values);
      toast.success("Profile updated successfully");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Picture Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>
              Upload a profile picture to personalize your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex flex-col items-center gap-4">
                      {field.value && (
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700">
                          <Image
                            src={field.value}
                            alt="Profile"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <FileUpload
                        endpoint="profileImage"
                        onChange={(url) => {
                          if (url) {
                            field.onChange(url);
                          }
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Your name and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        disabled={isSubmitting}
                        placeholder="John Doe"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Email</FormLabel>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  disabled
                  value={initialData.email}
                  className="pl-10 bg-gray-50 dark:bg-gray-800"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Email cannot be changed. Contact support if you need to update
                it.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        {initialData.role !== "STUDENT" && (
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>
                Visible on your instructor profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Title</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          disabled={isSubmitting}
                          placeholder="e.g., Senior Business Coach, Entrepreneur"
                          className="pl-10"
                          {...field}
                          value={field.value || ""}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Your job title or professional role
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="headline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Headline</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="e.g., Helping entrepreneurs build successful businesses"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      A brief tagline about what you do
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={isSubmitting}
                        placeholder="Tell us about yourself, your experience, and what you teach..."
                        className="min-h-[120px]"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Your biography will appear on your instructor profile
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Links & Social Media */}
        <Card>
          <CardHeader>
            <CardTitle>Links & Social Media</CardTitle>
            <CardDescription>
              Connect your social profiles and website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="website_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        disabled={isSubmitting}
                        placeholder="https://yourwebsite.com"
                        className="pl-10"
                        {...field}
                        value={field.value || ""}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Social Media</h4>

              <FormField
                control={form.control}
                name="social_links.linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn Username</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-800 dark:border-gray-700">
                          linkedin.com/in/
                        </span>
                        <Input
                          disabled={isSubmitting}
                          placeholder="username"
                          className="rounded-l-none"
                          {...field}
                          value={field.value || ""}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="social_links.twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter/X Username</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-800 dark:border-gray-700">
                          @
                        </span>
                        <Input
                          disabled={isSubmitting}
                          placeholder="username"
                          className="rounded-l-none"
                          {...field}
                          value={field.value || ""}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="social_links.github"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub Username</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-800 dark:border-gray-700">
                          github.com/
                        </span>
                        <Input
                          disabled={isSubmitting}
                          placeholder="username"
                          className="rounded-l-none"
                          {...field}
                          value={field.value || ""}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
};
