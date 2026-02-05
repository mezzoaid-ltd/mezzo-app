// =============================================================================
// CERTIFICATE VERIFICATION PAGE WITH SEO
// Replace: app/(verify)/verify/[code]/page.tsx
// =============================================================================

import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Award, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JsonLd } from "@/components/json-ld";
import { siteConfig } from "@/lib/seo-config";

// =============================================================================
// TYPES
// =============================================================================
type CertificateRow = {
  id: string;
  user_id: string;
  course_id: string;
  verification_code: string;
  issued_at: string;
};

type StudentRow = {
  name: string;
  email: string;
};

type CourseRow = {
  title: string;
};

// =============================================================================
// DYNAMIC METADATA
// =============================================================================
interface PageProps {
  params: { code: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const supabase = await createClient();

  const { data: certRaw } = await supabase
    .from("certificates")
    .select("*")
    .eq("verification_code", params.code)
    .single();

  const certificate = certRaw as unknown as CertificateRow | null;

  if (!certificate) {
    return {
      title: "Certificate Not Found",
      description: "This certificate could not be verified.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  // Get course and student names
  const { data: courseRaw } = await supabase
    .from("courses")
    .select("title")
    .eq("id", certificate.course_id)
    .single();

  const { data: studentRaw } = await supabase
    .from("profiles")
    .select("name")
    .eq("user_id", certificate.user_id)
    .single();

  const course = courseRaw as unknown as CourseRow | null;
  const student = studentRaw as unknown as { name: string } | null;

  const title = `Certificate Verification - ${params.code}`;
  const description =
    course && student
      ? `Verified certificate for ${student.name} completing "${course.title}" on Mezzo Aid.`
      : "Certificate verification on Mezzo Aid.";

  return {
    title,
    description,
    alternates: {
      canonical: `/verify/${params.code}`,
    },
    openGraph: {
      type: "website",
      title: `${title} | Mezzo Aid`,
      description,
      url: `${siteConfig.url}/verify/${params.code}`,
      siteName: siteConfig.name,
    },
    robots: {
      index: true, // Allow indexing of valid certificates
      follow: true,
    },
  };
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================
const VerifyPage = async ({ params }: PageProps) => {
  const supabase = await createClient();

  // Fetch certificate by verification code
  const { data: certRaw } = await supabase
    .from("certificates")
    .select("*")
    .eq("verification_code", params.code)
    .maybeSingle();

  const cert = certRaw as unknown as CertificateRow | null;

  let student: StudentRow | null = null;
  let course: CourseRow | null = null;

  if (cert) {
    // Get student manually
    const { data: studentRaw } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("user_id", cert.user_id)
      .single();
    student = studentRaw as unknown as StudentRow | null;

    // Get course manually
    const { data: courseRaw } = await supabase
      .from("courses")
      .select("title")
      .eq("id", cert.course_id)
      .single();
    course = courseRaw as unknown as CourseRow | null;
  }

  const isValid = !!(cert && student && course);

  const formattedDate =
    isValid && cert
      ? new Date(cert.issued_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

  // Generate structured data for valid certificates
  const credentialSchema =
    isValid && cert && student && course
      ? {
          "@context": "https://schema.org",
          "@type": "EducationalOccupationalCredential",
          name: `${course.title} Certificate`,
          credentialCategory: "Certificate of Completion",
          recognizedBy: {
            "@type": "Organization",
            name: siteConfig.organization.name,
            url: siteConfig.url,
          },
          validFor: "P99Y", // Valid for 99 years (essentially forever)
          dateCreated: cert.issued_at,
        }
      : null;

  return (
    <>
      {/* JSON-LD for valid certificates */}
      {credentialSchema && <JsonLd data={credentialSchema} />}

      {/* Page Content */}
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {isValid ? (
                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl">
              {isValid ? "Valid Certificate" : "Invalid Certificate"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isValid && student && course ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-lg p-6 border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-start gap-3 mb-4">
                    <Award className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Successfully completed by
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mt-4">
                    <div className="flex justify-between items-center py-2 border-t border-indigo-200 dark:border-indigo-800">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Student Name
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {student.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-t border-indigo-200 dark:border-indigo-800">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Completion Date
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formattedDate}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-t border-indigo-200 dark:border-indigo-800">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Verification Code
                      </span>
                      <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                        {params.code}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  This certificate has been verified and is authentic.
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  The verification code{" "}
                  <span className="font-mono font-medium">{params.code}</span>{" "}
                  is not valid.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Please check the code and try again, or contact support if you
                  believe this is an error.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default VerifyPage;
