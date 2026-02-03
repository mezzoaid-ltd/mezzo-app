import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register fonts (using built-in fonts for now)
// You can add custom fonts later if needed

interface CertificateTemplateProps {
  studentName: string;
  courseName: string;
  instructorName: string;
  completionDate: string;
  verificationCode: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 60,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  border: {
    border: "8px solid #4F46E5",
    padding: 40,
    height: "100%",
  },
  innerBorder: {
    border: "2px solid #4F46E5",
    padding: 30,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    color: "#4F46E5",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    color: "#6B7280",
    letterSpacing: 1,
  },
  body: {
    textAlign: "center",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  awardText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 20,
  },
  studentName: {
    fontSize: 36,
    fontFamily: "Helvetica-Bold",
    color: "#1F2937",
    marginBottom: 25,
    borderBottom: "2px solid #E5E7EB",
    paddingBottom: 10,
  },
  completionText: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
  },
  courseName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#4F46E5",
    marginBottom: 30,
  },
  footer: {
    marginTop: 40,
  },
  signatureSection: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  signatureBlock: {
    width: "40%",
    textAlign: "center",
  },
  signatureLine: {
    borderTop: "1px solid #9CA3AF",
    paddingTop: 5,
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 10,
    color: "#6B7280",
  },
  signatureName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#374151",
  },
  verification: {
    textAlign: "center",
    marginTop: 20,
  },
  verificationCode: {
    fontSize: 10,
    color: "#9CA3AF",
    letterSpacing: 1,
  },
  verificationUrl: {
    fontSize: 8,
    color: "#9CA3AF",
    marginTop: 3,
  },
});

export const CertificateTemplate: React.FC<CertificateTemplateProps> = ({
  studentName,
  courseName,
  instructorName,
  completionDate,
  verificationCode,
}) => {
  const formattedDate = new Date(completionDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border}>
          <View style={styles.innerBorder}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>CERTIFICATE OF COMPLETION</Text>
              <Text style={styles.subtitle}>THIS CERTIFIES THAT</Text>
            </View>

            {/* Body */}
            <View style={styles.body}>
              <Text style={styles.studentName}>{studentName}</Text>
              <Text style={styles.awardText}>
                has successfully completed the course
              </Text>
              <Text style={styles.courseName}>{courseName}</Text>
              <Text style={styles.completionText}>
                Completed on {formattedDate}
              </Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.signatureSection}>
                <View style={styles.signatureBlock}>
                  <View style={styles.signatureLine}>
                    <Text style={styles.signatureName}>{instructorName}</Text>
                  </View>
                  <Text style={styles.signatureLabel}>Instructor</Text>
                </View>
                <View style={styles.signatureBlock}>
                  <View style={styles.signatureLine}>
                    <Text style={styles.signatureName}>Mezzo Aid</Text>
                  </View>
                  <Text style={styles.signatureLabel}>Platform</Text>
                </View>
              </View>

              {/* Verification */}
              <View style={styles.verification}>
                <Text style={styles.verificationCode}>
                  Verification Code: {verificationCode}
                </Text>
                <Text style={styles.verificationUrl}>
                  Verify at: mezzoaid.com/verify/{verificationCode}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
