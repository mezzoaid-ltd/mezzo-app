"use client";

import { useTheme } from "./providers/theme-provider";
import React from "react";
import { BsMoon, BsSun } from "react-icons/bs";
import { FaArrowUp, FaUser } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = React.useState(false);

  React.useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsSignedIn(!!user);
    };

    checkAuth();

    // Subscribe to auth changes
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsSignedIn(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSignIn = () => {
    router.push("/sign-in");
  };

  return (
    <div className="fixed bottom-5 right-5 flex gap-4">
      <button
        title="Toggle theme"
        className="bg-white w-[3rem] h-[3rem] bg-opacity-80 backdrop-blur-[0.5rem] border border-white border-opacity-40 shadow-2xl rounded-full flex items-center justify-center hover:scale-[1.15] active:scale-105 transition-all dark:bg-gray-950"
        onClick={toggleTheme}
      >
        {theme === "light" ? <BsSun /> : <BsMoon />}
      </button>

      <button
        title="Scroll to top"
        className="bg-white w-[3rem] h-[3rem] bg-opacity-80 backdrop-blur-[0.5rem] border border-white border-opacity-40 shadow-2xl rounded-full flex items-center justify-center hover:scale-[1.15] active:scale-105 transition-all dark:bg-gray-950"
        onClick={scrollToTop}
      >
        <FaArrowUp />
      </button>

      {!isSignedIn && (
        <button
          title="Sign in"
          onClick={handleSignIn}
          className="bg-white w-[3rem] h-[3rem] bg-opacity-80 backdrop-blur-[0.5rem] border border-white border-opacity-40 shadow-2xl rounded-full flex items-center justify-center hover:scale-[1.15] active:scale-105 transition-all dark:bg-gray-950"
        >
          <FaUser />
        </button>
      )}
    </div>
  );
}
