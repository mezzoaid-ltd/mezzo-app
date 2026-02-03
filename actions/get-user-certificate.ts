import { createClient } from "@/lib/supabase/server";

interface CertificateWithCourse {
  id: string;
  verification_code: string;
  issued_at: string;
  course: {
    id: string;
    title: string;
    image_url: string | null;
  };
}

export const getUserCertificates = async (
  userId: string,
): Promise<CertificateWithCourse[]> => {
  try {
    const supabase = await createClient();

    // Get all certificates for user
    const { data: certsRaw, error } = await supabase
      .from("certificates")
      .select("id, verification_code, issued_at, course_id")
      .eq("user_id", userId)
      .order("issued_at", { ascending: false });

    if (error || !certsRaw) {
      console.error("[GET_USER_CERTIFICATES]", error);
      return [];
    }

    const certificates = certsRaw as unknown as {
      id: string;
      verification_code: string;
      issued_at: string;
      course_id: string;
    }[];

    if (certificates.length === 0) {
      return [];
    }

    // Get course details for all certificates
    const courseIds = certificates.map((c) => c.course_id);
    const { data: coursesRaw } = await supabase
      .from("courses")
      .select("id, title, image_url")
      .in("id", courseIds);

    const courses = (coursesRaw || []) as unknown as {
      id: string;
      title: string;
      image_url: string | null;
    }[];

    // Create a map for quick lookup
    const courseMap: Record<
      string,
      { id: string; title: string; image_url: string | null }
    > = {};
    for (const course of courses) {
      courseMap[course.id] = course;
    }

    // Merge certificates with course data
    const result: CertificateWithCourse[] = certificates.map((cert) => ({
      id: cert.id,
      verification_code: cert.verification_code,
      issued_at: cert.issued_at,
      course: courseMap[cert.course_id] || {
        id: cert.course_id,
        title: "Unknown Course",
        image_url: null,
      },
    }));

    return result;
  } catch (error) {
    console.error("[GET_USER_CERTIFICATES]", error);
    return [];
  }
};
