// import { redirect } from "next/navigation";
// import { createClient } from "@/lib/supabase/server";
// import { SearchInput } from "@/components/search-input";
// import { getCourses } from "@/actions/get-courses";
// import { CoursesList } from "@/components/courses-list";
// import { Categories } from "./_components/categories";

// interface SearchPageProps {
//   searchParams: {
//     title: string;
//     categoryId: string;
//   };
// }

// const SearchPage = async ({ searchParams }: SearchPageProps) => {
//   const supabase = await createClient();

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     return redirect("/sign-in");
//   }

//   // Get categories
//   const { data: categories } = await supabase
//     .from("categories")
//     .select("*")
//     .order("name", { ascending: true });

//   // Get courses
//   const courses = await getCourses({
//     userId: user.id,
//     ...searchParams,
//   });

//   return (
//     <>
//       <div className="px-6 pt-6 md:hidden md:mb-0 block">
//         <SearchInput />
//       </div>
//       <div className="p-6 space-y-4">
//         <Categories items={categories || []} />
//         <CoursesList items={courses} />
//       </div>
//     </>
//   );
// };

// export default SearchPage;

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Categories } from "./_components/categories";
import { SearchInput } from "@/components/search-input";
import { getCourses } from "@/actions/get-courses";
import { CoursesList } from "@/components/courses-list";

interface SearchPageProps {
  searchParams: {
    title?: string;
    categoryId?: string;
  };
}

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  // Get courses with instructor info
  const courses = await getCourses({
    userId: user.id,
    title: searchParams.title,
    categoryId: searchParams.categoryId,
  });

  return (
    <>
      <div className="px-6 pt-6 md:hidden md:mb-0 block">
        <SearchInput />
      </div>
      <div className="p-6 space-y-4">
        <Categories items={categories || []} />
        <CoursesList items={courses} />
      </div>
    </>
  );
};

export default SearchPage;
