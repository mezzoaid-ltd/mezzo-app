"use client";

import { useState } from "react";
import { Award, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface CertificateButtonProps {
  courseId: string;
  courseName: string;
  isComplete: boolean;
}

export const CertificateButton = ({
  courseId,
  courseName,
  isComplete,
}: CertificateButtonProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      const response = await fetch(`/api/courses/${courseId}/certificate`);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to generate certificate");
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificate-${courseName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Certificate downloaded successfully!");
    } catch (error: any) {
      console.error("[CERTIFICATE_DOWNLOAD]", error);
      toast.error(error.message || "Failed to download certificate");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isComplete) {
    return (
      <Button disabled variant="outline" size="sm">
        <Award className="h-4 w-4 mr-2" />
        Complete course to earn certificate
      </Button>
    );
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading}
      variant="default"
      size="sm"
      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
    >
      {isDownloading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Award className="h-4 w-4 mr-2" />
          Download Certificate
        </>
      )}
    </Button>
  );
};
