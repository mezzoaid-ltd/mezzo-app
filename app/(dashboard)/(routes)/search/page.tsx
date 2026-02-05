// =============================================================================
// SEARCH PAGE WITH SEO
// Replace: app/(dashboard)/(routes)/search/page.tsx
// =============================================================================

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import { Categories } from "./_components/categories";
import { SearchInput } from "@/components/search-input";
import { getCourses } from "@/actions/get-courses";
import { CoursesList } from "@/components/courses-list";
import { JsonLd } from "@/components/json-ld";
import { generateBreadcrumbSchema } from "@/lib/json-ld-schemas";
import { siteConfig } from "@/lib/seo-config";
import { Database } from "@/lib/supabase/types";

// =============================================================================
// TYPES - Use the full Category type from your database types
// =============================================================================
type Category = Database["public"]["Tables"]["categories"]["Row"];

// =============================================================================
// DYNAMIC METADATA
// =============================================================================
interface SearchPageProps {
  searchParams: {
    title?: string;
    categoryId?: string;
  };
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const supabase = await createClient();

  let title = "Browse Courses";
  let description =
    "Discover courses to accelerate your entrepreneurship journey. Browse by category or search for specific topics.";

  // If category is selected, customize metadata
  if (searchParams.categoryId) {
    const { data: categoryRaw } = await supabase
      .from("categories")
      .select("name")
      .eq("id", searchParams.categoryId)
      .single();

    const category = categoryRaw as unknown as { name: string } | null;

    if (category) {
      title = `${category.name} Courses`;
      description = `Explore ${category.name} courses on Mezzo Aid. Learn from expert instructors and build your business skills.`;
    }
  }

  // If search term is present
  if (searchParams.title) {
    title = `Search: "${searchParams.title}"`;
    description = `Search results for "${searchParams.title}" on Mezzo Aid. Find courses to help you grow.`;
  }

  return {
    title,
    description,
    keywords: [
      "courses",
      "online learning",
      "entrepreneurship",
      searchParams.title || "",
      "Mezzo Aid",
    ].filter(Boolean),
    alternates: {
      canonical: "/search",
    },
    openGraph: {
      type: "website",
      title: `${title} | Mezzo Aid`,
      description,
      url: `${siteConfig.url}/search`,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: "Browse Courses on Mezzo Aid",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.social.twitter,
      title: `${title} | Mezzo Aid`,
      description,
      images: [siteConfig.ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================
const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get categories
  const { data: categoriesRaw } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  const categories = (categoriesRaw || []) as unknown as Category[];

  // Get courses with instructor info
  const courses = await getCourses({
    userId: user.id,
    title: searchParams.title,
    categoryId: searchParams.categoryId,
  });

  // Generate breadcrumb schema
  const breadcrumbItems = [
    { name: "Home", url: siteConfig.url },
    { name: "Courses", url: `${siteConfig.url}/search` },
  ];

  // Add category to breadcrumb if selected
  if (searchParams.categoryId) {
    const selectedCategory = categories.find(
      (c) => c.id === searchParams.categoryId,
    );
    if (selectedCategory) {
      breadcrumbItems.push({
        name: selectedCategory.name,
        url: `${siteConfig.url}/search?categoryId=${searchParams.categoryId}`,
      });
    }
  }

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  // Generate ItemList schema for courses (helps with rich results)
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: searchParams.title
      ? `Search results for "${searchParams.title}"`
      : "Available Courses",
    numberOfItems: courses.length,
    itemListElement: courses.slice(0, 10).map((course, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Course",
        name: course.title,
        url: `${siteConfig.url}/courses/${course.id}`,
        description: course.description?.replace(/<[^>]*>/g, "").slice(0, 100),
        provider: {
          "@type": "Organization",
          name: siteConfig.organization.name,
        },
      },
    })),
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <JsonLd data={[breadcrumbSchema, itemListSchema]} />

      {/* Page Content */}
      <div className="px-6 pt-6 md:hidden md:mb-0 block">
        <SearchInput />
      </div>
      <div className="p-6 space-y-4">
        <Categories items={categories} />
        <CoursesList items={courses} />
      </div>
    </>
  );
};

export default SearchPage;
