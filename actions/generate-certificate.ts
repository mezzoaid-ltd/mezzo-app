import { createClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";

interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  verification_code: string;
  issued_at: string;
}

export const generateCertificate = async (
  userId: string,
  courseId: string,
): Promise<Certificate | null> => {
  try {
    const supabase = await createClient();

    // Check if certificate already exists
    const { data: existingCert } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();

    if (existingCert) {
      return existingCert as unknown as Certificate;
    }

    // Verify user has completed the course (100% progress)
    const { data: chaptersRaw } = await supabase
      .from("chapters")
      .select("id")
      .eq("course_id", courseId)
      .eq("is_published", true);

    const chapters = (chaptersRaw || []) as unknown as { id: string }[];

    if (chapters.length === 0) {
      console.error("[GENERATE_CERTIFICATE] No published chapters found");
      return null;
    }

    const chapterIds = chapters.map((ch) => ch.id);

    const { data: progressRaw } = await supabase
      .from("user_progress")
      .select("chapter_id, is_completed")
      .eq("user_id", userId)
      .in("chapter_id", chapterIds)
      .eq("is_completed", true);

    const completedChapters = (progressRaw || []) as unknown as {
      chapter_id: string;
      is_completed: boolean;
    }[];

    const completionPercentage =
      chapters.length > 0
        ? (completedChapters.length / chapters.length) * 100
        : 0;

    if (completionPercentage < 100) {
      console.error(
        `[GENERATE_CERTIFICATE] Course not completed: ${completionPercentage}%`,
      );
      return null;
    }

    // Generate unique verification code
    const verificationCode = `CERT-${nanoid(10).toUpperCase()}`;

    const { data: newCert, error } = await supabase
      .from("certificates")
      .insert({
        user_id: userId,
        course_id: courseId,
        verification_code: verificationCode,
      } as any)
      .select()
      .single();

    if (error) {
      console.error("[GENERATE_CERTIFICATE]", error);
      return null;
    }

    // ✅ SEND CERTIFICATE EMAIL - Fire and forget
    try {
      // Get user profile
      const { data: profileRaw } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("user_id", userId)
        .single();

      if (!profileRaw) {
        console.error("[CERTIFICATE_EMAIL] Profile not found");
        return newCert as unknown as Certificate;
      }

      const profile = profileRaw as { name: string; email: string };

      // Get course with instructor
      const { data: courseRaw } = await supabase
        .from("courses")
        .select(
          `
          title,
          user_id
        `,
        )
        .eq("id", courseId)
        .single();

      if (!courseRaw) {
        console.error("[CERTIFICATE_EMAIL] Course not found");
        return newCert as unknown as Certificate;
      }

      const course = courseRaw as { title: string; user_id: string };

      // Get instructor name
      const { data: instructorRaw } = await supabase
        .from("profiles")
        .select("name")
        .eq("user_id", course.user_id)
        .single();

      const instructor = instructorRaw as { name: string } | null;

      // Send certificate email
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "https://mezzo-app-service.onrender.com";
      fetch(`${API_BASE_URL}/api/v1/emails/lms/certificate-earned`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: profile.email,
          userName: profile.name,
          courseName: course.title,
          verificationCode: verificationCode,
          completionDate: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          certificateUrl: `https://app.mezzoaid.com/api/courses/${courseId}/certificate`,
          instructorName: instructor?.name,
          totalChapters: chapters.length,
        }),
      }).catch((err) => console.error("[CERTIFICATE_EMAIL] Failed:", err));
    } catch (emailError) {
      console.error("[CERTIFICATE_EMAIL] Error:", emailError);
      // Don't block certificate generation if email fails
    }

    return newCert as unknown as Certificate;
  } catch (error) {
    console.error("[GENERATE_CERTIFICATE]", error);
    return null;
  }
};

export const getCertificate = async (
  userId: string,
  courseId: string,
): Promise<Certificate | null> => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();

    if (error) {
      console.error("[GET_CERTIFICATE]", error);
      return null;
    }

    return data as unknown as Certificate | null;
  } catch (error) {
    console.error("[GET_CERTIFICATE]", error);
    return null;
  }
};
