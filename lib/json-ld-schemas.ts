// =============================================================================
// JSON-LD STRUCTURED DATA COMPONENTS
// These generate Google-friendly structured data for rich search results
// =============================================================================

import { siteConfig } from "./seo-config";

// -----------------------------------------------------------------------------
// Organization Schema
// Shows your business info in Google Knowledge Panel
// -----------------------------------------------------------------------------
export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.organization.name,
  legalName: siteConfig.organization.legalName,
  url: siteConfig.landingUrl,
  logo: siteConfig.logo,
  foundingDate: siteConfig.organization.foundingDate,
  founders: siteConfig.organization.founders.map((name) => ({
    "@type": "Person",
    name,
  })),
  sameAs: [
    siteConfig.social.twitterUrl,
    siteConfig.social.linkedin,
    siteConfig.social.instagram,
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    url: `${siteConfig.landingUrl}/contact`,
  },
});

// -----------------------------------------------------------------------------
// Website Schema
// Helps Google understand your site structure
// -----------------------------------------------------------------------------
export const generateWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  publisher: {
    "@type": "Organization",
    name: siteConfig.organization.name,
    logo: {
      "@type": "ImageObject",
      url: siteConfig.logo,
    },
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteConfig.url}/search?title={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
});

// -----------------------------------------------------------------------------
// Course Schema
// Shows course info with ratings, price, and instructor in Google results
// -----------------------------------------------------------------------------
interface CourseSchemaInput {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  instructor: {
    name: string;
    imageUrl: string | null;
  } | null;
  category: string | null;
  totalChapters: number;
  averageRating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
}

export const generateCourseSchema = (course: CourseSchemaInput) => ({
  "@context": "https://schema.org",
  "@type": "Course",
  name: course.title,
  description: course.description || `Learn ${course.title} on Mezzo Aid`,
  url: `${siteConfig.url}/courses/${course.id}`,
  image: course.imageUrl || siteConfig.ogImage,
  provider: {
    "@type": "Organization",
    name: siteConfig.organization.name,
    sameAs: siteConfig.url,
  },
  creator: course.instructor
    ? {
        "@type": "Person",
        name: course.instructor.name,
        image: course.instructor.imageUrl,
      }
    : undefined,
  teaches: course.category || "Entrepreneurship",
  numberOfCredits: course.totalChapters,
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "online",
    courseWorkload: `PT${course.totalChapters}H`, // Estimate 1 hour per chapter
  },
  offers: course.price
    ? {
        "@type": "Offer",
        price: course.price,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${siteConfig.url}/courses/${course.id}`,
        validFrom: course.createdAt,
      }
    : {
        "@type": "Offer",
        price: 0,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        description: "Free Course",
      },
  aggregateRating:
    course.averageRating && course.totalReviews
      ? {
          "@type": "AggregateRating",
          ratingValue: course.averageRating.toFixed(1),
          bestRating: 5,
          worstRating: 1,
          ratingCount: course.totalReviews,
        }
      : undefined,
  dateCreated: course.createdAt,
  dateModified: course.updatedAt,
});

// -----------------------------------------------------------------------------
// Review Schema
// Shows individual reviews in rich snippets
// -----------------------------------------------------------------------------
interface ReviewSchemaInput {
  author: string;
  rating: number;
  reviewBody: string;
  datePublished: string;
  courseName: string;
  courseUrl: string;
}

export const generateReviewSchema = (review: ReviewSchemaInput) => ({
  "@context": "https://schema.org",
  "@type": "Review",
  itemReviewed: {
    "@type": "Course",
    name: review.courseName,
    url: review.courseUrl,
  },
  author: {
    "@type": "Person",
    name: review.author,
  },
  reviewRating: {
    "@type": "Rating",
    ratingValue: review.rating,
    bestRating: 5,
    worstRating: 1,
  },
  reviewBody: review.reviewBody,
  datePublished: review.datePublished,
  publisher: {
    "@type": "Organization",
    name: siteConfig.organization.name,
  },
});

// -----------------------------------------------------------------------------
// Breadcrumb Schema
// Shows breadcrumb trail in Google results
// -----------------------------------------------------------------------------
interface BreadcrumbItem {
  name: string;
  url: string;
}

export const generateBreadcrumbSchema = (items: BreadcrumbItem[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

// -----------------------------------------------------------------------------
// FAQ Schema (for course pages with FAQ sections)
// -----------------------------------------------------------------------------
interface FAQItem {
  question: string;
  answer: string;
}

export const generateFAQSchema = (faqs: FAQItem[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
});

// -----------------------------------------------------------------------------
// Person Schema (for instructor pages)
// -----------------------------------------------------------------------------
interface InstructorSchemaInput {
  id: string;
  name: string;
  imageUrl: string | null;
  title: string | null;
  bio: string | null;
  totalCourses: number;
  totalStudents: number;
}

export const generateInstructorSchema = (
  instructor: InstructorSchemaInput,
) => ({
  "@context": "https://schema.org",
  "@type": "Person",
  name: instructor.name,
  url: `${siteConfig.url}/instructor/${instructor.id}`,
  image: instructor.imageUrl,
  jobTitle: instructor.title || "Instructor",
  description: instructor.bio,
  worksFor: {
    "@type": "Organization",
    name: siteConfig.organization.name,
  },
  knowsAbout: ["Entrepreneurship", "Business", "Education"],
});

// -----------------------------------------------------------------------------
// EducationalOrganization Schema
// Shows Mezzo Aid as an educational platform
// -----------------------------------------------------------------------------
export const generateEducationalOrgSchema = () => ({
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: siteConfig.organization.name,
  url: siteConfig.url,
  logo: siteConfig.logo,
  description: siteConfig.description,
  sameAs: [
    siteConfig.social.twitterUrl,
    siteConfig.social.linkedin,
    siteConfig.social.instagram,
  ],
  areaServed: "Worldwide",
  hasOfferingCatalog: {
    "@type": "OfferingCatalog",
    name: "Mezzo Aid Courses",
    itemListElement: {
      "@type": "OfferCatalog",
      name: "Entrepreneurship Courses",
    },
  },
});
