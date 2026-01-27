import { getCurrentProfile } from "@/lib/current-profile";

export const isTeacher = async () => {
  const profile = await getCurrentProfile();
  return profile?.role === "TEACHER" || profile?.role === "ADMIN";
};
