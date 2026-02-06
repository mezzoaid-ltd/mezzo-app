// lib/email-service.ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://mezzo-app-service.onrender.com";

interface EmailResponse {
  success: boolean;
  message?: string;
  emailId?: string;
  error?: string;
}

/**
 * Send welcome email when user signs up
 */
export async function sendWelcomeEmail(
  email: string,
  userName: string,
): Promise<EmailResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/emails/lms/welcome`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, userName }),
    });

    return await response.json();
  } catch (error) {
    console.error("[SEND_WELCOME_EMAIL]", error);
    return { success: false, message: "Failed to send welcome email" };
  }
}

/**
 * Send course enrollment email
 */
export async function sendCourseEnrollmentEmail(data: {
  email: string;
  userName: string;
  courseName: string;
  courseDescription?: string;
  courseImageUrl?: string;
  courseUrl: string;
  instructorName?: string;
  chaptersCount?: number;
  price?: string;
}): Promise<EmailResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/emails/lms/course-enrollment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    return await response.json();
  } catch (error) {
    console.error("[SEND_ENROLLMENT_EMAIL]", error);
    return { success: false, message: "Failed to send enrollment email" };
  }
}

/**
 * Send chapter completion email
 */
export async function sendChapterCompletionEmail(data: {
  email: string;
  userName: string;
  chapterTitle: string;
  courseName: string;
  courseUrl: string;
  nextChapterTitle?: string;
  nextChapterUrl?: string;
  completedChapters: number;
  totalChapters: number;
  progressPercentage: number;
}): Promise<EmailResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/emails/lms/chapter-completion`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    return await response.json();
  } catch (error) {
    console.error("[SEND_CHAPTER_COMPLETION_EMAIL]", error);
    return {
      success: false,
      message: "Failed to send chapter completion email",
    };
  }
}

/**
 * Send certificate earned email
 */
export async function sendCertificateEarnedEmail(data: {
  email: string;
  userName: string;
  courseName: string;
  verificationCode: string;
  completionDate?: string;
  certificateUrl: string;
  certificatePdfBase64?: string; // Optional PDF attachment
  instructorName?: string;
  totalChapters?: number;
}): Promise<EmailResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/emails/lms/certificate-earned`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    return await response.json();
  } catch (error) {
    console.error("[SEND_CERTIFICATE_EMAIL]", error);
    return { success: false, message: "Failed to send certificate email" };
  }
}

/**
 * Send new review notification to instructor
 */
export async function sendNewReviewEmail(data: {
  email: string; // Instructor email
  instructorName: string;
  courseName: string;
  courseUrl: string;
  reviewerName: string;
  rating: number;
  reviewComment?: string;
  reviewDate?: string;
}): Promise<EmailResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/emails/lms/new-review`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    return await response.json();
  } catch (error) {
    console.error("[SEND_NEW_REVIEW_EMAIL]", error);
    return { success: false, message: "Failed to send new review email" };
  }
}

/**
 * Send course published notification to instructor
 */
export async function sendCoursePublishedEmail(data: {
  email: string; // Instructor email
  instructorName: string;
  courseName: string;
  courseUrl: string;
  courseImageUrl?: string;
  totalChapters?: number;
  publishDate?: string;
}): Promise<EmailResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/emails/lms/course-published`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    return await response.json();
  } catch (error) {
    console.error("[SEND_COURSE_PUBLISHED_EMAIL]", error);
    return { success: false, message: "Failed to send course published email" };
  }
}
